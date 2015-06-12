/**
 *  An EntityStore holds a set of {@link Baff.app.model.EntityModel}s associated with a particular 
 *  entity type.  It is able to retrieve its data to a remote service via a {@link Baff.app.model.ServiceProxy}, 
 *  which is specified in configuration along with associated URLs.
 *  
 *  This class extends from {Ext.foundation.BufferedStore} which cacbes a subset of the data held
 *  on the server and retrieves more data as required.
 *  
 *  A typical implementation is as follows:
 *  
 *      Ext.define('MyApp.store.MyStore', {
 *          extend: 'Baff.app.model.EntityStore',
 *                    
 *      config: {
 *              
 *              model: 'MyApp.model.MyModel',  
 *          
 *              // Default sorter
 *              sorters: [{
 *                  property: 'foo',
 *                  direction: 'ASC'
 *              }],
 *          
 *              // Filters (if required)
 *              filters: [{
 *                  property: 'bar',
 *                  value: 'val1|val2|val3'  // pipe delimit for multiple values
 *              }],
 *        
 *            // Proxy
 *            proxy: {
 *                type: 'serviceproxy',
 *                url: 'myapp/myentity/findAll.json'
 *            }
 *        }
 *        
 */          
Ext.define('Baff.app.model.EntityStore', {
    extend: 'Ext.data.Store',
    requires: 'Baff.app.model.ServiceProxy',
    
    /**
     * The model for this store
     * @cfg model
     */
    model: 'Baff.app.model.EntityModel',
    
    /**
     * The unique key for the store instance
     * @readonly
     */
    storeKey: null,
    
    /**
     * The unique key for master entity instance associated with this store
     * @readonly
     */
    masterKey: null,  
    
    /**
     * The type of store
     * @readonly
     */
    storeType: null,
    
    /**
     * Whether this store has any data loaded
     * @private
     */
    hasLoaded: false,
    
    config: {
        
        /**
        * Specifies the associated master entity identifier, to be set when creating the store instance
        */
        masterEntityId: null,
        
        /**
        * Specifies owning {@link Baff.app.controller.ActivityController} identifier, to be set when creating the
        * store instance
        */
        ownerId: null,
        
        /**
        * Specifies that sorting should be performed by the service
        * @protected
        */
        remoteSort: true,

        /**
        * Specifies that filtering (searching) should be performed by the service
        * @protected
        */
        remoteFilter: true,

        /**
        * Specifies the number of records to be retrieved in each service request
        * @protected
        */
        pageSize: 25,

        /**
        * Specifies that the store supports paging / more processing
        * @protected
        */
        buffered: true,
        
        clearOnPageLoad: false
        
    },
    
    /**
     * @event postfetch
     * Fires when the store has sucessfully completed a load operation.
     */
    
   
    /**
     * Sets the {@link #storeType} and keys
     */
    constructor: function() {
        
        var me = this;
        me.callParent(arguments);
        
        me.storeType = me.self.getName();
        me.setKeys(me.ownerId, me.getMasterEntityId());
        

    },
    
    /**
     * Loads the store - manages store load state
     */
    load: function() {
        this.currentPage = 1;
        this.hasLoaded = false;
        this.callParent(arguments);
    },
    
     /**
     * Sets {@link hasLoaded} and fires an event if the store has finished loading and the load was successful.
     * Calls the overridden superclass method.
     * @param operation The proxy operation
     * @fires postfetch
     */
    onProxyLoad: function(operation) { 
    
        var me = this;
        
        me.callParent(arguments);
        
        if (!me.isLoading() && operation.wasSuccessful()) {
            
            var firstLoad = false;
            
            if (!me.hasLoaded) {
                me.hasLoaded = true;
                firstLoad = true;
            }
            
            me.fireEvent('postfetch', me, me.getProxy().getResponse(), firstLoad);
            
        }
    },
    
    /**
     * Sets {@link hasLoaded} following removal of the store data.
     * Calls the overridden superclass method.
     */
    removeAll: function() {
        this.hasLoaded = false;
        this.callParent(arguments);    
        
    },
    
     /**
     * Flushes the data
     * @param {boolean} indicates if the store is invalid
     * @fires flush
     */
    flush: function(invalid) {
        this.removeAll();
        this.fireEvent('flush', this, invalid);
        
    },  
    
    /**
     * Return {@link #hasLoaded}, which indicates the store had performed a load operation since
     * being crreated or last refreshed
     * @return {boolean}
     */
    hasLoadedData: function() {
        return this.hasLoaded;
    },
    
    /**
    * Sets an additional parameter on this record's proxy, to be sent to the service.
    * @param {String} param
    * @param {String} value
    */  
    setParam: function(param, value) {
        
        this.getProxy().setExtraParam(param, value);       
    },
    
      
    /**
     * Sets {@link #storeKey} and {@link #masterKey}, as well as any filter on the master entity identifier
     * that will be sent to the service on load operations 
     * @param {String} ownerId The owning {@link Baff.app.controller.ActivityController} identifier
     * @param {String} masterEntityId The associated master entity identifier
     * @private
     */
    setKeys: function (ownerId, masterEntityId) {       
        var me = this;    
        
        // Store key is: store name | master entity type | owner identifier
              
        me.storeKey = Ext.getClassName(this);
        var masterEntityType = null;
        var model = me.getModel();
        
        if (model != null)
           masterEntityType = model.getMasterEntityType();
        
        if (masterEntityType !=null && masterEntityType != '') {
            me.masterKey =  masterEntityType;
            
            if (masterEntityId != null) {
                me.storeKey += "|" + masterEntityId;
                me.masterKey =  masterEntityType+ "|" + masterEntityId;  

                // Set the filter
                var filter = new Ext.util.Filter({
                        property: 'masterEntityId',
                        value: masterEntityId
                    });
                    
                me.addFilter(filter);
            }               
        }
        
         
        if (ownerId != null) {
            me.storeKey += "|" + ownerId;
        }
                
    },
    
    /**
     * Finds a record matching the entity provided
     * @param {Baff.app.model.EntityModel} the entity to find
     * @returns {Baff.app.model.EntityModel} the matching store entity
     */
    findEntity: function(entity) {
        if (entity.getEntityId() != null)
            return this.findRecord('entityId', entity.getEntityId(), 0, false, true, true);
        else
            return null;
    },
    
    /**
     * Adds a filter to the store.
     * @param {Ext.util.Filter} filter The filter to add
     */
    addFilter: function(filter) {
        var me = this;
 
        me.data.addFilter(filter);
        
    },
    
    /**
     * Removes a filter from the store.
     * @param {Ext.util.Filter} filter The filter to remove
     */
    removeFilter: function(filter) {
        var me = this;
        
        me.data.removeFilters(filter);
       
    }
    
});