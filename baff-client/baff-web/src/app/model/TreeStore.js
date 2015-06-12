/**
 *  A TreeStore holds a set of {@link Baff.app.model.TreeModel}.  It is able to retrieve its data from a remote 
 *  service via a {@link Baff.app.model.ServiceProxy}, which is specified in configuration along with associated URLs.
 *  
 *  A typical implementation is as follows:
 *  
 *      Ext.define('MyApp.store.MyTreeStore', {
 *          extend: 'Baff.app.model.TreeStore',
 *          model: 'MyApp.model.MyTreeModel',  
 *        
 *          // Proxy
 *          proxy: {
 *              type: 'serviceproxy',
 *              url: 'myapp/mytree/findNode.json'
 *          }
 *        
 */
Ext.define('Baff.app.model.TreeStore', {
    extend: 'Ext.data.TreeStore',
    requires: ['Baff.app.model.TreeModel'],
 
    /**
     * The model for this store
     * @cfg model
     */
    model: 'Baff.app.model.TreeModel',

    /**
     * The root configuration
     * @private
     */
    root: {
        expanded: true,
        text: "",
        data: []
    },
    
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
        * Specifies owning {@link Baff.app.controller.ActivityController} identifier, to be set when creating the
        * store instance
        */
        ownerId: null
        
    },
    
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
      
        me.storeType = me.self.getName();
        me.setKeys(me.ownerId);
        
        if (Utils.userSecurityManager != null && Utils.userSecurityManager.getUserName() != null)
            me.setParam("username",  Utils.userSecurityManager.getUserName());
        
        me.on('load', me.onLoad, me);

    },
    
    /**
     * Called when the store is loaded to set load state
     * @protected
     */
     onLoad: function(store, records, success, operation, node) {
    
        var me = this;
        
        if (!me.isLoading() && operation.wasSuccessful()) {
        
            me.hasLoaded = true;
            me.fireEvent('postfetch', me, operation.getResponse(), true);
            
        }
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
    setKeys: function (ownerId, masters) {       
        var me = this;    
        
        me.storeKey = Ext.getClassName(this);
        me.masterKey =  '#' + me.getModel().getMasterEntityType() + '#';
            
        if (ownerId != null) {
            me.storeKey += "|" + ownerId;
        }
                   
    },
    
    /**
     * Finds a note for a specific entity
     * @param {String} The entity type as per the node descriptor
     * @param {String} The entity id
     * @returns {Baff.app.model.TreeNode} The node that holds the entity
     */
    findNodeForEntity: function(entityType, entityId) {
        var me = this;
        
        var index = me.findBy(function(node) {
            if (node.isEntity(entityType, entityId))
                return true
        });
            
        if (index == -1)
            return null;
        else
            return me.getAt(index);       
    },
    
    clearFieldFilters: function(auto) {},      
    setContextFilters: function(filters) {}

    
});