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
     * @private
     */  
    stores: null,
    
    /**
     * Constructs the Store Mananger and initialises {@link #stores}.
     */  
    constructor: function() {
        
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
        var store = me.stores.get(storeKey);
        
        if (store != null) {     
                    
            me.stores.removeAtKey(storeKey);
            store.destroy();        
        }
    
    
    },
    
    /**
     * Gets a store by looking for an existing instance and creating a new one if not found.
     * @param {String} storeType The type of store (it's class name)
     * @param {String} ownerId The identifier of the {@link Baff.app.controller.ActivityController} that
     * owns this store
     * @param {String} masterEntityId The identifier of the master entity instance that is assoicated
     * with this store
     * @return {Baff.app.model.EntityStore}
     */  
    getStore: function (storeType, ownerId, masterEntityId) {       
        var me = this;
        
        var storeKey = me.getStoreKey(storeType, ownerId, masterEntityId);
        var store = me.stores.get(storeKey);
        
        if (store == null) {
            
            store = Ext.create(storeType, {
                masterEntityId: masterEntityId,
                ownerId: ownerId
            });
            
            if (store == null) {
                Utils.logger.error("EntityStoreManager::getStore, failed to create new store");
            }
            
            // Add the store to the list
            me.stores.add(storeKey, store);
        
        }
        
        return store;
            
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
            var filter = new Ext.util.Filter({
                property: 'storeType',
                value : primaryStoreType,
                exactMatch: true
            });
            
             masteringStores = masteringStores.filter(filter);
        
        }
              
        var master = null;
        
        // Iterate throught the filtered store set to look for the master record
        masteringStores.each( function () { 
            if (this.getCount() > 0) {
                master = this.findRecord('entityId', masterEntityId, 0, false, true, true );
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
        
        var masterKey = masterEntityType;
        var match = true;
        
        // Also filter on the entity id if provided
        if (masterEntityId != null) {
            masterKey += "|" + masterEntityId;
            if (masterEntityId == "")
                match = false;
        }
        
        var filter = new Ext.util.Filter({
            property: 'masterKey',
            value : masterKey,
            exactMatch: match
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
            Utils.logger.info("flushing mastered store = " + this.storeKey);
            this.flush(invalid);
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
            Utils.logger.info("flushing master store = " + this.storeKey);
            this.flush();
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

