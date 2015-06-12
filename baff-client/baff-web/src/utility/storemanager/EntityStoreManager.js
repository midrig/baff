/**
 *  The EntityStoreManager manages {@link Baff.app.model.EntityStore} creation and retrieval,
 *  including finding stores that contain master {@link Baff.app.model.EntityModel}s and those
 *  that contain entity's that are mastered. 
 *  
 */
Ext.define('Baff.utility.storemanager.EntityStoreManager', {	
    extend: 'Ext.Base',       
    requires: ['Baff.app.model.EntityModel', 
                    'Baff.app.model.EntityStore' ],
    
    /**
     * The list of stores, a {Ext.util.MixedCollection} 
     * Each store is held in an object that contains the store and the list of users
     * @private
     */  
    stores: null,
    
    config: {

        /**
         * The number of stores to cache before destroying unused stores
         */  
        cacheSize: 25
    
    },

    /**
     * Constructs the Store Mananger and initialises {@link #stores}.
     */  
    constructor: function(config) {
        
        this.initConfig(config); 
        this.stores = new Ext.util.MixedCollection();
    },
    
    /**
     * Determines the key string for a store.
     * @param {String} storeType The type of store (it's class name)
     * @param {String} ownerId The identifier of the {@link Baff.app.controller.ActivityController} that
     * owns this store
     * @param {String} masterEntityId The identifier of the master entity instance that is assoicated
     * with this store 
     * @return {String} The store key in the format: store type | master entity id | owner id
     */  
    getStoreKey: function(storeType, ownerId, masterEntityId) {        
        var me = this;        
        var storeKey = storeType;
        
        // Store key format is: store type | master entity id | owner id
        
        if (masterEntityId != null)
            storeKey += "|" + masterEntityId;
        
        if (ownerId != null)
            storeKey += "|" + ownerId;
        
        return storeKey;
        
    },
    
    /**
     * Disengages as store from a store user
     * @param {Baff.mode.EntityStore} store
     * @param {String} userId
     */
    detachStore: function(store, userId) {
        var me = this;
        
        var storeObj = me.stores.get(store.storeKey);
        
        if (storeObj != null) {
            Ext.Array.remove(storeObj.users, userId);
        }
        
        me.manageStoreCache();
    
    },
    
    /**
     * Manages the store cache by removing uniused stores if the cache exceeds {@link #cacheSize}
     */
    manageStoreCache: function() {
        var me = this;
        
        if (me.stores.getCount() > me.getCacheSize()) {
            
            var storeObj = me.stores.findBy(function(storeObj, storeKey) {
                if (storeObj.users.length == 0) {
                    Utils.logger.debug("Destroying store with key: " + storeKey);
                    me.stores.removeAtKey(storeKey);
                    storeObj.store.destroy(); 
                    return true;
                }                
            });
            
        }
        
    },
    
    /**
     * Destroys a store instance.
     * @param {String} storeType The type of store (it's class name)
     * @param {String} ownerId The identifier of the {@link Baff.app.controller.ActivityController} that
     * owns this store
     * @param {String} masterEntityId The identifier of the master entity instance that is assoicated
     * with this store 
     */  
    destroyStore: function (storeType, ownerId, masterEntityId) {    
        var me = this;
        
        var storeKey = me.getStoreKey(storeType, ownerId, masterEntityId);
        var storeObj = me.stores.get(storeKey);
        
        if (storeObj != null) {
                    
            me.stores.removeAtKey(storeKey);
            storeObj.store.destroy();        
        }
    
    
    },
    
    /**
     * Gets a store by looking for an existing instance and creating a new one if not found.
     * @param {String} storeType The type of store (it's class name)
     * @param {String} ownerId The identifier of the {@link Baff.app.controller.ActivityController} that
     * owns this store
     * @param {String} masterEntityId The identifier of the master entity instance that is assoicated
     * with this store
     * @param {String} userId A unique identifier of the user of this store
     * @return {Baff.app.model.EntityStore}
     */  
    getStore: function (storeType, ownerId, masterEntityId, userId) {       
        var me = this;
        
        var storeKey = me.getStoreKey(storeType, ownerId, masterEntityId);
        var storeObj = me.stores.get(storeKey);
        
        if (storeObj == null) {
            
            var store = Ext.create(storeType, {
                masterEntityId: masterEntityId,
                ownerId: ownerId
            });
            
            if (store == null) {
                Utils.logger.error("EntityStoreManager::getStore, failed to create new store");
                return null;
            }
            
            storeObj = {};
            storeObj.store = store;
            storeObj.users = [userId];
            
            // Add the store to the list
            me.stores.add(storeKey, storeObj);
        
        } else if (!Ext.Array.contains(storeObj.users, userId)) {
            
            storeObj.users.push(userId);
            
        }
        
        me.manageStoreCache();
        
        return storeObj.store;
            
    },
    
    /**
     * Retrieves a master entity from within the existing stores
     * @param {String} masterEntityType The type of master entity (it's class name)
     * @param {String} masterEntityId The identifier of the master entity instance
     * @retrun {Baff.app.model.EntityModel} The master record or null if it was not found
     */  
    findMaster: function (masterEntityType, masterEntityId) {        
        var me = this;
        
        // Get the mastering stores
        var masteringStores = me.getMasteringStores(masterEntityType);
        
        // Get the primary store type for the master entity
        var masterEntity = Ext.create(masterEntityType);        
        var primaryStoreType = masterEntity.getPrimaryStoreType();
        
        // Filter the mastering stores on the primary store type
        if (primaryStoreType !== null) {
            /*
            var filter = new Ext.util.Filter({
                property: 'store.storeType',
                value : primaryStoreType,
                exactMatch: true
            });*/
            
            var filter = new Ext.util.Filter({
                 filterFn: function(storeObj) {
                     if(storeObj.store.storeType == primaryStoreType)
                         return true;
                 }
             });
            
             masteringStores = masteringStores.filter(filter);
        
        }
              
        var master = null;
        
        // Iterate throught the filtered store set to look for the master record
        masteringStores.each( function () { 
            if (this.store.getCount() > 0) {
                master = this.store.findRecord('entityId', masterEntityId, 0, false, true, true );
                if (master != null) {
                    return false;
                }
            }
        });
        
        return master;
        
    },
     
    /**
     * Finds a list of stores that master a given master entity type and instance if a master entity 
     * identifier is passed
     * @param {String} masterEntityType The type of master entity (it's class name)
     * @param {String} [masterEntityId="null"] The identifier of the master entity instance
     * @retrun {Array} The list of{@link Baff.app.model.EntityStore}s.
     */  
    getMasteringStores: function (masterEntityType, masterEntityId) {
        var me = this;

        var masterTypes = masterEntityType.split('#');
   
        var filter = new Ext.util.Filter({
                 filterFn: function(storeObj) {
                     
                 for (var i=0;i<masterTypes.length;i++) {
                     
                    var masterKey = '#' + masterTypes[i] + '#';

                    if (masterEntityId != null) {
                        // Looking for mastered stores only
                        masterKey += "|" + masterEntityId;
                        
                        if (storeObj.store.masterKey.indexOf(masterKey) >= 0)
                            return true;
                    
                    } else {
                        // Looking for master stores only
                        if (storeObj.store.masterKey.indexOf('|') < 0 &&
                            storeObj.store.masterKey.indexOf(masterKey) >= 0)
                            return true;
                    }
                
                }
                
                return false;
           }
                        
        }); 
      
      return me.stores.filter(filter);

    },
    
    /**
     * Removes the data from all stores that are mastered by a given master entity instance, restrictied for a
     * specific master entity instance, if specified.
     * @param {String} masterEntityType The type of master entity (it's class name)
     * @param {String} [masterEntityId="null"] The identifier of a master entity instance
     * @param {boolean} indicates that the related master entity has not been able to be loaded
     */  
    flushMasteredStores: function (masterEntityType, masterEntityId, invalid) {        
        var me = this;    
        
        if (invalid == null)
            invalid = false;
        
        // If no master id specified then we will flush all mastered stores for the type
        // Otherwise it will only be for the specified id
         if (masterEntityId == null)
             masterEntityId = '';
         
        var masteredStores = me.getMasteringStores(masterEntityType, masterEntityId);
        
        masteredStores.each( function () { 
            Utils.logger.info("flushing mastered store = " + this.store.storeKey + " ,masterKey= " + this.store.masterKey);
            this.store.flush(invalid);
        });
    },
   
    /**
     * Removes the data from all stores that master a given master entity type.
     * @param {String} masterEntityType The type of master entity (it's class name)
     */  
    flushMasterStores: function (masterEntityType) {
      var me = this;
        
        var masterStores = me.getMasteringStores(masterEntityType);
        masterStores.each( function () { 
            Utils.logger.info("flushing master store = " + this.store.storeKey + " ,masterKey= " + this.store.masterKey);
            this.store.flush();
        });
   
    },
    
    /**
     * Removes the data from all stores for a given given master entity type and instance.
     * @param {String} masterEntityType The type of master entity (it's class name)
     * @param {String} [masterEntityId="null"] The identifier of the master entity instance
     */  
    flushMasteringStores: function (masterEntityType, masterEntityId) {
         var me = this;
        
        // Flush master stores first so that it's not possible to retrieve master data from them
        me.flushMasterStores(masterEntityType);
        me.flushMasteredStores(masterEntityType, masterEntityId);
                
    }
    
        
});

