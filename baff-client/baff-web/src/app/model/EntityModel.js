/**
 *  An EntityModel represents an entity record, and defines the various fields and validators. It is able
 *  to send its data to a remote service via a {@link Baff.app.model.ServiceProxy}, which is specified
 *  in configuration along with associated URLs.
 *  
 *  This class extends {Ext.data.Model}, which provides more details on field and validator definitions.
 *  
 *  A typical implementation is as follows:
 *  
 *      Ext.define('MyApp.model.MyModel', {
 *          extend: 'Baff.app.model.EntityModel',
 *          alias: 'MyModel',  // Useful to support automatic generation in tree views
 *          requires: ['Baff.utility.Utilities'],
 *
 *          // IMPORTANT: Do NOT set the idProperty as this results in spurious data being sent to the server
 *
 *          statics: {                
 *               masterEntityType: 'MyApp.model.MyMasterEntity',  // specify even if own master
 *               entityIdProperty: 'myEntityId', 
 *               masterEntityIdProperty: 'myMasterEntityId',  // specify if mastered
 *               primaryStoreType: 'MyApp.store.MyEntityStore'  // specify if a master and doing client side version control
 *          }, 
 *                     
 *          fields: [
 *              { name: 'idMyEntity', type: 'int', allowNull: true },
 *              { name: 'foo', type: 'string', defaultValue: 'MY.REF.DATA' },
 *              { name: 'bar', type: 'string' },  
 *              ...
 *          ],
 *          
 *          validators: [
 *              { field: 'foo', type: 'rdpresent' },
 *              { field: 'bar', type: 'present' },
 *              { field: 'bar', type: 'length', max: 200 },
 *              ...
 *           ],             
 *  
 *          doIntegrityValidation: function (action, origRecord) {
 *              // Do some integrity validation...
 *          },
 *          
 *          proxy: {
 *              type: 'serviceproxy',
 *              api:{
 *                  create: 'myapp/myentity/save.json',
 *                  read: 'myapp/myentity/find.json',
 *                  update: 'myapp/myentity/save.json',
 *                  destroy: 'myapp/myentityremove.json'
 *               }
 *     });
 *                           
 */
Ext.define('Baff.app.model.EntityModel', {
    extend: 'Ext.data.Model', 
    requires: ['Ext.data.validator.Length'],
    
    /**
     * The client side id property, set to avoid conflicy with typical
     * use of 'id' to hold entity identifer
     * @private
     */
    idProperty: 'clientId',
    
    /**
     * A list of error messages created during validation
     * @private
     */
    errorMessages: [],
    
    /**
     * A list of error fields created during validation
     * @private
     */
    errorFields: [],
    
    /**
     * The last generation of this instance that was validated, used to avoid unnecessary
     * and/or spurious validation processsing
     * @private
     */
    syncGeneration: 0,
    
    /**
     * Inernal flags defines if the entity is valid; only relevant after validation processing has been invoked
     * @private
     */
    valid: true,
    
    /**
     * The pre-modified entity record passed in to the validation routines
     * @protected
     */
    originalRecord: null,
    
    
    // Display text for locale override
    dtCannotBeModified: "Cannot be modified",
    
   
    inheritableStatics: {
    
        /**
         * Determines if this is a type of master entity
         * @returns {Boolean}
         */
        isMasterEntity: function() {     
            return (this.masterEntityType == null || this.masterEntityType == this.getName());
        },
        
        /**
         * Returns the master entity type for this type of entity (this may be itself)
         * @returns {String} The master entity type
         */
        getMasterEntityType: function() {
            if (this.masterEntityType != null)
                return this.masterEntityType;
            else
                return this.getName();
        },
        
        /**
        * Returns the value of {@link #entityIdProperty}
        * @return {String}
        */
        getEntityIdProperty: function() {
            return this.entityIdProperty;
        },

        /**
        * Returns the value of {@link #masterEntityIdProperty}
        * @return {String}
        */
        getMasterEntityIdProperty: function() {
            return this.masterEntityIdProperty;
        },

        /**
        * Returns the value of {@link #primaryStoreType}
        * @return {String}
        */
        getPrimaryStoreType: function() {
            return this.primaryStoreType;
        },
        
        /**
        * Returns the entity type
        * @return {String}
        */
        getEntityType: function () {
            return this.getName();
        },
    
        /**
         * The master entity type for this entity type, e.g. Customer if this is CustomerAddress
         * @cfg masterEntityType
         */
        masterEntityType: null,
        
        // For one to one mappings, otherwise may overide set methods
        // Although server domain object may handle conversion if not set
        
        /**
         * The master entity id property for the given master entity type, assuming it's a single field;
         * otherwise {@link #getMasterEntityIdProperty} may require to be overridden.
         * Not required if this is a master entity type.
         * @cfg masterEntityIdProperty
         */        
        masterEntityIdProperty: null, 
        
        /**
         * The id property for the this entity type, assuming it's a single field, defaults to 'id';
         * otherwise {@link #geEntityIdProperty} may require to be overridden.
         * @cfg entityIdProperty
         */        
        entityIdProperty: 'id',  
        
        /**
         * The primary store type for this entity, only relevant for master entities and if performing
         * client side version control; this is the type of store where the {@link Baff.utility.versionmanager.VersionManager}
         * will go to look for the master record if it's not been set in the {@link Baff.utility.versionmanager.MasterStore}.
         * @cfg
         */        
        primaryStoreType: null,
        
        /**
         * Literals that define the actions that can be performed on the entity
         */
        ACTION: {
            CREATE: 'CREATE',
            UPDATE: 'UPDATE',
            DELETE: 'DELETE'
        }
   
     },
    
    /**
    * Standard fields for all entities that contain the entity identifier, master entity identifier and version
    * @protected
    */
    fields: [
        { name: 'entityId', type: 'string' },
        { name: 'masterEntityId', type: 'string', allowNull: true },
        { name: 'currencyControl', type: 'string', allowNull: true },
        { name: 'versionControl', type: 'string', allowNull: true }
     ],
      
    /**
    * Performs integrity validation, should be overridden by the subclass if required.  
    * Add errors via {@link #addError} (this will set {@link #valid} automatically) 
    * @param {String} action The type of {@link #ACTION} being performed
    * @param {Baff.app.model.EntityModel} originalRecord The pre-midified entity record
    * @protected
    */
    doIntegrityValidation: function (action, originalRecord) {
        
        // Use this.addError(field, value) to add errors (will also set valid flag)      
    },
    
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
       return this.self.isMasterEntity();
    },
    
    /**
    * Returns the value of {@link #entityIdProperty}
    * @return {String}
    */
    getEntityIdProperty: function() {
        return this.self.entityIdProperty;
    },
    
    /**
    * Returns the value of {@link #masterEntityIdProperty}
    * @return {String}
    */
    getMasterEntityIdProperty: function() {
        return this.self.masterEntityIdProperty;
    },
    
    /**
    * Returns the value of {@link #primaryStoreType}
    * @return {String}
    */
    getPrimaryStoreType: function() {
        return this.self.primaryStoreType;
    },
    
    /**
    * Returns the entity type
    * @return {String}
    */
    getEntityType: function () {
        return this.self.getName();
    },
    
    /**
    * Sets the value of the 'entityId' field and the field defined by {@link entityIdProperty}.
    * @param {String} id The entity identifier
    *
    */
    setEntityId: function (id) {
        this.set('entityId', id);
        
        if (this.getEntityIdProperty() != null)
            this.set(this.getEntityIdProperty(), id);
    },
    
    /**
    * Sets the value of the 'masterEntityId' field and the field defined by {@link masterEntityIdProperty}.
    * @param {String} id The master entity identifier
    */
    setMasterEntityId: function (id) {
        this.set('masterEntityId', id);
        
        if (this.getMasterEntityIdProperty() != null)
            this.set(this.getMasterEntityIdProperty(), id);
    },
   
    /**
    * Returns the value of the 'entityId' field
    * @return {String}
    */
    getEntityId: function () {
        var entityId = this.get('entityId');
        
        if ((entityId == null || entityId == '') && this.getEntityIdProperty() != null)
            entityId = this.get(this.getEntityIdProperty());
        
        if (entityId == '')
            entityId = null;
        
        return entityId;
    },
    
    /**
    * Returns the value of the 'masterEntityId' field
    * @return {String}
    */
    getMasterEntityId: function () {
        var entityId = this.get('masterEntityId');
        
        if (entityId == null && this.isMasterEntity()) ///XXXX
            entityId = this.getEntityId();
        
        if ((entityId == null || entityId == '') && this.getMasterEntityIdProperty() != null)
            entityId = this.get(this.getMasterEntityIdProperty());
            
        if (entityId == '')
            entityId = null;
        
        return entityId;
    },
    
    /**
    * Sets the value of the 'versionControl' field.
    * @param {String} version The version
    */
    setVersion: function (version) {
        this.set('versionControl', version);

    },
    
    /**
    * Returns the value of the 'versionControl' field
    * @return {String}
    */
    getVersion: function () {
       return this.get('versionControl');
    },

    /**
    * Determines if the entity is valid.   
    * Sets various internal properties accordingly.
    * @param {String} action The type of {@link #ACTION} being performed
    * @param {Baff.app.model.EntityModel} originalRecord The pre-midified entity record
    * @return {Boolean}
    */
    isValid: function(action, originalRecord) {
        var me = this;
        
        if (me.syncGeneration !== me.generation) {
            
            me.valid = true;
            me.syncGeneration = me.generation;
            me.errorMessages = [];
            me.errorFields = [];
            me.originalRecord = originalRecord;
                    
            if (action != me.self.ACTION.DELETE) {
            
                var val = me.getValidation();

                if (val.dirty) {
                    Ext.iterate(val.getData(), function(field, value){
                        if(true !== value) this.addError(field, value);        
                    }, me);
                };
            
            }
            
            // Do general integrity validation
            me.doIntegrityValidation(action, originalRecord);
            
        }
        
        return me.valid;
    },
    
    /**
    * Determines if the entity field has been changed. 
    * @param {String} field The field to be tested.
    * @param {String} [message=me.dtCannotBeModified] The message to be displayed if the test fails.
    * @return {Boolean}
    * @protected
    */
    validateNoChange: function (field, message) {
        var me = this;

        if (me.originalRecord) {
            if (me.get(field) != me.originalRecord.get(field)) {
                if (!message) {
                    message = me.dtCannotBeModified;
                }
                me.addSingleError(field, message);
            }
        }
                
    },
    
    /**
    * Processes validation errors.
    * @param {String or Object} field The field or list of fields that are invalid.
    * @param {String} message The message to be displayed
    * @protected
    */  
    addError: function(field, message) {
        var me = this;

        if (typeof field === "object") {
            
            for (var i=0; i<field.length; i++) {
                me.addSingleError(field[i], message);
            }
        } else {
            me.addSingleError(field, message);
        }
    },

    /**
    * Processes a single validation errors.  Marks the entity as invalid by setting {@link #valid} false.
    * @param {String} field The field that is invalid.
    * @param {String} message The message to be displayed
    * @protected
    */  
    addSingleError: function(field, message) {
        var me = this;

        if (me.errorFields.indexOf(field) === -1) {
                        
            me.errorFields.push(field);
            me.errorMessages.push({ id: field, msg: message });
            me.valid = false;
        }
        
    },
    
    /**
    * Initiates validation and returns the list of error messages.
    * @return {Array} errorMessages The list of error message 
    */  
    getErrors: function() {
         var me = this;
        
        me.isValid();
        return me.errorMessages;       
    }, 
    
    /**
    * Sets the action code on this record's proxy, to be sent to the service.
    * @param {String} actionCode
    */  
    setActionCode: function(actionCode) {
        
        this.setParam("actionCode", actionCode);  
    },
    
    /**
    * Sets an additional parameter on this record's proxy, to be sent to the service.
    * @param {String} param
    * @param {String} value
    */  
    setParam: function(param, value) {
        
        this.getProxy().setExtraParam(param, value);       
    }
    
    
    
});


Ext.define('override.data.Validation', {
    override: 'Ext.data.Validation',
    getErrors: function(){
        var errors = [];
        Ext.iterate(this.getData(), function(field, value){
            if(true !== value) this.push({ id: field, msg: value });        
        }, errors);
        return errors;
    }    
});

Ext.define('validator.Present', {
    extend: 'Ext.data.validator.Validator',
    alias: 'data.validator.present',
    validate: function(value){
        return !Ext.isEmpty(value) || 'Must be present';
    }
});

Ext.define('validator.RDPresent', {
    extend: 'Ext.data.validator.Validator',
    alias: 'data.validator.rdpresent',
    validate: function(value){
        if (Ext.isEmpty(value) || value === 0)
            return 'Must be present';
        else
            return true;
    }
});


