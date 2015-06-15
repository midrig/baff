/**
 *  An EntityStore holds a set of {@link Baff.app.model.EntityModel}s associated with a particular 
 *  entity type.  It is able to retrieve its data from a remote service via a {@link Baff.app.model.ServiceProxy}, 
 *  which is specified in configuration along with associated URLs.
 *  
 *  This class extends from {Ext.data.BufferedStore} which cacbes a subset of the data held
 *  on the server and retrieves more data as required.
 *  
 *  A typical implementation is as follows:
 *  
 *      Ext.define('MyApp.store.MyStore', {
 *          extend: 'Baff.app.model.EntityStore',
 *          model: 'MyApp.model.MyModel',  
 *          
 *          // Default sorter
 *          sorters: [{
 *              property: 'foo',
 *              direction: 'ASC'
 *          }],
 *          
 *          // Filters (if required)
 *          filters: [{
 *              property: 'bar',
 *              value: 'val1|val2|val3'  // pipe delimit for multiple values
 *          }],
 *        
 *          // Proxy
 *          proxy: {
 *              type: 'serviceproxy',
 *              url: 'myapp/myentity/findAll.json'
 *          }
 *        
 */          
Ext.define('Baff.app.model.EntityStore', {
    extend: 'Ext.data.BufferedStore',
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
    * Specifies to use the buffer, set to false to get all data in one go
    */
    isBuffered: true,
    
    /**
     * Specifies the number of records to be retrieved in each service request
     * @protected
     */
    pageSize: 250,
    
    /**
     * The master entity filter applied to the store
     * @protected
     */
    masterFilter: null,
    
    /**
     * The field filters applied to the store
     * @protected
     */
    fieldFilters: null,
    
    /**
     * The context filters applied to the store
     * @protected
     */
    contextFilters: null,
    
    
    // Other Ext.data.BufferedStore configurations to manage buffer processing
    leadingBufferZone: 250,
    trailingBufferZone: 1000,
    purgePageCount: 5,
    
    
    config: {
        
        /**
        * Specifies the associated master entity identifier, to be set when creating the store instance
        */
        masterEntityId: null,
        
        /**
        * Specifies owning {@link Baff.app.controller.ActivityController} identifier, to be set when creating the
        * store instance
        */
        ownerId: null
    },
    
    /**
     * @event postfetch
     * Fires when the store has sucessfully completed a load operation.
     */
    
    /**
     * @event flush
     * Fires when the store is flushed as a result of store management
     */
    
   
    /**
     * Sets the {@link #storeType} and keys
     */
    constructor: function() {
        
        var me = this;
        
        me.callParent(arguments);
        
        if (!me.isBuffered) {
            me.setPageSize(999999999);
            me.setLeadingBufferZone(999999999);
            me.setTrailingBufferZone(999999999);
            me.setPurgePageCount(0);
        }
        
        me.fieldFilters = new Ext.util.Collection();
        me.contextFilters = new Ext.util.Collection();
      
        me.storeType = me.self.getName();
        me.setKeys(me.ownerId, me.getMasterEntityId());
        
        if (Utils.userSecurityManager != null && Utils.userSecurityManager.getUserName() != null)
            me.setParam("username",  Utils.userSecurityManager.getUserName());
        

    },
    
    /**
    * Sets an additional parameter on this record's proxy, to be sent to the service.
    * @param {String} param
    * @param {String} value
    */  
    setParam: function(param, value) {
        
        var params = this.getProxy().getExtraParams();
        
        if (params.param != value) {
            this.removeAll();
            this.getProxy().setExtraParam(param, value);
        }
    },
    
    /**
     * Loads the store - manages store load state
     */
    load: function() {
        this.hasLoaded = false;
        this.callParent(arguments);
    },
    
    
     /**
     * Sets {@link hasLoaded} and fires an event if the store has finished loading and the load was successful.
     * Calls the overridden superclass method.
     * @param operation The proxy operation
     * @fires postfetch
     */
    onProxyPrefetch: function(operation) {
        var me = this;
        
        me.callParent(arguments);
        
        if (!me.isLoading() && operation.wasSuccessful()) {
        
            if (!me.isBuffered) {
                me.data.items = me.getRange(0, 999999999);
            }    
            
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
     * being created or last refreshed
     * @return {boolean}
     */
    hasLoadedData: function() {
        return this.hasLoaded;
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
            me.masterKey =  '#' + masterEntityType + '#';
            
            if (masterEntityId != null) {
                me.storeKey += "|" + masterEntityId;
                me.masterKey +=  "|" + masterEntityId;  

                // Set the filter
                me.masterFilter = new Ext.util.Filter({
                        property: 'masterEntityId',
                        value: masterEntityId
                    });

                me.setAutoFilter(false);
                me.getFilters().add(me.masterFilter);
                me.setAutoFilter(true);
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
     * Adds a field filter to the store
     * @param {Ext.util.Filter} filter The filter to apply
     * @param {boolean} auto Set to true to automatically reload the store - defaults to true
     */
    addFieldFilter: function(filter, auto) {
        var me = this;
        
        auto = (auto == null ? true : false);
        me.setAutoFilter(auto);

        me.fieldFilters.add(filter);
        me.getFilters().add(filter);
        
        me.setAutoFilter(true);
        
    },

     /**
     * Removes a field filter from the store
     * @param {Ext.util.Filter} filter The filter to remove
     * @param {boolean} auto Set to true to automatically reload the store - defaults to true
     */

    removeFieldFilter: function(filter, auto) {
        var me = this;
        
        auto = (auto == null ? true : false);
        me.setAutoFilter(auto);

        me.fieldFilters.remove(filter);
        me.getFilters().remove(filter);

        me.setAutoFilter(true);
        
    },
    
    /**
     * Clear all field filters from the store
     * @param {boolean} auto Set to true to automatically reload the store - defaults to false
     */
    clearFieldFilters: function(auto) {
        var me = this;

        if (me.fieldFilters.length > 0) {

            auto = (auto == null ? false : true);
            me.setAutoFilter(auto);

            me.removeAll();
            me.getFilters().remove(me.fieldFilters.items);
            me.fieldFilters.removeAll();
            
            me.setAutoFilter(true);
        
        }
        
    },
    
    /**
     * Returns a count of the field filters applied
     * @returns {integer}
     */
    getFieldFilterCount: function() {
        return this.fieldFilters.length;
    },
    
    /**
     * Sets context filters on the store
     * @param {Ext.util.Filter} filter An array of filters to apply
     * @returns {boolean} If the existing filters were changed
     */
    setContextFilters: function(filters) {
        var me = this;
        
        var filter, storeFilter = null;
        var match = true;
        var filterLength = filters != null ? filters.length : 0;
        
        if (me.contextFilters.length != filterLength) {
            match = false;
        
        } else if (filters != null) {
            
            // Loop through the filters
            for(var i=0; i<filters.length; i++) {

                filter = filters[i];
                storeFilter = me.contextFilters.getByKey(filter.getId());

                if (storeFilter == null || storeFilter.getValue() != filter.getValue()) {
                    match = false;
                    break;
                }       
            }        
        }
        
        if (match) {
            return true; // already setup
        
        } else {
            
            me.setAutoFilter(false);
            me.removeAll();
            
            if (me.contextFilters.length > 0)
                me.getFilters().remove(me.contextFilters.items);
            
            if (filters != null && filters.length > 0)
                me.getFilters().add(filters);
            
            me.contextFilters.removeAll();
            me.contextFilters.add(filters);
            
            me.setAutoFilter(true);
            
        }
        
        return false;
        
    },
    
    // Override to work around an exception that occurs when sorting on a field with a row selected
    // Don't do anything if there is no data available
    onRangeAvailable: function(options) {
        var me = this;
        
        if (me.getTotalCount() > 0)
            me.callParent(arguments)
    },
    
    // Override of non-existing method
    contains: function (record, modifiedFieldNames) {
        return false;
    }
    
});