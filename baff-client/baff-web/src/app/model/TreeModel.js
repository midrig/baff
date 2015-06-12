/**
 *  A TreeModel represents a node in a tree and an associated entity record.
 *  
 *  A typical implementation is as follows:
 *  
 *      Ext.define('MyApp.model.MyTreeModel', {
 *          extend: 'Baff.app.model.TreeModel',
 *
 *          statics: {                
 *               masterEntityType: 'MyApp.model.MyMasterEntityA#MyApp.model.MyMasterEntityB'
 *           }, 
 *          
 *     });
 *                           
 */
Ext.define('Baff.app.model.TreeModel', {
    extend: 'Ext.data.TreeModel',
    
    /**
     * The client side id property, set to avoid conflicy with typical
     * use of 'id' to hold entity identifer
     * @private
     */
    idProperty: 'nodeId',
    
    /**
     * Specifies that this record is a node entity
     * @readonly
     */
    isNodeEntity: true,
    
    inheritableStatics: {
        
        /**
         * Determines if this is a type of master entity
         * @returns {Boolean}
         */
        isMasterEntity: function() {
            return false;
        },
        
        /**
         * Returns the master entity type for this type of entity (this may be itself)
         * @returns {String} The master entity type
         */
        getMasterEntityType: function() {
            return this.masterEntityType;
        },
        
        // This should be a complete set of master entity types
        /**
         * A "#" delimited list of master entity types that the tree supports, e.g. 
         * 'MyApp.model.MyMasterEntityA#MyApp.model.MyMasterEntityB'
         * @cfg masterEntityType
         */
        masterEntityType: null
        
    },
    
    /**
    * Standard fields for all entities that contain the entity identifier, master entity identifier and version
    * @protected
    */
    fields: [
        { name: 'nodeId', type: 'string' },
        { name: 'nodeType', type: 'string' },        
        { name: 'entityId', type: 'string' },
        { name: 'entityType', type: 'string' },
        { name: 'masterEntityId', type: 'string' },
        { name: 'isNewEntity', type: 'boolean' }   // To indicate this is a phantom record to support adding     
    ],
    
    /**
    * Returns the value of {@link #masterEntityType}
    * @return {String}
    */
    getMasterEntityType: function() {
            return this.self.getMasterEntityType();
    },
    
    /**
    * Determines if this is a type of master entity
    * @returns {Boolean}
    */
    isMasterEntity: function() {     
       return false;
    },
    
    /**
     * Called on load
     * @protected
     */
    onLoad: function() {
        var me = this;
        var iconCls = me.setIconCls();
        if (iconCls != null)
            me.set('iconCls', iconCls);
    },
    
    /**
     * Override to set the icon for the node
     * @returns {String} the iconCls
     * @protected
     */
    setIconCls: function() {

        if (this.get('newEntity') == true)
            return 'newnode';
        
        return null;
    },
    
    /**
     * Gets the data entity for the node, if set
     * @returns {Baff.app.model.EntityModel} or null if not set
     */
    getEntity: function() {
        var me = this;
        var entity = null;
        
        // Extract the actual record
         var data = me.get('entityData');

         if (data != null) {

             entity = Ext.create(me.get('entityType'), {
                 clientId: me.getEntityId()
             });

             if (entity != null)
                 entity.set(data);
         }

        if (entity != null) 
            entity.node = me;
        
        return entity;
    },
    
    /**
     * Gets the data entity type for the node
     * @returns {String}
     */
    getEntityType: function() {
        var me = this;
        
        var type = me.get('entityType');
        var name = Ext.ClassManager.getNameByAlias(type);
        
        if (name != "")
            return name;
        else
            return type;
        
        
    },
    
    /**
     * Gets the data entity id for the node
     * @returns {String}
     */
    getEntityId: function() {
        var entityId =  this.get('entityId');
        
         if (entityId == '')
            entityId = null;
        
        return entityId;
    },
    
    getMasterEntityId: function() {
        var entityId =  this.get('masterEntityId');
        
         if (entityId == '')
            entityId = null;
        
        return entityId;
    },
    
    /**
     * Checks if this node matches the entity identifiers
     * @ param {String} entityType the entity name or alias
     * @ param {String} entityId the entity id
     * @ return {boolean}
     */
    isEntity: function (entityType, entityId) {
        var me = this;
        
        if (entityId != me.get('entityId'))
            return false;
        
        // Check against the node entity type
        var nodeEntityType = me.get('entityType');                
        if (nodeEntityType == entityType)
            return true;
        
        // As node entity type may be an alias try to get a related model name
        var nodeEntityName = Ext.ClassManager.getNameByAlias(nodeEntityType);        
        if (nodeEntityName == entityType)
            return true;
        
        // Finally as the entityType passed in may be an alias...
        var entityName = Ext.ClassManager.getNameByAlias(entityType);        
        if (entityName == nodeEntityType || entityName == nodeEntityName)
            return true;
        
        return false;
        
    }
    
});
