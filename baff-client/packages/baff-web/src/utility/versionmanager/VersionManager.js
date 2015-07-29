/**
 *  The Version Manager manages client side version control and the state of data cached in stores
 *  managed by the {@link  Baff.utility.storemanager.EntityStoreManager}, based on master entity versions held in 
 *  a {@link Baff.utility.versionmanager.MasterStore}. 
 *  A key principle is that a master must be present for any mastered data, and that the master must be the least
 *  current information (i.e. having been retrieved first) - therefore when storing new master data, e.g. after a refresh
 *  then any related mastered data must be flushed.  When the master is set by obtaining it from its primary data
 *  store, then the assumption is that  
 *  
 */
Ext.define('Baff.utility.versionmanager.VersionManager', {	
    extend: 'Ext.Base',
    mixins: ['Ext.mixin.Observable'],
        
    requires: [
                    'Baff.utility.storemanager.EntityStoreManager' ,
                    'Baff.utility.versionmanager.MasterStore'],
    
    
    /**
     * The master entity store
     * @private
     */  
    masterStore: null,
    
    HTTP_RESPONSE_OK: 200,
    dtSystemErrorTitle: 'System Error',
    dtSystemError: 'A system error has occurred',
    
    /**
     * Sets the {@link masterStore}
     */  
    constructor: function(config) {
 
        this.mixins.observable.constructor.call(this, config);
        this.masterStore = Ext.create('Baff.utility.versionmanager.MasterStore');
        
    },

    /**
     * Gets the version of the master for a given master entity type and id
     * @param {String} type The master entity type
     * @param {String} id The master entity id
     * @return {String} The version or null if not found
     */ 
    getVersion: function (type, id) {       
        Utils.logger.info("VersionManager::getVersion");
        var me = this;
     
        if (id == null || type === '' || id === '')
            return;
        
        var master = this.getMaster(type, id);  
        
        if (master != null) {  
            return master.getVersion();
        } else {
            return null;
        }
    
    },
    
     /**
     * Refreshes the client data cache for a given master entity type, id and restores the master entity
     * @param {String} type The master entity type
     * @param {String} id The master entity id
     * @param {Baff.app.model.EntityModel} master The current master entity record
     */ 
    refreshData: function (type, id, master) {        
        Utils.logger.info("VersionManager::refreshData");
        var me = this;
        
        // Flush all data related to the master type and id, but don't reload as
        // this will be managed by the activity controllers
        if (type != null && type!= '') {
            
            if (master == null) {
                if (id != null) {
                    
                    // Refreshing for a specific master entity, so get a new copy of the master - this will result
                    // in a flush of the specific mastered data, so just flush the master data here
                    me.loadMaster(type, id);
                    Utils.entityStoreManager.flushMasterStores(type);
                
                } else {
                    // General refresh so need to flush all master records, master and mastered data for the given master type 
                    me.flushMaster(type);
                    Utils.entityStoreManager.flushMasteringStores(type);
                }
            } else {
                
                // Store the new master provided and flush all master data and only specific mastered data
                var masterEntity = Ext.create(type, master);
                me.storeMaster(masterEntity);
                Utils.entityStoreManager.flushMasteringStores(type, id);
            }  
             
        }
        
    },
    
    /**
     * Gets the master entity for a given master entity type and id
     * @param {String} type The master entity type
     * @param {String} id The master entity id
     * @returns {Baff.app.model.EntityModel} master The current master entity record
     */ 
    getMaster: function(type, id) {
        Utils.logger.info("VersionManager::getMaster");
        var me =this;
        
        if (type == null || id == null)
            return null;
        
        var master = me.masterStore.getMaster(type,id); 
        
        if (master == null) { 
            master = me.setMaster(type, id);
        }
        
        return master;
        
    },
    
    /**
     * Sets the master entity from the client data cache (will initiate a load if not found)
     * @param {String} type The master entity type
     * @param {String} id The master entity id
     * @returns {Baff.app.model.EntityModel} master The current master entity record or null if not
     * found in the client data cache
     */ 
    setMaster: function(type, id) {       
        Utils.logger.info("VersionManager::setMaster");
        var me =this;
        
        // Try to get any currently retrieved master record (only one should exist as a result of data integrity checks)
        var masterEntity = me.getMasterEntityFromPrimaryStore(type, id);    

        if (masterEntity == null) {
            // Note that this will be done asynchronously so this function will return null
            me.loadMaster(type, id);
        }
        else {
            me.storeMaster(masterEntity);
        }
        
        return masterEntity;
        
    },
    
     /**
     * Loads the master entity record from the server
     * @param {String} type The master entity type
     * @param {String} id The master entity id
     */ 
    loadMaster: function (type, id) {      
        Utils.logger.info("VersionManager::loadMaster, type= " + type + " ,id= " + id);
        var me =this;
        
        if (Utils.globals.viewport != null)
            Utils.globals.viewport.showWaitMask(true, "VM");
        
        // Remove the master to start with in case of delay in loading a new one
        me.masterStore.removeMaster(type, id);          
       
        // Get the master entity type
        var masterEntity = Ext.create(type, {
             clientId: id
        });        
        
        masterEntity.setEntityId(id);
        
        var username = (Utils.userSecurityManager != null ? Utils.userSecurityManager.getUserName() : ''); 
            
        masterEntity.load({
            scope: me,
            params: {
                    'entityId': id,
                    'username': username,
                    'actionCode': ''
                },
            callback: function(record, operation) {
                
                var response = operation.getResponse();

                if (!operation.success && response !=null) {
                        
                    var message;
                    
                    if (response.status != me.HTTP_RESPONSE_OK) {
                        message = me.dtResponseFailMsg + response.status + " (" + response.statusText + ")"; 
                    } else {
                        var jsonResponse = Ext.decode(response.responseText);
                        message = jsonResponse.message;
                    }
                    
                    var callback = function() {
                        if (Utils.globals.application != null)
                            Utils.globals.application.fireEvent('systemfailure');
                        else {
                            Utils.entityStoreManager.flushMasteredStores(type, id, true);
                            me.fireEvent('masterload', type, id, true);
                        } 
                    };
                         
                         
                   if (Utils.globals.viewport != null)
                       Utils.globals.viewport.showAlertMessage(me.dtSystemErrorTitle, message, callback);
                   else
                       Ext.Message.alert(me.dtSystemErrorTitle, message, callback);
                   
                    
                } else if (operation.getRecords().length == 0) {
                    
                    Utils.logger.info("VersionManager::loadMaster, failed to load master of type= " + type + " ,id= " + id);
                    
                    // If we don't get the master then we should notify this
                    Utils.entityStoreManager.flushMasteredStores(type, id, true);
                    me.fireEvent('masterload', type, id, true);

                
                } else {
                    
                    me.storeMaster(record);
                    
                    // Now flush any data associated with the master but don't flush the related master stores as this
                    // is unnecessary and will cause multiple retrievals
                    Utils.entityStoreManager.flushMasteredStores(type, id);
                    me.fireEvent('masterload', type, id, false);
                
                }
                
                if (Utils.globals.viewport != null)
                    Utils.globals.viewport.showWaitMask(false, "VM");

                
            }
        });

    },
    
     /**
     * Stores the master entity record in the master store
     * @param {Baff.app.model.EntityModel} master The master entity record to be stored
     */ 
    storeMaster: function (master) {       
        Utils.logger.info("VersionManager::storeMaster");
        var me = this;
        me.masterStore.storeMaster(master);

    },
    
     /**
     * Flushes the master store for the given type 
     * @param {String} type The master entity type to be flushed
     */ 
    flushMaster: function (type) {       
        Utils.logger.info("VersionManager::flushMaster");
        var me = this;
        me.masterStore.flushMaster(type);

    },
     
     /**
     * Gets the master entity from its primary store
     * @param {String} type The master entity type
     * @param {String} id The master entity id
     * @returns {Baff.app.model.EntityModel} master The current master entity record or null if not
     * found
     */ 
    getMasterEntityFromPrimaryStore: function (type, id) {       
        Utils.logger.info("VersionManager::getMasterEntityFromPrimaryStore");
        var me =this;
        
        return Utils.entityStoreManager.findMaster(type, id);
       
    }
    
    

});
