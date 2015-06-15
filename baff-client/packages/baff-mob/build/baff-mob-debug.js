/**
 *  Overrides {@link Ext.data.Validations} to add 'present' and 'rdpresent' validators.
 */ 
Ext.define('Baff.app.model.Validations', {
    override: 'Ext.data.Validations',
    
    dtPresentMessage: 'Must be present',

    getPresentMessage: function() {
        return this.dtPresentMessage;
    },
    
    getRdpresentMessage: function() {
        return this.dtPresentMessage;
    },
    
    present: function(config, value) {
        if (arguments.length === 1) {
            value = config;
        }
        return !Ext.isEmpty(value);
    },
    
    rdpresent: function(config, value) {
        if (arguments.length === 1) {
            value = config;
        }
        return !Ext.isEmpty(value) && value !== 0;
    }
});

/**
 *  A FormPanel provides a panel for presenting and capturing business entity data.  It is typically 
 *  presented in a {@link Baff.app.view.FormView} where it is specified via the 
 *  {@link Baff.app.view.FormView #formPanel} configuration property.
 *  
 *  
 *  An example implementation is as follows:
 *  
 *      Ext.define('MyApp.view.MyForm', {
 *          extend: 'Baff.app.view.FormPanel',
 *          alias: 'widget.productform',
 *          
 *          config: {
 *          
 *              items: [{                  
 *                      xtype: 'textfield',
 *                      name: 'foo',
 *                      label: 'Foo',
 *                  },{
 *                      xtype: 'refdatacombobox',
 *                      name: 'bar',
 *                      label: 'Bar',
 *                      refdataClass: 'REFDATA.BAR',
 *                  }]
 *             
 *          }
 *      });
 *
 */        
Ext.define('Baff.app.view.FormPanel', {
    extend: 'Ext.form.Panel',
    xtype: 'formpanel',
    
    requires: ['Ext.field.Checkbox',
                     'Ext.form.FieldSet'],
    
    dirty: false, 
    
    // Display text for locale override
    dtValidationError: 'Validation Error',
    
    config : {
        
        /*
         * Specifies the style to be appled for an invalid field
         */
        invalidFieldCls: 'invalid-field'
    },
    
    /**
     * Resets all the fields in the form to their original values
     */
    setCleanRecord: function (listen) {
        var me = this;
               
        me.getFieldsArray().forEach(function(field) { 
            field.resetOriginalValue();
            field.reset();
            field.removeCls(me.getInvalidFieldCls());
            
            if (listen) {
                field.on('change', me.onFieldChange, me);
                field.on('keyup', me.onFieldChange, me);
            }
        });
        
        if (me.dirty) {
            me.dirty = false;
            this.fireEvent('dirtychange', me, false);
        }
    
    },
    
    /*
     * Sets the form to dirty on a field change
     */
    onFieldChange: function() {
        var me = this;
        
        if (!me.dirty) {
            me.dirty = true;
            this.fireEvent('dirtychange', me, true);
        }
    },
    
     /**
     * Determines if any of the fields are dirty
     * @return {boolean}
     */
    isDirty: function () {     
        return this.dirty;
        
    },
    
    /**
     * Sets all the fields in the form read only (or editable if false)
     * @param {boolean}
     */
    makeReadOnlyForAll: function(readOnly) {
        
        this.getFieldsArray().forEach(function(field) { 
          field.setReadOnly(readOnly);
        });
        
    },
    
    /*
     * Marks fields as invalid and prompts the user with the error messages
     * @param {Array} errors The list of validation errors
     */
    markInvalid: function(errors) {
        var me = this;
        
        me.getFieldsArray().forEach(function(field) {
            field.removeCls('invalidField');
        });
        
        var errorString = '';
        
        errors.forEach(function(error) {
            var sel = Ext.String.format('field[name={0}]', error.id);
            var field = me.down(sel);
            errorString += field.getLabel() + ": " + error.msg + '<br>';
            field.addCls(me.getInvalidFieldCls());
        });
        
        Ext.Msg.alert(me.dtValidationError, errorString);
        
    }
    
});

/*
 * Override for checkbox to provide setReadOnly function.
 */
Ext.define('Baff.app.field.Checkbox', {
    override: 'Ext.field.Checkbox',
    
    setReadOnly: function(readOnly) {
        if (readOnly)
            this.disable();
        else
            this.enable();
    }
});

/*
 * Override for slider to reset to original value.
 */
Ext.define('Baff.app.field.Slider', {
    override: 'Ext.field.Slider',
    
    reset: function() {
        if (this.originalValue != null) {
            this.setValue(this.originalValue)
            this.onSliderChange();
        }
        else
            this.callParent(arguments);
    }
});
    
    
    

/**
 *  A Logger provides console logging methods for INFO, DEBUG and ERROR levels.  If there is no
 *  console logger available then logging will not occur.  Logging levels can be toggled at runtime.
 *  
 */
Ext.define('Baff.utility.logger.Logger', {     
    extend: 'Ext.Base',
    
    config: {
    
        // Flags to indicate if logging is enabled
        enableInfo: true,
        enableDebug: true,
        enableError: true
    
    },
    
    // Logging function references
    info: null,
    debug: null,
    error: null,
    
    /**
    *  Sets the logging for all levels; could be modified for production release.
    *  TODO: look for global settings.
    */
    constructor: function(config) {
        
        this.initConfig(config);
 
        this.setInfoLogger (this.getEnableInfo());
        this.setDebugLogger (this.getEnableDebug());
        this.setErrorLogger (this.getEnableError());
 
    },
    
    /**
    *  Enables the INFO logger
    *  @param {boolean}
    */
    setInfoLogger: function (enabled) {
        
        if (typeof console != 'undefined' && enabled) 
            this.info = Function.prototype.bind.call(console.log, console);
        else     
            this.info = function() {return;};
        
    },
    
    /**
    *  Enables the DEBUG logger
    *  @param {boolean}
    */
    setDebugLogger: function (enabled) {
        
        if (typeof console != 'undefined' && enabled) 
            this.debug = Function.prototype.bind.call(console.debug, console);
        else     
            this.debug = function() {return;};
        
    },
    
    /**
    *  Enables the ERROR logger
    *  @param {boolean}
    */
    setErrorLogger: function (enabled) {
        
        if (typeof console != 'undefined' && enabled) 
            this.error = Function.prototype.bind.call(console.error, console);
        else     
            this.error = function() {return;};
        
    }
    
    
});

    

    



/**
 *  An EntityModel represents an entity record, and defines the various fields and validators. It is able
 *  to send its data to a remote service via a {@link Baff.app.model.ServiceProxy}, which is specified
 *  in configuration along with associated URLs.
 *  
 *  This class extends {Ext.ata.Model}, which provides more details on field and validator definitions.
 *  
 *  A typical implementation is as follows:
 *  
 *      Ext.define('MyApp.model.MyModel', {
 *          extend: 'Baff.app.model.EntityModel',
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
 *          config: {
 *                     
 *              fields: [
 *                  { name: 'idMyEntity', type: 'int', allowNull: true },
 *                  { name: 'foo', type: 'string', defaultValue: 'MY.REF.DATA' },
 *                  { name: 'bar', type: 'string' },  
 *                  ...
 *               ],
 *          
 *              validators: [
 *                  { field: 'foo', type: 'rdpresent' },
 *                  { field: 'bar', type: 'present' },
 *                  { field: 'bar', type: 'length', max: 200 },
 *                  ...
 *               ],             
 *  
 *              proxy: {
 *                  type: 'serviceproxy',
 *                  api:{
 *                      create: 'myapp/myentity/save.json',
 *                      read: 'myapp/myentity/find.json',
 *                      update: 'myapp/myentity/save.json',
 *                      destroy: 'myapp/myentityremove.json'
 *                   }
 *               }
 *               
 *          },
 *               
 *          doIntegrityValidation: function (action, origRecord) {
 *              // Do some integrity validation...
 *          }
 *          
 *     });
 *                           
 */
Ext.define('Baff.app.model.EntityModel', {
    extend: 'Ext.data.Model', 
    requires: ['Ext.data.Validations',
        'Baff.app.model.Validations'],
    
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
         * @cfg masterEntityType (required)
         */
        masterEntityType: null,
        
        // For one to one mappings, otherwise may overide set methods
        // Although server domain object may handle conversion if not set
        
        /**
         * The master entity id property for the given master entity type, assuming it's a single field;
         * otherwise {@link #getMasterEntityIdProperty} may require to be overridden.
         * Not required if this is a master entity type.
         * @cfg masterEntityIdProperty (required)
         */        
        masterEntityIdProperty: null, 
        
        /**
         * The id property for the this entity type, assuming it's a single field, defaults to 'id';
         * otherwise {@link #geEntityIdProperty} may require to be overridden.
         * @cfg entityIdProperty (required)
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
     
     config:  {
      
       /**
        * Specifies id property used by the sencha framework, avoiding conflict with any 'id' fields
        */
       idProperty: 'clientId',
    
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
        * Specifies to setup the model from raw data, ignoring fields configuration
        */
        setDataFromRaw: false
     },
     
     /*
     * Override to support creation from raw data
     * @param {type} rawData
     * @returns {undefined}
     */
     setData: function(rawData) {
         var me = this
         if (me.getSetDataFromRaw()) {
             me.data = me.raw;
             return me;
         } else {
             return me.callParent(arguments);
         }
     },
      
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
            
                var errors = me.validate();  
               
                if (!errors.isValid()) {
                    Ext.iterate(errors.all, function(error){
                         this.addError(error.getField(), error.getMessage());        
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



/**
 *  A ServiceProxy provides an interface to underlying services and is specifed in {@link Baff.app.model.EntityModel}
 *  and {@link Baff.app.model.EntityStore} configuration to send and retrieve data.
 */ 
Ext.define('Baff.app.model.ServiceProxy', {
    extend: 'Ext.data.proxy.Ajax',
    alias: 'proxy.serviceproxy',
    
    /**
     * Sets the id paramater sent to the service as the 'entityId' field in {@link Baff.app.model.EntityModel}.
     * @private
     */  
    idParam: 'entityId',
    
    config: { 
    
        /**
         * The service response reader
         * @private
         */  
        reader: {

             type: 'json',            
             rootProperty: 'data',
             totalProperty: 'total',
             useSimpleAccessors: true // Allows use "." in field names

        },

        /**
         * The service request writer
         * @private
         */  
        writer: {
               type: 'json',
               allowSingle:true,
               encode:true,
               writeAllFields: true,
               writeRecordId: false,
               rootProperty:'data'       
        }
    },
    
    /**
     * Returns the JSON data from the service response
     * @return {String}
     */  
    getResponse: function() {
        return this.getReader().rawData;
    }
    

});
    


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


/**
 *  A MasterModel holds a reference to a master entity, to be held in the {@link Baff.utility.versionmanager.MasterStore}.
 *  
 */
Ext.define('Baff.utility.versionmanager.MasterModel', {
     extend: 'Ext.data.Model', 
     
     config: {
     
        fields: [
           { name: 'entityType', type: 'string' },
           { name: 'entityId', type: 'string' },
           { name: 'versionControl', type: 'string' },
           { name: 'data', type: 'string' }
        ]
        
    },
     
    idParam: 'entityId',
     
    /**
    *  Returns the version of the master entity
    *  @returns {String}
    */
     getVersion: function() {
        return this.get('versionControl');
     },
     
    /**
    *  Returns the JSON encoded data for the master entity record
    *  @return {String}
    */
     getData: function() {
        return this.get('data');
     }
    
});

/**
 *  A MasterStores holds the references to cached master entity records defined by
 *  {@link Baff.utility.versionmanager.MasterModel}.
 *  
 */
Ext.define('Baff.utility.versionmanager.MasterStore', {
    extend: 'Ext.data.Store',
    requires: ['Baff.utility.versionmanager.MasterModel'],
    
    config: { 
    
        model: 'Baff.utility.versionmanager.MasterModel'
        
    },
    
    /**
    * Returns the master reference record for the given type and identifier
    * @param {String} type The entity type
    * @param {String} id The entity identifier
    * @returns {Baff.utility.versionmanager.MasterModel} or null if does not exist.
    */
    getMaster: function(type, id) {      
        var me = this;
     
        var index = me.findBy(function(rec, recId) {
            if (rec.get('entityId') == id &&
                rec.get('entityType') == type) {
                return true;
            } else {
                return false;
            }
        });
    
        if (index > -1) {
            var master = Ext.create(type);
            master.set(Ext.decode(me.getAt(index).getData()));
            return master;
        }
        else
            return null;  
    },
    
    /**
    * Removes the master reference record for the given type and identifier, if it exists
    * @param {String} type The entity type
    * @param {String} id The entity identifier
    */
    removeMaster: function(type, id) {
        
        var me = this;
     
        var index = me.findBy(function(rec, recId) {
            if (rec.get('entityId') == id &&
                rec.get('entityType') == type) {
                return true;
            }else {
                return false;
            }
        });
        
        if (index > -1) {
            Utils.logger.info("MasterStore::removeMaster, removing type: " + type + " ,id: " + id);
            me.removeAt(index);
        }
 
    },
    
    /**
    * Stores a master reference record for the given master entity.
    * @param {Baff.app.model.EntityModel} master The master entity
    * @return {Baff.utility.versionmanager.MasterModel} The master record stored
    */
    storeMaster: function (master) {
        var me = this;
       
        var type = master.getMasterEntityType();
        var id = master.getEntityId();
        
        // Remove any existing master record
        me.removeMaster(type, id);
        
        // Create a new one and add it to the store
        var newRecord = Ext.create('Baff.utility.versionmanager.MasterModel'); 
                
        newRecord.set('entityId', id);
        newRecord.set('entityType', type);
        newRecord.set('versionControl', master.getVersion());
        
        var data = master.getData({serialize: true});
        var encoded = Ext.encode(data);
        
        newRecord.set('data',encoded)     

        me.add(newRecord);
        
        return newRecord;
    },
    
     /**
    * Flushes the master store
    * @param {String} type The master entity type to be flushed
    */
    flushMaster: function (type) {
        var me = this;

        Utils.logger.info("MasterStore::flushMaster, removing type: " + type);
        
        var records = [];
        var i=0;
        
        me.each(function(rec) {
           if (rec.get('entityType') == type) {
                records[i] = rec;
                i++;
            }
        });
        
        me.remove(records);
        
    }
 
});

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
        
    requires: [
                    'Baff.utility.storemanager.EntityStoreManager' ,
                    'Baff.utility.versionmanager.MasterStore'],
    
    
    /**
     * The master entity store
     * @private
     */  
    masterStore: null,
    
    /**
     * Sets the {@link masterStore}
     */  
    constructor: function() {
 
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
                    
                    // Refreshing for a mastered entity, so get a new copy of the master - this will result
                    // in a flush of the specific mastered data, so just flush the master data here
                    me.loadMaster(type, id);
                    Utils.entityStoreManager.flushMasterStores(type);
                
                } else {
                    // General refresh so need to flush all master records, master and mastered data for the given master type 
                    me.flushMaster(type);
                    Utils.entityStoreManager.flushMasteringStores(type);
                }
            } else {
                
                // Refreshing for a mastered entity - store the new master provided and flush all master data and only specific mastered data
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
         // Remove the master to start with in case of delay in loading a new one
        me.masterStore.removeMaster(type, id);            
        
        // Set the username
        var username = null;
        
        if (Utils.userSecurityManager != null)
            username =  Utils.userSecurityManager.getUserName();
        
        Ext.ClassManager.get(type).load(id, { 
            params: {
                'entityId': id,
                'username': username
            },
            callback: function(record, operation) {
                if (!operation.success || operation.getRecords().length == 0) {
                    
                    Utils.logger.info("VersionManager::loadMaster, failed to load master of type= " + type + " ,id= " + id);
                    
                    // If we don't get the master then we should notify this
                    Utils.entityStoreManager.flushMasteredStores(type, id, true);

                
                } else {
                    
                    me.storeMaster(record);
                    
                    // Now flush any data associated with the master but don't flush the related master stores as this
                    // is unnecessary and will cause multiple retrievals
                    Utils.entityStoreManager.flushMasteredStores(type, id);
                }
                
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

/**
 *  A User Permissions Store holds permissions for a specific user, loaded via a service proxy.
 *  
 */
Ext.define('Baff.utility.usersecurity.UserPermissionsStore', {
    extend: 'Ext.data.Store',
    requires: 'Baff.app.model.ServiceProxy',
    
    
    config: { 

        // The permission model - simply a string
        fields: [
            {name: 'permission', type: 'string'}
        ],

        /**
         * The proxy for the service to retrieve the user permissions
         * @private
         */  
        proxy: {
            type: 'serviceproxy',
            actionMethods: {
                read: 'POST'
            }
        }
    
    },
    
    /**
     * Finds a user role (permission) in the store
     * @param {String} role
     * @return {Number} The index of the record, or -1 if doesn't exist
     */  
    findUserRole: function(role) {
        
        return this.find('permission', role);
        
    }
    
    
});


/**
 *  The UserSecurityManager manages user acess logon, logoff and access control based on user
 *  permission held in a {@link Baff.utility.usersecurity.UserPermissionsStore}.
 *  
 *  The url to an associated service to retrieve the user permissions should be set by the application
 *  via the {@link #setUrl} method.
 *  
 */
Ext.define('Baff.utility.usersecurity.UserSecurityManager', {
    extend: 'Ext.Base',
    requires: ['Baff.utility.usersecurity.UserPermissionsStore'],
    
    /**
     * The permissions store
     * @private
     */  
    permissionStore: null,
    
    /**
     * The user name for the logged on user
     * @private
     */  
    username: null,
    
    
    config: {
    
        /**
         * The service root url
        */  
        serviceRootUrl:  '/user',
        
        /**
         * Default permissions
         */
        defaultPermissions: null
    
    },
    
    /**
     * Creates the user permissions store
     */  
    constructor: function(config) {
         
        this.initConfig(config);        
        this.permissionStore = Ext.create('Baff.utility.usersecurity.UserPermissionsStore');
        
    },
    
    /**
     * Gets the logged on user name.
     * @param {String}
     */  
    getUserName: function() {
        return this.username;
    },

    /**
     * Loads the user permissions into the {@link Baff.utility.usersecurity.UserPermissionsStore}.
     * @param {String} username The user name
     * @param {String} password The user password
     * @param cbFun The function to be called back
     * @param cbScope The scope for the call back function
     */  
    logon: function(username, password, cbFun, cbScope) {       
        Utils.logger.info("UserSecurityManager::logon");
        var me = this;
    
        me.username = username;
        me.permissionStore.getProxy().setUrl(this.getServiceRootUrl() + '/permission/findAll.json');
       
        me.permissionStore.load({
           
           params: {
                username: username,
                password: password
           },
           callback: function(records, operation, success) {
                cbFun(operation, success, cbScope);
           }
           
        });

    },
    
    /**
     * Determines if the user has the given role(s)
     * @param {String or Array} roles A single role or list of roles
     * @returns {boolean}
     */  
    isUserInRole: function(roles) {    
        Utils.logger.info("UserSecurityManager::isUserInRole");
        var me = this;
        var found = false;
        
        Ext.Array.each(roles, function(role, index) {
                if (me.permissionStore.findUserRole(role) !== -1) {
                    found = true;
                    return false;;
                }
        });
        
        return found;
        
    },
    
    /**
     * Removes all the data from the permissions store.
     */  
    logoff: function() {
        
        Utils.logger.info("UserSecurityManager::isUserInRole");
        var me = this;
        
        Ext.Ajax.request({url: me.getServiceRootUrl() + '/logout.json'});
        
        me.permissionStore.removeAll();
        me.username = null;
    }
    
});

    

    



/**
 *  The LocalRefDataProvider loads locally defined reference data into a reference data store.  This
 *  class may be updated to define local reference data. In production the {@link Baff.utility.refdata.RefDataManager}
 *  should retrieve reference data from a service.
 *  
 */
Ext.define('Baff.utility.refdata.LocalRefDataProvider', {	
    extend: 'Ext.Base',
    
    /**
     * Load locally defined reference data into the given store.
     * @param {Ext.data.Store} The store to be loaded.
     */  
    loadRefDataStore: function (store) {
        
        if (store.getStoreId() === 'REF.DATA.NOCLASS') {
 
            store.add([
                {"key": "REF.DATA.NULL", "code":0, "decode":"Not Applicable"}
            ]);
        
        }
    }
});





/**
 *  A RefDataModel holds a reference to a reference data record, where the key is in the format:
 *  "DOMAIN.CLASS.RECORD" - a class reference is defined as "DOMAIN.CLASS".
 *  
 */
Ext.define('Baff.utility.refdata.RefDataModel', {
    extend: 'Ext.data.Model',
    
    config: {
        fields: [

            { name: 'key', type: 'string' },
            { name: 'code', type: 'int' },
            { name: 'decode', type: 'string' }

        ]
    }
    
});

/**
 *  The RefDataManager manages access to reference data classes and their storage. Reference
 *  data records are defined by {@link Baff.utility.refdata.RefDataModel}, where the key is in the format:
 *  "DOMAIN.CLASS.RECORD" - a class reference is defined as "DOMAIN.CLASS".
 *  
 *  Note that a "null" or "not known" reference data code defaults to 0.
 *  
 *  The url to an associated service to retrieve reference data  should be set by the application
 *  via the {@link #setServiceUrl} method.
 */
Ext.define('Baff.utility.refdata.RefDataManager', {	
    extend: 'Ext.Base',
    requires: ['Baff.utility.refdata.RefDataModel'],
    
    config: {
    
    /**
     * The url of the service to retrieve reference data from.
     */  
        serviceRootUrl: null
    
    },

    constructor: function(config) {
         
        this.initConfig(config);
        
    },

    /**
     * Returns the store that holds the reference data records for a given class
     * @param {String} refdataclass The reference data class ("DOMAIN.CLASS" part of the complete key)
     * @returns {Ext.data.Store}
     */  
    getRefDataStore: function (refdataclass) {
        var me = this;
        var store = Ext.getStore(refdataclass);
        
        if (store == null) {
             store = me.createRefDataStore (refdataclass);
        }

        return store;
    },

    /**
     * Creates a new store to hold reference data.
     * TO DO: Load the data from the server
     * @param {String} refdataclass The reference data class ("DOMAIN.CLASS" part of the complete key)
     * @returns {Ext.data.Store} The store holding the reference data records
     * @private
     */  
    createRefDataStore: function (refdataclass) {
        var me = this;
        var store = Ext.create('Ext.data.Store', {

            storeId: refdataclass,
            model: Baff.utility.refdata.RefDataModel
            
        });
        
        
        // If server side reference data enabled
        if (me.getServiceRootUrl() != null) {
            var url = me.getServiceRootUrl() + '/find.json';
            var proxy = Ext.create('Baff.app.model.ServiceProxy', {
                url: url
            });
            
            proxy.setExtraParam("refdataclass", refdataclass);      
            store.setProxy(proxy);
            
            store.load();
            
         
        } else {
             
            Utils.localRefDataProvider.loadRefDataStore(store);
        
        }
        return store;

    },
    
    
    /**
     * Get the code for a given reference data class and record key.
     * Ensure the reference data has been loaded before calling this method.
     * @param {String} key The key (exluding the class and domain)
     * @param {String} [refdataclass="null"] The reference data class ("DOMAIN.CLASS" part of the record key)
     * @returns {String}
     */  
    getCode: function (key, refdataclass) {
        var me = this;       
        
        if (refdataclass == null) {
            var sep = key.split('.');    
            if (sep.length == 3) {
                refdataclass = sep[0] + "." + sep[1];
            }
            else {
                Utils.logger.error("Invalid reference data class specified");
                return null;
            }
        } else {
            key = refdataclass + "." + key;
        }
        
        var store = me.getRefDataStore(refdataclass);
        
        var record = store.findRecord('key', key);
        if (record) {
            return record.get('code');
        } else {
            Utils.logger.error("Reference data not found - ensure reference data has been loaded, class= " + refdataclass + ", key= " + key);
            return null;
        }
        
    },
    
    /**
     * Get the list of decodes for a given reference data key.
     * Ensure the reference data has been loaded before calling this method.
     * @param {String} The reference data class ("DOMAIN.CLASS" part of the complete key)
     * @returns {Array}
     */  
    getCodeDecodeArray: function (refdataclass) {
        var me = this;
        var decodes = [],
              record;   
 
        var store = me.getRefDataStore(refdataclass);
        var count = store.count();
        
        if (count < 1) {
            Utils.logger.error("Reference data not found - ensure reference data has been loaded");
            return null;
        }
        
        for (var i=0; i<count; i++) {            
            
            record = store.getAt(i);
            decodes[i] = record.data; 
        }
        
        return decodes;
                
    },
    
    /**
     * Get the decode for a given reference data class and code.
     * Ensure the reference data has been loaded before calling this method.
     * @param {String} The reference data class ("DOMAIN.CLASS" part of the complete key)
     * @param {String} The reference data code
     * @returns {String}
     */  
    getDecode: function (code, refdataclass) {
        var me = this;
        var store = me.getRefDataStore(refdataclass);
        var record = store.findRecord('code', code);
        if (record) {
            return record.get('decode');
        } else {
            Utils.logger.error("Reference data not found - ensure reference data has been loaded");
            return null;
        }
        
    }
    
    
});

/**
 *  Holder for global variables and applicatin configuration.
 *  Should be updated for specific application deployments.
 */
Ext.define('Baff.utility.Globals', {
    extend: 'Ext.Base',
    
    /**
     * The application.
     * **IMPORTANT** This should be set in Ext.app.Application.init
     */ 
    application: null,
        
     /**
     * The application viewport of type 'Baff.utility.application.Viewport'
     * This should be set when the viewport is created to manage view masking on load.
     * Set by Baff.utility.application.MainApplicationController if using this.
     */    
    viewport: null,
        
    /**
     * The application name used for display purposes.
     * **IMPORTANT** This should be set in Ext.app.Application.init
     */   
    applicationName: "MyApp",
        
    /**
     * Root url for user security security service
     * **IMPORTANT**: This must be set here or else call UserSecurityManager.setServiceRoorUrl in Ext.app.Application.init
     */
    securityServiceRootUrl: 'myapp/user',
        
    /**
     * Root url for user reference data security service.
     * **IMPORTANT**: This must be set here or else call RefDataManager.setServiceRoorUrl in Ext.app.Application.init
     */
    refdataServiceRootUrl: 'myapp/refdata',
        
    /**
     * Indicates whether to generally use client side version control
     * Defaults to true; if not required should be set to false in Ext.app.Application.init
     */
    useVersionManager: true,
        
    /**
     * Indicates whether to generally pro-actively check entity versions on load (if using client side version control)
     * Defaults to true; if not required should be set to false in Ext.app.Application.init
     */
    checkVersionOnView: true,
    
    /**
     * Indicates whether to generally set entity versions from the master (if using client side version control)
     * Defaults to true; if not required should be set to false in Ext.app.Application.init
     */ 
    setVersionFromMaster: true,
    
    /**
     * Indicates whether to generally set entity versions from the master (if using client side version control)
     * Defaults to true; if not required should be set to false in Ext.app.Application.init
     */ 
    autoRefreshOnLock: true,   
    
    /**
     * Splash screen delay
     * Defaults to 2 seconds; alternative value should be set in Ext.app.Application.init
     */
    splashScreenDelay: 2000, 
    
    /**
     * The name of the main navigation view to be created by Baff.utility.application.MainApplicationController
     * Defaults to 'mainnavigationview'; alternative value should be set in Ext.app.Application.init
     */    
    mainView: 'mainnavigation',        
    
     /**
     * Specifies if the application manages users
     * This should be set to true in Ext.app.Application.init if required 
     */
    manageUsers: false,
    
     /**
     * Default user permissions when creating a new user
     * This must be set here or else call UserSecurityManager.setDefaultPermissions in Ext.app.Application.init
     */
    defaultPermissions: 'myapp.read, myapp.update',
    
    /**
     * Default user name for login
     * This should be set in Ext.app.Application.init if required, typically on for  non production builds
     */
    defaultUsername: "",
    
    /**
     * Default password for login
     * This should be set in Ext.app.Application.init if required, typically on for  non production builds
     */
    defaultPassword: "",
    
     /**
     * Default setting for logging 'info' messages.
     * May be overwritten by a build property that replaces "$LOGGER_INFO$"
     */
    logInfo: true,
    
    /**
     * Default setting for logging 'debug' message. 
     * May be overwritten by a build property that replaces "$LOGGER_DEBUG$"
     */
    logDebug: true,
    
    /**
     * Default setting for logging 'error' messages.
     * May be overwritten by a build property that replaces "$LOGGER_ERROR$"
     */
    logError: true,
    
    /**
     * Default version.
     * May be overwritten by a build property that replaces "$$BUILD_VERSION$$"
     */
     version: "[Development]",
        
    
    /**
     * Constructor - set any globals based on build properties here
     */ 
    constructor: function (utils) {
        var me = this;
         
        me.version = utils.getBuildProperty('$BUILD_VERSION$', me.version);
        
    }
    
});

    

    



/**
 *  Utilities provides access to the various utility services:
 *  
 *    - Store Manager, the default is a {@link Baff.utility.storemanager.EntityStoreManager}
 *    - Version Manager, the default is a {@link Baff.utility.versionmanager.VersionManager}
 *    - Security Manager, the default is a {@link Baff.utility.usersecurity.UserSecurityManager}
 *    - Reference Data Manager, the default is a {@link Baff.utility.refdata.RefDataManager}
 *    - Local Reference Data Provider, the default is a {@link Baff.utility.refdata.LocalRefDataProvider}
 *    - Logger, the default is a {@link Baff.utility.logger.Logger}
 *  
 *  These should be setup by the Application during initialisation if different services are required.
 *  
 *  The services can be accessed using the shorthand name 'Utils', e.g. Utils.logger
 */
Ext.define('Baff.utility.Utilities', {
    extend: 'Ext.Base',
    alternateClassName: 'Utils',  
    singleton: true,
    
    requires: ['Baff.utility.logger.Logger',
                    'Baff.utility.storemanager.EntityStoreManager',
                    'Baff.utility.versionmanager.VersionManager',
                    'Baff.utility.usersecurity.UserSecurityManager',
                    'Baff.utility.refdata.LocalRefDataProvider',
                    'Baff.utility.refdata.RefDataManager',
                    //'Baff.utility.workflow.WorkflowManager',
                    'Baff.utility.Globals'
                     ],
    
    /**
     * The entity store manager
     */
    entityStoreManager: null,
    
    /**
     * The version manager
     */
    versionManager: null,
    
    /**
     * The user security manager
     */
    userSecurityManager: null,
    
    /**
     * The reference data manager
     */
    refDataManager: null,
    
    /**
     * The local reference data provider
     */
    localRefDataProvider: null,
    
     /**
     * The workflow manager
     */
    workflowManager: null,
    
    /**
     * The logger
     */
    logger: null,
    
    /**
     * Global variables
     */
    globals: null,
   
    
    /**
     * Initialises the utility services
     */
    constructor: function() {
        var me = this;
        
        me.globals = Ext.create('Baff.utility.Globals', me);

        me.entityStoreManager = Ext.create('Baff.utility.storemanager.EntityStoreManager');
        me.versionManager = Ext.create('Baff.utility.versionmanager.VersionManager');
    
        me.userSecurityManager = Ext.create('Baff.utility.usersecurity.UserSecurityManager', {
            serviceRootUrl: me.globals.securityServiceRootUrl,
            defaultPermissions: me.globals.defaultPermissions
        });       
        
        me.refDataManager = Ext.create('Baff.utility.refdata.RefDataManager', {
            serviceRootUrl: me.globals.refdataServiceRootUrl
        });
        
        me.localRefDataProvider = Ext.create('Baff.utility.refdata.LocalRefDataProvider');
        
        me.logger = Ext.create('Baff.utility.logger.Logger' , {  
            enableInfo: me.getBuildProperty('$LOGGER_INFO$', me.globals.logInfo),
            enableDebug: me.getBuildProperty('$LOGGER_DEBUG$', me.globals.logDebug),
            enableError:  me.getBuildProperty('$LOGGER_ERROR$', me.globals.logError)     
        });
        
    },
    
    /**
     * Gets a build property
     * @param {String} property The property to get
     * @param {String} defaultValue The default value if it was not set
     */
    getBuildProperty: function (property, defaultValue) {
            
            if (property[0] == '$') {
                return defaultValue;
            } else {
                if (property == "true")
                    return true;
                else if (property == "false")
                    return false
                else
                    return property;
            }
    }
    
});

    

    



/**
 *  An ActvityController controls the components involved in a discrete activity, such as maintaining a 
 *  business data entity, where an activity represents a logical unit of work involving CRUD operations
 *  upon upon a particular {@link Baff.app.model.EntityModel}.and requiring a 
 *  {@link Baff.app.view.ActivityView} to present the data and a {@link Baff.app.model.EntityStore} 
 *  to hold the data, following an MVC pattern.
 *  
 *  All types of activity controllers such as those based on {@link Baff.app.controller.FormController}, 
 *  {@link Baff.app.controller.ListFormController} and {@link Baff.app.controller.SelectorController} rely on
 *  this base class and associated configuration. 
 *  
 *  This class provides the core processing for managing activity state and performing operations on a 
 *  data entity.  However outside of the activity view it does not manage any other user interface components;
 *  the subclasses referenced above support specific activity design patterns and associated user interface.
 *  
 *  Client side version control is specified by default by setting {@link #useVersionManager}, with master
 *  version control set via {@link setVersionFromMaster}, and version checking on load by 
 *  {@link #checkVersionOnView}.
 *  
 *  The view will be enabled by default if dependent on a master and master record is available. Subclasses
 *  should override {@link #enableOnMasterChange} to check master properties.
 *  
 *  This class extends {Ext.app.Controller}, however subclasses should generally not require to configure
 *  the superclass properties.  
 *  
 *  Important Note: In the Sencha Touch framework this is a singleton that in theory
 *  may manage multiple view instances; however in the Baff framework a single controller instance is intended
 *  to control a single view instance, therefore the application needs to be designed as such.  This means that
 *  two instances of the same view/controller would need to be setup as two different sets of classes.  However
 *  given that a mobile UI is typically a single document interface, this scenario is not considered likely and in
 *  any event can be catered for through extensions of a base class, i.e. define MyView and MyController then 
 *  extend them to define MyView1/MyController1, MyView1/MyController2 etc. 
 *  
 */
Ext.define('Baff.app.controller.ActivityController', {
    extend: 'Ext.app.Controller', 
    requires: ['Baff.utility.Utilities'],
    alias: 'controller.activity',
    
    /**
     * Defines if read actions are allowed, will be set based on user permissions
     * @readonly 
     */
    allowRead: true,
    
    /**
     * Defines if add, modify and remove actions are allowed, will be set based on user permissions
     * @readonly 
     */
    allowUpdate: true,
    
    /**
     * A unqiue ID for the controller instance, used for store ownership.  It will be set automatically. 
     * @readonly
     */       
    ID: null,
    
    /**
     *  A combination of name and ID used for logging purposes
     * @readonly 
     */
    identifier: null,
   
    /**
     * The {@link Baff.app.model.EntityModel} instance currently being operated on.
     * @readonly
     */
    currentRecord: null,
    
    /**
     * The {@link Baff.app.model.EntityStore} that holds the data for the activity.  It will be unique to 
     * this activity controller unless {@link #storeOwner} is set to false.
     * @readonly   
     */
    entityStore: null,
     
    /**
     * The {@link Baff.app.model.EntityModel} that represents the data entity managed by this activity.
     * @readonly 
     */
    entityModel: null,
    
    /**
     * The master entity identifier for the entity managed by this activity, if it has a master. 
     * @readonly 
     */
    masterEntityId: null,
    
    /**
     * The activity view manged by this controller.
     * @readonly  
     */
    activityView: null,
    
    /**
     * Holds an externally set master entity identifier used to reset this controller when it's view is
     * re-activated.  This will be set as a result of {@link #masterentitychange} event. 
     * @private 
     */
    extMasterEntityId: null,
    
    /**
     * Holds an externally set context list of name value pairs 
     * @readonly
     */
    extContext: null,
    
    /**
     * Holds an internally set context list of name value pairs 
     * @private 
     */
    filterContext: null,
    
    /**
     * Holds the filters being applied to the store based on context
     * @private 
     */
    activeContextFilters: null,
    
    /**
     * Indicates the activity has been fully initialized
     * @private 
     */
    isInitialized: false,
     
    /**
     * Indicates if context has been set
     * @private 
     */
    contextSet: false,
    
     /**
     * Indicates if a data refresh is required
     * @protected 
     */
    dataRefresh: true,
    
     /**
     * The refresh button
     * @readonly
     */   
     refreshButton: null,
     
     /**
    * The close button
    * @readonly
    */   
    closeButton: null,
    
    /**
    * Indicates if the view is active
    * @readonly
    */   
    isActive: false,

     /**
      * Literals to define operation type
      * @readonly
      */
     OPERATION: {
        SAVE: 'OPERATION_SAVE',
        REMOVE: 'OPERATION_REMOVE',  
        LOAD: 'OPERATION_LOAD'
     },
    
    /**
     * Literals to define service response type.  These values must match with those returned
     * by the service.
     * @readonly
     */
    RESULT: {
     
        OK: 'RESULT_OK',
        FAIL_SYSTEM_ERROR: 'RESULT_FAIL_SYSTEM_ERROR',
        FAIL_VALIDATION_ERROR: 'RESULT_FAIL_VALIDATION_ERROR',
        FAIL_WARNING: 'RESULT_FAIL_WARNING',
        FAIL_STALE_DATA: "RESULT_FAIL_STALE_DATA"
    },
    
    // Literal for http response
    HTTP_RESPONSE_OK: 200,
    
    // Display text for locale override
    dtLoading: "Please wait....",
    dtAckTitle: "Acknowledge",
    dtResponseFailMsg: "Server responded with code: ",
    dtWarningTitle: "Warning",
    dtValidationErrorTitle: "Validation Error",
    dtContinue: " ....Continue ?",
    dtSystemErrorTitle: "System Error",
       
    config: {
        
        /**
         * Specifies the view events to be handled
         */
        control: {
            viewSelector: {
                initialize: 'onViewInit'
            }
        },
        
        /**
        * A reference to the view that this controller controls 
        * **IMPORTANT**: This must be set by the subclass.
        * @cfg viewSelector (required) 
        */        
        refs: {
            viewSelector: ''
        },
        
        /**
         * Placeholder to support activity management. Should be set to a unique identifer for the activity.
         */
        activityId: null,
        
        /**
        * Identifier for a shared store to limit their access to one or more controller types.  Note that
        * {@link storeOwner} must be set to false to enable stores to be shared.
        */
        shareStoreId: null,
        
        
        /**
         * Specifies if this controller instance has it's own store.  If set to false then its store will be
         * shared across any other instances this and any other controllers that use its type and
         * {@link sharedStoreId} if specified, and therefore subject to load and filter
         * operations carried out by any one of these.
         */
        storeOwner: true,
        
        /**
        * The type of {@link Baff.app.model.EntityStore} store used by the activity.  
        * **IMPORTANT**: This must be set by the subclass unless a store is not required.
        * @cfg storeSelector
        */
        storeSelector: '',
        
        /**
        * The type of {@link Baff.app.model.EntityModel} managed by the activity.  
        * **IMPORTANT**: This must be set by the subclass.
        * @cfg modelSelector (required) 
        */
        modelSelector: '',
        
         /**
        * Specifies a selector for the refresh button.  If not set (by default)  it is determined automatically
        * from the associated {@link Baff.app.view.SelectorView}
        */   
        refreshButtonSelector: '',
        
         /**
        * Specifies a selector for the close button.  If not set (by default)  it is determined automatically
        * from the associated {@link Baff.app.view.SelectorView}
        */   
        closeButtonSelector: '',
        
        /**
        * Specifies if the activity only involves read operations; if set to true then save and remove
        * operations will not be available.
        */       
        readOnly: false,
        
        /**
        * Specifies if the activity is to be setup when activated / viewed, in order to ensure the correct
        * data is presented and managed. 
        */    
        setupOnActivate: true, 
        
        /**
        * Specifies if the activity is to be setup when initially launched, but care must be taken as other
        * components may not be initialised yet.
        */    
        setupOnLaunch: false,  
        
        /**
        * Specifies the application roles that are permitted to perform read operations for the activity.
        * These will be matched against user permissions managed by a {@link Baff.utility.Utilities#userSecurityManager} 
        */    
        readRoles: null,
        
        /**
        * Specifies the application roles that are premitted to perform update (save and remove) operations for the activity.
        * These will be matched against user permissions managed by a {@link Baff.utility.Utilities#userSecurityManager} 
        */    
        updateRoles: null,
        
        /**
        * Specifies if the activity should automatically be refreshed when data is found to be out of date.
        * If set to false then the user will need to refresh the activity manually, but any changes they
        * made previously will be visible in case these need to be noted.
        * If not specified then this will be set automatically based on the value of 
        * {@link Baff.utility.Globals #autoRefreshOnLock}, otherwise defaults to true.
        */    
        autoRefreshOnLock: null,
        
        /**
        * Specifies if the activity should check that data held on the client is current when loading new data.  
        * This should only be used for mastered entities where the version has been set correctly the retrieving service.
        * If not specified then this will be to true for master entities, otherwise set automatically based on the value of 
        * {@link Baff.utility.Globals #checkVersionOnView}, or if this is not specified then will default to false. 
        */    
        checkVersionOnView: null, 
        
        /**
        * Specifies that the activity should use the {@link Baff.utility.Utilities#versionManager} to check data
        * currency and set the version from any master on update.  If false then no version management will
        * be performed on the client.
        * If not specified then this will be set automatically based on the value of 
        * {@link Baff.utility.Globals #checkVersionOnView}, otherwise defaults to true.
        */    
        useVersionManager: null,
        
        /**
        * Specifies that the activity should use the {@link Baff.utility.Utilities#versionManager} to check data
        * currency and set the version from any master on update.  If false then no version management will
        * be performed on the client.
        * If not specified then this will be set to false for master entities, otherwise automatically based on the value of 
        * {@link Baff.utility.Globals #checkVersionOnView}, or if this is not specified then will default to true.
        */    
        setVersionFromMaster: null,
        
        /**
        * Specifies the message that should be shown to acknowledge a data locking event with
        * {@link #autoRefreshOnLock} set to false.
        */    
        msgAckOptLock: "This data has been updated, please refresh",
        
        /**
        * Specifies the message that should be shown to acknowledge a data locking event with
        * {@link #autoRefreshOnLock} set to true.
        */    
        msgAckOptLockRefresh: "This data has been updated, refreshing...",
        
        /**
        * Specifies that this controller should fire an {@link #masterentitychange} event if it changes
        * the master data entity being operated on.  Only relevant for those controllers managing a master
        * entity.  
        */    
        fireOnMasterChange: true,
        
        /**
        * Specifies that this activity is dependent on a master having been determined.  This will be determined
        * automatically based on the type of {@link Baff.app.model.EntityModel} being processed, although
        * may be set to true for an activity that manages a master entity record that has been selected by a different
        * activity.
        */            
        dependentOnMaster: null,
        
        /**
        * Specifies that this controller should fire an {@link #entitychange} event if it changes
        * its data entity being operated on.
        */    
        fireOnEntityChange: false,
        
        /**
        * Specifies that this controller should listen for the {@link #entitychange} event, for example to
        * determine if the view or particual widgets should be enabled, or to store it locally for future reference.
        */    
        listenForEntityChange: false,
        
        /**
        * Specifies context information that this activity will filter it's data on by listening for the 
        * {@link #contextchange} event.  The context map is a list of mappings between the <b>service
        * domain entity field name</b> (which may or may not match the corresponding local model field 
        * name)and a common context name, for example: [{"customer.id", "customerId"},...]
        */   
        contextHandlerMap: null,
        
        /**
        * Specifies to capture any context information by listening for the {@link #contextchange} event.
        * Not required if {@link contextHandlerMap} is specified.
        */   
        contextListener: false,
        
        /**
        * Specifies context information that this activity will set and dispatch via the {@link #contextchange} 
        * event.  The context map is a list of mappings between the <b>local model field name</b> 
        * and a common context name, for example:  [{"idCustomer", "customerId"},...]
        */
        contextSetterMap: null,
        
        /**
        * Specifies that the activity should be reset on context change, so any current record is deselected.
        */
        resetOnContextChange: true,
        
        /**
        * Specifies that this activity is dependent on context having been defined.
        */            
        dependentOnContext: false,
        
        /**
        * Specifies if a successful save operation should be acknowledge by the user with the
        * {@link #ackSaveMessage} message.
        */            
        ackSave: false,
        
        /**
        * Specifies if a successful remove operation should be acknowledge by the user with the
        * {@link #ackRemove} message.
        */             
        ackRemove: false,
        
        /**
        * Specifies message to be displayed following a successful save operation if {@link #ackSave} is true.
        */        
        ackSaveMessage: "Save successful",        
        
        /**
        * Specifies message to be displayed following a successful remove operation if {@link #ackRemove} is true.
        */        
        ackRemoveMessage:  "Delete successful",
               
        /**
        * Specifies the default action code for the save operation
        */            
        defaultSaveActionCode: 'SAVE',
        
        /**
        * Specifies the default action code for the remove operation
        */     
        defaultRemoveActionCode: 'REMOVE'
        
   },
 
    /**
     * @event masterentitychange
     * Fires when this controller changes the master entity being operated on.
     * @param {Baff.app.controller.ActivityController} controller The activity controller firing the event
     * @param {Baff.app.model.EntityModel} model The master entity record
     * @param {String} type The master entity type
     */
    
    /**
     * @event entitychange
     * Fires when this controller changes the entity being operated on.
     * @param {Baff.app.controller.ActivityController} controller The activity controller firing the event
     * @param {Baff.app.model.EntityModel} model The entity record
     * @param {String} type The entity type
     */
    
    /**
     * @event contextchange
     * Fires when this controller changes the context.
     * @param {Baff.app.controller.ActivityController} controller The activity controller firing the event
     * @param {Ext.util.HashMap} context The list of context
     */
    
    /**
     * @event systemfailure
     * Fires when a system failure has been detected.
     */
    
    
    /**
     * @event dataintegrityissue
     * Fires on the domain view when a data integrity issue has been detected.
     * @param {Baff.app.controller.ActivityController} controller The activity controller firing the event
     */
    
    
    
    /**
    * Initialises the controller.    
    * Sets {@link #ID}, {@link #identifier} and {@link #entityModel}.
    */   
    init: function() {  
        var me = this;
        
        // Set the unique id for this instance and the identifier
        me.ID = Ext.id(me, "AC");        
        me.identifier = me.self.getName() + "-" + me.ID;
        
        me.entityModel = Ext.ClassManager.get(me.getModelSelector());
        
         // Set the context map
        me.extContext = new Ext.util.HashMap();
        me.filterContext = new Ext.util.HashMap();
        
        // Determine if dependent on a master entity
        if (me.getDependentOnMaster() == null) {  // Not set by subclass
            if (me.entityModel.isMasterEntity()) {
                me.setDependentOnMaster(false);
             } else {
                me.setDependentOnMaster(true);                   
            }
        }
            
        // Setup based on global settings
        if (me.getUseVersionManager() == null)
            me.setUseVersionManager(Utils.globals.useVersionManager != null ? Utils.globals.useVersionManager : true);
        
        if (me.getCheckVersionOnView() == null) {
            
            // Always check version for master entities
            if (me.entityModel.isMasterEntity())
                me.setCheckVersionOnView(true);
            else
                me.setCheckVersionOnView(Utils.globals.checkVersionOnView != null ? Utils.globals.checkVersionOnView : false);
        
        }
        
         if (me.getSetVersionFromMaster() == null) {
            
            // Dpn't set version for master entities
            if (me.entityModel.isMasterEntity())
                me.setSetVersionFromMaster(false);
            else
                me.setSetVersionFromMaster(Utils.globals.setVersionFromMaster != null ? Utils.globals.setVersionFromMaster : true);
        }
        
        if (me.getAutoRefreshOnLock() == null)
            me.setAutoRefreshOnLock(Utils.globals.autoRefreshOnLock != null ? Utils.globals.autoRefreshOnLock : true);
        
        Utils.logger.info("ActivityController[" + this.identifier + "]::init");
        
    },
   
    /**
    * Initialisation once the associated view has been initialised    
    * Sets {@link #activityView}.
    */   
    onViewInit: function(view) {     
        var me = this;
        
        Utils.logger.info("ActivityController[" + this.identifier + "]::onViewInit");
        
        // Only set the view if it's changed (may not be the case for a repeated pop-up)
        if (view != me.activityView) {
            me.activityView =  view;
            me.isInitialized = false;
       
            me.activityView.setController(me); 

            // Setup access rights
            me.setupAccessRights();     

            // Set listeners for entity view events
            me.getApplication().on('afterinit', me.afterInit, me);
            me.activityView.on('painted', me.afterInit, me);
        }
        
    }, 
    
    /**
    * Launches the controller once all application view initialiasion is completed   
    */   
    afterInit: function() {
        var me = this;
        Utils.logger.info("ActivityController[" + this.identifier + "]::afterInit");
        
        if (!me.isInitialized) {
            me.isInitialized = true;
            me.addApplicationListeners();
            me.onLaunch();
        }
        
    },
    
    /**
    * Sets up the view components to be controlled.  Disables the view if (@link dependentOnMaster}
    * is specified as true and the activity does not handle the master record itself.
    * Called on initialisation.  
    * Calls {@link #setup} if {@link #setupOnLaunch} is true.
    * @protected 
    */      
    onLaunch: function () {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onLaunch");
        var me = this;
        
        // Refresh Button
        var selector = me.getRefreshButtonSelector();
        
        if (selector === '')
            selector = me.activityView.getRefreshButton();
        
        if (selector !== '') {
            me.refreshButton = me.lookupReference(selector);
            me.refreshButton.on('tap', me.onRefreshButton, me); 
        }
        
        if (me.getStoreSelector() == '') // No store 
            me.showWidget(me.refreshButton, false);
        
         // Close Button
        selector = me.getCloseButtonSelector();
        
        if (selector === '')
            selector = me.activityView.getCloseButton();
        
        if (selector !== '') {
            me.closeButton = me.lookupReference(selector);
            me.closeButton.on('tap', me.onCloseButton, me);  
        }
         
        // Setup the view
        me.activityView.on('beforedestroy', me.beforeDestroy, me);
        
        // Disable the view iniitially if dependent on a master that it's not handling
        if ((me.getDependentOnMaster() && !me.entityModel.isMasterEntity()) ||
            (me.getDependentOnContext() && !me.contextSet)) {
        
            Utils.logger.info("Disabling view on launch: " + this.identifier);
            me.activityView.disable();
        }
        
        // Setup if required      
        if (me.getSetupOnLaunch()) {
            me.setup();
        }
        
    },
    
    /**
    * Sets up access rights based on user permissions.  User permissions obtained from 
    * {@link Baff.utility.Utilities #userSecurityManager} are tested against the {@link readRoles} and 
    * {@link updateRoles} specified.  
    * Sets {@link allowRead} and {@link allowUpdate} accordingly.  
    * Called during initialisation.
    * @protected
    */   
    setupAccessRights: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]::setupAccessRights");
        var me = this;
        
        var readRoles = me.getReadRoles();
        var updateRoles = me.getUpdateRoles();
        
        if (readRoles != null) {
            me.allowRead = Utils.userSecurityManager.isUserInRole(readRoles);
            me.allowUpdate = false;
        }
       
        if (updateRoles != null)
            me.allowUpdate = Utils.userSecurityManager.isUserInRole(updateRoles);   
        
        if (me.allowUpdate == true)
            me.allowRead = true;
        
     },
     
    /**
     * Manages the view state based on availablity of master entity and context if dependent on these as
     * specified by {@link #dependentOnMaster} and {@link #dependentOnContext}.
     * @protected
     */
    manageViewState: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]::manageViewState");
        var me = this;
        
        if ((!me.getDependentOnMaster() || me.isMasterSet()) &&
            (!me.getDependentOnContext() || me.isContextSet()))
            me.activityView.enable();  
        else
            me.activityView.disable();
    },
    
    /**
    * Sets up access to view components based on {@link #allowRead}, {@link #allowUpdate}, and
    * {@link #readOnly}.  
    * Called during initialisation.
    * @protected
    */      
    setupAccessControl: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]:setupAccessControl");
        var me = this;
        
        if (!me.allowUpdate || me.getReadOnly()) {            
            if (!me.allowUpdate && !me.allowRead) {              
                Utils.logger.info("ActivityController[" + this.identifier + "]:setupAccessControl - access not allowed");
                me.activityView.disable();
                me.activityView.hide();

            } else {               
                Utils.logger.info("ActivityController[" + this.identifier + "]:setupAccessControl - read only access");
                me.makeReadOnly();
             }
        } else {
            me.makeReadOnly(false);
        }
         
    },
    
    /**
    * Sets view components to read-only.  For use by sub-classes that control specific view elements.  
    * Called during initialisation.
    * @param {boolean} [readonly="true"]
    * @protected
    */    
    makeReadOnly: function(readonly) {
        
    },
    
    /**
    * Refreshes the activity and associated data.   
    * Called when the refresh button is clicked.    
    */    
    onRefreshButton: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onRefreshButton");
        var me = this;
        
        me.refreshCache();
        
    },
    
     /**
    * Closes the view of a popup
    * Called when close button is clicked.    
    */    
    onCloseButton: function() {
        Utils.logger.info("SelectorController[" + this.identifier + "]::onCloseButton");
        var me = this;

        if (me.activityView.getPopup())  { 
            me.closePopup(); 
        }
    },
    
    
    /**
    * Sets up listeners to {@link #masterentitychange}, {@link #entitychange} and {@link #contextchange}
    * events fired externally as well as on the {@link Baff.app.controller.DomainController} if this activity
    * fires those events.
    * Sets {@link #dependentOnMaster} if not explicitly set if this activity manages a master data entity.  
    * Called during initialisation.
    * @protected
    */    
    addApplicationListeners: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]:addApplicationListeners");
        var me = this;
        
        // Get the entity view
        var domainView = me.activityView.getParent();
        
        if (domainView != null && domainView.isXType('domainview')) { 
            
            var mainController = domainView.getController();
            
            // Listen to external master change events if dependent on a master
            if (me.getDependentOnMaster())
                domainView.on('masterentitychange', me.onMasterEntityChange, me);
            
            // If handling a master entity then have the main controller subscribe to change events fired from
            // this controllers view
            if (me.entityModel.isMasterEntity() && me.getFireOnMasterChange()) {
  
                if (mainController != null)
                    me.activityView.on('masterentitychange', mainController.onMasterEntityChange, mainController);
            }
            
            // Listen to external entity change events if specified
            if (me.getListenForEntityChange())
                domainView.on('entitychange', me.onEntityChange, me);
            
            // If firing entity change then have the main controller subscribe to change events fired from
            // this controllers view
            if (me.getFireOnEntityChange()) {

                if (mainController != null)
                    me.activityView.on('entitychange', mainController.onEntityChange, mainController);
            }
            
            // Listen to external context change events if specified
            if (me.getContextHandlerMap() != null  || me.getContextListener())
                domainView.on('contextchange', me.onContextChange, me); 
            
            // If firing context change then have the main controller subscribe to change events fired from
            // this controllers view
            if (me.getContextSetterMap() != null) {
                
                if (mainController != null)
                    me.activityView.on('contextchange', mainController.onContextChange, mainController);
            }
            
            if (mainController != null)
                    me.activityView.on('dataintegrityissue', mainController.onDataIntegrityIssue, mainController);
        }
        
    },
    
    /**
    * Destroys any store owned by this controller or removes the listeners to a shared store.  
    * Called before the view is destroyed.  
    */   
    beforeDestroy: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]::beforeDestroy");
        var me = this;
        
        me.detachStore();
        
    },
    
    
    /**
    * Sets up the activity on activation / view if {@link #setupOnActivate} is true.  
    * Called when view is activated (viewed).  Note that this is managed by the {@link Baff.app.controller.DomainController}
    * and not through the 'activate' event.  
    */   
    onActivateView: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onActivateView");
        var me=this;
        
        me.isActive = true;
        
        if (me.getSetupOnActivate() && !me.activityView.isDisabled())
                me.setup(me.extMasterEntityId);  
                   
    },
    
    /**
    * Does nothing, for subclasses to override.    
    * Called whe view is deactivated.  Note that this is managed by the {@link Baff.app.controller.DomainController}
    * and not through the 'deactivate' event.     
    */   
    onDeactivateView: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onDeactivateView");
        var me = this;
        me.isActive = false;
        
     },
    
    /**
    * Sets up data management state, the entity store and initiates refresh if the state has changed.    
    * Sets {@link #masterEntityId} if {@link #dependentOnMaster} is true.
    * @param masterId The master entity identifier
    * @param {Baff.app.model.EntityModel} record The entity record to be operated on
    * @protected
    */    
    setup: function(masterId, record) {        
        Utils.logger.info("ActivityController[" + this.identifier + "]::setup");
        var me = this;

        if (!me.isInitialized)
            me.afterInit();
        
        // Setup the master entity identifier
        if (!me.getDependentOnMaster()) {
            // Ignore master entity value for controllers handling a master entity
            masterId = me.masterEntityId = null;  
         } else if (masterId == null) {
            
            if (record != null)
                masterId = record.getMasterEntityId();
            
            if (masterId == null)
                masterId = me.masterEntityId; 
           
            if (masterId == null) {
                // If we don't have a master and we're dependent on one 
                // then check if we have a data integrity issue
                if (!me.checkDataIntegrity());  
                    return;
            }
            
        }
        // Check if effectively already setup
        // For forms with no store then the record must be provided so this will reset the current record
        if (masterId != me.masterEntityId || me.entityStore == null) {
                
            me.dataRefresh = true; // ensure a refresh
            
            if (masterId != me.masterEntityId) {
                me.masterEntityId = masterId;
                me.setCurrentRecord(null);  
            }

            me.setupStore();       
            
        }
   
        // Ensure a refresh if the record has changed 
        if (record != null && record != me.currentRecord)
           me.dataRefresh = true;

        // Only refresh if something has changed or the store needs to be loaded
        if (me.dataRefresh) { 
            
            // Set up the view based on user permissions and parameters
            me.setupAccessControl();    
        
            // Do nothing if access is not permitted
            if (!me.isAccessAllowed())
                return;

            // Hook to prepare activity prior to refresh - for example to apply further filters based on context
            // or the record provided
            me.prepareActivity(record);
            
            me.refresh(record)
        
        } else if (me.entityStore == null || !me.entityStore.isLoading()) {
            
            if (me.entityStore != null && !me.entityStore.hasLoadedData()) {
                    me.refresh(record);

            } else {

                // Check any currently loaded version
                if (me.checkDataIntegrity())
                    if (me.checkVersionOnView(me.currentRecord));           
                            me.setCurrentRecord(me.currentRecord);  // This will fire a context event
            }    
        }

 
     },
     
     /**
    * Sets up context filters on the store if this activity responds to externally set context.
    * @protected
    */    
    refreshContextFilters: function () {
        Utils.logger.info("ActivityController[" + this.identifier + "]::refreshContextFilters");
        var me = this;
    
        if (me.entityStore == null)
            return;
            
        // Remove any existing context filters
        if (me.entityStore != null && me.activeContextFilters != null) {
            
            Ext.Array.each(me.activeContextFilters, function(filter) {
                me.entityStore.removeFilter(filter);
            });     
        }
            
        me.activeContextFilters = null;

        if (me.filterContext != null) {

            me.activeContextFilters = new Array();    
            me.filterContext.each( function (key, value) {
               
                var filter = new Ext.util.Filter({
                    property: key,
                    value: value
                });

                me.activeContextFilters.push(filter); 
                me.entityStore.addFilter(filter);

            });
            
        }
 
    },
    
    /**
    * Sets up the {@link Baff.app.model.EntityStore} for this activity.  
    * Sets {@link #entityStore}; this will be null if adding a master entity.
    * @protected
    */    
    setupStore: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]::setupStore");
        var me = this,
                id;
        
        // Detach the current store
        me.detachStore();
        
         if (me.getStoreSelector() == '')
            return;  // No store for this activity
       
        
        // If dependent on master and no master is set then adding a new master entity (e.g. for a summary - details
        // type of arrangement; so don't set up a store now - it can be setup after the entity is created
        if (me.getDependentOnMaster() && me.masterEntityId  == null) {
            return;
        }
        
        // Get unique id for the store if a store owner
        if (me.getStoreOwner())
            id = me.ID;
        else 
            id = me.getSharedStoreId(); // This is null by default

        // Get the store from the store manager
        me.entityStore = Utils.entityStoreManager.getStore(me.getStoreSelector(), id, me.masterEntityId);

        if (me.entityStore == null) {
            Utils.logger.error("ActivityController[" + this.identifier + "]::setup failed to get store, " + me.getStoreSelector() + " ,owner= " + me.ID + " ,masterid= " + me.masterEntityId);
            return;
        }

        // Setup event handlers for store loads 
        me.entityStore.on('postfetch', me.onPostFetch, me);
        me.entityStore.on('flush', me.onStoreFlush, me);
        me.entityStore.getProxy().on('exception', me.onLoadException, me);
        
    },
    
     /**
    * Detaches the current {@link Baff.app.model.EntityStore} for this activity.  
    * @protected
    */    
    detachStore: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]::detachStore");
        var me = this;
        
        if (me.entityStore != null) {
        
            if (me.getStoreOwner()) {
                Utils.entityStoreManager.destroyStore(me.getStoreSelector(), me.ID, me.masterEntityId);
            } else {

                // Remove event handlers for store loads 
                me.entityStore.un('postfetch', me.onPostFetch, me);
                me.entityStore.un('flush', me.onStoreFlush, me);
                me.entityStore.getProxy().un('exception', me.onLoadException, me);
            }
        }
        
        me.entityStore = null;
        
    },
    
    /**
    * Resets the view via {@link setup}, ensuring a data load    
    */   
    reset: function() {
        this.currentRecord = null;
        this.dataRefresh = true;
        this.setup(this.extMasterEntityId);          
     },
    
    /**
     * Override to prepare the activity post superclass setup and prior to any store refresh.
     * Set {@link dataRefresh} if required.
     */
    prepareActivity: function () {
        
    },
    
    
    /**
    * Refreshes the state of this activity, including reloading the store if there is one.  
    * @param {Baff.app.model.EntityModel} record The entity record to be operated on
    * @protected
    */    
    refresh: function(record) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::refresh");
        var me = this;
        
        me.showWaitMask(true);
        
        if (me.getUseVersionManager() && me.getDependentOnMaster())
             // Don't proceed if a valid master is not present - it will be attempted to be loaded
             if (Utils.versionManager.getMaster(me.entityModel.getMasterEntityType(), me.masterEntityId) == null) 
                 return;
                 
        // Update context filters
        me.refreshContextFilters();

        // If no record passed then use the current record
        // NB this will have been reset if the store was reset
        if (record == null)
            record = me.currentRecord;
        
        // Set the current entity record
        me.setCurrentRecord(record);
        me.dataRefresh = false;
        
        // Load the store  
        if (me.entityStore != null) {
            me.entityStore.load(); 
        } else {
            me.refreshWithNoStore(record);
        }
    },                   

    /**
    * Manages activity state following a refresh with no store (e.g. adding a master entity).  For use by sub classes.
    * @param {Baff.app.model.EntityModel} The entity record to be operated on
    * @protected
    */    
    refreshWithNoStore: function(record) {
        var me = this;
        
        me.showWaitMask(false);
        
        if (me.checkDataIntegrity() == false)        
            return;
        
        var allowModify = (me.allowUpdate && !me.isReadOnly);
        me.prepareView(true, allowModify, null, null);
        
    },
    
     /**
    * Handles a store flush event
    * @param {Baff.app.model.EntityStore} The store that has loaded
    * @param {boolean} Indicates if the store is valid
    */    
    onStoreFlush: function(store, invalid){
        Utils.logger.info("ActivityController[" + this.identifier + "]::onStoreFlush");
        var me = this;
        
        if (me.isActive && !me.activityView.isDisabled()) {
        
            // If the store is invalid (i.e. related master was not able to be loaded) then detach
            // and try to refresh without it - this may likely result in a DI error
            if (invalid == true) {
                me.detachStore();
                me.refreshWithNoStore();
            } else {    
                me.refresh();
            }
        } else {
            
            // Ensure we are not showing any wait mask
            me.showWaitMask(false);
        }
    },        
    
    /**
    * Handles a store load event, which may be the initial data load, or a subsequent load as a result
    * of store buffer processing.  
    * @param {Baff.app.model.EntityStore} The store that has loaded
    * @param {String} response The raw data returned by the service
    * @param {boolean}firstLoad Indicates if this is the first load
    * @protected
    */    
    onPostFetch: function(store, response, firstLoad){
        Utils.logger.info("ActivityController[" + this.identifier + "]::onPostFetch, load state= " + this.isStoreLoaded);
        var me = this;
        
        if (response.message != null)            
            me.showAlertMessage(me.dtAckTitle, response.message);
        
        if (firstLoad) {
            me.onStoreFirstLoaded();
        } else {
            me.onStoreFetchMore();
        }
    },
    
    /**
    * Manages activity state following initial load of the store.  For subclasses to override.
    * @protected
    */    
    onStoreFirstLoaded: function () {
        var me = this;
        
        if (me.checkDataIntegrity()) {
        
            var allowModify = (me.allowUpdate && !me.isReadOnly);
            me.prepareView(true, allowModify, null, null);
        } 
            
        this.showWaitMask(false);
    },
    
  
    /**
    * Override to prepare the form prior to modifying an existing or creating a new entity.  
    * {@link #recordAction} can be queried to determine the action being performed. 
    * @param {boolean} isAfterRefresh If this is being called for the first time after the activity has been refreshed
    * @param {boolean} allowModify If the view is allowed to be modified
    * @param {Baff.app.model.EntityModel} record The entity record to be displayed 
    * @param {String} recordAction The {@link Baff.app.model.EntiotyMode #ACTION} being performed   
    * @protected
    */   
    prepareView: function (isAfterRefresh, allowModify, record, recordAction) {

                 
    },
    
    /**
    * Manages activity state following initial load of the store.  For subclasses to override.
    * @protected
    */    
    onStoreFetchMore: function () {
        // Override
    },

    /**
    * Handles an exception during a store load operation.
    * @param {Ext.data.proxy.Proxy} proxy The service proxy
    * @param {String} response The raw data returned by the service
    * @param {Ext.data.operation.Operation} operation The proxy operation
    */    
    onLoadException: function(proxy, response, operation) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onLoadException");               
        var me = this;
        
        me.doLoadException(response);
        
    },
    
    /**
    * Processes an error during a store or record load operation.
    * @param {String} response The raw data returned by the service
    */   
    doLoadException: function(response) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::doLoadException");               
        var me = this;
        
        if (me.activityView.isHidden())
            return;

        me.showWaitMask(false);
        
        var message;
        
        if (response.status != me.HTTP_RESPONSE_OK) {
            message = me.dtResponseFailMsg + response.status + " (" + response.statusText + ")"; 
        } else {
            var jsonResponse = Ext.decode(response.responseText);
            message = jsonResponse.message;
        }
        
        me.processSystemFailure(message);

    },
    
    /**
    * Sets {@link #currentRecord} and fires {@link #masterentitychange} if processing a master 
    * entity record and {@link #fireOnMasterChange} is true.
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @fires masterentitychange
    * @fires entitychange
    * @protected
    */    
    setCurrentRecord: function(record) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::setCurrentRecord");
        var me = this;
        
        var fireContext = (me.isActive && !me.dataRefresh);
        var fireEntityChange = false;
       
        if (me.currentRecord != record) {
            
            me.currentRecord = record;
            fireContext = true;
            fireEntityChange = true;
        
        }
        
        if (fireContext) 
            me.fireContextEvent(record);
        
        if (fireEntityChange) {
            
            if (me.entityModel.isMasterEntity() && me.getFireOnMasterChange())
                me.activityView.fireEvent('masterentitychange', me, record, me.entityModel.getName());

            if (me.getFireOnEntityChange())
                me.activityView.fireEvent('entitychange', me, record, me.entityModel.getName());
            
        }

    },
    
    /**
    * Fires a {@link #contextchange} event if required.
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @fires contextchange
    * @protected
    */    
    fireContextEvent: function(record) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::fireContextEvent");
        var me = this;
        
        if (me.getContextSetterMap() != null) {       

            var context = new Ext.util.HashMap();
            
                Ext.Array.each(me.getContextSetterMap(), function (item) {

                var contextValue = null;

                if (record != null)
                    contextValue = record.get(item.fieldName);

                    context.replace(item.contextMap, contextValue);
            
                });

            me.activityView.fireEvent('contextchange', me, context);
         }
        
    },
    
    /** Gets {@link #currentRecord}.
    * @retrun {Baff.app.model.EntityModel}
    * @fires masterentitychange
    */
    getCurrentRecord: function () {
        return this.currentRecord;
    },
     
    /**
    * Initiates refresh of the client data cache via {@link Utils #versionManager} if 
    * {@link useVersionManager} is true.
    * Note that this will result in a refresh on any active views when the store is flushed.
    * @param {Baff.app.model.EntityModel} record The entity record that was updated
    * @param {Baff.app.model.EntityModel} master The new master entity record
    * @protected
    */    
    refreshCache: function (record, master) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::refreshCache");
        var me = this;
        
        // Set the wait mask if we will be waiting for store flush
        if (me.entityStore != null) {          
            me.showWaitMask(true);            
        }
        
        if (me.getUseVersionManager()) {
            
            // Get the master type
            var type = me.getMasterType(record);  
            
            // Get the master id - if dealing with a master entity and record is null then will return null
            var id = me.getMasterId(record);
            
            Utils.versionManager.refreshData(type, id, master);
        
        } else {
            
            if (me.entityStore != null)
                me.entityStore.flush();
        }
        
        
    },
 
    /**
    * Checks the version of the entity record loaded is consistent with the client data cache via 
    * {@link Utils #versionManager} if {@link useVersionManager} and {@link checkVersionOnView} 
    * are both true.  Note that this should only be the case when any mastered entity has it's version
    * correctly set by the service on retrieval, otherwise it will generally fail.
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @protected
    */    
    checkVersionOnView: function(record) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::checkVersionOnView");
        var me = this;
        
         // Only process an failure if definetely false
        if (me.checkVersion(record) == false) {
            
            me.processOpLock (record, me.OPERATION.LOAD);
            return false;
        }
         
         return true;
    },
    
    /**
    * Checks the version of the entity record loaded is consistent with the client data cache via 
    * {@link Utils #versionManager} 
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @return {boolean} or null if a master record was not found
    * @protected
    */  
    checkVersion: function(record) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::checkVersion");
        var me = this;
        
         if (record != null && me.getUseVersionManager() && me.getCheckVersionOnView()) {
             
            var recVer = record.getVersion();
            
            if (recVer != null && recVer != '') {

                var id = me.getMasterId(record);
                var type = me.getMasterType(record);    
                var masterVer = Utils.versionManager.getVersion(type, id);   
                                
                // May not have the master if it's still not been loaded following a refresh
                // so return null if we can't find it
                if (masterVer == null)
                    return null;
               
                if (recVer !== masterVer) 
                    return false;
                else
                    return true;
                    
            }
        }
         
         return null;
    },
    
      /**
    * Checks that data present on the client for this avtivity is valid; override if special rules apply
    * If an issue is detected then this should be passed to the domain controller to handle 
    * @protected
    * @fires dataintegrityissue
    */    
    checkDataIntegrity: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]::checkDataIntegrity");
        var me = this;
        
         if (me.getUseVersionManager() && me.getDependentOnMaster()) {             
             if (Utils.versionManager.getMaster(me.entityModel.getMasterEntityType(), me.masterEntityId) == null)  {                    
                
                Utils.logger.error("ActivityController[" + this.identifier + "]::checkDataIntegrity - failed for type= " + me.entityModel.getMasterEntityType() + " , id= " + me.masterEntityId);       
                
                me.activityView.fireEvent('dataintegrityissue', me);             
                return false;
                
            }
        }
       
        return true;
 
    },
    
    /**
    * Handles an external change to the master data entity as a result of the {@link #masterentitychange} 
    * event if {@link #dependentOnMaster} is true.  
    * Sets {@link #extMasterEntityId}.
    * @param {Baff.app.controller.ActivityController} controller The activity controller that fired the event
    * @param {Baff.app.model.EntityModel} master The master entity record that has been selected
    * @param {String} type The master entity type
    */    
    onMasterEntityChange: function (controller, master, type) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onMasterEntityChange");
        var me = this;
        
        // Check if should handle this event
        if (controller == me || !me.getDependentOnMaster() ||
            me.entityModel.getMasterEntityType() != type)
            return;
        
        if (master == null) 
            me.extMasterEntityId = null;
        else
            me.extMasterEntityId = master.getEntityId();
        
        me.manageViewState();
        
        if (me.masterEntityId != me.extMasterEntityId) {
        
            me.dataRefresh = true;
            me.setCurrentRecord(null); 

            if (me.isActive && !me.activityView.isDisabled())
                me.setup(me.extMasterEntityId);
        }
        
        if (me.isActive && !me.activityView.isDisabled()) 
           me.setup(me.extMasterEntityId);
        
    },
    
    /**
    * Determines if the master has been set.
    * @return {boolean}
    */    
    isMasterSet: function () {
        Utils.logger.info("ActivityController[" + this.identifier + "]::isMasterSet");
        var me = this;
       
        return (me.extMasterEntityId != null);
    },
    
    /**
    * Handles an external change to the the activity as a result of the {@link #entitychange} 
    * event if {@link #listenForEntityChange} is true.
    * Should be overridden by the subclass if required (bear in mind the entity may be null).
    * @param {Baff.app.controller.ActivityController} controller The activity controller that fired the event
    * @param {Baff.app.model.EntityModel} master The entity record that has been selected or changed.
    * @param {String} type The entity type
    */    
    onEntityChange: function (controller, entity, type) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onEntityChange");
        var me = this;
        
    }, 
    
    /**
    * Handles an external change to the activity as a result of the {@link #contextchange} event.
    * @param {Baff.app.controller.ActivityController} controller The activity controller that fired the event.
    * @param {HashMap} context The context that has been changed.
    */    
    onContextChange: function (controller, context) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onContextChange");
        var me = this;
        
        if (me == controller)
            return;
        
        // Check if this context is relevant
        var contextMap = me.getContextHandlerMap();
        
        var hasChanged = false;
        
        context.each( function (key, value) {
            
            me.extContext.replace(key, value);
            
            Ext.Array.each(contextMap, function (item) {

                if (key == item.contextMap)
                    if (me.changeContext(item.fieldName, value))
                        hasChanged = true;
                    
            });
        });
        
        me.manageViewState();
         
        if (hasChanged && me.getResetOnContextChange()) {
            
            me.dataRefresh = true;
            me.setCurrentRecord(null);
             
            if (me.isActive && !me.activityView.isDisabled())
                me.setup(me.extMasterEntityId);
            
         }
        
    },
    
    /**
     * Determines if context has been set - override if required.
     * If overriding returning false will disable the activity if {@link #dependentOnContext} is true.
     * Default is to return true if{@link #filterContext} contains one or more filters.
     * @return {boolean}
     */
    isContextSet: function() {
        return this.filterContext.getCount() > 0;
    },

    
    /**
    * Gets extenernally set context from {@link #extContext}. 
    * If asObject is specified then context will be returned in a {key, value} object, or null if the key does not exist
    * If not specified then undefined should be returned if the key does not exist; null will be returned if the context
    * is null - however loose checking (== vs. ===) may not differentiate between the two.
    * @param {String}  key The context key
    * @param {boolean}  asObject Indicates to return an object otherwise the value will be returned
    * @return {Object} the context object
    * @protected
    */    
    getExternalContext: function(key, asObject) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::getExternalContext");
        var me = this;
        
        if (asObject) {
            if (me.extContext.containsKey(key)) {
                var context = {};
                context.key = key;
                context.value = me.extContext.get(key);
                return context;    
           
            } else {
                return null;
            } 
        
        } else {
            return me.extContext.get(key);
        }
        
    },
    
    
    /**
    * Sets internal filtering context {@link #filterContext}.  If overriding setting me.contextSet = false will disable
    * the activity if {@link #dependentOnContext} is true.
    * @param {String} fieldName The field associated with the context
    * @param {Objectl} value The value of the context
    */    
    changeContext: function(fieldName, value) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::changeContext");
        var me = this;

        var hasChanged = false;       
        var currentValue = me.filterContext.get(fieldName);
             
        if (value !== null && value != '') {
            if (value != currentValue) {
                me.filterContext.replace(fieldName, value);
                hasChanged = true;
            }
        } else {
             // Don't put null values into filter context, but check if we are changing  the context  
            if (currentValue != null) {
                me.filterContext.removeByKey(fieldName);
                hasChanged = true;
            }
        }
        
        return hasChanged;

    },
    
    /**
    * Prepares an entity record for save or removal, including setting the version if {@link setVersionFromMaster}
    * is true.  Also sets the default action codes from {@link defaultSaveActionCode} or {@link defaultRemoveActionCode.}
    * @param operationType The type of operation being performed defined by {@link #OPERATION}
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @protected
    */    
    prepareRecord: function (operationType, record) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::prepareRecord");
        var me = this;
        
         // Set the action code
         if (operationType == me.OPERATION.SAVE)
            record.setActionCode(me.getDefaultSaveActionCode());
        else if (operationType == me.OPERATION.REMOVE)
             record.setActionCode(me.getDefaultRemoveActionCode());
        
        if (me.getUseVersionManager() && me.getSetVersionFromMaster()) {

            var id = me.getMasterId(record);
            var type = me.getMasterType(record);          
            var masterVersion = Utils.versionManager.getVersion(type, id);           
            
            // Only set the version if it is not already set (by the service on load) 
            // and we have a valid master version
            if (masterVersion != null && record.getVersion() == null)
                record.setVersion(masterVersion);
        }
        
        // Set the username
        if (Utils.userSecurityManager != null && Utils.userSecurityManager.getUserName() != null)
            record.setParam("username",  Utils.userSecurityManager.getUserName());
        
        // Set the entityId
        record.setParam("entityId", record.getEntityId())
    },  

    /**
    * Executes a save operation, which will send the request to the server via the 
    * {@link Baff.app.model.EntityModel}'s proxy.
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @protected
    */    
    saveExec: function (record) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::saveExec");
        var me = this;
        
        me.showWaitMask(true);
        
        record.save({
                    scope: me,
                    success: me.saveRecordSuccess,
                    failure: me.saveRecordFail
                    }, me);   
        
    },
    
    /**
    * Following a successful record save
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @param {Ext.data.operation.Operation} operation The proxy operation
    * @protected
    */    
    saveRecordSuccess: function (record, operation) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::saveRecordSuccess");
        var me = this; 

        var response = record.getProxy().getResponse();
        me.saveSuccess(record, response);
        
    },
    
    /**
    * Following a failed record save
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @param {Ext.data.operation.Operation} operation The proxy operation
    * @protected
    */    
    saveRecordFail: function (record, operation) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::saveRecordFail");
        var me = this; 
        
        var response = record.getProxy().getResponse();        
        me.saveFail(record, response, operation);
        
    },
    
    /**
    * Following a successful save operation prompts the user ot acknowledge if (@link ackSave} is true,
    * and initiates data and activity refresh
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @param {String} response The Json encoded response
    * @protected
    */    
    saveSuccess: function (record, response) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::saveSuccess");
        var me = this; 
        
        me.showWaitMask(false);
        
         // Acknowledge
        if (me.getAckSave() || response.message != null) {
            
            var message = me.getAckSaveMessage();

            if (response.message != null ) 
                 message = response.message;           
            
            me.showAlertMessage(me.dtAckTitle, message);
        }
              
        // Set the current record
        me.setCurrentRecord(record);
              
        // Refresh the data cache
        me.refreshCache(record, response.master);
        
    },
    

    /**
    * Initiates error handling following a failed save operation.
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @param {String} response The Json encoded response 
    * @param {Ext.data.operation.Operation} operation The proxy operation
    * @protected
    */    
    saveFail: function(record, response, operation) {       
        Utils.logger.info("ActivityController[" + this.identifier + "]::saveFail");
        var me = this;
         
        me.operationFail(this.OPERATION.SAVE, record, response, operation);    
    },
    
    /**
    * Executes a remove operation, which will send the request to the server via the 
    * {@link Baff.app.model.EntityModel}'s proxy.
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @protected
    */    
    removeExec: function(record) {        
        Utils.logger.info("ActivityController[" + this.identifier + "]::removeExec");
        var me = this;
        
        me.showWaitMask(true);
        
        record.erase({
                        scope: me,
                        success: me.removeRecordSuccess,
                        failure: me.removeRecordFail  }, 
                    me);
        
    },
    
    /**
    * Following a successful record remove
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @param {String} response The Json encoded response
    * @protected
    */    
    removeRecordSuccess: function (record, operation) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::removeRecordSuccess");
        var me = this; 
        
        var response = record.getProxy().getResponse();   
        me.removeSuccess(record, response);
        
    },
    
    /**
    * Following a failed record removeal
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @param {Ext.data.operation.Operation} operation The proxy operation
    * @protected
    */    
    removeRecordFail: function (record, operation) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::saveRecordFail");
        var me = this; 
        
        var response = record.getProxy().getResponse();        
        me.removeFail(record, response, operation);
        
    },
     
    /**
    * Following a successful remove operation prompts the user ot acknowledge if (@link ackRemove} is true,
    * and initiates data and activity refresh.
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @param {Str} operation The proxy operation
    * @protected
    */    
    removeSuccess: function(record, response) {       
        Utils.logger.info("ActivityController[" + this.identifier + "]::removeSuccess"); 
        var me = this;
        
        me.showWaitMask(false);   
        
        // Acknowledge
        if (me.getAckRemove() || response.message != null) {
            
            var message = me.getAckRemoveMessage();
            
            if (response.message != null )
                message = response.message;
            
           me.showAlertMessage(me.dtAckTitle, message);
        }
        
        // Set the current record
        me.setCurrentRecord(null);

        // Refresh the data cache
        me.refreshCache(record);
    },
    
    /**
    * Initiates error handling following a failed remove operation.
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @param {String} response The Json encoded response  
    * @param {Ext.data.operation.Operation} operation The proxy operation
    * @protected
    */    
    removeFail: function(record, response, operation) {        
        Utils.logger.info("ActivityController[" + this.identifier + "]::removeFail");
    
        this.operationFail(this.OPERATION.REMOVE, record, response, operation);
    
    },  
    
    /**
    * Initiates data cache refresh if (@link useVersionManager} is true.  The enitty and any master
    * returned by the service will be passed to the {@link Baff.utility.Utilities #versionManager}
    * @param operationType The type of operation being performed defined by {@link #OPERATION}
    * @param {Baff.app.model.EntityModel} record The entity record that was processed
    * @param {Baff.app.model.EntityModel} record The associated master entity record
    * @protected
    */    
    onRecordUpdate: function (operationType, record, master) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onRecordUpdate");
        var me = this;
        
        if (me.getUseVersionManager()) {
            
            var id = me.getMasterId(record);
            var type = me.getMasterType(record);    
            Utils.versionManager.refreshData(type, id, master);
        }
    },
    
    /**
    * Determines the nature of the failed operation and initates the appropriate error handling.
    * @param operationType The type of operation being performed defined by {@link #OPERATION}
    * @param {Baff.app.model.EntityModel} record The entity record that was processed
    * @protected
    */    
    operationFail: function(operationType, record, response, operation) {                    
        Utils.logger.info("ActivityController[" + this.identifier + "]::operationFail");
        var me = this;
        
        me.showWaitMask(false); 
        
        if (response == null || response.resultType == null) {
            
            var message = me.dtResponseFailMsg + "BEX888";
        
            if (operation != null) {

                var opResponse = operation.getResponse();

                if (opResponse != null && opResponse.status != me.HTTP_RESPONSE_OK)
                    message = me.dtResponseFailMsg + opResponse.status + " (" + opResponse.statusText + ")";
            }

            me.processSystemFailure(message); 
            return;

        } 
        
        switch (response.resultType) {
            
            case me.RESULT.FAIL_VALIDATION_ERROR:
                me.processValidationError(response, record, operationType); 
                break;
                
            case me.RESULT.FAIL_WARNING:
                me.processWarning(response, record, operationType); 
                break;
                
            case me.RESULT.FAIL_STALE_DATA:
                me.processOpLock(record, operationType); 
                break;  
            
            default:
                me.processSystemFailure(response.message); 
            
        }
        
    },
    
    /**
    * Handles a validation error returned by a service operation.
    * @param {String} response The raw data returned by the service
    * @param {Baff.app.model.EntityModel} record The entity record that was processed
    * @param operationType The type of operation being performed defined by {@link #OPERATION}
    * @protected
    */    
    processValidationError: function(response, record, operationType) {    
        Utils.logger.info("ActivityController[" + this.identifier + "]::processValidationError");
        var me = this;
        
        if (response.message !== null ) {
            me.showAlertMessage(me.dtValidationErrorTitle, response.message);
        } 
    },
    
    /**
    * Handles a warning returned by a service operation by prompting the user and re-trying
    * the operation.  Any revised action code returned by the initial operation will be passed in the
    * re-try attempt so that the service can identify it as such.
    * @param response The raw data returned by the service
    * @param {Baff.app.model.EntityModel} record The entity record that was processed
    * @param operationType The type of operation being performed defined by {@link #OPERATION}
    * @protected
    */    
    processWarning: function(response, record, operationType) {       
        Utils.logger.info("ActivityController[" + this.identifier + "]::processWarning");
        var me = this;
        
        Ext.Msg.confirm(me.dtWarningTitle, response.message + "</br></br>" + me.dtContinue, function(btn) {
                    if (btn === 'yes') {
                         
                        // Set the action code to the result code so that the service can see that
                        // the warning has been acknowledged
                        record.setActionCode(response.resultCode);
                        
                        // Re-submit the operation
                        if (operationType === me.OPERATION.SAVE) {
                             me.saveExec(record);
                         } else if (operationType === me.OPERATION.REMOVE) {
                             me.removeExec(record);
                         }
                    }
        });         
    },
    
    /**
    * Handles a data currency error as a result of an assumed optimistic locking strategy.  Prompts the
    * user and initiates automatic refresh if {@link #autoRefreshOnLock} is true.
    * @param {Baff.app.model.EntityModel} record The entity record that was processed
    * @param operationType The type of operation being performed defined by {@link #OPERATION}
    * @protected
    */    
    processOpLock: function(record, operationType) {        
        Utils.logger.info("ActivityController[" + this.identifier + "]::processOpLock");
        var me = this,
                msg;
        
        if (!me.procOpLock) {
            me.procOpLock = true;
        
            if (me.getAutoRefreshOnLock())
                msg = me.getMsgAckOptLockRefresh();
            else
                msg = me.getMsgAckOptLock();

            me.showAlertMessage(me.dtWarningTitle, msg);

            if (me.getAutoRefreshOnLock()) {        

                // This will invoke a refresh on any active views when the store is flushed
                me.setCurrentRecord(null);
                me.refreshCache();

            }
            
            me.procOpLock = false;
        
        } else {
            
            if (Utils.globals.application != null)
                Utils.globals.application.fireEvent('systemfailure');
        
        }
        
    },
    
    /**
    * Handles a system error by prompting the user and firing a {@link #systemfailure} event.
    * @param response The raw data returned by the service
    * @param {Baff.app.model.EntityModel} record The entity record that was processed
    * @param {String} operationType The type of operation being performed defined by {@link #OPERATION}
    * @protected
    */    
    processSystemFailure: function(message) {        
        Utils.logger.info("ActivityController[" + this.identifier + "]::processSystemFailure");
        var me = this;
        
        if (message == null || message == '') {
            message = me.dtSystemError;
        }       
        
        // Only other result supported by the framework is system error
        me.showAlertMessage(me.dtSystemErrorTitle, message, function() {
            if (Utils.globals.application != null)
                Utils.globals.application.fireEvent('systemfailure');
         });
    },
    
    /**
    * Helper method for enabling view elements.
    * This can also be overriddent to synchronize enabling / disabling of widgets.
    * @param {Ext.Widget} widget The widget to be updated
    * @param {boolean} [enable="false"]
    * @protected
    */    
    enableWidget: function(widget, enable) {
        
        if (widget == null)
            return;
        
        if (enable == null || enable == true)
            widget.enable();
        else
            widget.disable();
    },
    
    /**
    * Helper method for showing view elements.
    * This can also be overriddent to synchronize showing of widgets.
    * @param {Ext.Widget} widget The widget to be updated
    * @param {boolean} [show="false"]
    * @protected
    */    
    showWidget: function(widget, show) {
        
        if (widget == null)
            return;
        
        if (show == null || show == true)
            widget.show();
        else
            widget.hide();
    },
    
    /**
    * Determines if this view is permitted to be accessed based on either of {@link #allowRead} or
    * {@link #allowUpdate} having been set to true during initialisation.
    * @return {boolean}
    */    
    isAccessAllowed: function() {
        return (this.allowRead || this.allowUpdate);
    },
 
    /**
    * Sets access rights
    *  @param {boolean} allowRead  Whether read access is allowed
    *  @param {boolean} allowUpdate  Whether update access is allowed
    * 
    */    
    setAccessRights: function(allowRead, allowUpdate) {
        
        this.allowRead = false;
        this.allowUpdate = false;
        
        if (allowRead == true) {
            this.allowRead = true;
            if (allowUpdate == true)
                this.allowUpdate = true;
        }

    },
 
    /**
    * Determines if the user should be prompted when the activity's view is de-activated / hidden.
    * @return {boolean}
    */    
    isDeactivationPromptRequired: function() {
        return false;
    },
    
    /**
    * Shows / hides the wait mask.
    * @param {boolean} [show="false"]
    * @protected
    */    
    showWaitMask: function (show) {
        var me = this;
        if (show)
            me.activityView.setMasked({xtype: 'loadmask', message: me.dtLoading});
        else
            me.activityView.setMasked(false);
    },
    
    showAlertMessage: function (title, message, callback) {
       
           Ext.Msg.alert(title, message, callback);
        
    },
    
    /**
    * Helper to determine the master entity type for a given entity record.
    * @param {Baff.app.model.EntityModel} record The entity record to be queried
    * @return {String} The master type
    * @protected
    */    
    getMasterType: function (record) {
        var me = this;
        var type = null;
                
        if (record != null)
            type = record.getMasterEntityType();
        
        if (type == null || type == '')
            if (me.entityModel != null)
                type = me.entityModel.getMasterEntityType();
 
        if (type == '')
            type = null;
        
        return type;

    },
    
    /**
    * Helper to determine the master entity identifier for a given entity record.
    * @param {Baff.app.model.EntityModel} record The entity record to be queried
    * @return {String} The master identifier
    * @protected
    */    
    getMasterId: function (record) {
        var me = this;
        var id = null;
                
        if (record != null) 
            id = record.getMasterEntityId();
        
        if (id == null || id == '') 
            id = me.masterEntityId;
        
        if (id == '')
            id = null;
        
        return id;

    },
    
   /*
    * Helper to get children of the activity view
    * @return {Ext.Component} The child component
    * @protected 
    */
   lookupReference: function(reference) {
        var me = this;
        
        return me.activityView.down("#"+ reference);
        
   },
   
   /*
    * Helper to display a 'popup' view, essentially a sub-activity from this controller
    * @param {String} popupselector  The widget type of the popup
    * @param {Baff.app.view.ActivityView} popup A reference to the popup if previously obtained
    * @param {Baff.app.model.EntityModel} record A record to passed to {@link Baff.app.controller.ActivityController #onEntityChange}
    * @return {Baff.app.view.ActivityView} The popup
    */
   showPopup: function(selector, popup, record) {
       var me = this;
       
       var mainController = me.activityView.domainController;
        
        if (mainController == null) {
            var domainView = me.activityView.getParent();
            
            if (domainView != null && domainView.isXType('domainview')) 
                mainController = domainView.getController();
        }
       
        if (mainController != null)
            return mainController.showPopup(selector, popup, record);
        else
            return null;
        
         if (popup != null)
            me.isActive = false;
       
   },
   
   /*
    * Helper to close a 'popup' view that is controlled by this controller
    */
   closePopup: function() {
       var me = this;

        if (me.activityView.getPopup()) {
            me.activityView.fireEvent('closepopup', me);
            Ext.Viewport.animateActiveItem(Ext.Viewport.down('domainview'), { type: 'slide', direction: 'right' });
            
        }
   }

});


/**
 *  A DomainController controls a set of related activities, typically related to maintaining a master business 
 *  data entity, where each activity is controlled by a {@link Baff.app.controller.ActivityController}.  The
 *  DomainController controls a {@link Baff.app.view.DomainView}, which tabulates the various
 *  {@link Baff.app.view.ActivityView}s assocated with the activities.  The DomainController manages
 *  navigation and communication between activities.
 *   
 *  For a mobile application there may typically be a single domain controller, for which a  typical implementation 
 *  is as follows.  Only {@link #readRoles} need be specified, and {@link #titleSelector}
 *  if the tab title should be based on a field of the master entity record, along with a unique alias for the 
 * {@link Baff.app.view.DomainView} to reference.
 * 
 *     Ext.define('MyApp.controller.MyMainDomainController', {
 *         extend: 'Baff.app.controller.DomainController',           
 *         alias: 'controller.mainproduct',
 *            
 *         config: {                      
 *             accessRoles: ['myentity.read', 'myentity.update'],
 *             titleSelector: 'myentityname'
 *         }
 *                         
 * Also refer to the documentation for the associated {@link Ext.foundation.domainView}, which specifies 
 * configuration for user interface components this controller manages. 
 * 
 *  This class extends {Ext.app.Controller}, however subclasses should generally not require to 
 *  configure the superclass properties.
 *  
 */
 Ext.define('Baff.app.controller.DomainController', {
    extend: 'Ext.app.Controller', 
    requires: 'Baff.utility.Utilities',
    alias: 'controller.entity',
 
    /**
     * Defines if access is allowed, will be set based on user permissions.
     * @readonly 
     */
    allowAccess: true,
    
    /**
     * A unqiue ID for the controller instance.  It will be set automatically. 
     * @readonly
     */       
    ID: null,
    
    /**
     *  A combination of name and ID used for logging purposes.
     * @readonly 
     */
    identifier: null,
    
    /**
     * The entity view manged by this controller.
     * @readonly  
     */
    domainView: null,
    
    /**
     * The parent of the entity view manged by this controller.
     * @readonly  
     */
    parentView: null,   
    
    /**
     * The popup Activity View being displayed.
     * @private 
     */
    popupView: null,
    
    /**
     * The current master entity
     * @readonly
     */
    currentMasterEntity: null,
    
    /**
     * The current master entity type
     * @readonly
     */
    currentMasterEntityType: null,
    
    /**
     * The current context
     * @readonly
     */
    currentContext: null,
    
    // Display text for override in locale file 
    dtNewTitle: "New",
    dtContinueWithoutSavingMsg: "Continue without saving changes?",
    dtWorkflowStoppedMsg: "Current workflow will be stopped",
    dtWorkflowStoppedContinueMsg: "Current workflow will be stopped, continue?",
    dtLoading: "Please wait....",
    dtDataIntegrityIssue: 'Data integrity issue detected, recovering...',
    
    
    config: {
        
        /**
         * Specifies the view events to be handled
         */
        control: {
            viewSelector: {
                initialize: 'onViewInit'
            }
        },
        
        /**
        * A reference to the view that this controller controls 
        * **IMPORTANT**: This must be set by the subclass.
        * @cfg viewSelector (required) 
        */        
        refs: {
            viewSelector: ''
        },
        
        /**
        * Specifies the position of the tab bar.
        * @private
        */  
        tabBarPosition: 'bottom',
        
        /**
        * Specifies the application roles that are permitted to access.  These will be matched against 
        * user permissions managed by a {@link Baff.utility.Utilities#userSecurityManager}. 
        */    
        accessRoles: null,
        
        /**
        * Specifies the name of the field from the entity {@link #titleEntityl} that should be displayed in the tab title,
        * whenever the entity changes via {@link #masterentitychange} or {@link #entitychange} event.
        * The length can be controlled via {@link #titleLength} and whether the original title should be included 
        * via {@link #includeOriginalTitle}. 
        */    
        titleSelector: null,
        
        /**
        * Specifies the type of master entity {@link Baff.app.model.EntityModel} that is used to set the title.
        */    
        titleEntity: null,
        
        /**
        * Specifies a maximum length for the title. not including the original title if this is included.
        */
        titleLength: 25,
        
        /**
        * Specifies if the original title specified in the view configuration should be included in the
        * re-formatted title
        */
        includeOriginalTitle: true,
        
        /**
        * Specifies the popup window widget type, e.g. a {@link Baff.app.view.SelectorPopup} that 
        * should be initially displayed in order to select the master entity
        */
        popupSelector: '',
        
        /**
        * Specifies if client side version management is enabled
        */
        useVersionManager: true,
        
        /**
         * Specifies if master entity events should be cascaded to this domain from parent domain controller
         * Defaults to false as typically a master entity should be managed by a bottom level domain controller.
         */
        cascadeMasterEntity: false,
        
        /**
         * Specifies if context change events should be cascaded to this domain from parent domain controller
         * Defaults to true as context may be set more broadly.
         */
        cascadeContext: true,
        
         /**
         * Specifies if entity change events should be cascaded to this domain from parent domain controller
         * Defaults to false.
         */
        cascadeEntity: false
        
    },
    
    /**
     * @event newtab
     * Fires when a new tab is to be created (refer to {@link Baff.app.view.DomainView} for
     * more details on how a new tab is configured)
     * @param {Ext.tab.Panel} view The "new tab" tab 
     */ 
    
    /**
     * @event masterentitychange
     * Relays this event from the activity controller that initiated it to other activity controllers.
     * @param {Baff.app.controller.ActivityController} controller The activity controller firing the event
     * @param {Baff.app.model.EntityModel} model The master entity record
     * @param {String} type The master entity type
     */
    
    /**
     * @event entitychange
     * Relays this event from the activity controller that initiated it to other activity controllers.
     * @param {Baff.app.controller.ActivityController} controller The activity controller firing the event
     * @param {Baff.app.model.EntityModel} model The entity record
     * @param {String} type The entity type 
     */
    
    /**
     * @event contextchange
     * Fires when this controller changes the context.
     * @param {Baff.app.controller.ActivityController} controller The activity controller firing the event
     * @param {Ext.util.HashMap} context The list of context
     */
 
    /**
    * Initialises the controller.    
    * Sets {@link #ID}, {@link #identifier}, {@link #activityView} and {@link #entityModel}.
    */ 
    init: function() {  
        var me = this;
        
        // Set the unique id for this instance and the identifier
        me.ID = Ext.id(this, "DC");
        me.identifier = me.self.getName() + "-" + me.ID;
        
        // Setup context
        me.currentContext = new Ext.util.HashMap();
        
        Utils.logger.info("DomainController" + this.identifier + "]:init");
        
    },
   
    /**
    * Initialisation once the associated view has been initialised    
    * Sets {@link #activityView}.
    */   
    onViewInit: function() {     
        var me = this;
        
        Utils.logger.info("DomainController[" + this.identifier + "]::onViewInit");
        
        // Get the view and setup listeners
        me.domainView = me.getViewSelector();    
        me.domainView.setController(me);
        
        // Setup access rights and control
        me.setupAccessRights();
        me.setupAccessControl();    
        
        me.getApplication().on('afterinit', me.afterInit, me); 
        
        me.domainView.on('painted', function() {
            
            if (!me.isInitialized) {
                var parentView = me.domainView.getParent();
                
                if (parentView == null || !parentView.isXType('domainview')) 
                    me.getApplication().fireEvent('afterinit');
            }

        }, me);
       
    },
    
    /**
    * Launches the controller once all application view initialiasion is completed   
    */   
    afterInit: function() {
        var me = this;
        Utils.logger.info("DomainController[" + this.identifier + "]::afterInit");
        
         if (me.isInitialized) {
            return;
         }
         
         me.isInitialized = true;
        
        // Get parent view
        var parentView = me.domainView.getParent();    

        if (parentView != null && parentView.isXType('domainview')) {
           
            // Listen to change events from the parent
            if (me.getCascadeMasterEntity())
                parentView.on('masterentitychange', me.onMasterEntityChange, me);

            if (me.getCascadeContext())
                parentView.on('contextchange', me.onContextChange, me);
            
            if (me.getCascadeEntity())
                parentView.on('entitychange', me.onEntityChange, me);

        } else {
            // Activate if no parent 
            me.activateView(me.domainView);
        }
        
        // Listen for children activation
        var children = Ext.ComponentQuery.query('activityview', me.domainView);
        
        Ext.Array.each(children, function(child) {
            child.on('deactivate', function(newTab, tabPanel, oldTab) {
                return false;
                });
        });     
        
        Ext.Array.each(children, function(view) {
            view.on('activate', me.onTabChange, me);
        }); 
        
        

    },
 
    /**
    * Sets up access rights based on user permissions.  User permissions obtained from 
    * {@link Baff.utility.Utilities #userSecurityManager} are tested against the {@link accessRoles} specified..  
    * Sets {@link allowAccess} accordingly.  
    * Called during initialisation.
    * @protected
    */   
    setupAccessRights: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]::setupAccessControl");
        var me = this;
        
        var accessRoles = me.getAccessRoles();
        
        if (accessRoles != null) {
            me.allowAccess = Utils.userSecurityManager.isUserInRole(accessRoles);
        }
          
    },
    
    /**
    * Sets up access to view components based on {@link #allowAccess}.
    * Called during initialisation.
    * @protected
    */      
    setupAccessControl: function() {
        Utils.logger.info("DomainController" + this.identifier + "]:setupAccessControl");
        var me = this;
 
        if (!me.allowAccess) {
            me.domainView.disable();
            me.domainView.hide();
            
            Utils.logger.info("DomainController" + this.identifier + "]:setupAccessControl - access not allowed");
            
        }
        
        // Remove children where access is disallowed
        me.removeDisallowedChildren('activityview');
        me.removeDisallowedChildren('domainview');
       
    },
    
    /**
    * Removes underlying activities to which access has not been granted
    * Called during initialisation.
    * @protected
    */      
    removeDisallowedChildren: function (selector) {
        Utils.logger.info("DomainController" + this.identifier + "]:removeChildren");
        var me=this;
        
        var children = Ext.ComponentQuery.query(selector, me.domainView);
        
        Ext.Array.each(children, function(child, index) {
            if (!child.getController().isAccessAllowed() || !me.allowAccess) {
                me.domainView.getTabBar().getComponent(index).hide();
            }
        });        
    },
    
     /**
    * Handle a data integrity issue, default behaviour is to select the first tab, so override if required
    * @protected
    */      
    onDataIntegrityIssue: function(controller) {
        Utils.logger.info("DomainController" + this.identifier + "]:onDataIntegrityIssue");
        var me=this;
        
        Ext.Msg.alert(me.dtAckTitle, me.dtDataIntegrityIssue, function() {
            
            // Reset and select the first tab; this should typically manage the master entity, otherwise 
            // this should be overridden as required
            var firstTab = me.domainView.items.getAt(0);
            firstTab.getController().reset();
            me.changeTab(firstTab);
            
        });
        
    },
    
    /**
    * Called when view is activated (viewed).  Note that this is managed by self (if top level) or 
    * higher level {@link Baff.app.controller.DomainController} and not through the 'activate' event.  
    */   
    onActivateView: function() {
        Utils.logger.info("DomainController" + this.identifier + "]:onActivateView");
        var me = this;
        
         // Set the title if lowest level
        if (me.domainView.getActiveItem() != null && me.domainView.getActiveItem().isXType('activityview')) 
            me.setTitleFromRecord(me.currentMasterEntity);      
       
        // Get the popup and display it
        if (me.getPopupSelector() != '' && me.popupView == null)  {         
            me.popupView = me.showPopup(me.getPopupSelector(), me.popupView);
            
        } else {
             me.activateView(me.domainView.getActiveItem());        
        }
    },
    
    /**
    * Displayes a pop-up window and sets it's context etc.
    * @param {String} popupselector  The widget type of the popup
    * @param {Baff.app.view.ActivityView} popup A reference to the popup if previously obtained
    * @return {Baff.app.view.ActivityView} The popup
    */   
    showPopup: function(popupselector, popup, record ,activateOnClose) {   
        Utils.logger.info("DomainController" + this.identifier + "]:showPopup");
        var me = this;
        
        if (popup == null) {
        
            // Get the selector popup
            popup = Ext.widget(popupselector, {popup: true});
            
            if (popup == null) {
                Utils.logger.error("Failed to instansiate popup");
                return;
            }
            
            if (activateOnClose !== false)
                popup.on('closepopup', me.onPopupClose, me);
            
            // Detach any existing store
            popup.getController().detachStore();
            
            // Listen to the popup events
            popup.on('masterentitychange', me.onMasterEntityChange, me);
            popup.on('contextchange', me.onContextChange, me);
            
        }
        
         // Set popup
        popup.getController().onMasterEntityChange(me, me.currentMasterEntity, me.currentMasterEntityType);
        popup.getController().onContextChange(me, me.currentContext);
        popup.getController().onEntityChange(me, record, record != null ? record.self.getName() : null);

        popup.display(me);

        return popup;
        
    },
    
    /**
    * Closes the entity view if the popup is closed and no activity views have been enabled.
    */   
    onPopupClose: function() {
       Utils.logger.info("DomainController" + this.identifier + "]:onPopupClose");
        var me = this; 
        
        if (me.domainView.getActiveItem().isDisabled()) {
            me.domainView.close();
        } else {
            me.domainView.getActiveItem().tab.activate(true); // Ensure the tab is activated in case it was previously disabled
            me.activateView(me.domainView.getActiveItem()); 
        }
        
    },
    
    
    /**
    * Does nothing, for subclasses to override.    
    * Called whe view is deactivated.  Note that this is managed by the higher level 
    * {@link Baff.app.controller.DomainController and not through the 'deactivate' event.     
    */   
    onDeactivateView: function() {
        Utils.logger.info("DomainController" + this.identifier + "]:onDeactivateView");
        var me = this;
    },
    
    /**
    * Activates a view relative to the position of the one input
    * @param {Baff.app.view.DomainView} view The reference view
    * @param {Number} relativePosition The relative position of the view to be activated
    */   
    activateRelativeView: function(view, relativePosition) {
        Utils.logger.info("DomainController" + this.identifier + "]:activateTabToLeft");
        var me=this;
        
        var activeTabIndex = me.domainView.items.findIndex('id', view.id);
        var newIndex = activeTabIndex + relativePosition; 
        
        if (newIndex >= 0) {
            me.domainView.setActiveItem(newIndex); 
            me.activateView(me.domainView.getActiveItem()); 
        }
        
    },
    
    /**
    * Queries underlying activities to determine if the user should be prompted before changing
    * the view.  Invokes onActivation and onDeactivation 'events' on impacted controllers.
    * Called whe active tab is requested to be changed.
    * Note: always invoked for the top level tab that controls both the old and new views to be changed;
    * old view will be at the same level of the new view (i.e. not any underlying active tab).
    * @param {Baff.app.view.DomainView} tabPanel The entity view that owns the tabs
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} newView The view being requested
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} oldView The current view
    */   
    onTabChange: function(newTab, tabPanel, oldTab) {
        Utils.logger.info("DomainController" + this.identifier + "]:onTabChange");
        var me=this;
        
        // Manage the underlying activity state       
        me.deactivateView(oldTab);
        me.activateView(newTab);
        
        return true;
    },
    
    
    /**
    * Changes the currently selected tab without triggering a tab change event.
    * This should only be called for this controllers' view's tabs.
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} newView The view being requested
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} oldView The current view
    * @protected
    */   
    changeTab: function (newView, oldView) {
        Utils.logger.info("DomainController" + this.identifier + "]::changeTab");
        var me = this;
        
        if (oldView == null)
            oldView = me.domainView.getActiveItem();
        
        newView.un('activate', me.onTabChange, me); 
        
        if (oldView != newView) {        
            me.domainView.setActiveItem(newView); 
            me.deactivateView(oldView);
        }
            
        me.activateView(newView);
        newView.on('activate', me.onTabChange, me); 
    },
    
    /**
    * Deactivates the view and all underlying entity and activity views via their controllers
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} view The view to be deactivated.
    * @protected
    */   
    deactivateView: function(view) {
        Utils.logger.info("DomainController" + this.identifier + "]::deactivateView");
        var me = this;
        
        var targetView = view; 
        
        // Cycle through lower level entity views
        while (targetView != null && targetView.isXType('domainview') ) {

           targetView.getController().onDeactivateView();
           targetView = targetView.getActiveItem(); 
        }
        
        // Deactivate the currently selected activity view
        if (targetView != null && targetView.isXType('activityview')) {
             targetView.getController().onDeactivateView();
        };        

    },
    
    /**
    * Activates the view and all underlying entity and activity views via their controllers
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} view The view to be activate.
    * @protected
    */   
    activateView: function(view) {
        Utils.logger.info("DomainController" + this.identifier + "]::activateView");
        var me = this;
        
        var targetView = view;
         
        // Cycle through lower level entity views
        if (targetView != null && targetView.isXType('domainview') ) {

                // If the tab is disabled try to select one that isn't
                if (targetView.isDisabled()) {
                    var parent = targetView.getParent();     
                    parent.items.forEach(function (item) {
                        if (item.isXType('domainview') && !item.isDisabled()) {
                            parent.getController().changeTab(item, targetView);
                            return false;
                        }
                    });
                    // The above should trigger this function again so don't continue
                    return;
                }    
            
                targetView.getController().onActivateView();          
        } else
        
        // Activate the currently selected activity view
        if (targetView != null && targetView.isXType('activityview')) {
            
            // If the tab is disabled try to select one that isn't
            if (targetView.isDisabled()) {
                    var parent = targetView.getParent();                      
                    parent.items.forEach(function (item) {                   
                        if (item.isXType('activityview') && !item.isDisabled()) {                            
                            parent.getController().changeTab(item, targetView);
                            return false;                       
                        }
                    });
                    // The above should trigger this function again so don't continue
                    return;
                }        
            
            targetView.getController().onActivateView();  
            Utils.globals.activeView = targetView;
              
        }
        
    },
    
    /**
    * Handles a change to the master data entity as a result of the {@link #masterentitychange} 
    * event. Sets the tab title, stores the master if {@link #useVersionManager} is true, and relays 
    * the event to underlying activity controllers.
    * @param {Baff.app.controller.ActivityController} controller The activity controller that fired the event
    * @param {Baff.app.model.EntityModel} master The master entity record that has been selected
    * @param {String} type The master entity type
    */    
    onMasterEntityChange: function(controller, record, type) {       
        Utils.logger.info("DomainController" + this.identifier + "]:onMasterEntityChange");
        var me = this;
        
        me.currentMasterEntity = record;
        me.currentMasterEntityType = type;
        
        // Set the tab title
        me.setTitleFromRecord(record, type);
     
        // Relay the event
        me.domainView.fireEvent('masterentitychange', controller, record, type);     

    },
    
    /**
    * Handles a change to a data entity as a result of the {@link #entitychange} 
    * event. 
    * @param {Baff.app.controller.ActivityController} controller The activity controller that fired the event
    * @param {Baff.app.model.EntityModel} master The entity record that has been selected
    * @param {String} type The entity type
    */    
    onEntityChange: function(controller, record, type) {       
        Utils.logger.info("DomainController" + this.identifier + "]:onEntityChange");
        var me = this;
        
        // Set the tab title
        me.setTitleFromRecord(record, type);
        
        // Relay the event
        me.domainView.fireEvent('entitychange', controller, record, type);    

    },
    
    /**
    * Handles a change to a context as a result of the {@link #contextchange} 
    * event. 
    * @param {Baff.app.controller.ActivityController} controller The activity controller that fired the event
    * @param {Baff.app.model.EntityModel} context The context that has been changed
    */    
    onContextChange: function(controller, context) {       
        Utils.logger.info("DomainController" + this.identifier + "]:onContextChange");
        var me = this;
        
        // Set the context property
        context.each( function (key, value) {
        
            if (value !== null && value != '')
                me.currentContext.replace(key, value);
            else
                me.currentContext.removeByKey(key);

        });
        
        // Relay the event
        me.domainView.fireEvent('contextchange', controller, context);    

    },
    
    /**
    * Gets extenernally set context from {@link #currentContext}
    * @param {String}  The context key
    * @return The context
    */    
    getCurrentContext: function(fieldName) {
        Utils.logger.info("DomainController[" + this.identifier + "]::getCurrentContext");
        var me = this;
        
        return me.currentContext.get(fieldName);
        
    },
    
    /**
    * Sets the tab title based on the record passed in and {@link #titleSelector}, {@link #includeOriginalTitle}
    * and {@link #titleLength} configuration.  Sets {@link #originalTitle}.
    * @param {Baff.app.model.EntityModel} record The entity record to query
    * @protected
    */    
    setTitleFromRecord: function(record, type) {
        Utils.logger.info("DomainController" + this.identifier + "]:setTitleFromRecord");
        var me = this;
        
        var selector = me.getTitleSelector();
        var entity = me.getTitleEntity();
        var titlebar =  me.domainView.down('#titlebar');
        
        if (selector == null || entity == null || entity != type || titlebar == null)
            return;
        
        var title = '';      
        
        if (me.getIncludeOriginalTitle()) {
            title = me.domainView.getTopTitle() + ": ";
        }
        
         if (record == null) {
            title += me.dtNewTitle;
        
         } else {
             
            var recordText = record.get(selector);
            var maxLength = me.getTitleLength();
        
            if (recordText.length > maxLength) {
                recordText =  recordText.substring(0, maxLength -3 ) + "...";
            }else {
                recordText = recordText.substring(0, maxLength);
            }
            
            title += recordText;
        }
        
        titlebar.setTitle(title);
        
    },
        
    /**
    * Determines if this view is permitted to be accessed based on either of {@link #allowRead} or
    * {@link #allowUpdate} having been set to true during initialisation.
    * @return {boolean}
    */    
    isAccessAllowed: function() {
        return this.allowAccess;
    },
    
    /**
    * Queries the active actvity to see if changes have been made - any other activities with amended 
    * details should have been prompted for previously.
    * @param {Baff.app.model.EntityModel} record The entity record to query
    * @param {boolean} ignoreWorklfow Indicates if workflow state should be ignored
    * @return {String} The message to be displayed.
    */    
    getDeactivationPrompt: function(activeView) {
        Utils.logger.info("DomainController" + this.identifier + "]:getDeactivationPrompt");
        var me = this;
        
        var message = "";
        
        // Check underlying activities
        var targetView = activeView;  
       
        if (targetView == null)
            targetView = me.domainView.getActiveItem();  
       
              
        while (targetView != null && !targetView.isXType('activityview')) {
            targetView = targetView.getActiveItem();  
        }
        
        if (targetView != null && targetView.isXType('activityview') &&
            targetView.getController().isDeactivationPromptRequired())
                message = me.dtContinueWithoutSavingMsg;
        
        
       return message;
    },
    
    /**
     * Navigates to and displays the associated {@link #domainView}.
     * @protected
     */
    showView: function() {
        Utils.logger.info("DomainController" + this.identifier + "]:showView");
        var me = this;
        
        var view = me.domainView;
        var parent = me.domainView.getParent('domainview');  
        
        while (parent !=null && parent,isXType('domainview')) {
             if (view != parent.getActiveItem()) 
                parent.getController().changeTab(view, parent.getActiveItem()); 
            
            view = parent;
            parent = parent.getParent();            
        }      
    },
    
   
    /**
    * Shows / hides the wait mask.
    * @param {boolean} [show="false"]
    * @protected
    */    
    showWaitMask: function (show) {
        var me = this;
        if (show)
            me.getView().setLoading(me.dtLoading);
        else
            me.getView().setLoading(false);
    }
    
        
});

// Bug in Ext.tab.Tab, fails to set focusable to false, results in multipe tab related events being fired
// making them impossible to handle cleanly
Ext.override('Ext.tab.Tab', {
    focusable: false
});

/**
 *  A FormController extends {@link Baff.app.controller.ActivityController} to support an activity that 
 *  involves managing a data entity presented in a {@link Baff.app.view.FormView}.  It therefore 
 *  supports various user interface components including the form for data view and captures as well 
 *  as the following buttons to manage activity operations and state:
 *  
 *  - Refresh: to refresh the current data set as well as associated client data cache
 *  - Add: to enter a state of creating a new data entity
 *  - Remove: to send a service request to delete the currently selected data entity
 *  - Revert: to undo any changes and revert to the existing entity or default values when creating a new entity
 *  - Save: to send a service request to save the updated existing or newly created entity 
 *  
 *  A minimal setup only requires the {@link #entityModelSelector} and {@link #entityStoreSelector}
 *  to be specified, along with a reference to the {@link Baff.app.view.FormView}, as follows:
 *  
 *      Ext.define('MyApp.controller.MyFormController', {
 *          extend: 'Baff.app.controller.FormController',
 *          alias: 'controller.myformcontroller',
 *   
 *          requires: ['MyApp.store.MyEntityStore',
 *                          'MyApp.model.MyEntityModel'],
 *   
 *          config: {
 *          
 *              refs: {       
 *                   viewSelector: 'myformview',        
 *              },
 *          
 *              storeSelector: 'MyApp.store.MyEntityStore',
 *              modelSelector: 'MyApp.model.MyEntityModel'
 *          }
 *
 *      }); 
 *  
 *  The configuration properties that manage general behaviour are {@link #viewExistingRecord},
 *  {@link #manageSingleRecord} and {@link #selectFirstRecord}, whilst {@link #createEnabled},
 *  {@link #updateEnabled} and {@link #deleteEnabled} can be set to support specific operations..
 *  
 *  Some typical general configurations are as follows:
 *   
 *  1 Maintain a single entity record in a 1-1 relationship with a master, e.g. customer details. 
 *      Add button will not be shown.  May be desirable to hide Remove button.
 *      
 *      config: {     
 *          viewExistingRecord: true, 
 *          manageSingleRecord: true,
 *          selectFirstRecord: irrelevant,
 *          deleteEnabled: false, // true by default   
 *          ...   
 *       }      
 *    
 *  2 Create an entity record in a M-1 relationship with a master, e.g. submit a customer order. Add button 
 *      will not be shown.
 *         
 *      config: {     
 *          viewExistingRecord: false, 
 *          manageSingleRecord: irrelevant,
 *          selectFirstRecord: irrelevant,
 *          ...   
 *       }
 *        
 *  3 Create and view newly created entity record in a M-1 relationship with a master, e.g. submit a 
 *      customer order - but will never select previously created records in the form by default.  
 *          
 *       config: {          
 *          viewExistingRecord: true, 
 *          manageSingleRecord: false,
 *          selectFirstRecord: false,  // but will select current record     
 *          updateEnabled: false, // could be defaulted to true to allow subsequent editing
 *          deleteEnabled: false,
 *          ...  
 *        }    
 *        
 *  4 Maintain and replace the "first" entity record in a M-1 relationship with a master, e.g. manage current
 *      address whilst retaining historical addresses.
 *      
 *      config: {     
 *          viewExistingRecord: true, 
 *          manageSingleRecord: false,
 *          selectFirstRecord: true,
 *          ... 
 *       }
 *
 *  The application roles that the user must be permitted to perform are set as follows:
 *   
 *      config: {
 *          ...     
 *          readRoles: ['myentity.read'],
 *          updateRoles: ['myentity.update'],
 *          ... 
 *       }
 *  
 *  Refer to the superclass {@link Baff.app.controller.ActivityController} for details of version control
 *  configuration.
 */
Ext.define('Baff.app.controller.FormController', {
    extend: 'Baff.app.controller.ActivityController',
    requires: ['Baff.utility.Utilities'],                
    alias: 'controller.form',
    
    /**
    * The {@link Baff.app.view.FormPanel} that contains the form
    * @readonly
    */
    formPanel: null,
    
    /**
    * The add button
    * @readonly
    */   
    addButton: null,
    
    /**
    * The save button
    * @readonly
    */   
    saveButton: null,
    
    /**
    * The remove button
    * @readonly
    */   
    removeButton: null,
    
    /**
    * The revert button
    * @readonly
    */   
    revertButton: null,
    
     /**
    * Defines whether an existing data is being modified or a new entity is being added.  
    * @protected
    */   
    recordAction: '',
    
    /**
    * Flag to indicate that the activity is in a read only state  
    * @readonly
    */   
    isReadOnly: false,
    
    // Display text for locale override
    dtConfirmTitle: "Confirm",
    dtConfirmDelete: "Delete this record?",
    dtConfirmRevert: "Discard all changes?",
    
  
    config: {
        
        /**
        * Specifies if creating a new entity is supported
        */   
        createEnabled: true,
        
        /**
        * Specifies if updating an existing entity is supported
        */
        updateEnabled: true,
        
        /**
        * Specifies if deleting an existing entity is supported
        */
        deleteEnabled: true, 
        
        /**
        * Specifies if existing entities will be displayed in the form.  If set to false then any existing entity records
        * will not be displayed and it will only be possible to create new entity records.
        */
        viewExistingRecord: true,
        
        /**
        * Specifies if this activity only acts on a single entity record, i.e. in a 1-1 relationship with a master entity
        */
        manageSingleRecord: true, 
        
        /**
        * Specifies if the first entity in a M-1 relationship with a master entity should be selected.  
        * If set to false then the activity will default to add state.
        */
        selectFirstRecord: true, 
        
        /**
        * Specifies a selector for the form panel.  If not set (by default)  it is determined automatically
        * from the associated {@link Baff.app.view.ActivityView}
        */   
        formPanelSelector: '',
        
        /**
        * Specifies a selector for the add button.  If not set (by default)  it is determined automatically
        * from the associated {@link Baff.app.view.ActivityView}
        */   
        addButtonSelector: '',
        
        /**
        * Specifies a selector for the save button.  If not set (by default)  it is determined automatically
        * from the associated {@link Baff.app.view.ActivityView}
        */   
        saveButtonSelector: '',
        
        /**
        * Specifies a selector for the remove button.  If not set (by default)  it is determined automatically
        * from the associated {@link Baff.app.view.ActivityView}
        */   
        removeButtonSelector: '',
        
        /**
        * Specifies a selector for the revert button.  If not set (by default)  it is determined automatically
        * from the associated {@link Baff.app.view.ActivityView}
        */   
        revertButtonSelector: '',
        
        /**
        * Specifies whether the user should be prompted before the view is deactivated if changes have
        * been made in which case if the user declines to proceed then the view will not be deactivated.
        */   
        promptOnDeactivate: true,
        
        /**
        * Specifies whether any changes made should be reverted when the view is deactivated.  If set
        * to false then the changes previously made will be retained and visible when the view is reactivated,
        * but subject to the activity's data not having been purged as a result of a client data cache refresh
        */   
        revertOnDeactivate: false,
        
        /**
         * Specifies a url for form submission, which will be used for any save operation
         */
        submitFormUrl: null,
       
        /**
         * Specifies if a new record should have its fields populated from context specified by 
         * {@link contextHandlerMap}, since this may typically be applied as a filter on the records fields
         */
        setupNewRecordFromContext: false,
        
         /**
         * Specifies if a confirmation prompt should be displayed when deleting a record
         */
        confirmRemove: false
       
    },
    
    /**
    * Initialises the controller.  
    * Calls the overriden superclass method. 
    */        
    init: function() {
        
        this.callParent(arguments);
         
    },
    
    /**
    * Sets up the associated view components and associated event handlers.  Will use any selectors specified 
    * in configuration such as {@link #formPanelSelector}, {@link #addButtonSelector}, etc., but by
    * default will determine the components automatically from the {@link Baff.app.view.FormView}.    
    * Sets the various component properties such as {@link #formPanel}, {@link #addButton}, etc.    
    * Called on initialisation.    
    * Calls the overriden superclass method.   
    * @protected 
    */          
    onLaunch: function() {
        Utils.logger.info("FormController[" + this.identifier + "]::onLaunch");
        var me = this,
                selector;
        
        me.showWaitMask(true);
        
        // Form
        selector = me.getFormPanelSelector();
        
        if (selector === '') 
            selector = me.activityView.getFormPanel();
        
        if (selector !== '') {
            me.formPanel = me.lookupReference(selector);
        }else { 
            me.formPanel = Ext.create('Baff.app.view.FormPanel');
        }       

        me.formPanel.setCleanRecord(true);
        me.formPanel.on('dirtychange', me.onFormDirtyChange, me);
              
        // Add Button
        selector = me.getAddButtonSelector();
        
        if (selector === '')
            selector = me.activityView.getAddButton();
        
        if (selector !== '') {
            me.addButton = me.lookupReference(selector);
            me.addButton.on('tap', me.onAddButton, me); 
        }
        
        // Remove Button
        selector = me.getRemoveButtonSelector();
        
        if (selector === '')
            selector = me.activityView.getRemoveButton();
        
        if (selector !== '') { 
            me.removeButton = me.lookupReference(selector);
            me.removeButton.on('tap', me.onRemoveButton, me); 
        }
        
        // Save Button
        selector = me.getSaveButtonSelector();
        
        if (selector === '')
            selector = me.activityView.getSaveButton();
        
        if (selector !== '') {
            me.saveButton = me.lookupReference(selector);
            me.saveButton.on('tap', me.onSaveButton, me); 
        }
        
        // Revert Button
        selector = me.getRevertButtonSelector();
        
        if (selector === '')
            selector = me.activityView.getRevertButton();
        
        if (selector !== '') {
            me.revertButton = me.lookupReference(selector);
            me.revertButton.on('tap', me.onRevertButton, me);
        }
        
        // Call the parent to complete
        me.callParent(arguments);       
    },
    
    /**
    * Sets up access to view components based on {@link #allowRead}, {@link #allowUpdate}, and
    * {@link #readOnly}, as well as {@link #viewExistingRecord}, {@link #manageSingleRecord}, 
    * {@link #selectFirstRecord}, and {@link #createEnabled}, {@link #updateEnabled} and {@link #deleteEnabled}.  
    * Called during initialisation.
    * @protected
    */      
    setupAccessControl: function() {
        Utils.logger.info("FormController[" + this.identifier + "]:setupAccessControl");
        var me = this;
        
        if (!me.allowUpdate || me.getReadOnly()) {            
            if (!me.allowRead) {              
                Utils.logger.info("FormController[" + this.identifier + "]:setupAccessControl - access not allowed");
                me.activityView.disable();
                me.activityView.hide();

            } else {               
                Utils.logger.info("FormController[" + this.identifier + "]:setupAccessControl - read only access");
                me.makeReadOnly();
             }
        } else {
            
            me.makeReadOnly(false);
           
            if (!me.getCreateEnabled() || me.getManageSingleRecord() || !me.getViewExistingRecord()) { 
                me.showWidget(me.addButton, false);
            }         
            
            if (!me.getUpdateEnabled() && !me.getCreateEnabled()) {
      
                    me.showWidget(me.saveButton, false);
                    me.showWidget(me.revertButton, false);
                    me.formPanel.makeReadOnlyForAll(true);               
           }
            
            if (!me.getDeleteEnabled() || !me.getViewExistingRecord()) {
                me.showWidget(me.removeButton, false);    
            }
        }           
    },
    
    /**
    * Sets view to read-only (not for temporarily disabling widgets).
    * Use {@link #setFieldsReadOnly} to disable record editing.  
    * Called during setup.
    * @param {boolean} [readonly="true"]
    * @protected
    */    
    makeReadOnly: function(readonly) {
        Utils.logger.info("FormController[" + this.identifier + "]:makeReadOnly");
         var me = this;

        if (readonly != false)
           readonly = true;
       
       var hidden = me.formPanel.isHidden();
       
        me.formPanel.makeReadOnlyForAll(readonly);
        me.showWidget(me.removeButton, !readonly);
        me.showWidget(me.saveButton, (!readonly && !hidden));
        me.showWidget(me.revertButton, (!readonly && !hidden));
        me.showWidget(me.addButton, !readonly);

        me.isReadOnly = readonly;
                
    },  
    
    /**
    * Reverts the view if changes have been made and {@link #revertOnDeactivate} is true.  
    * Called whe view is deactivated.  Note that this is managed by the {@link Baff.app.controller.DomainController}
    * and not through the 'deactivate' event.     
    */    
    onDeactivateView: function() {
        Utils.logger.info("FormController[" + this.identifier + "]::onDeactivateView");
        var me = this;
        
        if (me.formPanel.isDirty()) {
            if (me.getRevertOnDeactivate()) {
                me.revertRecord();
            }
        } 
        
        me.callParent(arguments);
    },
    
    /**
    * Called whe form changes its dirty state.  
    * @param {Ext.form.Form} form The form who's state has changed
    * @param {boolean} dirty The dirty state   
    */    
    onFormDirtyChange: function(form, dirty) {
        var me = this;
        me.dirtyChange(form, dirty); 
    },
    
    /**
    * Prompts the user if changes have been made before proceeding to create a record.   
    * Called whe add button is clicked.    
    */    
    onAddButton: function() {
        Utils.logger.info("FormController[" + this.identifier + "]::onAddButton");
        var me = this;
            
        if (me.formPanel.isDirty()) {
            Ext.Msg.confirm(me.dtConfirmTitle, me.dtConfirmRevert, function(btn) {
                if (btn === 'yes')
                    me.addRecord();
            });
        } else {
            me.addRecord();
        }
    },
    
    /**
    * Proceeds to save a record.    
    * Called when the save button is clicked.    
    */    
    onSaveButton: function() {
        Utils.logger.info("FormController[" + this.identifier + "]::onSaveButton");
        this.saveRecord();
    },
    
    /**
    * Prompts the user if changes have been made before proceeding to remove a record.     
    * Called when the remove button is clicked.    
    */    
    onRemoveButton: function() {
        Utils.logger.info("FormController[" + this.identifier + "]::onRemoveButton");
        var me = this;
        
        if (me.formPanel.isDirty()) {
            Ext.Msg.confirm(me.dtConfirmTitle, me.dtConfirmRevert, function(btn) {
                if (btn === 'yes')
                    me.removeRecord();
            });
        } else {
            me.removeRecord();
        }

    },
    
    /**
    * Prompts the user if changes have been made before proceeding to revert the entity record.      
    * Called when the revert button is clicked.    
    */    
    onRevertButton: function() {
        Utils.logger.info("FormController[" + this.identifier + "]::onRevertButton");
       var me = this;
       
        if (me.formPanel.isDirty()) {
            Ext.Msg.confirm(me.dtConfirmTitle, me.dtConfirmRevert, function(btn) {
                if (btn === 'yes')
                    me.revertRecord();
            });
        } else {
            me.revertRecord();
        }

    },
    
    /**
    * Prompts the user if changes have been made before proceeding to refresh the activity.      
    * Called when the refresh button is clicked.    
    */    
    onRefreshButton: function() {
        Utils.logger.info("FormController[" + this.identifier + "]::onRefreshButton");
        var me = this;
        
        // Called when refresh button selected 
        
        if (me.formPanel.isDirty()) {
            Ext.Msg.confirm(me.dtConfirmTitle, me.dtConfirmRevert, function(btn) {
                if (btn === 'yes') {
                    me.setCurrentRecord(null);
                    me.refreshCache();
                }
            });
        } else {
            me.setCurrentRecord(null);
            me.refreshCache();
        }
        
    },
    
    /**
    * Determines the state to enter following a refresh, based on {@link #currentRecord}, 
    * {@link #viewExistingRecord}, {@link #manageSingleRecord} and {@link #selectFirstRecord}.   
    * Called after the store is first loaded.    
    * @protected
    */    
    onStoreFirstLoaded: function () {
        Utils.logger.info("FormController[" + this.identifier + "]::onStoreFirstLoaded");
        var me = this;
        
       if (me.checkDataIntegrity() == false) {
            me.showWaitMask(false);
            return;
        }
        
        if (me.currentRecord == null || !me.getViewExistingRecord()) {
            if (!me.getManageSingleRecord() && !me.getSelectFirstRecord()) {
                me.onLoadAdd();
            } else {
                me.onLoadSelectFirst();
            }
        } else {
            me.onLoadModify();
        }
    },
    
    /**
    * Proceeds to add a new entity record.  
    * Called after the store is first loaded. 
    * @protected
    */    
    onLoadAdd: function() {
        Utils.logger.info("FormController[" + this.identifier + "]::onLoadAdd");
        var me = this;
        
        this.addRecord(true); 
    },
    
    /**
    * Attempts to match and reset {@link #currentRecord} in the store before proceeding to modify it. 
    * Called after the store is first loaded. 
    * @protected
    */    
    onLoadModify: function() {
        Utils.logger.info("FormController[" + this.identifier + "]::onLoadModify");
        var me=this;
        
        // Try to get the current record from the store
        var record = me.entityStore.findEntity(me.currentRecord);  
        
        if (record != null) {
            
            me.currentRecord = record
            me.modifyRecord(me.currentRecord, true);
            
        // Reload current record if unless we're sure it's ok
        } else if (me.checkVersion(me.currentRecord) != true){
            
            Utils.logger.info("FormController[" + this.identifier + "]::onLoadModify - reloading record");
           
             // Set the username
            var username = null;

            if (Utils.userSecurityManager != null)
                username =  Utils.userSecurityManager.getUserName();
            
            Ext.ClassManager.get(me.getModelSelector()).load(me.currentRecord.getEntityId(), { 
            params: {
                'entityId': me.currentRecord.getEntityId(),
                'username': username
            },
            callback: function(record, operation, success) {
               if (!operation.success) {
                  me.doLoadException(record.getProxy().getResponse());          
                       
                } else if (operation.getRecords().length == 0) {                  
                    me.setCurrentRecord(null);
                    me.onStoreFirstLoaded();
                    
                } else {
                    me.setCurrentRecord(record);
                    me.modifyRecord(me.currentRecord, true);
                }
            }
        });
        } else {
            me.modifyRecord(me.currentRecord, true);
        }
  
    },
    
    /**
    * Proceeds to select the first entity record for modifying.  
    * Called after the store is first loaded.
    * @protected
    */    
    onLoadSelectFirst: function() {
        Utils.logger.info("FormController[" + this.identifier + "]::onLoadSelectFirst");
        this.selectFirstRecord(true); 
    },
    
    /**
    * Determines the state to enter following a refresh when no store is present.
    * @param {Baff.app.model.EntityModel} record The entity record to be processed   
    * @protected
    */    
    refreshWithNoStore: function(record) {
        Utils.logger.info("FormController[" + this.identifier + "]::refreshWithNoStore");
        var me = this;
        
        if (me.checkDataIntegrity() == false) {
            me.showWaitMask(false);
            return;
        }
        
        if (record != null)
            me.modifyRecord(record, true);
        else
            me.addRecord(true);
        
    },
   
    /**
    * Selects the first entity record in the data set and proceeds to modify it, otherwise if no data present
    * then proceeds to add a new entity record.  
    * @param {boolean} isAfterRefresh Flag set to true if this is following refresh
    * @protected
    */    
    selectFirstRecord: function(isAfterRefresh) {      
        Utils.logger.info("FormController[" + this.identifier + "]::selectFirstRecord");
        var me = this;
       
        if (me.entityStore.getTotalCount() == 0) {
            me.addRecord(isAfterRefresh);
        } else {
            var record = me.entityStore.getAt(0);
            
            if (record != null && me.getViewExistingRecord())
                me.modifyRecord(record, isAfterRefresh);
            else 
                me.addRecord(isAfterRefresh);
           
        }

    },
    
    /**
    * Enables the buttons based on whether data has been changed.
    * @param {Ext.form.Form} form The form who's state has changed
    * @param {boolean} dirty The dirty state   
    * @protected
    */    
    dirtyChange: function(form, dirty) {
        Utils.logger.info("FormController[" + this.identifier + "]::dirtyChange, dirty = " + dirty);
        var me = this;
        
        if (dirty && !me.getReadOnly()) {
           
            me.enableWidget(me.removeButton, false);
            me.enableWidget(me.revertButton, true);
            me.enableWidget(me.saveButton, true);
        }       
    },
    
    /**
    * Undoes any changes made whilst modify an existing or adding a new entity.
    * @protected
    */    
    revertRecord: function() {
        Utils.logger.info("FormController[" + this.identifier + "]::revertRecord, state = " + this.state);
        var me = this;
        
        if (me.currentRecord != null) {
            me.modifyRecord(me.currentRecord); 
        } else {
            me.addRecord();
        }
    
    },
    
    /**
    * Enters the state of modifying an existing entity record by setting up the view components and loading
    * the form with the selected entity record.
    * @param {Baff.app.model.EntityModel} record The entity record to be processed   
    * @param {boolean} isAfterRefresh Flag set to true if this is following refresh
    * @protected
    */    
    modifyRecord: function(record, isAfterRefresh) {
        Utils.logger.info("FormController[" + this.identifier + "]::modifyRecord");
        var me = this;
               
        me.recordAction = me.entityModel.ACTION.UPDATE;    
        me.setCurrentRecord(record);   
        
        // Load the record
        me.loadRecord(record, me.recordAction);

        // Manage control state
        me.formPanel.makeReadOnlyForAll(me.isReadOnly || !(me.getUpdateEnabled()));
        me.enableWidget(me.removeButton, (me.getDeleteEnabled() && !me.isReadOnly));
        me.enableWidget(me.addButton, (me.getCreateEnabled() && !me.isReadOnly));   
        me.enableWidget(me.revertButton, false);    
        me.enableWidget(me.saveButton, false);    
        
        // Prepare form for editing
        var allowModify = (me.allowUpdate && !me.isReadOnly);
        me.prepareView(isAfterRefresh == true, allowModify, record, me.recordAction);
               
        me.formPanel.setCleanRecord();

        me.showWaitMask(false);
        
        // Now check version if required (do last in case not auto refreshing)
        me.checkVersionOnView(record);
        
    },

    /**
    * Enters the state of adding a new entity record by setting up the view components and loading
    * the form with a default entity.
    * @param {boolean} isAfterRefresh Flag set to true if this is following refresh
    * @protected
    */    
    addRecord: function(isAfterRefresh) {
        Utils.logger.info("FormController[" + this.identifier + "]::addRecord");
        var me = this;
        
        me.recordAction = me.entityModel.ACTION.CREATE;     
        me.setCurrentRecord(null);
        
        // Create a new entity record
        var newRecord = Ext.create(me.entityModel.getName()); 
        me.setNewRecordDefaults(newRecord)
        
         // Load the record
        me.loadRecord(newRecord, me.recordAction);
        
        // Manage control state
        me.formPanel.makeReadOnlyForAll(me.isReadOnly || !(me.getCreateEnabled()));
        me.enableWidget(me.removeButton, false);
        me.enableWidget(me.addButton, false);   
        me.enableWidget(me.revertButton, false);    
        me.enableWidget(me.saveButton, false);   
       
        // Prepare form post record load
        var allowModify = (me.allowUpdate && !me.isReadOnly);
        me.prepareView(isAfterRefresh == true, allowModify, newRecord, me.recordAction);    
          
        me.formPanel.setCleanRecord();
        
        me.showWaitMask(false);
                          
    },
    
    /**
    * Set new record defaults based on master entity id and filtering context
    * @param {Baff.app.model.EntityModel} record The entity record to be processed   
    * @protected
    */   
    setNewRecordDefaults: function(record) {
        var me = this;
        
        record.setMasterEntityId(me.masterEntityId);
        
        if (me.getSetupNewRecordFromContext() && me.filterContext.getCount() > 0)
            record.set(me.filterContext.map);      

    },
    
    /**
    * Override to prepare the record prior to loading it in the form.  
    * {@link #recordAction} can be queried to determine the action being performed. 
    * @param {Baff.app.model.EntityModel} record The entity record to be processed   
    * @param {String} recordAction The {@link Baff.app.model.EntiotyMode #ACTION} being performed   
    * @protected
    */   
    loadRecord: function(record, recordAction) {
        var me = this;
        me.formPanel.setRecord(record); 

    },
    
    /**
     * Sets all fields to read only and disables the delete button
     * @param {boolean} readOnly 
     */
    setFieldsReadOnly: function (readOnly) {
        var me = this;
        
        if (readOnly != false)
            readOnly = true;
        
        me.formPanel.makeReadOnlyForAll(readOnly);
        
        if (readOnly)
            me.enableWidget(me.removeButton, false);
        
    },
    
    /**
    * Prepares to save the modified existing / new entity record by retrieving it from the form and performing
    * validation, before executing the save operation. 
    * @protected
    */   
    saveRecord: function() {
        Utils.logger.info("FormController[" + this.identifier + "]::saveRecord");
        var me = this;
        
        // Get entity record loaded into form
        var origRecord = me.formPanel.getRecord();
        
        // Create a new entity record with values from the form otherwise updates will be stored locally
        // before the service has confirmed - then we can update the store once confirmed
        var revRecord = origRecord.copy();
        
        // Update the entity record from the values in the form
        me.formPanel.updateRecord(revRecord);      
        
        // Perform validation
        var isValid = me.doValidation(revRecord, origRecord);
       
        if (!isValid) { 
        
            // Display the errors
            me.formPanel.markInvalid( revRecord.getErrors() );  
        
        } else {
            
            // Prepare the record for save
            me.prepareRecord(me.OPERATION.SAVE, revRecord);            
            
            // Save the entity record
            me.saveExec(revRecord);
 
        }
    },
    
    /**
    * Prepares to delete an existing entity record by retrieving it from the form and performing
    * validation, before executing the remove operation. 
    * @protected
    */   
    removeRecord: function() {
        Utils.logger.info("FormController[" + this.identifier + "]::removeRecord");
        var me = this;
        
        // Set the record action
        me.recordAction = me.entityModel.ACTION.DELETE;    
                  
        // Get entity record loaded into form
        var origRecord = me.formPanel.getRecord();
        
        // Create a copy otherwise the original will get erased from the store even before the
        // service has confirmed success - then we can update the store once confirmed
        var revRecord = origRecord.copy();
        
        // Perform validation
        var isValid = me.doValidation(revRecord, origRecord);
        
        if (!isValid) { 
        
            // Display the errors
            me.formPanel.markInvalid( revRecord.getErrors() );  
        
        } else {
            
            if (me.getConfirmRemove()) {
        
                Ext.Msg.confirm(me.dtConfirmTitle, me.dtConfirmDelete, function(btn) {
                    if (btn === 'yes') {

                        // Prepare the entity record for removal and remove it
                        me.prepareRecord(me.OPERATION.REMOVE, revRecord);
                        me.removeExec(revRecord);

                    }
                }); 
                
            } else {

                // Prepare the entity record for removal and then remove
                me.prepareRecord(me.OPERATION.REMOVE, revRecord);                   
                me.removeExec(revRecord);
                
            }
        }
    },
    
    /**
    * Invokes entity level validation via {@link Baff.app.model.EntityModel #isValid} and general 
    * feasibility validation via {@link #doFeasibilityValidation}
    * @param {Baff.app.model.EntityModel} revisedRecord The revised or new entity record
    * @param {Baff.app.model.EntityModel} originalRecord The original entity record
    * @return {boolean} The success state of the validation
    * @protected
    */   
    doValidation: function (revisedRecord, originalRecord) {       
        Utils.logger.info("FormController[" + this.identifier + "]::doValidation");
        var me = this;
        
        var isValid = revisedRecord.isValid(me.recordAction, originalRecord);
        var isFeas = me.doFeasibilityValidation(revisedRecord, originalRecord);
        
        if (isValid && isFeas)
            return true;
        
        return false;
    },
       
    /**
    * Override to perform feasibility validation on the revised entity record. {@link #recordAction} can 
    * be queried to determine the action being performed. On determining validation errors these should 
    * be added to the revised entity record via {@link Baff.app.model.EntityModel #addErrors} and return false.
    * @param {Baff.app.model.EntityModel} revisedRecord The revised or new entity record
    * @param {Baff.app.model.EntityModel} originalRecord The original entity record
    * @return {boolean} The success state of the validation
    * @protected
    */   
    doFeasibilityValidation: function (revisedRecord, originalRecord) {
        
        // Perform any additional validation - Add errors via revisedRecord.addErrors() 
        // and return false       
        return true;
    },
    
    /**
    * Executes a save operation, which will send the request to the server via the 
    * {@link Baff.app.model.EntityModel}'s proxy or via a form submit action if {@link #submitFormUrl}
    * is specified.
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @protected
    */    
    saveExec: function (record) {
        Utils.logger.info("FormController[" + this.identifier + "]::saveExec");
        var me = this;
        
        // Submit via the form if specified
        if (me.getSubmitFormUrl() != null) {
            
            var params = {};
            params.data = Ext.encode(record.getData());
            
            me.formPanel.submit({
            
                url: me.getSubmitFormUrl(),
                success: me.saveFormSuccess,
                failure: me.saveFormFail,
                scope: me,
                clientValidation: false,
                params: params
                
 
            });   
            
        } else {
            me.callParent(arguments);
        }
    },
    
    /**
    * Following a successful form submission
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @param {Ext.data.operation.Operation} operation The proxy operation
    * @protected
    */    
    saveFormSuccess: function (form, action) {
        Utils.logger.info("FormController[" + this.identifier + "]::saveFormSuccess");
        var me = this; 

        var record = Ext.create(me.getModelSelector());
        
        if (action.result.data != null)
            record.set(action.result.data);
      
        me.saveSuccess(record, action.result);
        
    },
    
    /**
    * Following a successful form submission
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @param {Ext.data.operation.Operation} operation The proxy operation
    * @protected
    */    
    saveFormFail: function (form, action) {
        Utils.logger.info("FormController[" + this.identifier + "]::saveFormFail");
        var me = this; 
        
        var record = Ext.create(me.getModelSelector());
        var response = null;
        
        if (action.result.data != null)
            record.set(action.result.data);
            
        me.saveFail(record, action.result);
        
    },
        
       
    /**
    * Handles validation errors returned from a service request.
    * @param response The raw data returned by the service
    * @param {Baff.app.model.EntityModel} record The entity record that was processed
    * @param {String} operationType The type of operation being performed defined by {@link #OPERATION}
    * @protected
    */    
    processValidationError: function(response, record, operationType) {    
        Utils.logger.info("FormController[" + this.identifier + "]::processValidationError");
        var me = this;
        
        // Assumes message takes priority as typically this cannot be resolved
        // by field level amendments defined by errors
        if (response.message !== null ) {
            me.showAlertMessage(me.dtValidationErrorTitle, response.message);
        } else {
            me.formPanel.markInvalid(response.errors);
        }
    },
    
    /**
    * Determines if the user should be prompted before deactivate based on whether they have
    * made changes and {@link #promptOnDeactivate}.  Note that this process is managed by the
    * {@link Baff.app.controller.DomainController).
    * @return {boolean}
    */    
    isDeactivationPromptRequired: function() {
        Utils.logger.info("FormController[" + this.identifier + "]::isDeactivationPromptRequired");
        var me = this;
        
        return (me.getPromptOnDeactivate() && me.formPanel.isDirty());
    },
    
    /**
    * Calls the provided function with arguments if the form is clean, the scope will 
    * @param fn The function to be called back
    * @param {Array} An array of arguments to be passed back to the function
    * @param {Object} The scope in which the function should be executed, defaults to the controller
    * @protected
    */    
    doIfClean: function(fn, args, scope) {
        var me = this;
        
        if (scope == null)
            scope = me;
        
        if (me.formPanel.isDirty()) {
                Ext.Msg.confirm(me.dtConfirmTitle, me.dtConfirmRevert, function(btn) {
                    if (btn === 'yes') {
                        Ext.callback(fn, scope, args);
                    }
                });
        } else {
            Ext.callback(fn, scope, args);
        }
   }
}); 

/**
 *  A ListFormController extends {@link Baff.app.controller.FormController} to support an activity that 
 *  involves managing a data entity presented in a list and/or a form presented in a 
 *  {@link Baff.app.view.ListFormView}, which supports a list user interface component in addition
 *  to the form and buttons supported by the superclass, with toggling between the list and the form.
 *  
 *  It requires only the same minimal setup as {@link Baff.app.controller.FormController}, so refer to the
 *  related documentation.  However note that by default {@link #manageSingleRecord} is set to false
 *  as we are processing a list.  Also, if {@link #selectFirstRecord} is set to true then the first record
 *  in the list will be selected automatically.
 */
Ext.define('Baff.app.controller.ListFormController', {
    extend: 'Baff.app.controller.FormController',
    requires: ['Baff.utility.Utilities'],              
    alias: 'controller.listform',
    
    /**
    * The {@link Baff.app.view.ListPanel} that contains the list
    * @readonly
    */
    listPanel: null,
    
    /**
    * The select button
    * @readonly
    */   
    toggleButton: null,
    
    // Display text
    dtTogList: 'List',
    dtTogForm: 'View',
  
    config: {
        
        /**
        * Specifies if this activity only acts on a single entity record, i.e. in a 1-1 relationship with a master entity
        */
        manageSingleRecord: false,
        
        /**
        * Specifies a selector for the list panel. If not set (by default)  it is determined automatically
        * from the associated {@link Baff.app.view.ListFormView}
        */   
        listPanelSelector: '',
          
        /**
        * Specifies a selector for the select button.  If not set (by default)  it is determined automatically
        * from the associated {@link Baff.app.view.ListFormView}
        */   
        toggleButtonSelector: '',
        
        /**
        * Specifies a selector for the filter button.  If not set (by default)  it is determined automatically
        * from the associated {@link Baff.app.view.ListFormView}
        */   
        filterButtonSelector: ''
        
     },
       
    
    /**
    * Sets up the associated view components and associated event handlers.  Will use the {@link #formPanelSelector}
    * specified in configuration, but by default will determine the list panel automatically from the {@link Baff.app.view.FormView}.       
    * Called on initialisation.    
    * Calls the overriden superclass method.   
    * @protected 
    */             
    onLaunch: function() {
        Utils.logger.info("ListFormController[" + this.identifier + "]::onLaunch");
        var me = this,
                selector;
        
        //Listbox
        selector = me.getListPanelSelector();
        
        if (selector === '')
            selector = me.activityView.getListPanel();
        
        if (selector !== '') {
            me.listPanel = me.lookupReference(selector);
            
            me.listPanel.on('selectionchange', me.onSelectList, me);   
            me.listPanel.on('refreshList', me.onRefreshList, me);        
        }
        
        // Select Button
        selector = me.getToggleButtonSelector();
        
        if (selector === '')
            selector = me.activityView.getToggleButton();
        
        if (selector !== '') {
            me.toggleButton = me.lookupReference(selector);
            me.toggleButton.on('tap', me.onToggleButton, me);
        }
        
        // Filter Button
        selector = me.getFilterButtonSelector();
        
        if (selector === '')
            selector = me.activityView.getFilterButton();
        
        if (selector !== '') {
            me.filterButton = me.lookupReference(selector);
            
            if (me.filterButton != null) {
                if (me.listPanel.getFilterPanel() != '') {
                    me.filterButton.on('tap', me.onFilterButton, me);  
                } else {
                    me.filterButton.destroy();
                    me.filterButton = null;
                }
            }
        }
         
        me.callParent(arguments);
        
        // Hide form related items to begin with
        me.showWidget(me.formPanel, false); 
        me.showWidget(me.revertButton, false); 
        me.showWidget(me.saveButton, false);     
        me.toggleListFormPanels(me.listPanel.isHidden());
        
    },
    
    /**
    * Called when the toggle button is clicked. 
    * @protected    
    */    
    onToggleButton: function() {
        Utils.logger.info("ListFormController[" + this.identifier + "]::onToggleButton");
        var me = this;

        me.toggleListFormPanels(me.formPanel.isHidden());
            
    },
    
    /**
    * Sets up the view when toggling between the listbox and the form.
    * Override to show display further items as required.
    * @param {boolean} showList Indicates if the list is being displayed (otherwise it is the form)
    * @protected    
    */   
   toggleListFormPanels: function(showForm) {
        Utils.logger.info("ListFormController[" + this.identifier + "]::toggleListFormPanels");
        var me = this;    
        
        if (showForm) {
            me.showWidget(me.listPanel, false); 
            me.showWidget(me.filterButton, false);            
            me.showWidget(me.formPanel, true); 
            
            if (me.getUpdateEnabled() || me.getCreateEnabled()) {
                me.showWidget(me.revertButton, true);
                me.showWidget(me.saveButton, true); 
            }
            
            if (me.toggleButton != null) {
                me.toggleButton.setIconCls('toglist');
                me.toggleButton.setText(me.dtTogList);
            }
            
        } else {           
            me.showWidget(me.formPanel, false); 
            me.showWidget(me.listPanel, true);
            me.showWidget(me.revertButton, false);
            me.showWidget(me.saveButton, false); 
            me.showWidget(me.filterButton, true);
            
            if (me.toggleButton != null) {
                me.toggleButton.setIconCls('togform');
                me.toggleButton.setText(me.dtTogForm);
            }
        }
       
   },
      
    /**
    * Shows the {@link #listPanel filterPanel}. 
    */    
    onFilterButton: function() {
        Utils.logger.info("ListFormController[" + this.identifier + "]::onFilterButton");
        var me = this;
        
        me.listPanel.onShowSearch();
        
    },
    
    /**
    * Proceeds as if the refresh button was selected.     
    * Called when the refresh button on the list is clicked.    
    */    
    onRefreshList: function() {
        this.onRefreshButton();
    },
    
    /**
    * Prompts the user if the seleted record is different from the current record and changes have been
    * made before proceeding to view/modify the selected record, as long as 
    * {@link #viewExistingRecord} is true.         
    * Called when an item in the list is selected.
    * @param {Ext.Selection.RowModel} selModel The selection model
    * @param {Baff.app.model.EntityModel} record The selected record
    */    
    onSelectList: function(list, record) {  
        Utils.logger.info("ListFormController[" + this.identifier + "]::onSelectList");
        var me = this;
        
        if (!me.getViewExistingRecord())
            return;
        
        // Check id's because a saved current record will not be the same instance as the one in the store
        if (me.currentRecord != null && record[0].getEntityId() == me.currentRecord.getEntityId())
            return;
        
        // Check if store is loaded - otherwise post flush
        if (!me.entityStore.hasLoaded)
            return;
        
        if (me.formPanel.isDirty()) {
            Ext.Msg.confirm(me.dtConfirmTitle, me.dtConfirmRevert, function(btn) {
                if (btn === 'yes') {
                    me.modifyRecord(record[0]);
                } else {
                    me.selectCurrentRecord();
                }
            });
        }
        else {
            me.modifyRecord(record[0]);
        }
    },
    
     /**
    * Sets up the list's store once the store has been setup by the superclass.
    * Calls the overriden superclass method. 
    * @protected
    */    
    setupStore: function() {       
        Utils.logger.info("ListFormController[" + this.identifier + "]::setupStore");
        var me = this;
        
        me.callParent(arguments);
        
        if (me.listPanel != null && me.entityStore != null) { 
                me.listPanel.setEntityStore(me.entityStore); 
                me.listPanel.updateSearchCount();
        }
    },
    
    /**
    * Updates the list search count after processing by the superclass.
    * Called after the store is first loaded.  
    * Calls the overridden superclass method.  
    * @protected
    */    
    onStoreFirstLoaded: function(){
        Utils.logger.info("ListFormController[" + this.identifier + "]::onStoreFirstLoaded");
        var me = this;
        
        me.callParent(arguments);
        me.selectCurrentRecord();
        me.listPanel.updateSearchCount();
        

    },
    
    /**
    * Updates the list search count and attempts to select the current record since it may have
    * been fetched as part of buffer processing (following an update it may not have been retrieved
    * in the initial load).
    * Called after the store retrieves more data.
    * @protected
    */    
    onStoreFetchMore: function () {
        Utils.logger.info("ListFormController[" + this.identifier + "]::onStoreFetchMore");
        var me = this;        
        
        if (me.listPanel != null) {
                me.listPanel.updateSearchCount(); 
                me.selectCurrentRecord();
        }
                
    },
    
    /**
    * Selects {@link #currentRecord} in the list if not already selected.
    * @protected
    */         
    selectCurrentRecord: function() {
        Utils.logger.info("ListFormController[" + this.identifier + "]::selectCurrentRecord");
        var me = this;
        
        me.selectRecord(me.currentRecord);
    },
    
    /**
    * Selects an entity record in the list.
    * @param {Ext.foundation.EntityModel} record The entity record to be selected
    * @protected
    */    
    selectRecord: function (record) {
        Utils.logger.info("ListFormController[" + this.identifier + "]::selectRecord");
        var me = this;
        
        // Selects the record in the grid
        if (me.listPanel != null) {
            
            if (me.entityStore != null && record != null) {

                // See if we can find the record in the store (and therefore the list)
                var storeRecord = me.entityStore.findRecord('entityId', record.getEntityId());

                if (storeRecord != null) {
                    me.listPanel.select(storeRecord, false, true);  
                    me.checkVersionOnView(storeRecord);
                } else {
                    // This may be the case if the currently selected record is not yet visible post an update
                    // due to store buffering, but make sure we haven't got anything else selected
                    var records = me.listPanel.getSelection(); 

                    if (records.length != 1 || records[0].getEntityId() != me.currentRecord.getEntityId())
                        me.listPanel.deselectAll(true);  
                }
            } else {
                me.listPanel.deselectAll(true); 
            }    
        }
    },

    /**
    * Sets the list selection prior to superclass processing.
    * Calls the overridden superclass method. 
    * @protected
    */    
    addRecord: function() {
        Utils.logger.info("ListFormController[" + this.identifier + "]::addRecord");
        var me = this;
        
        me.selectRecord(null);
        me.callParent(arguments);
 
    },
    
    /**
    * Sets the list selection prior to superclass processing.
    * Calls the overridden superclass method. 
    * @param {Ext.foundation.EntityModel} record The entity record to be selected
    * @protected
    */    
    modifyRecord: function(record) {
        Utils.logger.info("ListFormController[" + this.identifier + "]::modifyRecord");
        var me = this;
        
        me.selectRecord(record);
        me.callParent(arguments);
                  
    }
    
}); 

/**
 *  A SelectorController extends {@link Baff.app.controller.ActivityController} to support an activity that 
 *  involves selecting a data entity presented in a {@link Baff.app.view.SelectorView}, which 
 *  supports a list user interface component as well as buttons tto manage activity operations and state:
 *  
 *  - Refresh: to refresh the current data set as well as associated client data cache
 *  - Add: to select no entity
 *  - Select: to select the entity selected in the list
 *  
 *  A minimal setup only requires the {@link #entityModelSelector} and {@link #entityStoreSelector}
 *  to be specified, along with a reference to the {@link Baff.app.view.FormView}, as follows:
 *  
 *      Ext.define('MyApp.controller.MySelectorController', {
 *          extend: 'Baff.app.controller.SelectorController',
 *          alias: 'controller.myselectorcontroller',
 *   
 *          requires: ['MyApp.store.MyEntityStore',
 *                          'MyApp.model.MyEntityModel'],
 *   
 *          config: {
 *          
 *              refs: {       
 *                  viewSelector: 'myselectorview',        
 *              },
 *              
 *              storeSelector: 'MyApp.store.MyEntityStore',
 *              modelSelector: 'MyApp.model.MyEntityModel'
 *          }
 *
 *      }); 
 *  
 *  If {@link #selectFirstRecord} is set to true then the first record in the list will be selected automatically.
 */
Ext.define('Baff.app.controller.SelectorController', {
    extend: 'Baff.app.controller.ActivityController',
    requires: ['Baff.utility.Utilities'],                
    alias: 'controller.selector',
    
    /**
    * The {@link Baff.app.view.ListPanel} that contains the list
    * @readonly
    */
    listPanel: null,
    
    /**
    * The add button
    * @readonly
    */   
    addButton: null,
    
    /**
    * The select button
    * @readonly
    */   
    selectButton: null,
  
    config: {
        
        /**
        * Specifies if the first entity should be selected in the list.  
        */
        selectFirstRecord: true,
        
        /**
        * Specifies a selector for the list panel. If not set (by default)  it is determined automatically
        * from the associated {@link Baff.app.view.SelectorView}
        */   
        listPanelSelector: '',  
        
        /**
        * Specifies a selector for the add button.  If not set (by default)  it is determined automatically
        * from the associated {@link Baff.app.view.SelectorView}
        */   
        addButtonSelector: '',
        
        /**
        * Specifies a selector for the select button.  If not set (by default)  it is determined automatically
        * from the associated {@link Baff.app.view.SelectorView}
        */   
        selectButtonSelector: '',
        
        /**
        * Specifies a selector for the refresh button.  If not set (by default)  it is determined automatically
        * from the associated {@link Baff.app.view.SelectorView}
        */   
        refreshButtonSelector: '',
        
        /**
        * Specifies a selector for the filter button.  If not set (by default)  it is determined automatically
        * from the associated {@link Baff.app.view.SelectorView}
        */   
        filterButtonSelector: ''
        
    },
       
    
    /**
    * Sets up the associated view components and associated event handlers.  Will use any selectors specified 
    * in configuration such as {@link #listPanelSelector}, {@link #addButtonSelector}, etc., but by
    * default will determine the components automatically from the {@link Baff.app.view.SelectorView}.    
    * Sets the various component properties such as {@link #listPanel}, {@link #addButton}, etc.    
    * Called on initialisation.    
    * Calls the overriden superclass method.   
    * @protected 
    */          
    onLaunch: function() {
        Utils.logger.info("SelectorController[" + this.identifier + "]::onLaunch");
        var me = this,
                selector;
        
        me.showWaitMask(true);
        
        //Listbox
        selector = me.getListPanelSelector();
        
         if (selector === '')
            selector = me.activityView.getListPanel();
        
        if (selector !== '') {
            me.listPanel = me.lookupReference(selector);
            
            me.listPanel.on('selectionchange', me.onSelectList, me);   
            me.listPanel.on('refreshList', me.onRefreshList, me);
        }
              
        // Add Button
        selector = me.getAddButtonSelector();
        
        if (selector === '')
            selector = me.activityView.getAddButton();
        
        if (selector !== '') {
            me.addButton = me.lookupReference(selector);
            me.addButton.on('tap', me.onAddButton, me);  
        }
        
        // Select Button
        selector = me.getSelectButtonSelector();
        
        if (selector === '')
            selector = me.activityView.getSelectButton();
        
        if (selector !== '') {
            me.selectButton = me.lookupReference(selector);
            me.selectButton.on('tap', me.onSelectButton, me);  
        }
        
        // Refresh Button
        selector = me.getRefreshButtonSelector();
        
        if (selector === '')
            selector = me.activityView.getRefreshButton();
        
        if (selector !== '') {
            me.refreshButton = me.lookupReference(selector);
            me.refreshButton.on('tap', me.onRefreshButton, me); 
        }
        
        // Filter Button
        selector = me.getFilterButtonSelector();
        
        if (selector === '')
            selector = me.activityView.getFilterButton();
        
        if (selector !== '') {
            me.filterButton = me.lookupReference(selector);
            
            if (me.listPanel.getFilterPanel() != '')
                me.filterButton.on('tap', me.onFilterButton, me);  
            else
                me.filterButton.destroy();
        }
        
        me.callParent(arguments);  
        
    },
    
    /**
    * Sets view permanently to read-only (not for temporarily disabling widgets).
    * Use {@link #setFieldsReadOnly} to disable record editing.  
    * Called during initialisation.
    * @protected
    */    
    makeReadOnly: function() {
        Utils.logger.info("SelectorController[" + this.identifier + "]:makeReadOnly");
        var me = this;

        me.showWidget(me.addButton, false);
        
    },
    
    /**
    * Sets the current entity record to null and closes the view if a popup.   
    * Called whe add button is clicked.    
    */    
    onAddButton: function() {
        Utils.logger.info("SelectorController[" + this.identifier + "]::onAddButton");
        var me = this;
        
        me.setCurrentRecord(null);    
        me.listPanel.deselectAll(true);  
    },
    
    /**
    * Closes the view if a popup
    * Called when select button is clicked.    
    */    
    onSelectButton: function() {
        Utils.logger.info("SelectorController[" + this.identifier + "]::onSelectButton");
        var me = this;

        if (me.activityView.getPopup())  
            me.closePopup(); 
    },
    
    /**
    * Proceeds as if the refresh button had been clicked
    * Called whe list refresh button is clicked.    
    */    
    onRefreshList: function() {
        this.onRefreshButton();
    },
    
    /**
    * Shows the {@link #listPanel filterPanel}. 
    */    
    onFilterButton: function() {
        Utils.logger.info("SelectorController[" + this.identifier + "]::onFilterButton");
        var me = this;
        
        me.listPanel.onShowSearch();
        
    },
    
    /**
    * Sets the current record to the one selected in the list.
    * Called when an item in the list is selected.
    * @param {Ext.Selection.RowModel} selModel The selection model
    * @param {Baff.app.model.EntityModel} record The selected record
    */    
    onSelectList: function(list, record) {    
        Utils.logger.info("SelectorController[" + this.identifier + "]::onSelectList");
        var me = this;
        var rec = record;
        
        me.setCurrentRecord(record[0]);  
               
    },
    
    /**
    * Sets up the list's store once the store has been setup by the superclass.
    * Calls the overriden superclass method. 
    * @protected
    */    
    setupStore: function() {       
        Utils.logger.info("SelectorController[" + this.identifier + "]::setupStore");
        var me = this;
        
        me.callParent(arguments);
        
        if (me.listPanel != null && me.entityStore != null) { 
            
                me.listPanel.setEntityStore(me.entityStore); 
                me.listPanel.updateSearchCount();
        }
    },
    
    /**
    * Sets the selected record following the store load and updates the search count.
    * Called after the store is first loaded.  
    * @protected
    */    
    onStoreFirstLoaded: function(store){
        Utils.logger.info("SelectorController[" + this.identifier + "]::onStoreFirstLoaded");
        var me = this;
        
        
        if (me.checkDataIntegrity() == true) {
        
            if (me.getSelectFirstRecord()) {
                me.selectFirstRecord(); 
            } else {
                me.setCurrentRecord(null);
                me.selectCurrentRecord();
            }

            var allowModify = (me.allowUpdate && !me.isReadOnly);
            me.prepareView(true, allowModify, null, null);

            if (me.listPanel != null) 
                me.listPanel.updateSearchCount();      
        
        }
        
        me.showWaitMask(false);
    },
    
    /**
    * Updates the list search count.
    * Called after the store retrieves more data.
    * @protected
    */    
    onStoreFetchMore: function () {
        Utils.logger.info("SelectorController[" + this.identifier + "]::onStoreFetchMore");
        var me = this;        
       
        if (me.listPanel != null) {
            me.listPanel.updateSearchCount();   
            me.selectCurrentRecord();
        }
    },
       
    /**
    * Selects the first record in the list if it exists.
    * @protected
    */         
    selectFirstRecord: function() {      
        Utils.logger.info("SelectorController[" + this.identifier + "]::selectFirstRecord");
        var me = this,
                record = null;
       
        if (me.entityStore != null && me.entityStore.getTotalCount() != 0)
           record = me.entityStore.getAt(0);

       me.setCurrentRecord(record);
       me.selectRecord(record);

    },
    
    /**
    * Selects {@link #currentRecord} in the list if not already selected.
    * @protected
    */         
    selectCurrentRecord: function() {
        Utils.logger.info("SelectorController[" + this.identifier + "]::selectCurrentRecord");
        var me = this;
        
        me.selectRecord(me.currentRecord);
    },
    
    /**
    * Selects an entity record in the list.
    * @param {Ext.foundation.EntityModel} record The entity record to be selected
    * @protected
    */    
    selectRecord: function (record) {
        Utils.logger.info("SelectorController[" + this.identifier + "]::selectRecord");
        var me = this;
        
        // Selects the record in the grid
        if (me.listPanel != null) {
            
            if (me.entityStore != null && record != null) {

                // See if we can find the record in the store (and therefore the list)
                var storeRecord = me.entityStore.findRecord('entityId', record.getEntityId());

                if (storeRecord != null) {
                    me.listPanel.select(storeRecord, false, true);  
                    me.enableWidget(me.selectButton, true);
                    me.checkVersionOnView(storeRecord);
                } else {
                    // This may be the case if the currently selected record is not yet visible post an update
                    // due to store buffering, but make sure we haven't got anything else selected
                    var records = me.listPanel.getSelection(); 

                    if (records.length != 1 || records[0].getEntityId() != me.currentRecord.getEntityId())
                        me.listPanel.deselectAll(true);  
                    
                    me.enableWidget(me.selectButton, false);
                }
            } else {
                me.listPanel.deselectAll(true); 
               me.enableWidget(me.selectButton, false); 
            }    
        }
    }
}); 

/**
 *  An ActivityView provides the view for a discrete activity controlled by a {@link Ext.foundation.ActivityController}.  
 *  
 *  All types of activity views such as those based on {@link Baff.app.view.FormView}, 
 *  {@link Baff.app.view.ListFormView} and {@link Baff.app.view.SelectorView} are based on this.
 *  
 *  This class extends {Ext.app.panel.Panel}, however subclasses should generally not require to configure
 *  the superclass properties.
 *  
 */
Ext.define('Baff.app.view.ActivityView', {
    extend: 'Ext.Panel',
    xtype: 'activityview',
    
    // Display text
    dtRefresh: 'Refresh',
    dtClose: 'Close',
        
       
        config: {
            
            /**
            * Specifiies the title to display in the top toolbar
            */
            topTitle: '', 

            /**
            * Specifiies the css class to use to style toolbar buttons
            */
            buttonCls: 'baff-button',    
            
            /*
             * Specifies the controller for this view, this will be set automatically by the framework
             * @private
             */
            controller: null, 
            
            
            /**
            * Specifies a reference to the refresh button for this view. If set to '' the add button will not be
            * created, however generally this is not necessary as the controller will manage button state.
            */
            refreshButton: 'refreshBtn',
            
            /**
            * Specifies a reference to the close button for this view (if a popup). If set to '' the close button will not be
            * created, however generally this is not necessary as the controller will manage button state.
            */
            closeButton: null,
            
            layout: {
                    type: 'vbox',
                    align: 'stretch'
                    },

            defaults: {
                    flex: 1
            },
            
            /*
             * Specifies if this view is a pup-up / sub-activity
             * @private
             */
            popup: false,
            
            /**
            * Specifies additional items created by the subclass that should be added to the view.
            */
            myItems: []
        
        },
        
    /**
    * Creates the view components, using the specified configuration such as {@link #refreshButton}. etc.
    * Calls the overridden superclass method.    
    */          
    initialize: function() {
        var me = this;
        
        if (me.getCloseButton() == null) {
            if (me.getPopup())
                me.setCloseButton('closeBtn');
            else
                me.setCloseButton('');
        }
        
        var dockedItems = me.setupDockedItems();
        var items = me.setupItems();
        
        if (me.getTopTitle() != '') {
            items.push({
                            xtype: 'toolbar',   
                            docked: 'top',
                            itemId: 'titlebar',
                            title: me.getTopTitle()
                        });
        }
         
        items.push({
	              	xtype: 'toolbar',         	
	                layout: { pack: 'center' },
	                docked: 'top',  
	                items: dockedItems	                             	
	             });
       
        me.add(items);
        
        me.callParent(arguments);      
        
    },
    
    /**
    * Sets up the docked items.
    * @return {Array} The list of items
    * @protected    
    */         
   setupDockedItems: function() {
       var me = this;
       
       var items = [];
       
       
        // Refresh Button
        if (typeof me.getRefreshButton() == "object") {            
            items.push(me.getRefreshButton());
            me.setRefreshButton(me.getRefreshButton().itemId);
            
        } else if (me.getRefreshButton() != '') {
            items.push({  
                        xtype: 'button',
                        itemId: me.getRefreshButton(),
                        iconCls: 'refresh',
                        iconAlign: 'top',
                        text: me.dtRefresh,
                        cls: me.getButtonCls()
                        });
        }
        
         if (typeof me.getCloseButton() == "object") {            
            items.push(me.getCloseButton());
            me.setCloseButton(me.getCloseButton().itemId);
            
        } else  if (me.getCloseButton() != '') {
            items.push({  
                        xtype: 'button',
                        itemId: me.getCloseButton(),
                        iconCls: 'close',
                        iconAlign: 'top',
                        text: me.dtClose,
                        cls: me.getButtonCls()
                        });
        }
        
        
        return items;
    },
    
     /**
    * Subclasses may override this and add the items in the required order.
    * @return {Array} The list of items
    * @protected    
    */         
    setupItems: function() {
        var me = this;
        
        var items = me.getMyItems();
        
        return items;
    },
    
    /**
     * Displays and activates a popup view.
     */
    display: function (dc) {
        var me = this;
        
        me.domainController = dc;

        me.enable();
        Ext.Viewport.animateActiveItem(me, { type: 'slide', direction: 'left' });       
        me.getController().onActivateView();
    }
               
 

});

/**
 *  A domainView tabulates a set of {@link Baff.app.view.ActivityView}s assocated with activities,
 *  and is controlled by a {@link Baff.app.controller.DomainController}, which manages navigation and
 *  communication between the activities.
 *  
 *  For a mobile application there may typically be a single domain view, for which a  typical implementation 
 *  is as follows.  Only the references to the various activity  views need to be specified.
 * 
 *     Ext.define('MyApp.view.MyMainEntitytView', {
 *          extend: 'Baff.app.view.DomainView',
 *          alias: 'widget.mymaindomainView',
 *            
 *          requires: ['MyApp.view.MyActivityFooView',
 *                          'MyApp.view.MyActivityBarView'],
 *          
 *          config: {    
 *                 
 *              items: [{
 *                      title: 'Foo',
 *                      xtype: 'myactivityfooview'
 *                  }, {     
 *                      title: 'Bar',
 *                      xtype: 'myactivitybarview',
 *                  }]
 *               }
 *     });
 *                     
 */
Ext.define('Baff.app.view.DomainView', {
    extend: 'Ext.tab.Panel',
    xtype: 'domainview',
    
    config: {
       
        /**
        * Specifiies the title to display in the top toolbar
        */
        topTitle: '',    
        
        /*
         * Specifies the tab bar position
         */
        tabBarPosition: 'bottom',
        
        /*
         * Specifies the controller for this view, this will be set automatically by the framework
         * @private
         */
        controller: null
        
    },
    
     /**
    * Creates the view components, using the specified configuration such as {@link #refreshButton}. etc.
    * Calls the overridden superclass method.    
    */          
    initialize: function() {
        var me = this;
       
       var items = [];
        
        if (me.getTopTitle() != '') {
            items.push({
                            xtype: 'toolbar',   
                            docked: 'top',
                            itemId: 'titlebar',
                            title: me.getTopTitle(),
                            items: me.setupDockedItems()
                        });
        }
       
        me.add(items);
        
        me.callParent(arguments);      
        
    },
    
    /**
    * Sets up the docked items.
    * @return {Array} The list of items
    * @protected    
    */         
   setupDockedItems: function() {
       var items = [];
       return items;
   },   
       
   
   
    /**
    * Queries underlying activities to determine if the user should be prompted before changing
    * the view. 
    * Called whe active tab is requested to be changed.
    * @param {Ext.tab.Bar} tabBar The tab bar
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} newTab The view being requested
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} oldTab The current view
    * @param {boolean} isPrompting Indicates if already prompting the user
    * 
    */   
    doTabChange: function(tabBar, newTab, oldTab, delegate, eOpts, isPrompting) {
        var me = this;
        Utils.logger.info("DomainView::doTabChange");

        // This is called twice, second time around by doSetActiveItem, which wraps the call with forcedChange = true
        if (!me.forcedChange && !isPrompting) {
        
            // Prompt the user if required
            var oldView = me.getActiveItem();
            var prompt = me.getController().getDeactivationPrompt(oldView);

            if (prompt != "") {  

                Ext.Msg.confirm('Confirm', prompt, 
                    function(btn) {

                        if (btn == 'yes') {
                            me.doTabChange(tabBar, newTab, oldTab, delegate, eOpts, true);
                        }

                    }
                );

                return false;
            }
        }

        return me.callParent(arguments);
    }
     
});

/**
 *  A FilterField provides a form text field to capture search criteria and filters a 
 *  {@link Baff.app.model.EntityStore}.  The field is typically defined on a parent 
 *  {@link Baff.app.view.FilterPanel} through it's 'xtype', which in turn is associated with a 
 *  parent {@link Baff.app.view.ListPanel}.
 */          
Ext.define('Baff.app.view.FilterField', {
    extend: 'Ext.field.Search',
    xtype: 'filterfield',
    
    /**
     * The {@link Baff.app.model.EntityStore} this field filters
     * @private
     */
    entityStore: null,
    
    /**
     * The currently active {Ext.util.Filter}
     * @private
     */
    activeFilter: null,  
   

    /**
     * Specifies the field name to be filtered
     * @cfg (required)
     */
    filterFieldName : 'filterFieldName not defined',
    
    // Display text for locale override
    dtLoading: "Please wait....",

    /**
    * Sets a handler so that the the search will be initiated if the the field is navigated away from via
    * one of the 'special' keys.
    * Calls the overridden superclass method.
    */      
    initialize: function() {
        var me = this;;

        me.callParent(arguments);
        me.on('action', me.onSearchClick, me);  
        me.on('clearicontap', me.onClearClick, me); 
    },
    
    /**
    * Sets {@link #entityStore}
    * @param {Baff.app.model.EntityStore} store
    */      
    setEntityStore: function(store) {
        var me = this;
  
        me.onClearClick();
        me.entityStore = store;
        
    },

    /**
    * Clears the {@link #activeFilter} if set.  Notifies any parent {@link Baff.app.view.ListPanel}.
    * Called when the clear widget is clicked.
    */  
    onClearClick : function(){
        var me = this,
            activeFilter = me.activeFilter;

        if (activeFilter) {
            me.setValue('');
            
            if (me.entityStore) {
                var listPanel = me.getParent().listPanel;
                if (listPanel != null) {
                    listPanel.incrementFilterCount(-1);
                }
            
                me.entityStore.removeFilter(me.activeFilter)
                
                me.showWaitMask(true);
                me.entityStore.load({
                    callback: function() {
                        me.showWaitMask(false);
                    }
                });                
            }
            
            me.activeFilter = null;
            
        }
    },

    /**
    * Sets the {@link #activeFilter}.  Notifies any parent {@link Baff.app.view.ListPanel}.
    * Called when the search widget is clicked.
    */  
    onSearchClick : function(){
        var me = this,
            value = me.getValue(),
            oldActiveFilter = me.activeFilter;
   
        if (value.length > 0) {
            me.activeFilter = new Ext.util.Filter({
                property: me.filterFieldName,
                value: "%" + value + "%"
            });
            
            if (me.entityStore) {
                if (oldActiveFilter != null) {
                    me.entityStore.removeFilter(oldActiveFilter);
                } else {
                    var listPanel = me.getParent().listPanel;
                    if (listPanel != null) {
                        listPanel.incrementFilterCount(1);
                    }
                }
                
                me.entityStore.addFilter(me.activeFilter)
                
                me.showWaitMask(true);
                me.entityStore.load({
                    callback: function() {
                        me.showWaitMask(false);
                    }
                });           
                
            }
            
        } else {
            me.onClearClick();
        }
        
        me.getParent().hide();
        
    },
    
    /**
    * Shows / hides the wait mask.
    * @param {boolean} [show="false"]
    * @protected
    */    
    showWaitMask: function (show) {
        var me = this;
        if (show) {
            me.getParent().setMasked({xtype: 'loadmask', message: me.dtLoading}); 
            me.getParent().setHideOnMaskTap(false);
        }else {
            me.getParent().setMasked(false);
            me.getParent().setHideOnMaskTap(true);
        }
    }
});


/**
 *  A RefDataComboBox is a form combo box bound to a reference data class.
 *  
 *  A typical configuration when defining fields for a {@link Baff.app.view.FormPanel} is:
 *          
 *      items: [{                  
 *           xtype: 'refdatacombobox',
 *           name: 'bar',
 *           label: 'Bar',
 *           refdataClass: 'REFDATA.BAR'
 *       }
 *       ...
 *                  
 */
Ext.define('Baff.utility.refdata.RefDataComboBox', {
    extend: 'Ext.field.Select', 
    requires: ['Baff.utility.refdata.RefDataManager'],   
    xtype: 'refdatacombobox',    
       
    initialKey: null,
    
    // Literals for the default values
    REF_DATA_NULL: 'REF.DATA.NULL',
    REF_DATA_NOCLASS: 'REF.DATA.NOCLASS',
  
    config: {
        
        /**
        * Specifes the reference data class to be used
        * @cfg refdataClass (required)
        */
        refdataClass:  'REF.DATA.NOCLASS',
        
        /**
        * Specifes the key for record to be displayed by default
        */    
        defaultKey: 'REF.DATA.NULL',
        
        /**
        * Specifies the value field for the underlying combo box
        * @private
        */
        valueField: 'code',

        /**
        * Specifies the display field for the underlying combo box
        * @private
        */
        displayField: 'decode'
        
        
    },
    
    /**
    * Setup the component by setting up the reference data class
    * Calls the overridden superclass method.
    * Called on initialisation.
    */
    initialize: function() {         
        var me = this;

        me.callParent(arguments);
        me.setRefDataClass(me.getRefdataClass(), me.getDefaultKey());  
    },
    
    /**
    * Gets the key for the currently selected record
    * @returns {String} key
    * @private
    */
    getKey: function() {      
        var me = this;
        
        var key = me.REF_DATA_NULL;
        
        if (me.getStore()) {
            var code = me.getSubmitValue();
            var record = me.getStore().findRecord('code', code);
        
            if (record) {
                key = record.get('key');
            }
        }
        
        return key;

    },
    
    /**
    * Gets the code for the currently selected record
    * @returns {String} code
    */
    getCode: function() {        
        var me = this;
        
        var code = null;
        
        if (me.getStore() != null)
            code = me.getSubmitValue();
        
        return code;

    },
    
    getSubmitValue: function() {  
        var me = this;
        return this.getValue();
    },
    
    /**
    * Loads the records for the given reference data class and selects the record for the given key.
    * @param {String} refdataclass The reference data class to be loaded.
    * @param {String} key The key for the record to be selected by default.
    * @returns {String} code
    */    
    setRefDataClass: function(refdataclass, key) {
       var me = this;
       
        me.initialKey = key;  
        me.refdataClass = refdataclass;
        
        me.setStore(Utils.refDataManager.getRefDataStore(me.refdataClass));
        
        if (me.getStore().isLoaded()) {
            me.setValueOnData();
        }
        

    },
    
    /**
    * Sets the default value when data is available in the store
    * @private
    */    
    setValueOnData: function () {
        var me = this;   
        
        var key = me.initialKey;
        
        if (me.refdataClass === me.REF_DATA_NOCLASS) {
           key = me.REF_DATA_NULL;
        } else if (!key) {
           key = me.getKey();
        }
        
        var dirty = me.isDirty();

        me.setValue(key);
        
        if (!dirty) {
            me.resetOriginalValue();
            me.reset();
        }

    },
    
    /**
    * Sets the value of a record for a given reference data key or code
    * @param {String} value The reference data key or code
    */
    setValue: function(value, doSelect) {
        var me = this;
        
        if (Ext.isString(value)) {
            
            if (value == me.REF_DATA_NULL) {
                value = null;
                
            } else if (value.split('.').length == 3) {
                
                    var record = me.getStore().findRecord('key', value);
                    if (record)
                        value = record.get('code');
                    else
                        value = null;

            }
            
        }
        
        me.callParent(arguments);     
      
    },
    
    /**
    * Overrides the superclass to correctly reset the value to the original value.
    */
    reset: function() {
        var me = this;
        me.setValue(me.originalValue);
    },
    
    /**
    * Overrides the superclass to correctly set the value
    */
    applyValue: function(value) {
        var me = this,
                findval = value;
        
        me.getOptions();
        
        if (findval == null)
            findval = 0;
        else if (findval.isModel)
            return findval;
                
        var record = me.getStore().findRecord('code', findval); 
        
        return record;
    }
 

});

/**
 *  A RefDataFilterField is a form combo box bound to a reference data class that is used to filter
 *  a store. It provides similar functionality to a {@link Baff.app.view.FilterField}.
 *  
 *  A typical configuration when defining fields for a {@link Baff.app.view.FilterPanel} is:
 *          
 *        items: [{
 *              label: 'Filter Bar',
 *              xtype: 'refdatafilter',
 *              refdataClass: 'REFDATACLASS.BAR',
 *              filterFieldName: 'bar'
 *            },
 *            ...
 *                  
 */
Ext.define('Baff.utility.refdata.RefDataFilterField', {
    extend: 'Baff.utility.refdata.RefDataComboBox',
    xtype: 'refdatafilter',
    
    /**
    * The entity store to be filtered
    * @private
    */
    entityStore: null,
    
    /**
     * The currently active {Ext.util.Filter}
     * @private
     */
    activeFilter: null,
    
    /**
     * Specifies the field name to be filtered
     * @cfg (required)
     */
    filterFieldName : 'filterFieldName not defined',
    
    // Display text for locale override
    dtLoading: "Please wait....",
    
    config: {
        
        // Makes the field look like a search field instead of a combo box 
        ui: 'search',
        
        // Adds an icon to clear the field
        clearIcon: true
        
    },
            

    /**
    * Sets a handler so that the the search will be initiated if a field is selected
    * Calls the overridden superclass method.
    */     
    initialize: function() {
        var me = this;
        
        //me.element.addCls(Ext.baseCSSPrefix + 'field-clearable');
        me.callParent(arguments);
        me.on('select', me.onSearchClick, me);   
        me.on('clearicontap', me.onClearClick, me);  

    },
    
    /**
    * Sets {@link #entityStore}
    * @param {Baff.app.model.EntityStore} store
    */     
    setEntityStore: function(store) {
        var me = this;
        
        me.onClearClick();
        me.entityStore = store;
        
    },

    /**
    * Clears the {@link #activeFilter} if set.  Notifies any parent {@link Baff.app.view.ListPanel}.
    * Called when the clear widget is clicked.
    */  
    onClearClick : function(){
        var me = this,
            activeFilter = me.activeFilter;
    
        me.setValue(null);
        
        var usePicker = me.getUsePicker();
        var picker = usePicker ? me.picker : me.listPanel;
        
        if (picker) {
            picker = picker.child(usePicker ? 'pickerslot' : 'dataview');
            picker.deselectAll();
        }

        if (activeFilter) {
            
            if (me.entityStore) {
               var listPanel = me.getParent().listPanel;
                if (listPanel != null) {
                    listPanel.incrementFilterCount(-1);
                }
            
                me.entityStore.removeFilter(me.activeFilter)
                
                me.showWaitMask(true);
                me.entityStore.load({
                    callback: function() {
                        me.showWaitMask(false);
                    }
                });                
            }
            
            me.activeFilter = null;
            
        }
    },

    /**
    * Sets the {@link #activeFilter}.  Notifies any parent {@link Baff.app.view.ListPanel}.
    * Called when the search widget is clicked.
    */  
    setValue : function(value){
        var me = this,
            oldValue = me.getValue(),
            oldActiveFilter = me.activeFilter;
    
        me.callParent(arguments);
        value = me.getValue();
        
        if (value != null && value != oldValue) {
            me.activeFilter = new Ext.util.Filter({
                property: me.filterFieldName,
                value: value
            });
            
            if (me.entityStore) {
                if (oldActiveFilter != null) {
                    me.entityStore.removeFilter(oldActiveFilter);
                } else {
                    var listPanel = me.getParent().listPanel;
                    if (listPanel != null) {
                        listPanel.incrementFilterCount(1);
                    }
                }

                me.entityStore.addFilter(me.activeFilter)
                
                me.showWaitMask(true);
                me.entityStore.load({
                    callback: function() {
                        me.showWaitMask(false);
                    }
                });           
            }
            
        }
    },
    
    /**
    * Shows / hides the wait mask.
    * @param {boolean} [show="false"]
    * @protected
    */    
    showWaitMask: function (show) {
        var me = this;
        if (show) {
            me.getParent().setMasked({xtype: 'loadmask', message: me.dtLoading}); 
            me.getParent().setHideOnMaskTap(false);
        }else {
            me.getParent().setMasked(false);
            me.getParent().setHideOnMaskTap(true);
        }
    }
});

/**
 *  A FilterPanel provides a panel for presenting {@link Baff.app.view.FilterField}s and
 *  {@link Baff.utility.refdata.RefDataFilterField}s to support a {@link Baff.app.view.ListPanel} where it
 *  is specfied via the {@link Baff.app.view.ListPanel #filterPanel} configuration property.
 *  
 *   An example implementation is as follows:
 *   
 *    Ext.define('Myapp.view.MyFilterPanel', {
 *        extend: 'Baff.app.view.FilterPanel',
 *        
 *        alias: 'widget.myfilterpanel',
 *        
 *        config: {
 *        
 *           width: 500,
 *           height: 500,
 *        
 *            items: [{
 *                  label: 'Search Foo',
 *                  xtype: 'filterfield',
 *                  filterFieldName: 'foo'
 *                },{
 *                  label: 'Filter Bar',
 *                  xtype: 'refdatafilter',
 *                  refdataClass: 'REFDATACLASS.BAR',
 *                  filterFieldName: 'bar'
 *                }
 *            ]
 *        }   
 *    }); 
 *
 */        
Ext.define('Baff.app.view.FilterPanel', {
    extend: 'Ext.form.Panel',
    xtype: 'filterpanel',
    
    requires:['Baff.app.view.FilterField',
                'Baff.utility.refdata.RefDataFilterField'],
            
    listPanel: null, 
    
    config: {
        
        modal: true,
        hideOnMaskTap: true,  // Do not change
        centered: true,
        scrollable: 'vertical',
        width: 300,
        height: 150,
        
        layout: 'vbox',
        
        showAnimation: {
            type: 'popIn',
            duration: 250,
            easing: 'ease-out'
        },
        hideAnimation: {
            type: 'popOut',
            duration: 250,
            easing: 'ease-out'
        }
            
    }
});

/**
 *  A FormView extends {@link Baff.app.view.ActivityView} to provide the view for a discrete activity 
 *  controlled by a {@link Ext.foundation.FormController}. It provides the various user interface components
 *  for the activity include the form and various buttons.
 *  
 *  A minimal setup only requires the {@link #formPanel} to be specified, along with an alias so that the
 *   view can be referenced by an {@link Baff.app.view.DomainView}. A {@link #topTitle} may also be specified.
 * 
 *      Ext.define('MyApp.view.MyFormView', {
 *          extend: 'Baff.app.view.FormView',
 *          
 *          alias: 'widget.myformview',
 *          
 *          requires: ['MyApp.view.MyFormPanel'],
 *   
 *          config : {
 *                    
 *                    topTitle: 'My Titile',
 *                    formPanel: 'myformpanel'     // alias of MyApp.view.MyFormPanel        
 *           }
 *  
 *  The refresh, add, remove, revert and save buttons will be created automatically, however if required
 *  a reference or even a button configuration object can be specified through configuration, as follows:
 *  
 *       config: {
 *          ....
 *          addButton: 'myreference',
 *          
 *          removeButton:  {
 *                      xtype: 'button',
 *                      itemId: 'removeBtn',
 *                      iconCls: 'myIcon',
 *                      text: 'myText'
 *              },
 *          ....
 *      }
 *     
 */
Ext.define('Baff.app.view.FormView', {
    extend: 'Baff.app.view.ActivityView',
    xtype: 'formview',
    
    requires: [
        'Ext.Toolbar',  
        'Baff.app.view.FormPanel'
    ], 
    
    // Display text
    dtAdd: 'Add',
    dtRemove: 'Delete',
    dtSave: 'Save',
    dtRevert: 'Undo',
    
    
    config: {
        
        /**
        * Specifies the type of {@link Baff.app.view.FormPanel} that provides the form for this view.
        * **IMPORTANT**: This view's subclass should specify a subclass of the above form panel.
        * @cfg formPanel (required)
        */
        formPanel: '',
        
        /**
        * Specifies a reference to the add button for this view. If set to '' the add button will not be
        * created, however generally this is not necessary as the controller will manage button state.
        */
        addButton: 'addBtn',
        
        /**
        * Specifies a reference to the remove button for this view. If set to '' the add button will not be
        * created, however generally this is not necessary as the controller will manage button state.
        */
        removeButton: 'removeBtn',
        
        /**
        * Specifies a reference to the save button for this view. If set to '' the add button will not be
        * created, however generally this is not necessary as the controller will manage button state.
        */
        saveButton: 'saveBtn',
        
        /**
        * Specifies a reference to the revert button for this view. If set to '' the add button will not be
        * created, however generally this is not necessary as the controller will manage button state.
        */
        revertButton: 'revertBtn'
        
    },
    
    /**
    * Sets up the docked items.
    * @return {Array} The list of items
    * @protected    
    */         
   setupDockedItems: function() {
       var me = this;
       
       var items = [];
       
        // Refresh Button
        if (typeof me.getRefreshButton() == "object") {            
            items.push(me.getRefreshButton());
            me.setRefreshButton(me.getRefreshButton().itemId);
            
        } else if (me.getRefreshButton() != '') {
            items.push({  
                        xtype: 'button',
                        itemId: me.getRefreshButton(),
                        iconCls: 'refresh',
                        iconAlign: 'top',
                        text: me.dtRefresh,
                        cls: me.getButtonCls()
                        });
        }
        
        // Add Button
        if (typeof me.getAddButton() == "object") {            
            items.push(me.getAddButton());
            me.setAddButton(me.getAddButton().itemId);
            
        } else if (me.getAddButton() != '') {            
            items.push({
                        xtype: 'button',
                        itemId:me.getAddButton(),
                        iconCls: 'add',
                        iconAlign: 'top',
                        text: me.dtAdd,
                        cls: me.getButtonCls()
                        });            
        }
        
        // Remove Button
        if (typeof me.getRemoveButton() == "object") {            
            items.push(me.getRemoveButton());
            me.setRemoveButton(me.getRemoveButton().itemId);
            
        } else if (me.getRemoveButton() != '') {
            items.push({
                        xtype: 'button',
                        itemId: me.getRemoveButton(),
                        iconCls: 'remove',
                        iconAlign: 'top',
                        text: me.dtRemove,
                        cls: me.getButtonCls()
                        });
        }
        
        // Revert Button
        if (typeof me.getRevertButton() == "object") {            
            items.push(me.getRevertButton());
            me.getRevertButton(me.getRevertButton().itemId);
            
        } else if (me.getRevertButton() != '') {
            items.push({
                        xtype: 'button',
                        itemId: me.getRevertButton(),
                        iconCls: 'undo',
                        iconAlign: 'top',
                        text: me.dtRevert,
                        cls: me.getButtonCls()
                        });
        }
        
        // Save Button
        if (typeof me.getSaveButton() == "object") {            
            items.push(me.getSaveButton());
            me.setSaveButton(me.getSaveButton().itemId);
            
        } else if (me.getSaveButton() != '') {
            items.push({  
                        xtype: 'button',
                        itemId: me.getSaveButton(),
                        iconCls: 'save',
                        iconAlign: 'top',
                        text: me.dtSave,
                        cls: me.getButtonCls()
                        });
        }
        
         if (typeof me.getCloseButton() == "object") {            
            items.push(me.getCloseButton());
            me.setCloseButton(me.getCloseButton().itemId);
            
        } else  if (me.getCloseButton() != '') {
            items.push({  
                        xtype: 'button',
                        itemId: me.getCloseButton(),
                        iconCls: 'close',
                        iconAlign: 'top',
                        text: me.dtClose,
                        cls: me.getButtonCls()
                        });
        }
        
        
        return items;
    },
               
    
    /**
    * Sets up the form panel specified by {@link #formPanel}.  This is a separate function so that
    * subclasses adding more items have flexibility to override this and add the items in the required
    * order.
    * @return {Array} The list of items
    * @protected    
    */         
    setupItems: function() {
        var me = this;
        
        var items = me.getMyItems();
        
        if (me.getFormPanel() != '') {
            items.push({
                    xtype: me.getFormPanel(),
                    itemId: me.getFormPanel(),
                    flex: 5          
            });
        }
        
        return items;
    }  

});

/**
 *  An sliderfield that displays the value of the slider in the label 
 * 
 */          
Ext.define('Baff.app.view.LabelSliderField', {
    extend: 'Ext.field.Slider',
    xtype: 'labelsliderfield',
    
    initialize: function() {
        var me = this;
        
        me.callParent(arguments);
        me.on('painted', me.setLabelOnChange, me);
        me.on('change', me.setLabelOnChange, me);
        me.on('drag', me.setLabelOnChange, me);
  
    },
    
    setLabelOnChange: function() {
        this.setLabel(this.config.label+ ': (' + this.getValue() + '%)'); 
    },
    
    reset: function() {
        var me = this;
        
        if (this.originalValue != null) {
            me.setValue(this.originalValue)  
        }
        
        me.setLabelOnChange();
        
    }
       
    
});


/**
 *  A ListPanel provides a panel for presenting a list of business entity data.  It is typically presented in 
 *  a {@link Baff.app.view.ListFormView} where it is specified via the 
 *  {@link Baff.app.view.FormView #formPanel} configuration property, or similarly for a
 *  {@link Baff.app.view.SelectorView}.
 *  
 *  An example implementation is as follows.  
 *  
 *      Ext.define('MyApp.view.MyListPanel', {
 *         extend: 'Baff.app.view.ListPanel',
 *         alias: 'widget.mylistpanel',
 *         requires: ['MyApp.view.MySearchPanel'],
 *         
 *         config: {
 *                 
 *             filterPanel: 'myfilterpanel',  // alias of MyApp.view.MySearchPanel (optional)
 *         
 *             itemTpl: new Ext.XTemplate (
 *                          '<div class="baff-list">',
 *                          '<div class="baff-list-main" style="width:30%">{[this.getValueFromFunction(values)]}</div>',   
 *                          '<div class="baff-list-main" style="width:70%">{foo}</div>',                         
 *                          '<div class="baff-list-detail" style="width: 100%">{bar}</div>',
 *                          '</div>',
 *                          {
 *                               getValueFromFunction: function(values) {
 *                                   ...
 *                                   return someValue;
 *                                  }
 *                          })
 *         };
 *
 */        
Ext.define('Baff.app.view.ListPanel', {
    extend: 'Ext.dataview.List', 
    xtype: 'listpanel',
    requires: ['Ext.plugin.ListPaging'],
    
    /**
     * A count of the filters applied as set by an associated {@link Baff.app.view.FilterField}.
     * Used to display the "filtered" text on count
     * @private
     */
    filterCount: 0,
    
    // Display text for override in locale file 
    dtRecordsFound: "Records found",
    dtFiltered: "(filtered)",
    
    filterPanel: null,
    
    config: {
        
        /**
        * Sets the loading text, set to '' as this is handled by the framework.
        * @private
        */
        loadingText: '',
        
        /**
        * Specifies a reference to a {@link Baff.app.view.FilterPanel} that provides filtering
        */
        filterPanel: '',
        
        /**
        * Specifies if the record count is to be displayed
        */
        listCount: true,
        
        /*
         * Specifies to shade every other row
         */
        striped: true,
        
        /*
         * Enables paging
         */
        plugins: [{ 
                type: 'listpaging',
                autoPaging: true,
                noMoreRecordsText: '',
                loadMoreText: 'More...'
         }]
    },
    
    /**
     * @event refreshList
     * Fires when the list has been refreshed.
     */

    /**
    * Sets up the user interface components
    * Calls the overridden superclass method.
    */     
    initialize: function() {
        var me = this;
        
        var items = [];
        
         // Setup the counter
        if (me.getListCount()) {
            
           items.push ({
                        docked: 'bottom',
                        height: 20,
                        xtype: 'toolbar',
                        itemId: 'listCount',
                        cls: 'baff-toolbar'
                });
        }
        
        me.add(items);
        
         if (me.getFilterPanel() != '') {   
            me.filterPanel = Ext.widget(me.getFilterPanel());
        }
        
        me.callParent(arguments);
        
        //me.getScrollable().getScroller().on('scrollend', me.onScrollEnd, me);
       
    },
    
    
    /**
    * Hides the associated {@link Baff.app.view.FilterPanel}.
    * Called when the hide widget is clicked.
    */   
    onHideSearch: function () {      
        var me = this;
             
    },
    
    /**
    * Shows the associated {@link Baff.app.view.FilterPanel}.
    * Called whe the show widget is clicked.
    */   
    onShowSearch: function () {       
        var me = this;
        
        if (me.filterPanel.listPanel == null) {
            me.filterPanel.listPanel = me;
            Ext.Viewport.add(me.filterPanel);
        }
        
        me.filterPanel.show();
          
    },
    
    /**
    * Removes any filters from the store (necessary if the store is shared).
    * Called before the pane is destroyed.
    */   
    beforeDestroy: function() {
        var me = this;
        
        if (me.filterPanel != null) {
            var filters = Ext.ComponentQuery.query('filterfield', me.filterPanel);
        
            for (i=0; i < filters.length; i++) {
               filters[i].onClearClick();
           }
    
            var refdataFilters = Ext.ComponentQuery.query('refdatafilter',  me.filterPanel);

            for (i=0; i < refdataFilters.length; i++) {
                refdataFilters[i].onClearClick();
            }
        }
        
        return true;
        
    },
    
    /**
    * Sets the store used by the list and applies any filters.
    * @param {Baff.app.model.EntityStore} store
    */   
    setEntityStore: function(store) {

        var me = this,
                i;
        
        if (me.filterPanel != null) {
            var filters = Ext.ComponentQuery.query('filterfield', me.filterPanel); 

             for (i=0; i < filters.length; i++) {
                filters[i].setEntityStore(store);
            }

            var refdataFilters = Ext.ComponentQuery.query('refdatafilter', me.filterPanel);

            for (i=0; i < refdataFilters.length; i++) {
                refdataFilters[i].setEntityStore(store);
            }
        }
 
        me.setStore(store);
    },
    
    /**
    * Updates the serach count display.  Should be called by a controller when the store has been updated.
    * Note that listening to the 'totalcountchange' event is not reliable.
    */   
    updateSearchCount: function() {       
        var me = this;
        
        var listCount = me.down('#listCount');
        
        var text = me.dtRecordsFound;
        
        if (me.filterCount > 0) {
            text += " " + me.dtFiltered;
        }
               
        if (listCount != null) {
            var count = me.getStore().getTotalCount();
            if (count == null)
                count = 0;
            text += ": " + count;
            listCount.setTitle(text); 
        }
        
    },
    
    /**
    * Increments the filter count applied by the filters in the associated {@link Baff.app.view.FilterPanel}
    * @param {integer} increment
    */   
    incrementFilterCount: function(increment) {
        
        var me = this;
        me.filterCount +=increment;
 
    }
    
    
});

/**
 *  A ListFormView extends {@link Baff.app.view.FormView} to provide the view for a discrete activity 
 *  controlled by a {@link Ext.foundation.ListFormController}. It provides the various user interface 
 *  components for the activity include the list, form and various buttons.
 *  
 *  A minimal setup only requires the {@link #listPanel} and {@link #formPanel}to be specified,
 *  along with an alias so that the view can be referenced by an {@link Baff.app.view.DomainView}.
 *  A {@link #topTitle} may also be specified.
 * 
 *      Ext.define('MyApp.view.MyListFormView', {
 *          extend: 'Baff.app.view.ListFormView',
 *          
 *          alias: 'widget.mylistformview',
 *          
 *          requires: ['MyApp.view.MyFormPanel',
 *                          'MyApp.view.MyListPanel],
 *   
 *          config : {
 *                    
 *                    topTitle: 'My Titile',     
 *                    formPanel: 'myproductform'     // alias of MyApp.view.MyProductForm 
 *                    listPanel: 'mylistpanel'      // alias of MyApp.view.MyListPanel       
 *           }
 *  
 *  The refresh, add, remove, revert and save buttons will be created automatically, however if required
 *  a reference or even a button configuration object can be specified through configuration, as follows:
 *  
 *       config: {
 *          ....
 *          addButton: 'myreference',
 *          
 *          removeButton:  {
 *                      xtype: 'button',
 *                      reference: 'myreference',
 *                      iconCls: 'myIcon',
 *                      text: 'myText'
 *              },
 *          ....
 *      }
 *   
 *         
 */
Ext.define('Baff.app.view.ListFormView', {
    extend: 'Baff.app.view.FormView',
    xtype: 'listformview',
 
    requires: [
        'Baff.app.view.ListPanel'
    ], 
    
    // Display text
    dtTogForm: 'View',
    dtFilter: 'Filter',
    
    
    config: {
        
        /**
        * Specifies the type of {@link Baff.app.view.ListPanel} that provides the form for this view.
        * **IMPORTANT**: This view's subclass should specify a subclass of the above form panel.
        * @cfg listPanel (required)
        */
        listPanel: '' ,
        
        /**
        * Specifies a reference to the select button for this view. If set to '' the select button will not be
        * created, however generally this is not necessary as the controller will manage button state.
        */
        toggleButton: 'selectBtn',
        
        /**
        * Specifies a reference to the filter button for this view. If set to '' the filter button will not be
        * created, however generally this is not necessary as the controller will manage button state.
        */
        filterButton: 'filterBtn'
        
    },
    
    /**
    * Sets up the docked items.
    * @return {Array} The list of items
    * @protected    
    */         
   setupDockedItems: function() {
       var me = this;
       
       var items = me.callParent(arguments);
       
        if (typeof me.getToggleButton() == "object") {            
            items.push(me.getToggleButton());
            me.setToggleButton(me.getToggleButton().itemId);
            
        } else if (me.getToggleButton() != '') {
            items.push({  
                        xtype: 'button',
                        itemId: me.getToggleButton(),
                        iconCls: 'togform',
                        iconAlign: 'top',
                        text: me.dtTogForm,
                        cls: me.getButtonCls()
                        });
        }
        
        if (typeof me.getFilterButton() == "object") {            
            items.push(me.getFilterButton());
            me.setFilterButton(me.getFilterButton().itemId);
            
        } else  if (me.config.filterButton != '') {
            items.unshift({  
                        xtype: 'button',
                        itemId: me.getFilterButton(),
                        iconCls: 'search',
                        iconAlign: 'top',
                        text: me.dtFilter,
                        cls: me.getButtonCls()
                        });
        }       
        
        return items;
    },
       

   /**
    * Sets up the form panel specified by {@link #listPanel}.  This is a separate function so that
    * subclasses adding more items have flexibility to override this and add the items in the required
    * order.  
    * Calls the overridden superclass method to add a list panel before the form panel.
    * @return {Array} The list of items
    * @protected    
    */         
    setupItems: function() {
        var me = this;
        
        var items = me.getMyItems();
       
        if (me.getListPanel() != '') {
 
            items.push ({
                        xtype: me.getListPanel(),
                        itemId: me.getListPanel()     

            });
        }
        
        me.callParent(arguments);
        
        return items;
        
    }

});

/**
 *  A SelectorView extends {@link Baff.app.view.ActivityView} to provide the view for a discrete activity 
 *  controlled by a {@link Ext.foundation.SelectorController}. It provides the various user interface components
 *  for the activity include the list and various buttons.  Also refer to {@link Baff.app.view.SelectorPopup}
 *  for a popup version of this view.
 *  
 *  A minimal setup only requires the {@link #listPanel} to be specified, alongwith an alias so that the 
 *  view can be referenced by an {@link Baff.app.view.DomainView}.  A {@link #topTitle} may also be specified.
 * 
 *      Ext.define('MyApp.view.MySelectorView', {
 *          extend: 'Baff.app.view.SelectorView',
 *          
 *          alias: 'widget.myselectorview',
 *          
 *          requires: ['MyApp.view.MyListPanel'],
 *   
 *          config : {
 *                    
 *                    topTitle: 'My Titile',       
 *                    formPanel: 'mylistpanel'     // alias of MyApp.view.MyListPanel        
 *           }
 *  
 *  The refresh, add and select buttons will be created automatically, however if required
 *  a reference or even a button configuration object can be specified through configuration, as follows:
 *  
 *       config: {
 *          ....
 *          addButton: 'myreference',
 *          
 *          removeButton:  {
 *                      xtype: 'button',
 *                      itemId: 'myreference',
 *                      iconCls: 'myIcon',
 *                      text: 'myText'
 *              },
 *          ....
 *      } 
 *         
 */
Ext.define('Baff.app.view.SelectorView', {
    extend: 'Baff.app.view.ActivityView',
    xtype: 'selectorview',
      
    requires: [
        'Ext.Toolbar',
        'Baff.app.view.ListPanel'
    ], 
    
    // Display text
    dtNone: 'None',
    dtSelect: 'Select',
    dtFilter: 'Filter',
   
    config: {
        
        
        /**
        * Specifies the type of {@link Baff.app.view.ListPanel} that provides the form for this view.
        * **IMPORTANT**: This view's subclass should specify a subclass of the above form panel.
        * @cfg listPanel (required)
        */
        listPanel: '', 
        
        /**
        * Specifies a reference to the add button for this view. If set to '' the add button will not be
        * created, however generally this is not necessary as the controller will manage button state.
        */
        addButton: 'addBtn',
        
        /**
        * Specifies a reference to the select button for this view. If set to '' the select button will not be
        * created, however generally this is not necessary as the controller will manage button state.
        */
        selectButton: null,
        
        /**
        * Specifies a reference to the filter button for this view. If set to '' the filter button will not be
        * created, however generally this is not necessary as the controller will manage button state.
        */
        filterButton: 'filterBtn',
        
        /**
        * Specifies that the close button is not displayed by default (as select will close the view)
        */
        closeButton: ''
        

    },
    
    /**
    * Creates the view components, using the specified configuration such as {@link #addButton}. etc.
    * Calls the overridden superclass method.    
    */  
    initialize: function() {
        var me = this;
        
        if (me.getSelectButton() == null) {
            if (me.getPopup())
                me.setSelectButton('selectBtn');
            else
                me.setSelectButton('');
        }
        
        me.callParent(arguments);      
       
    },
    
    
    /**
    * Sets up the docked items.
    * @return {Array} The list of items
    * @protected    
    */         
    setupDockedItems: function() {
        var me = this
        
        var items = [];
        
        if (typeof me.getFilterButton() == "object") {            
            items.push(me.getFilterButton());
            me.setFilterButton(me.getFilterButton().itemId);
            
        } else  if (me.config.filterButton != '') {
            items.push({  
                        xtype: 'button',
                        itemId: me.getFilterButton(),
                        iconCls: 'search',
                        iconAlign: 'top',
                        text: me.dtFilter,
                        cls: me.getButtonCls()
                        });
        }       
        
         if (typeof me.getRefreshButton() == "object") {            
            items.push(me.getRefreshButton());
            me.setRefreshButton(me.getRefreshButton().itemId);
            
        } else  if (me.getRefreshButton() != '') {
            items.push({  
                        xtype: 'button',
                        itemId: me.getRefreshButton(),
                        iconCls: 'refresh',
                        iconAlign: 'top',
                        text: me.dtRefresh,
                        cls: me.getButtonCls()
                        });
        }
        
        if (typeof me.getAddButton() == "object") {            
            items.push(me.getAddButton());
            me.setAddButton(me.getAddButton().itemId);
            
        } else if (me.getAddButton() != '') {
            items.push({
                        xtype: 'button',
                        itemId:me.getAddButton(),
                        iconCls: 'none',
                        iconAlign: 'top',
                        text: me.dtNone,
                        cls: me.getButtonCls()
                        });
        }
        
        if (typeof me.getSelectButton() == "object") {            
            items.push(me.getSelectButton());
            me.setSelectButton(me.getSelectButton().itemId);
            
        } else if (me.getSelectButton() != '') {
            items.push({  
                        xtype: 'button',
                        itemId: me.getSelectButton(),
                        iconCls: 'select',
                        iconAlign: 'top',
                        text: me.dtSelect,
                        cls: me.getButtonCls()
                        });
        }
                
        if (typeof me.getCloseButton() == "object") {            
            items.push(me.getCloseButton());
            me.setCloseButton(me.getCloseButton().itemId);
            
        } else  if (me.getCloseButton() != '') {
            items.push({  
                        xtype: 'button',
                        itemId: me.getCloseButton(),
                        iconCls: 'close',
                        iconAlign: 'top',
                        text: me.dtClose,
                        cls: me.getButtonCls()
                        });
        }
       
        
        
        return items;
    
    },
    
    /**
    * Sets up the form panel specified by {@link #listPanel}.  This is a separate function so that
    * subclasses adding more items have flexibility to override this and add the items in the required
    * order.  
    * @return {Array} The list of items
    * @protected    
    */         
    setupItems: function() {
        var me = this;
        
        var items = me.getMyItems();
       
        if (me.getListPanel() != '') {
 
            items.push ({
                        xtype: me.getListPanel(),
                        itemId: me.getListPanel()		     
            });
        }
        
        return items;
        
    }
  
});

/**
 *  A LogonWindow captures the user name and password.
 *  
 *  A detault user name and password can be set via Utils.globals.defaultUsername and
 *  Utils.globals.defaultPassword.
 *  
 */
Ext.define('Baff.utility.application.LogonWindow', {
    extend: 'Ext.Panel',
    
    alias: 'widget.logonwindow',
    
    requires: ['Baff.utility.Utilities'],
    
    closable: false,
    bodyPadding: '10 10 0 10',
    
    // Literals for locale override
    dtLogonTitle: 'Logon',
    dtLogonBtn: 'Logon',
    dtUserName: 'User Name',
    dtPassword: 'Password',
    dtVersion: 'Version',
    
    buttonAlign: 'center',
    
    config: {
        
            layout: {
                    type: 'vbox',
                    align: 'stretch'
                    },

            defaults: {
                    flex: 1
            },
            
            centered: true,
            width: 350,
            height: 200
    },
    
    initialize: function() {
        var me = this;
        
         me.add( [{
                        xtype: 'toolbar',   
                        docked: 'top',
                        itemId: 'titlebar',
                        title: Utils.globals.applicationName + ' ' + me.dtLogonTitle
                        },                     
                     {
                        xtype: 'textfield', 
                        label: me.dtUserName,
                        name: 'username',
                        value: Utils.globals.defaultUsername,
                        allowBlank: false,
                        itemId: 'username'
                  
                    }, {   
                        xtype: 'textfield',
                        name: 'password',
                        label: me.dtPassword,
                        inputType: 'password',
                        value: Utils.globals.defaultPassword,
                        allowBlank: false,
                        itemId: 'password'
                    },{
                        xtype: 'toolbar',         	
                        layout: { pack: 'center' },
                        docked: 'bottom',  
                        items: [{
                            text: me.dtLogonBtn,
                            itemId: 'logonBtn'	                             	
                         }]
                    }
                ]);
                 
        me.callParent(arguments);
    }
    
});

/**
 *  A MainApplicationController manages user logong (via {@link Baff.utility.application.LogonWindow},
 *  user logoff and exit due to system error.
 */
Ext.define('Baff.utility.application.MainApplicationController', {
    extend: 'Ext.app.Controller',
    alias: 'controller.mainapplication',
    
    requires:[
        'Ext.MessageBox',
        'Baff.utility.usersecurity.UserSecurityManager'
    ],
    
    config: {
    
        views: [
           'Baff.utility.application.LogonWindow'
       ],

       refs: {
               usernameField: 'logonwindow #username',
               passwordField: 'logonwindow #password'
           },
       
       control: {
               'logonwindow #logonBtn': {
                   tap: 'onLogonButton'
               }
           }
    },
        
    // Literals for locale override
    dtInvalidLogonTitle: 'Invalid Logon',
    dtInvalidLogonMsg: 'Please enter a valid username and password',
    
    dtConfirmRestartTitle: 'Confirm',
    dtConfirmRestartMsg: 'Are you sure you want to restart?',  
    dtFailTitle: 'Unrecoverable System Failure', 
    dtRestartMsg: 'The application will be now be restarted.<br>Sorry for any inconvenience caused.',
    
    dtLoading: 'Please wait....',
    
    
    HTTP_REQUEST_OK: 200,
    
    splashcreen: null,
    
   /**
     * Initialise the controller.
     */
    init: function() {   
        Utils.logger.info("MainApplicationController::init");
        var me = this;
  
    },
    
    
     /**
     * Log the user off and restart the application when a system error ocurrs.
     */
    onSystemFailure: function () {
        var me = this;
        
        Ext.Msg.alert(me.dtFailTitle, me.dtRestartMsg, function() {
            
            Utils.userSecurityManager.logoff();
            window.location.reload();
        
        });       
        
    },
    
    
     /**
     * Log the user off and restart the application when the log off button is clicked.
     */
    onSystemRestart : function(){
        var me = this;
        
        Ext.Msg.confirm(me.dtConfirmRestartTitle, me.dtConfirmRestartMsg, function(button){
                
                if(button === 'yes'){
                    Utils.userSecurityManager.logoff();
                    window.location.reload();
                }
            }
        );        
    },
    
    
    /**
     * Display the logon window on application launch.
     */
    onLaunch: function() {       
        Utils.logger.info("MainApplicationController::onLaunch");
        var me = this;
         
        Utils.globals.application.on('systemfailure', me.onSystemFailure, me);
        Utils.globals.application.on('systemrestart', me.onSystemRestart, me);
        
        me.logonWindow = Ext.widget('logonwindow');
        me.logonWindow.enable();
        Ext.Viewport.add(me.logonWindow);
        me.logonWindow.show();
        
    },

    /**
     * Authenticate the user when the logon button is clicked.
     */
    onLogonButton: function() {       
        Utils.logger.info("MainApplicationController::onLogonButton");
        var me = this;
        
        me.logonWindow.setMasked({xtype: 'loadmask', message: me.dtLoading});       
        
        var username = me.getUsernameField().getValue();
        var password = me.getPasswordField().getValue();
               
        Utils.userSecurityManager.logon(
                                username,
                                password,
                                me.postLogon, me);
    
    },
    
    postLogon: function(operation, success, me) {  
        Utils.logger.info("MainApplicationController::postLogon");
        //var me = this;  // passed in as scope
        
        me.logonWindow.setMasked(false);
        
        if (success) {

            if (Utils.globals.manageUsers) {
                
                Utils.userSecurityManager.loadUserAttributes(me.getUsernameField().getValue(),
                                me.postGetUserAttributes, me);
                                
            }
   
            me.logonWindow.destroy();
            
            Ext.Viewport.add({xtype: Utils.globals.mainView});
            
        } else {
           
            if (operation.getResponse() != null && operation.getResponse().status == me.HTTP_REQUEST_OK) {
                Ext.Msg.alert(me.dtInvalidLogonTitle, me.dtInvalidLogonMsg);

            } else {
                me.onSystemFailure();
            }
        }
    },
    
    postGetUserAttributes: function(record, operation, success, me) {   
        Utils.logger.info("MainApplicationController::postGetUserAttributes");
        //var me = this;  // passed in as scope
     
        if (!operation.success && 
                (operation.getResponse() == null || operation.getResponse().status != me.HTTP_REQUEST_OK))
            me.onSystemFailure();
           
    }
});
 
    

