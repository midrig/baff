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
    requires: [
        'Ext.data.validator.Length'
    ],
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
            if (this.masterEntityType != null)  {
                return this.masterEntityType;
            }
            else  {
                return this.getName();
            }
            
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
        getEntityType: function() {
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
        {
            name: 'entityId',
            type: 'string'
        },
        {
            name: 'masterEntityId',
            type: 'string',
            allowNull: true
        },
        {
            name: 'currencyControl',
            type: 'string',
            allowNull: true
        },
        {
            name: 'versionControl',
            type: 'string',
            allowNull: true
        }
    ],
    /**
    * Performs integrity validation, should be overridden by the subclass if required.  
    * Add errors via {@link #addError} (this will set {@link #valid} automatically) 
    * @param {String} action The type of {@link #ACTION} being performed
    * @param {Baff.app.model.EntityModel} originalRecord The pre-midified entity record
    * @protected
    */
    doIntegrityValidation: function(action, originalRecord) {},
    // Use this.addError(field, value) to add errors (will also set valid flag)      
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
    getEntityType: function() {
        return this.self.getName();
    },
    /**
    * Sets the value of the 'entityId' field and the field defined by {@link entityIdProperty}.
    * @param {String} id The entity identifier
    *
    */
    setEntityId: function(id) {
        this.set('entityId', id);
        if (this.getEntityIdProperty() != null)  {
            this.set(this.getEntityIdProperty(), id);
        }
        
    },
    /**
    * Sets the value of the 'masterEntityId' field and the field defined by {@link masterEntityIdProperty}.
    * @param {String} id The master entity identifier
    */
    setMasterEntityId: function(id) {
        this.set('masterEntityId', id);
        if (this.getMasterEntityIdProperty() != null)  {
            this.set(this.getMasterEntityIdProperty(), id);
        }
        
    },
    /**
    * Returns the value of the 'entityId' field
    * @return {String}
    */
    getEntityId: function() {
        var entityId = this.get('entityId');
        if ((entityId == null || entityId == '') && this.getEntityIdProperty() != null)  {
            entityId = this.get(this.getEntityIdProperty());
        }
        
        if (entityId == '')  {
            entityId = null;
        }
        
        return entityId;
    },
    /**
    * Returns the value of the 'masterEntityId' field
    * @return {String}
    */
    getMasterEntityId: function() {
        var entityId = this.get('masterEntityId');
        if (entityId == null && this.isMasterEntity())  {
            entityId = this.getEntityId();
        }
        
        if ((entityId == null || entityId == '') && this.getMasterEntityIdProperty() != null)  {
            entityId = this.get(this.getMasterEntityIdProperty());
        }
        
        if (entityId == '')  {
            entityId = null;
        }
        
        return entityId;
    },
    /**
    * Sets the value of the 'versionControl' field.
    * @param {String} version The version
    */
    setVersion: function(version) {
        this.set('versionControl', version);
    },
    /**
    * Returns the value of the 'versionControl' field
    * @return {String}
    */
    getVersion: function() {
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
                    Ext.iterate(val.getData(), function(field, value) {
                        if (true !== value)  {
                            this.addError(field, value);
                        }
                        
                    }, me);
                }
                
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
    validateNoChange: function(field, message) {
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
            for (var i = 0; i < field.length; i++) {
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
            me.errorMessages.push({
                id: field,
                msg: message
            });
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
    getErrors: function() {
        var errors = [];
        Ext.iterate(this.getData(), function(field, value) {
            if (true !== value)  {
                this.push({
                    id: field,
                    msg: value
                });
            }
            
        }, errors);
        return errors;
    }
});
Ext.define('validator.Present', {
    extend: 'Ext.data.validator.Validator',
    alias: 'data.validator.present',
    validate: function(value) {
        return !Ext.isEmpty(value) || 'Must be present';
    }
});
Ext.define('validator.RDPresent', {
    extend: 'Ext.data.validator.Validator',
    alias: 'data.validator.rdpresent',
    validate: function(value) {
        if (Ext.isEmpty(value) || value === 0)  {
            return 'Must be present';
        }
        else  {
            return true;
        }
        
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
        this.setInfoLogger(this.getEnableInfo());
        this.setDebugLogger(this.getEnableDebug());
        this.setErrorLogger(this.getEnableError());
    },
    /**
    *  Enables the INFO logger
    *  @param {boolean}
    */
    setInfoLogger: function(enabled) {
        if (typeof console != 'undefined' && enabled)  {
            this.info = Function.prototype.bind.call(console.log, console);
        }
        else  {
            this.info = function() {
                return;
            };
        }
        
    },
    /**
    *  Enables the DEBUG logger
    *  @param {boolean}
    */
    setDebugLogger: function(enabled) {
        if (typeof console != 'undefined' && enabled)  {
            this.debug = Function.prototype.bind.call(console.debug, console);
        }
        else  {
            this.debug = function() {
                return;
            };
        }
        
    },
    /**
    *  Enables the ERROR logger
    *  @param {boolean}
    */
    setErrorLogger: function(enabled) {
        if (typeof console != 'undefined' && enabled)  {
            this.error = Function.prototype.bind.call(console.error, console);
        }
        else  {
            this.error = function() {
                return;
            };
        }
        
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
    typeProperty: ' ',
    /**
     * The service response reader
     * @private
     */
    reader: {
        type: 'json',
        rootProperty: 'data',
        totalProperty: 'total',
        useSimpleAccessors: true,
        // Allows use "." in field names
        typeProperty: this.typeProperty
    },
    /**
     * The service request writer
     * @private
     */
    writer: {
        type: 'json',
        allowSingle: true,
        encode: true,
        writeAllFields: true,
        writeRecordId: false,
        rootProperty: 'data'
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
    /**
     * Indicates that the load requests from the ext framework should be processed; used to suppress automatic
     * loads due to filtering.
     */
    allowLoad: true,
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
        if (Utils.userSecurityManager != null && Utils.userSecurityManager.getUserName() != null)  {
            me.setParam("username", Utils.userSecurityManager.getUserName());
        }
        
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
    load: function(options) {
        if (this.allowLoad) {
            this.hasLoaded = false;
            this.callParent(arguments);
        }
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
    setKeys: function(ownerId, masterEntityId) {
        var me = this;
        // Store key is: store name | master entity type | owner identifier
        me.storeKey = Ext.getClassName(this);
        var masterEntityType = null;
        var model = me.getModel();
        if (model != null)  {
            masterEntityType = model.getMasterEntityType();
        }
        
        if (masterEntityType != null && masterEntityType != '') {
            me.masterKey = '#' + masterEntityType + '#';
            if (masterEntityId != null) {
                me.storeKey += "|" + masterEntityId;
                me.masterKey += "|" + masterEntityId;
                // Set the filter
                me.masterFilter = new Ext.util.Filter({
                    property: 'masterEntityId',
                    value: masterEntityId
                });
                me.setAllowLoad(false);
                me.getFilters().add(me.masterFilter);
                me.setAllowLoad(true);
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
        if (entity.getEntityId() != null)  {
            return this.findRecord('entityId', entity.getEntityId(), 0, false, true, true);
        }
        else  {
            return this.getById(entity.getId());
        }
        
    },
    // For 'dummy' records
    /**
     * Adds a field filter to the store
     * @param {Ext.util.Filter} filter The filter to apply
     * @param {boolean} auto Set to true to automatically reload the store - defaults to true
     */
    addFieldFilter: function(filter, auto) {
        var me = this;
        auto = (auto == null ? true : false);
        me.setAllowLoad(auto);
        me.fieldFilters.add(filter);
        me.getFilters().add(filter);
        me.setAllowLoad(true);
    },
    /**
     * Removes a field filter from the store
     * @param {Ext.util.Filter} filter The filter to remove
     * @param {boolean} auto Set to true to automatically reload the store - defaults to true
     */
    removeFieldFilter: function(filter, auto) {
        var me = this;
        auto = (auto == null ? true : false);
        me.setAllowLoad(auto);
        me.fieldFilters.remove(filter);
        me.getFilters().remove(filter);
        me.setAllowLoad(true);
    },
    /**
     * Clear all field filters from the store
     * @param {boolean} auto Set to true to automatically reload the store - defaults to false
     */
    clearFieldFilters: function(auto) {
        var me = this;
        if (me.fieldFilters.length > 0) {
            auto = (auto == null ? false : true);
            me.setAllowLoad(auto);
            me.removeAll();
            me.getFilters().remove(me.fieldFilters.items);
            me.fieldFilters.removeAll();
            me.setAllowLoad(true);
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
        var filter,
            storeFilter = null;
        var match = true;
        var filterLength = filters != null ? filters.length : 0;
        if (me.contextFilters.length != filterLength) {
            match = false;
        } else if (filters != null) {
            // Loop through the filters
            for (var i = 0; i < filters.length; i++) {
                filter = filters[i];
                storeFilter = me.contextFilters.getByKey(filter.getId());
                if (storeFilter == null || storeFilter.getValue() != filter.getValue()) {
                    match = false;
                    break;
                }
            }
        }
        if (match) {
            return true;
        } else // already setup
        {
            me.setAllowLoad(false);
            me.removeAll();
            if (me.contextFilters.length > 0)  {
                me.getFilters().remove(me.contextFilters.items);
            }
            
            if (filters != null && filters.length > 0)  {
                me.getFilters().add(filters);
            }
            
            me.contextFilters.removeAll();
            me.contextFilters.add(filters);
            me.setAllowLoad(true);
        }
        return false;
    },
    /**
     * Sets the auto filter flag
     */
    setAllowLoad: function(allowLoad) {
        this.allowLoad = allowLoad;
    },
    // Override to work around an exception that occurs when sorting on a field with a row selected
    // Don't do anything if there is no data available
    onRangeAvailable: function(options) {
        var me = this;
        if (me.getTotalCount() > 0)  {
            me.callParent(arguments);
        }
        
    },
    // Override of non-existing method
    contains: function(record, modifiedFieldNames) {
        return false;
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
    requires: [
        'Baff.app.model.EntityModel',
        'Baff.app.model.EntityStore'
    ],
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
        if (masterEntityId != null)  {
            storeKey += "|" + masterEntityId;
        }
        
        if (ownerId != null)  {
            storeKey += "|" + ownerId;
        }
        
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
    destroyStore: function(storeType, ownerId, masterEntityId) {
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
    getStore: function(storeType, ownerId, masterEntityId, userId) {
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
            storeObj.users = [
                userId
            ];
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
    findMaster: function(masterEntityType, masterEntityId) {
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
                        if (storeObj.store.storeType == primaryStoreType)  {
                            return true;
                        }
                        
                    }
                });
            masteringStores = masteringStores.filter(filter);
        }
        var master = null;
        // Iterate throught the filtered store set to look for the master record
        masteringStores.each(function() {
            if (this.store.getCount() > 0) {
                master = this.store.findRecord('entityId', masterEntityId, 0, false, true, true);
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
    getMasteringStores: function(masterEntityType, masterEntityId) {
        var me = this;
        var masterTypes = masterEntityType.split('#');
        var filter = new Ext.util.Filter({
                filterFn: function(storeObj) {
                    for (var i = 0; i < masterTypes.length; i++) {
                        var masterKey = '#' + masterTypes[i] + '#';
                        if (masterEntityId != null) {
                            // Looking for mastered stores only
                            masterKey += "|" + masterEntityId;
                            if (storeObj.store.masterKey.indexOf(masterKey) >= 0)  {
                                return true;
                            }
                            
                        } else {
                            // Looking for master stores only
                            if (storeObj.store.masterKey.indexOf('|') < 0 && storeObj.store.masterKey.indexOf(masterKey) >= 0)  {
                                return true;
                            }
                            
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
    flushMasteredStores: function(masterEntityType, masterEntityId, invalid) {
        var me = this;
        if (invalid == null)  {
            invalid = false;
        }
        
        // If no master id specified then we will flush all mastered stores for the type
        // Otherwise it will only be for the specified id
        if (masterEntityId == null)  {
            masterEntityId = '';
        }
        
        var masteredStores = me.getMasteringStores(masterEntityType, masterEntityId);
        masteredStores.each(function() {
            Utils.logger.info("flushing mastered store = " + this.store.storeKey + " ,masterKey= " + this.store.masterKey);
            this.store.flush(invalid);
        });
    },
    /**
     * Removes the data from all stores that master a given master entity type.
     * @param {String} masterEntityType The type of master entity (it's class name)
     */
    flushMasterStores: function(masterEntityType) {
        var me = this;
        var masterStores = me.getMasteringStores(masterEntityType);
        masterStores.each(function() {
            Utils.logger.info("flushing master store = " + this.store.storeKey + " ,masterKey= " + this.store.masterKey);
            this.store.flush();
        });
    },
    /**
     * Removes the data from all stores for a given given master entity type and instance.
     * @param {String} masterEntityType The type of master entity (it's class name)
     * @param {String} [masterEntityId="null"] The identifier of the master entity instance
     */
    flushMasteringStores: function(masterEntityType, masterEntityId) {
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
    fields: [
        {
            name: 'entityType',
            type: 'string'
        },
        {
            name: 'entityId',
            type: 'string'
        },
        {
            name: 'versionControl',
            type: 'string'
        },
        {
            name: 'data',
            type: 'string'
        }
    ],
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
    requires: [
        'Baff.utility.versionmanager.MasterModel'
    ],
    model: 'Baff.utility.versionmanager.MasterModel',
    /**
    * Returns the master reference record for the given type and identifier
    * @param {String} type The entity type
    * @param {String} id The entity identifier
    * @returns {Baff.utility.versionmanager.MasterModel} or null if does not exist.
    */
    getMaster: function(type, id) {
        var me = this;
        var index = me.findBy(function(rec, recId) {
                if (rec.get('entityId') == id && rec.get('entityType') == type) {
                    return true;
                } else {
                    return false;
                }
            });
        if (index > -1) {
            var master = Ext.create(type);
            master.set(Ext.decode(me.getAt(index).getData()));
            return master;
        } else {
            return null;
        }
    },
    /**
    * Removes the master reference record for the given type and identifier, if it exists
    * @param {String} type The entity type
    * @param {String} id The entity identifier
    */
    removeMaster: function(type, id) {
        var me = this;
        var index = me.findBy(function(rec, recId) {
                if (rec.get('entityId') == id && rec.get('entityType') == type) {
                    return true;
                } else {
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
    storeMaster: function(master) {
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
        var data = master.getData({
                serialize: true
            });
        var encoded = Ext.encode(data);
        newRecord.set('data', encoded);
        me.add(newRecord);
        return newRecord;
    },
    /**
    * Flushes the master store
    * @param {String} type The master entity type to be flushed
    */
    flushMaster: function(type) {
        var me = this;
        Utils.logger.info("MasterStore::flushMaster, removing type: " + type);
        var records = [];
        var i = 0;
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
    mixins: [
        'Ext.mixin.Observable'
    ],
    requires: [
        'Baff.utility.storemanager.EntityStoreManager',
        'Baff.utility.versionmanager.MasterStore'
    ],
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
    getVersion: function(type, id) {
        Utils.logger.info("VersionManager::getVersion");
        var me = this;
        if (id == null || type === '' || id === '')  {
            return;
        }
        
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
    refreshData: function(type, id, master) {
        Utils.logger.info("VersionManager::refreshData");
        var me = this;
        // Flush all data related to the master type and id, but don't reload as
        // this will be managed by the activity controllers
        if (type != null && type != '') {
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
        var me = this;
        if (type == null || id == null)  {
            return null;
        }
        
        var master = me.masterStore.getMaster(type, id);
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
        var me = this;
        // Try to get any currently retrieved master record (only one should exist as a result of data integrity checks)
        var masterEntity = me.getMasterEntityFromPrimaryStore(type, id);
        if (masterEntity == null) {
            // Note that this will be done asynchronously so this function will return null
            me.loadMaster(type, id);
        } else {
            me.storeMaster(masterEntity);
        }
        return masterEntity;
    },
    /**
     * Loads the master entity record from the server
     * @param {String} type The master entity type
     * @param {String} id The master entity id
     */
    loadMaster: function(type, id) {
        Utils.logger.info("VersionManager::loadMaster, type= " + type + " ,id= " + id);
        var me = this;
        if (Utils.globals.viewport != null)  {
            Utils.globals.viewport.showWaitMask(true, "VM");
        }
        
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
                if (!operation.success && response != null) {
                    var message;
                    if (response.status != me.HTTP_RESPONSE_OK) {
                        message = me.dtResponseFailMsg + response.status + " (" + response.statusText + ")";
                    } else {
                        var jsonResponse = Ext.decode(response.responseText);
                        message = jsonResponse.message;
                    }
                    var callback = function() {
                            if (Utils.globals.application != null)  {
                                Utils.globals.application.fireEvent('systemfailure');
                            }
                            else {
                                Utils.entityStoreManager.flushMasteredStores(type, id, true);
                                me.fireEvent('masterload', type, id, true);
                            }
                        };
                    if (Utils.globals.viewport != null)  {
                        Utils.globals.viewport.showAlertMessage(me.dtSystemErrorTitle, message, callback);
                    }
                    else  {
                        Ext.Message.alert(me.dtSystemErrorTitle, message, callback);
                    }
                    
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
                if (Utils.globals.viewport != null)  {
                    Utils.globals.viewport.showWaitMask(false, "VM");
                }
                
            }
        });
    },
    /**
     * Stores the master entity record in the master store
     * @param {Baff.app.model.EntityModel} master The master entity record to be stored
     */
    storeMaster: function(master) {
        Utils.logger.info("VersionManager::storeMaster");
        var me = this;
        me.masterStore.storeMaster(master);
    },
    /**
     * Flushes the master store for the given type 
     * @param {String} type The master entity type to be flushed
     */
    flushMaster: function(type) {
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
    getMasterEntityFromPrimaryStore: function(type, id) {
        Utils.logger.info("VersionManager::getMasterEntityFromPrimaryStore");
        var me = this;
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
    // The permission model - simply a string
    fields: [
        {
            name: 'permission',
            type: 'string'
        }
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
 *  A RefDataModel holds a reference to a reference data record, where the key is in the format:
 *  "DOMAIN.CLASS.RECORD" - a class reference is defined as "DOMAIN.CLASS".
 *  
 */
Ext.define('Baff.utility.usersecurity.UserAttributes', {
    extend: 'Ext.data.Model',
    fields: [
        {
            name: 'username',
            type: 'string'
        },
        {
            name: 'displayname',
            type: 'string'
        },
        {
            name: 'email',
            type: 'string'
        }
    ],
    proxy: {
        type: 'serviceproxy'
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
    requires: [
        'Baff.utility.usersecurity.UserPermissionsStore',
        'Baff.utility.usersecurity.UserAttributes'
    ],
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
    /**
     * The user attributes for the logged on user
     * @private
     */
    userAttributes: null,
    config: {
        /**
         * The service root url
         */
        serviceRootUrl: '/user',
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
                return false;
                
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
        Ext.Ajax.request({
            url: me.getServiceRootUrl() + '/logout.json'
        });
        me.permissionStore.removeAll();
        me.username = null;
    },
    registerUser: function(email, displayname, permissions, cbFun, cbScope) {
        Utils.logger.info("UserSecurityManager::registerUser");
        var me = this;
        if (permissions == null)  {
            permissions = this.getDefaultPermissions();
        }
        
        Ext.Ajax.request({
            url: me.getServiceRootUrl() + '/register.json',
            params: {
                email: email,
                displayname: displayname,
                permissions: permissions
            },
            callback: function(options, success, response) {
                cbFun(success, response, cbScope);
            }
        });
    },
    resetUser: function(email, cbFun, cbScope) {
        Utils.logger.info("UserSecurityManager::resetUser");
        var me = this;
        Ext.Ajax.request({
            url: me.getServiceRootUrl() + '/reset.json',
            params: {
                email: email
            },
            callback: function(options, success, response) {
                cbFun(success, response, cbScope);
            }
        });
    },
    updateUser: function(email, displayname, oldPassword, newPassword, permissions, cbFun, cbScope) {
        Utils.logger.info("UserSecurityManager::register");
        var me = this;
        Ext.Ajax.request({
            url: me.getServiceRootUrl() + '/update.json',
            params: {
                email: email,
                displayname: displayname,
                oldPassword: oldPassword,
                newPassword: newPassword,
                permissions: permissions
            },
            callback: function(options, success, response) {
                cbFun(success, response, cbScope);
            }
        });
    },
    loadUserAttributes: function(email, cbFun, cbScope) {
        Utils.logger.info("UserSecurityManager::getUserAttributes");
        var me = this;
        me.userAttributes = Ext.create('Baff.utility.usersecurity.UserAttributes', {
            id: email
        });
        me.userAttributes.getProxy().setApi({
            read: me.getServiceRootUrl() + '/find.json'
        });
        me.userAttributes.getProxy().setExtraParam('email', email);
        me.userAttributes.load({
            scope: me,
            callback: function(record, operation, success) {
                cbFun(record, operation, success, cbScope);
            }
        });
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
    loadRefDataStore: function(store) {
        if (store.getStoreId() === 'REF.DATA.NOCLASS') {
            store.add([
                {
                    "key": "REF.DATA.NULL",
                    "code": 0,
                    "decode": "Not Applicable"
                }
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
    fields: [
        {
            name: 'key',
            type: 'string'
        },
        {
            name: 'code',
            type: 'int'
        },
        {
            name: 'decode',
            type: 'string'
        }
    ]
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
    requires: [
        'Baff.utility.refdata.RefDataModel'
    ],
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
    getRefDataStore: function(refdataclass) {
        var me = this;
        var store = Ext.getStore(refdataclass);
        if (store == null) {
            store = me.createRefDataStore(refdataclass);
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
    createRefDataStore: function(refdataclass) {
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
    getCode: function(key, refdataclass) {
        var me = this;
        if (refdataclass == null) {
            var sep = key.split('.');
            if (sep.length == 3) {
                refdataclass = sep[0] + "." + sep[1];
            } else {
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
    getCodeDecodeArray: function(refdataclass) {
        var me = this;
        var decodes = [],
            record;
        var store = me.getRefDataStore(refdataclass);
        var count = store.count();
        if (count < 1) {
            Utils.logger.error("Reference data not found - ensure reference data has been loaded");
            return null;
        }
        for (var i = 0; i < count; i++) {
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
    getDecode: function(code, refdataclass) {
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
 *  A WorkflowManager manages execution of a sequence of workflow steps that are defined within
 *  {@link Baff.app.controller.DomainController}s.
 *  
 *  Workflows can be selected via a {@link Baff.utility.workflow.WorkflowToolbar} that presents the
 *  currently available workflows for the active views.  Only workflows for the active views are shown
 *  for usability; it is a design decision whether to create workflow wrappers that are visible at higher
 *  levels within the application. 
 */
Ext.define('Baff.utility.workflow.WorkflowManager', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.workflow',
    singleton: true,
    /**
     * The workflow store
     * @private
     */
    wfStore: null,
    /**
     * The workflow selector
     * @private
     */
    wfSelector: null,
    /**
     * The next button on the toolbar
     * @private
     */
    wfNextButton: null,
    /**
     * The previous button on the toolbar
     * @private
     */
    wfPrevButton: null,
    /**
     * The context object for the current workflow step, passed between this and the domain
     * controllers to manage workflow state, includes:
     * workflow: the workflow name
     * step: the step name
     * controller: the domain controller for the step
     * resume: if the workflow can be resumed if the user navigates away
     * replay: if the worklfow can be replayed once completed
     * previous: if the previous step can be returned to
     * statePaused: if the workflow is paused and waiting to be resumed
     * stateResuming: if the workflow is being resumed
     * statePrev: if the previous step has been selected (otherwise the next step has been selected
     */
    wfContext: null,
    /**
     * The current workflow sequence; the last workflow in the list is the current one
     * @private
     */
    wfChain: null,
    /**
     * The currently active domain controller
     * @private
     */
    activeController: null,
    // Various display text for override in locale file
    dtConfirmTitle: 'Confirm',
    dtConfirmStopWorkflow: 'Stop the current workflow?',
    dtNextStep: 'Next Step',
    dtPreviousStep: 'Prev Step',
    dtInfoTitle: 'Info',
    dtFailedMsg: 'The current workflow state cannot be resumed.',
    dtRepeatMsg: 'Repeat',
    dtOrFinish: 'or finish ?',
    dtOrContinue: 'or continue workflow ?',
    dtBtnRepeat: 'Repeat',
    dtBtnFinish: 'Finish',
    dtBtnContinue: 'Continue',
    dtFinishedMsg: 'Workflow has been completed.',
    dtRootName: 'Workflows',
    dtStartInstruction: 'Select a workflow to begin.',
    dtNoWorkflow: 'No workflow selected',
    dtPauseInstruction: 'Workflow is paused.',
    dtResume: 'Resume',
    dtActivityNotAvailableMsg: 'The next activity is not yet available.',
    dtCompleteCurrentMsg: 'Please complete the current activity.',
    /**
     * Initialises the workflow manager.
     */
    init: function() {
        Utils.logger.info("WorkflowManager::init");
        var me = this;
        me.wfStore = Ext.create('Ext.data.TreeStore');
        me.wfSelector = me.lookupReference('wfSelector');
        me.wfNextButton = me.lookupReference('wfNextButton');
        me.wfPrevButton = me.lookupReference('wfPrevButton');
        me.wfInstruction = me.lookupReference('wfInstruction');
        me.wfName = me.lookupReference('wfName');
        me.wfSelector.on('selectionchange', me.onWorkflowSelection, me);
        me.wfNextButton.on('click', me.onClickNextButton, me);
        me.wfPrevButton.on('click', me.onClickPrevButton, me);
        me.setStartState();
    },
    /**
     * Sets a listener on any a new toolbar button.
     * Called when the workflow toolbar selection changes.  
     */
    onWorkflowSelection: function(selector, selection) {
        var me = this;
        // If there are no children then must be a leaf node so set a listner on its button
        if (selection != null && selection.getData().children == null) {
            // Find the button
            me.wfSelector.items.each(function(item) {
                if (item.getText() == selection.getData().text) {
                    item.on('click', me.onClickWorkflowSelector, me);
                }
            });
        }
    },
    /**
     * Initiates a workflow.  Called by clicking on a workflow button.
     */
    onClickWorkflowSelector: function(button) {
        var me = this;
        if (me.wfContext != null) {
            Ext.Msg.confirm(me.dtConfirmTitle, me.dtConfirmStopWorkflow, function(btn) {
                if (btn == 'yes')  {
                    me.startWorkflow();
                }
                
            });
        } else {
            me.startWorkflow();
        }
    },
    /**
     * Selects the next step in the workflow.
     * Called by clicking on the next button.
     */
    onClickNextButton: function() {
        var me = this;
        me.wfContext.statePrev = false;
        me.onClickButton();
    },
    /**
     * Selects the previous step in the workflow.
     * Called by clicking on the previous button.
     */
    onClickPrevButton: function() {
        var me = this;
        me.wfContext.statePrev = true;
        me.onClickButton();
    },
    /**
     * Prompts the user if required before initiating the next step.
     * Called when either the next or previous buttons are clicked.
     */
    onClickButton: function() {
        var me = this;
        var prompt = me.activeController.getDeactivationPrompt(true);
        if (prompt != "") {
            Ext.Msg.confirm(me.dtConfirmTItle, prompt, function(btn) {
                if (btn == 'yes')  {
                    me.nextStep();
                }
                
            });
        } else {
            me.nextStep();
        }
    },
    /**
     * Sets the workflow selector state when a new view is selected by the user.
     */
    onActiveViewChange: function(view) {
        Utils.logger.info("WorkflowManager::onActiveViewChange");
        var me = this;
        // Get the domain controller
        var controller;
        if (view.isXType('domainview'))  {
            controller = view.getController();
        }
        else  {
            controller = view.findParentByType('domainview').getController();
        }
        
        // Set the state if not triggered by workflow step execution or it's the active workflow
        if (me.wfContext != null && !me.processingNextStep && view != me.wfContext.activeView) {
            if (me.wfContext.resume != true) {
                me.setStartState();
            } else {
                me.wfContext.context = me.wfContext.controller.getWorkflowContext();
                me.setPausedState();
            }
        }
        // If a new domain controller
        if (controller != me.activeController) {
            me.activeController = controller;
            me.setAvailableWorkflows(controller);
            // If currently processing a workflow 
            if (me.wfContext != null && !me.wfContext.statePaused) {
                // Try to select the workflow in the toolbar
                var root = me.wfStore.getRoot();
                var node = root.findChild("text", me.wfContext.owningView, true);
                if (node != null)  {
                    node = node.findChild("text", me.wfContext.owningWorkflow);
                }
                
                if (node != null)  {
                    me.wfSelector.setSelection(node);
                }
                
            }
        }
    },
    /**
     * Starts a new workflow.
     */
    startWorkflow: function() {
        Utils.logger.info("WorkflowManager::startWorkflow");
        var me = this;
        me.wfContext = {};
        var item = me.wfSelector.getSelection().getData();
        me.wfChain = new Array();
        var link = me.addWfLink(item.text, item.controller);
        var parentNode = me.wfStore.getNodeById(item.parentId);
        me.wfContext.owningView = parentNode.getData().text;
        me.wfContext.owningWorkflow = item.text;
        me.wfContext.workflow = item.text;
        me.wfContext.controller = item.controller;
        me.wfContext.step = null;
        me.nextStep();
    },
    /**
     * Completes the next step in a workflow.
     */
    nextStep: function() {
        Utils.logger.info("WorkflowManager::nextStep");
        var me = this;
        me.processingNextStep = true;
        // Avoid button presses whilst determining workflow step
        me.wfNextButton.disable();
        me.wfPrevButton.disable();
        var currentWorkflow = me.wfContext.workflow;
        var currentStep = me.wfContext.step;
        me.wfNextButton.setText(me.dtNextStep);
        if (me.wfContext.statePaused) {
            me.wfContext.statePaused = false;
            me.wfContext.stateResuming = true;
        }
        me.wfContext.controller.onNextStep(me.wfContext);
        var wasResuming = me.wfContext.stateResuming;
        me.wfContext.stateResuming = false;
        if (me.wfContext.workflow == null) {
            Utils.logger.debug("Workflow undefined, stopping");
            // Finished unexpectedly
            Ext.Msg.alert(me.dtInfoTitle, me.dtFailedMsg);
            me.setStartState();
        } else if (currentWorkflow != me.wfContext.workflow) {
            Utils.logger.debug("Switching to child workflow....");
            // Switched workflow - add node and call controller
            me.addWfLink(me.wfContext.workflow, me.wfContext.controller);
            me.wfContext.step = null;
            me.nextStep();
            me.wfNextButton.enable();
        } else if (me.wfContext.step == null) {
            Utils.logger.debug("Finished current workflow....");
            // Check to see if current workflow can be replayed
            if (me.wfContext.replay) {
                var prompt = me.dtRepeatMsg + " " + me.wfContext.workflow + "</br>";
                var buttons;
                // Check if only this workflow in the chain)
                if (me.wfChain.length == 1) {
                    prompt += me.dtOrFinish;
                    buttons = {
                        yes: me.dtBtnRepeat,
                        no: me.dtBtnFinish
                    };
                } else {
                    prompt += me.dtOrContinue;
                    buttons = {
                        yes: me.dtBtnRepeat,
                        no: me.dtBtnContinue
                    };
                }
                Ext.Msg.show({
                    title: me.dtConfitmTitle,
                    message: prompt,
                    buttonText: buttons,
                    fn: function(btn) {
                        if (btn == 'yes') {
                            me.wfContext.step = null;
                            me.nextStep();
                        } else {
                            me.nextContinue(false);
                        }
                    }
                });
                return;
            }
            me.nextContinue(true);
            return;
        } else {
            Utils.logger.debug("Continuing with current workflow....");
            if (me.wfContext.step == currentStep && !wasResuming) {
                Utils.logger.debug("Next step not available....");
                Ext.Msg.alert(me.dtInfoTitle, me.dtActivityNotAvailableMsg + "</br></br>" + me.dtCompleteCurrentMsg);
            }
            // Stick with current workflow
            me.wfInstruction.update(me.wfContext.instruction);
            me.wfName.update(me.wfContext.workflow);
            me.wfNextButton.enable();
            if (me.wfContext.previous && me.wfContext.allowPrev)  {
                me.wfPrevButton.enable();
            }
            else  {
                me.wfPrevButton.disable();
            }
            
        }
        me.processingNextStep = false;
    },
    /**
     * Continue processing the current workflow.
     * @param {boolean} if the finished prompt should be shown
     */
    nextContinue: function(prompt) {
        Utils.logger.info("WorkflowManager::nextContinue");
        var me = this;
        // Process next level up if it exists
        if (me.wfChain.length > 1) {
            var prevLink = me.wfChain.pop();
            var link = me.wfChain[me.wfChain.length - 1];
            Utils.logger.debug("Finished child workflow " + prevLink.workflow + "  ,returning to parent workflow...." + link.workflow);
            me.wfContext.workflow = link.workflow;
            me.wfContext.controller = link.controller;
            me.wfContext.step = prevLink.workflow;
            me.nextStep();
        } else {
            Utils.logger.debug("Finished worklfow, stopping");
            // Finished
            if (prompt)  {
                Ext.Msg.alert(me.dtInfoTitle, me.dtFinishedMsg);
            }
            
            me.setStartState();
        }
        me.processingNextStep = false;
    },
    /**
     * Adds a link to the current workflow chain.
     */
    addWfLink: function(workflow, controller) {
        var me = this;
        var link = {};
        link.workflow = workflow;
        link.controller = controller;
        me.wfChain.push(link);
        return link;
    },
    /**
     * Determines the available workflows for the current activity and it's parents
     * and builds the store for the workflow selector toolbar.
     * @param {@link Baff.app.controller.DomainController}
     */
    setAvailableWorkflows: function(activeDC) {
        Utils.logger.info("WorkflowManager::setAvailableWorkflows");
        var me = this;
        var controller, workflows, i, j,
            len = 0,
            node = null;
        var view = activeDC.getView();
        var topView = null;
        // Loop up through this activity and its parents
        while (view != null && view.isXType('domainview')) {
            // Get the workflow config for the domain controller
            controller = view.getController();
            workflows = controller.getAvailableWorkflows();
            if (workflows != null) {
                var found = false;
                // Loop through the workflows for this domain
                for (i = 0; i < workflows.length; i++) {
                    if (workflows[i].visible != false) {
                        if (!found) {
                            // The first child for the node should be a link to the previous activity's workflows
                            if (node != null) {
                                var newNode = {};
                                newNode.children = [];
                                newNode.children[0] = node;
                                node = newNode;
                                j = 1;
                            } else {
                                node = {};
                                node.children = [];
                                j = 0;
                            }
                            node.text = controller.originalTitle;
                            node.iconCls = 'workflow';
                            node.controller = controller;
                            found = true;
                        }
                        node.children[j] = {};
                        node.children[j].leaf = true;
                        node.children[j].text = workflows[i].workflow;
                        node.children[j].iconCls = 'activity';
                        node.children[j].controller = controller;
                        j++;
                    }
                }
                len++;
            }
            topView = view;
            view = view.findParentByType('domainview');
        }
        var rootNode;
        if (node != null) {
            if (node.text == topView.getController().originalTitle) {
                rootNode = node;
            } else {
                rootNode = {};
                rootNode.children = [];
                rootNode.children[0] = node;
                len++;
            }
        } else {
            rootNode = {};
            rootNode.children = [];
            len++;
        }
        if (Utils.globals.dtRootName != null)  {
            rootNode.text = Utils.globals.dtRootName;
        }
        else if (Utils.globals.applicationName != null)  {
            rootNode.text = Utils.globals.applicationName;
        }
        else  {
            rootNode.text = me.dtRootName;
        }
        
        rootNode.iconCls = 'root';
        me.wfStore.setRoot(rootNode);
        me.wfSelector.setStore(me.wfStore);
        // Select the lowest level activity in the toolbar
        var selection = me.wfStore.getRoot();
        for (i = 0; i < len - 1; i++) selection = selection.childNodes[0];
        me.wfSelector.setSelection(selection);
    },
    /**
     * Set the state if no workflow selected.
     */
    setStartState: function() {
        var me = this;
        me.wfContext = null;
        me.wfInstruction.update(me.dtStartInstruction);
        me.wfName.update(me.dtNoWorkflow);
        me.wfNextButton.setText(me.dtNextStep);
        me.wfPrevButton.setText(me.dtPreviousStep);
        me.wfNextButton.disable();
        me.wfPrevButton.disable();
    },
    setPausedState: function() {
        var me = this;
        me.wfNextButton.setText(me.dtResume);
        me.wfInstruction.update(me.dtPauseInstruction);
        me.wfPrevButton.disable();
        me.wfContext.statePaused = true;
    },
    isDeactivationPromptRequired: function() {
        var me = this;
        if (me.wfContext != null && me.wfContext.resume != true)  {
            return true;
        }
        else  {
            return false;
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
     * The number of stores to cache before destroying unused stores
     */
    storeCacheSize: 25,
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
    mainView: 'mainnavigationview',
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
    constructor: function(utils) {
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
    requires: [
        'Baff.utility.logger.Logger',
        'Baff.utility.storemanager.EntityStoreManager',
        'Baff.utility.versionmanager.VersionManager',
        'Baff.utility.usersecurity.UserSecurityManager',
        'Baff.utility.refdata.LocalRefDataProvider',
        'Baff.utility.refdata.RefDataManager',
        'Baff.utility.workflow.WorkflowManager',
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
        me.entityStoreManager = Ext.create('Baff.utility.storemanager.EntityStoreManager', {
            cacheSize: me.globals.storeCacheSize
        });
        me.versionManager = Ext.create('Baff.utility.versionmanager.VersionManager');
        me.userSecurityManager = Ext.create('Baff.utility.usersecurity.UserSecurityManager', {
            serviceRootUrl: me.globals.securityServiceRootUrl,
            defaultPermissions: me.globals.defaultPermissions
        });
        me.refDataManager = Ext.create('Baff.utility.refdata.RefDataManager', {
            serviceRootUrl: me.globals.refdataServiceRootUrl
        });
        me.localRefDataProvider = Ext.create('Baff.utility.refdata.LocalRefDataProvider');
        me.workflowManager = Baff.utility.workflow.WorkflowManager;
        me.logger = Ext.create('Baff.utility.logger.Logger', {
            enableInfo: me.getBuildProperty('$LOGGER_INFO$', me.globals.logInfo),
            enableDebug: me.getBuildProperty('$LOGGER_DEBUG$', me.globals.logDebug),
            enableError: me.getBuildProperty('$LOGGER_ERROR$', me.globals.logError)
        });
    },
    /**
     * Gets a build property
     * @param {String} property The property to get
     * @param {String} defaultValue The default value if it was not set
     */
    getBuildProperty: function(property, defaultValue) {
        if (property[0] == '$') {
            return defaultValue;
        } else {
            if (property == "true")  {
                return true;
            }
            else if (property == "false")  {
                return false;
            }
            else  {
                return property;
            }
            
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
 *  data entity.  However outside of the activity view it does not manage any other user interface components
 *  such as form and list panels; the subclasses referenced above support specific activity design patterns 
 *  and associated user interfaces.
 *  
 *  Client side version control is specified by default by setting {@link #useVersionManager}, with master
 *  version control set via {@link setVersionFromMaster} if not set on load by the service and/or version 
 *  checking on load by {@link #checkVersionOnView}, which is dependent on the version being set by the 
 *  service on load.
 *  
 *  If the activity processes a master entity it will inform other activites via the a {@link #masterentitychange}
 *  event, and if processes a mastered entity it will listen for this event and manage state accordingly.
 *  Likewise the activity may set context via {@link #contextSetterMap} and listen for context via 
 *  {@link #contextHandlerMap} in order to fliter entity retrieval, set {@link #contextListener} to listen for
 *  context accessible via {@link #getExternalContext},  and set {@link #dependentOnContext} to manage
 *  state accordingly. Set {@link #fireOnEntityChange} and {@link #listenForEntityChange} to send and handle
 *  entity changes.
 *  
 *  If managing a single entity record in a 1-1 relationship with another entity (@link #manageSingleRecord} is
 *  set to true, and if this is not 1-1 with the master then it may be necessary to apply a filter based on an externally
 *  provided entity id, set by passing in the entity in {@link #onActivateView} or by listening to entity change events.
 *  If the entity is provided directly via {@link #onActivateView} then a store is not necessary. 
 *  
 *  This class extends {Ext.app.ViewController}, however subclasses should generally not require to configure
 *  the superclass properties.
 *  
 */
Ext.define('Baff.app.controller.ActivityController', {
    extend: 'Ext.app.ViewController',
    requires: [
        'Baff.utility.Utilities'
    ],
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
     * Holds an externally set master entity set as a result of {@link #masterentitychange} event. 
     * @private 
     */
    extMasterEntity: null,
    /**
     * Holds an externally set entity set as a result of {@link #entitychange} event. 
     * @private 
     */
    extEntity: null,
    /**
     * Holds an externally set context list of name value pairs 
     * @readonly 
     */
    extContext: null,
    /**
     * Holds externally set entity context for activities managing a single record  
     * @private
     */
    entityFilter: false,
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
    dtAckTitle: 'Acknowledge',
    dtResponseFailMsg: "Server responded with code: ",
    dtWarningTitle: 'Warning',
    dtValidationErrorTitle: 'Validation Error',
    dtContinue: " ....Continue ?",
    dtSystemErrorTitle: 'System Error',
    dtSystemError: 'A system error has occurred',
    config: {
        /**
         * Placeholder to support activity management. Should be set to a unique identifer for the activity.
         * Set automatically by the view if not specified.
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
        * from the associated {@link Baff.app.view.ActivityView}
        */
        refreshButtonSelector: '',
        /**
        * Specifies if this activity only acts on a single entity record, e.g. in a 1-1 relationship with a master entity
        * or if the entity is provided directly via {@link #onActivateView} or entity identifiers to filter the store on
        * are provided via an {@link #entitychange} event.
        */
        manageSingleRecord: false,
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
        ackRemoveMessage: "Delete successful",
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
    * Sets {@link #ID}, {@link #identifier}, {@link #activityView} and {@link #entityModel}.
    */
    init: function() {
        var me = this;
        me.callParent(arguments);
        // Set the unique id for this instance and the identifier
        me.ID = Ext.id(me, "AC");
        me.identifier = me.self.getName() + "-" + me.ID;
        Utils.logger.info("ActivityController[" + this.identifier + "]::init");
        // Get the view and entity model
        me.activityView = me.getView();
        me.entityModel = Ext.ClassManager.get(me.getModelSelector());
        // Set the context map
        me.extContext = new Ext.util.HashMap();
        me.filterContext = new Ext.util.HashMap();
        // Determine if dependent on a master entity
        if (me.getDependentOnMaster() == null) {
            // Not set by subclass
            if (me.entityModel.isMasterEntity()) {
                me.setDependentOnMaster(false);
            } else {
                me.setDependentOnMaster(true);
            }
        }
        // Setup based on global settings
        if (me.getUseVersionManager() == null)  {
            me.setUseVersionManager(Utils.globals.useVersionManager != null ? Utils.globals.useVersionManager : true);
        }
        
        if (me.getCheckVersionOnView() == null) {
            // Always check version for master entities
            if (me.entityModel.isMasterEntity())  {
                me.setCheckVersionOnView(true);
            }
            else  {
                me.setCheckVersionOnView(Utils.globals.checkVersionOnView != null ? Utils.globals.checkVersionOnView : false);
            }
            
        }
        if (me.getSetVersionFromMaster() == null) {
            // Dpn't set version for master entities
            if (me.entityModel.isMasterEntity())  {
                me.setSetVersionFromMaster(false);
            }
            else  {
                me.setSetVersionFromMaster(Utils.globals.setVersionFromMaster != null ? Utils.globals.setVersionFromMaster : true);
            }
            
        }
        if (me.getAutoRefreshOnLock() == null)  {
            me.setAutoRefreshOnLock(Utils.globals.autoRefreshOnLock != null ? Utils.globals.autoRefreshOnLock : true);
        }
        
        // Set listeners for entity view events
        me.addApplicationListeners();
        // Setup access rights
        me.setupAccessRights();
        // Launch the controller
        this.onLaunch();
    },
    /**
    * Sets up the view components to be controlled.  Disables the view if (@link dependentOnMaster}
    * is specified as true and the activity does not handle the master record itself.
    * Called on initialisation.  
    * Calls {@link #setup} if {@link #setupOnLaunch} is true.
    * @protected 
    */
    onLaunch: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onLaunch");
        var me = this;
        // Refresh Button
        var selector = me.getRefreshButtonSelector();
        if (selector === '')  {
            selector = me.activityView.getRefreshButton();
        }
        
        if (selector !== '') {
            me.refreshButton = me.lookupReference(selector);
            me.refreshButton.on('click', me.onRefreshButton, me);
        }
        if (me.getStoreSelector() == '')  {
            // No store 
            me.showWidget(me.refreshButton, false);
        }
        
        if (me.activityView.getDashlet())  {
            me.setReadOnly(true);
        }
        
        // Setup the view
        me.activityView.on('beforedestroy', me.beforeDestroy, me);
        me.manageViewState();
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
        if (updateRoles != null) {
            me.allowUpdate = Utils.userSecurityManager.isUserInRole(updateRoles);
        }
        if (me.allowUpdate == true)  {
            me.allowRead = true;
        }
        
    },
    /**
     * Manages the view state based on availablity of master entity and context if dependent on these as
     * specified by {@link #dependentOnMaster} and {@link #dependentOnContext}.
     * @protected
     */
    manageViewState: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]::manageViewState");
        var me = this;
        if ((!me.getDependentOnMaster() || me.isMasterSet()) && (!me.getDependentOnContext() || me.isContextSet()))  {
            me.activityView.enable();
        }
        else {
            me.activityView.enable();
            me.activityView.disable();
        }
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
    makeReadOnly: function(readonly) {},
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
        var domainView = me.findParentView();
        if (domainView != null) {
            var mainController = domainView.getController();
            // Listen to external master change events if dependent on a master
            if (me.getDependentOnMaster())  {
                domainView.on('masterentitychange', me.onMasterEntityChange, me);
            }
            
            // If handling a master entity then have the main controller subscribe to change events fired from
            // this controllers view
            if (me.entityModel.isMasterEntity() && me.getFireOnMasterChange()) {
                if (mainController != null)  {
                    me.activityView.on('masterentitychange', mainController.onMasterEntityChange, mainController);
                }
                
            }
            // Listen to external entity change events if specified
            if (me.getListenForEntityChange())  {
                domainView.on('entitychange', me.onEntityChange, me);
            }
            
            // If firing entity change then have the main controller subscribe to change events fired from
            // this controllers view
            if (me.getFireOnEntityChange()) {
                if (mainController != null)  {
                    me.activityView.on('entitychange', mainController.onEntityChange, mainController);
                }
                
            }
            // Listen to external context change events if specified
            if (me.getContextHandlerMap() != null || me.getContextListener())  {
                domainView.on('contextchange', me.onContextChange, me);
            }
            
            // If firing context change then have the main controller subscribe to change events fired from
            // this controllers view
            if (me.getContextSetterMap() != null) {
                if (mainController != null)  {
                    me.activityView.on('contextchange', mainController.onContextChange, mainController);
                }
                
            }
        }
    },
    /**
    * Destroys any store owned by this controller or removes the listeners to a shared store.  
    * Called by the framework before the view is destroyed.  
    * @protected
    */
    beforeDestroy: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]::beforeDestroy");
        var me = this;
        me.detachStore();
    },
    /**
    * Sets up the activity on activation / view if {@link #setupOnActivate} is true.  
    * Called by the framework when the view is activated (viewed). and may also be called directly, for example
    * by a parent controller handling a request to select an activity based on menu or dashboard selection.
    * @param {Baff.model.EntityModel) record An entity for the activity to process (may be specifically set to null)  
    * @protected
    */
    onActivateView: function(record) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onActivateView");
        var me = this;
        me.isActive = true;
        // Test if a null record was explicity set, rather than no record being provided
        if (record !== undefined && arguments.length > 0)  {
            me.updateEntityFilter(record, true);
        }
        
        if (me.getSetupOnActivate() && !me.activityView.isDisabled()) {
            var masterId = (record == null ? me.extMasterEntityId : null);
            me.setup(masterId, record);
        }
    },
    /**  
    * Called by the framework when view is deactivated.
    * @protected
    */
    onDeactivateView: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onDeactivateView");
        var me = this;
        me.isActive = false;
    },
    /**
    * Resets the activity and curent record, ensuring a data load  
    */
    reset: function() {
        this.currentRecord = null;
        this.dataRefresh = true;
        this.setup(this.extMasterEntityId);
    },
    /**
    * Sets up data management state, the entity store and initiates refresh if the state has changed.    
    * @param masterId The master entity identifier
    * @param {Baff.app.model.EntityModel} record The entity record to be operated on
    * @protected
    */
    setup: function(masterId, record) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::setup");
        var me = this;
        // Setup the master entity identifier
        if (!me.getDependentOnMaster()) {
            // Ignore master entity value for activities that are not dependent on a master entity
            masterId = me.masterEntityId = null;
        } else if (masterId == null) {
            if (record != null)  {
                masterId = record.getMasterEntityId();
            }
            
            if (masterId == null)  {
                masterId = me.masterEntityId;
            }
            
            if (masterId == null) {
                // If we don't have a master and we're dependent on one 
                // then check if we have a data integrity issue
                if (!me.checkDataIntegrity())  {
                    ;
                }
                
                return;
            }
        }
        // Check if effectively already setup
        // For forms with no store then the record must be provided so this will reset the current record
        if (masterId != me.masterEntityId || me.entityStore == null) {
            me.dataRefresh = true;
            // ensure a refresh
            if (masterId != me.masterEntityId) {
                me.masterEntityId = masterId;
                me.setCurrentRecord(null);
            }
            me.setupStore();
        }
        // Ensure a refresh if the record has changed 
        if (record != null && record != me.currentRecord)  {
            me.dataRefresh = true;
        }
        
        // Only refresh if something has changed or the store needs to be loaded
        if (me.dataRefresh) {
            // Set up the view based on user permissions and parameters
            me.setupAccessControl();
            // Do nothing if access is not permitted
            if (!me.isAccessAllowed())  {
                return;
            }
            
            // Hook to prepare activity prior to refresh - for example to apply further filters based on context
            // or the record provided
            me.prepareActivity(record);
            me.refresh(record);
        } else if (me.entityStore == null || !me.entityStore.isLoading()) {
            if (me.entityStore != null && !me.entityStore.hasLoadedData()) {
                me.refresh(record);
            } else {
                // Check any currently loaded version
                if (me.checkDataIntegrity())  {
                    if (me.checkVersionOnView(me.currentRecord))  {
                        ;
                    }
                    ;
                }
                
                me.setCurrentRecord(me.currentRecord);
            }
        }
    },
    // This will fire a context event
    /**
    * Sets up the {@link #entityStore} for this activity.  
    * @protected
    */
    setupStore: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]::setupStore");
        var me = this,
            id;
        // Detach any existing current store
        me.detachStore();
        if (me.getStoreSelector() == '')  {
            return;
        }
        
        // No store for this activity
        // If dependent on master and no master is set 
        // then won't be able to set the filters necessary to load the store
        if (me.getDependentOnMaster() && me.masterEntityId == null) {
            return;
        }
        // Get unique id for the store if a store owner
        if (me.getStoreOwner())  {
            id = me.ID;
        }
        else  {
            id = me.getSharedStoreId();
        }
        
        // This is null by default      
        // Get the store from the store manager
        me.entityStore = Utils.entityStoreManager.getStore(me.getStoreSelector(), id, me.masterEntityId, me.ID);
        if (me.entityStore == null) {
            Utils.logger.error("ActivityController[" + this.identifier + "]::setup failed to get store, " + me.getStoreSelector() + " ,owner= " + me.ID + " ,masterid= " + me.masterEntityId);
            return;
        }
        // Clear any existing field filters
        me.entityStore.clearFieldFilters();
        // Setup event handlers for store loads 
        me.entityStore.on('postfetch', me.onPostFetch, me);
        me.entityStore.on('flush', me.onStoreFlush, me);
        me.entityStore.getProxy().on('exception', me.onLoadException, me);
    },
    /**
    * Detaches the current {@link #entityStore} for this activity.  
    * @protected
    */
    detachStore: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]::detachStore");
        var me = this;
        if (me.entityStore != null) {
            me.entityStore.un('postfetch', me.onPostFetch, me);
            me.entityStore.un('flush', me.onStoreFlush, me);
            me.entityStore.getProxy().un('exception', me.onLoadException, me);
            Utils.entityStoreManager.detachStore(me.entityStore, me.ID);
        }
        me.entityStore = null;
    },
    /**
     * Override to prepare the activity post superclass setup and prior to any store refresh.
     * May be used to setup filters based on context or the input record.
     * @param {Baff.app.model.EntityModel} record The entity record provided for setup
     * @protected
     */
    prepareActivity: function(record) {},
    /**
    * Sets up context filters on the store if this activity responds to externally set context, including entity
    * filters if {@link #manageSingleRecord} is true.
    * @protected
    */
    refreshContextFilters: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]::refreshContextFilters");
        var me = this;
        if (me.entityStore == null)  {
            return;
        }
        
        me.activeContextFilters = new Array();
        // Try to add an entity id specific filter if managing a single entity
        if (me.getManageSingleRecord()) {
            var entityIdFilter = false;
            // Set the entity filter based on any record passed in            
            if (me.currentRecord != null) {
                entityIdFilter = me.currentRecord.getEntityId();
                // Ensure any explicit filter is synched with the record
                me.updateEntityFilter(me.currentRecord, false);
            }
            // If we have a filter explicitly set then use that
            // NB this will have been synched above with any record passed in
            if (me.entityFilter != false)  {
                entityIdFilter = me.entityFilter;
            }
            
            if (entityIdFilter == null) {
                // Should be adding a new record so need for a store 
                me.detachStore();
                return;
            } else if (entityIdFilter != false) {
                // We have an entity id to filter the store with 
                var filter = new Ext.util.Filter({
                        property: me.entityModel.getEntityIdProperty(),
                        value: entityIdFilter
                    });
                me.activeContextFilters.push(filter);
            }
        }
        // Proceed even if an entityIdFilter was not set, as the record may be in 1-1 relationship
        // with it's master, or we may just be selecting the first record in a list
        // Add any specific context filters
        if (me.filterContext != null) {
            me.filterContext.each(function(key, value) {
                var filter = new Ext.util.Filter({
                        property: key,
                        value: value
                    });
                me.activeContextFilters.push(filter);
            });
        }
        me.entityStore.setContextFilters(me.activeContextFilters);
    },
    /**
    * Refreshes the state of this activity, including reloading the store if there is one.  
    * @param {Baff.app.model.EntityModel} record The entity record to be operated on
    * @protected
    */
    refresh: function(record) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::refresh");
        var me = this;
        // If no record passed then use the current record
        // NB this will have been reset if the store was reset
        // Do this before checking if master loaded as this may return
        if (record == null)  {
            record = me.currentRecord;
        }
        
        me.setCurrentRecord(record);
        // Ensure any assocated master entity is loaded
        // NB if it is null and the activity is dependent on a master this is subject to a DI check during setup
        if (me.getUseVersionManager() && me.getDependentOnMaster() && me.masterEntityId != null) {
            if (me.entityStore == null)  {
                // At this stage most activities should have a store
                Utils.versionManager.on('masterload', me.onMasterLoad, me);
            }
            
            if (Utils.versionManager.getMaster(me.entityModel.getMasterEntityType(), me.masterEntityId) == null)  {
                return;
            }
            
            // Don't proceed if a valid master is not present - it will be attempted to be loaded, triggering a flush/load event
            Utils.versionManager.un('masterload', me.onMasterLoad, me);
        }
        // Setup context filters on the store
        me.refreshContextFilters();
        // Now everything is refreshed
        me.dataRefresh = false;
        // Load the store  
        if (me.entityStore != null) {
            if (me.entityStore.hasLoadedData()) {
                me.onStoreFirstLoaded();
            } else {
                me.showWaitMask(true);
                me.entityStore.load();
            }
        } else {
            me.refreshWithNoStore(record);
        }
    },
    /**
     * Handles a master load event
    * @param {String} type The master type
    * @param {String} id The master id
    * @param {boolean} invalid indicates if the master is valid
    * @protected
     */
    onMasterLoad: function(type, id, invalid) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onMasterLoad");
        var me = this;
        if (me.entityStore == null && type == me.entityModel.getMasterEntityType() && id == me.masterEntityId) {
            Utils.versionManager.un('masterload', me.onMasterLoad, me);
            me.onCacheUpdate(invalid);
        }
    },
    /**
    * Handles a store flush event
    * @param {Baff.app.model.EntityStore} store The store that has loaded
    * @param {boolean} invalid Indicates if the master asociated with the store is valid
    * @protected
    */
    onStoreFlush: function(store, invalid) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onStoreFlush");
        var me = this;
        me.onCacheUpdate(invalid);
    },
    /**
    * Handles a cache update informed via a store flush or master load event
    * @param {boolean} invalid Indicates if the related master is valid
    * @protected
    */
    onCacheUpdate: function(invalid) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onCacheUpdate");
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
    * Manages activity state following a refresh with no store (e.g. adding a master entity).  For use by sub classes.
    * @param {Baff.app.model.EntityModel} The entity record to be operated on
    * @protected
    */
    refreshWithNoStore: function(record) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::refreshWithNoStore");
        var me = this;
        me.setCurrentRecord(record);
        me.showWaitMask(false);
        if (me.checkDataIntegrity() == false)  {
            return;
        }
        
        var allowModify = (me.allowUpdate && !me.isReadOnly);
        me.prepareView(true, allowModify, null, null);
    },
    /**
    * Handles a store load event, which may be the initial data load, or a subsequent load as a result
    * of store buffer processing.  
    * @param {Baff.app.model.EntityStore} The store that has loaded
    * @param {String} response The raw data returned by the service
    * @param {boolean}firstLoad Indicates if this is the first load
    * @protected
    */
    onPostFetch: function(store, response, firstLoad) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onPostFetch, load state= " + firstLoad);
        var me = this;
        if (response.message != null)  {
            me.showAlertMessage(me.dtAckTitle, response.message);
        }
        
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
    onStoreFirstLoaded: function() {
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
    prepareView: function(isAfterRefresh, allowModify, record, recordAction) {},
    /**
    * Manages activity state following initial load of the store.  For subclasses to override.
    * @protected
    */
    onStoreFetchMore: function() {},
    /**
    * Handles an exception during a store load operation.
    * @param {Ext.data.proxy.Proxy} proxy The service proxy
    * @param {String} response The raw data returned by the service
    * @param {Ext.data.operation.Operation} operation The proxy operation
    * @protected
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
        if (me.activityView.isHidden())  {
            return;
        }
        
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
    * @param {Baff.app.model.EntityModel} record The entity record being 
    * @param {boolean} fireContext Indicates to fire context even if there is no change (defaults to true)
    * @fires masterentitychange
    * @fires entitychange
    * @fires contextchange
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
        if (fireContext)  {
            me.fireContextEvent(record);
        }
        
        if (fireEntityChange) {
            if (me.entityModel.isMasterEntity() && me.getFireOnMasterChange())  {
                me.fireViewEvent('masterentitychange', me, record, me.entityModel.getName());
            }
            
            if (me.getFireOnEntityChange())  {
                me.fireViewEvent('entitychange', me, record, me.entityModel.getName());
            }
            
        }
    },
    /** 
    * Gets {@link #currentRecord}.
    * @return {Baff.app.model.EntityModel}
    */
    getCurrentRecord: function() {
        return this.currentRecord;
    },
    /**
     * Sets context and fires the event event
     * @param {context} either the context name or a HashMap containing context
     * @param {value} the context value if a name was specified for the first parameter
     * @fires contextchange
     */
    setContext: function(context, value) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::setContext");
        var me = this;
        if (me.getContextSetterMap() == null) {
            // Need to set the listener
            var domainView = me.findParentView();
            if (domainView != null) {
                var mainController = domainView.getController();
                if (mainController != null)  {
                    me.activityView.on('contextchange', mainController.onContextChange, mainController);
                }
                
            }
            me.setContextSetterMap([]);
        }
        var contextMap = context;
        if (typeof context != "object") {
            contextMap = new Ext.util.HashMap();
            contextMap.add(context, value);
        }
        me.fireViewEvent('contextchange', me, contextMap);
    },
    /**
    * Fires a {@link #contextchange} event if required.
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @param {Object} contextSetterMap A context map to use if different from configuration
    * @fires contextchange
    * @protected
    */
    fireContextEvent: function(record, contextSetterMap) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::fireContextEvent");
        var me = this;
        if (contextSetterMap == null)  {
            contextSetterMap = me.getContextSetterMap();
        }
        
        if (contextSetterMap != null) {
            var context = new Ext.util.HashMap();
            Ext.Array.each(contextSetterMap, function(item) {
                var contextValue = null;
                if (record != null)  {
                    contextValue = record.get(item.fieldName);
                }
                
                context.add(item.contextMap, contextValue);
            });
            me.fireViewEvent('contextchange', me, context);
        }
    },
    /**
    * Refreshes the activity and associated data.   
    * Called when the refresh button is clicked.
    * @protected    
    */
    onRefreshButton: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onRefreshButton");
        var me = this;
        me.setCurrentRecord(null);
        me.refreshCache();
    },
    /**
    * Initiates refresh of the client data cache via {@link Utils #versionManager} if 
    * {@link useVersionManager} is true. 
    * Note that this will result in a refresh on any active activities when the store is flushed.
    * @param {Baff.app.model.EntityModel} record The entity record that was updated
    * @param {Baff.app.model.EntityModel} master The new master entity record
    * @protected
    */
    refreshCache: function(record, master) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::refreshCache");
        var me = this;
        var setup = false;
        // Set the wait mask if we will be waiting for store flush
        if (me.entityStore != null) {
            me.showWaitMask(true);
        }
        if (me.getUseVersionManager()) {
            // Get the master type
            var type = me.getMasterType(record);
            if (type != null) {
                // Get the master id - if dealing with a master entity and record is null then will return null
                var id = me.getMasterId(record);
                Utils.versionManager.refreshData(type, id, master);
            } else if (me.entityStore != null) {
                me.entityStore.flush();
            }
        } else if (me.entityStore != null) {
            me.entityStore.flush();
        }
        // If no store then setup - if there is a store then above flush will trigger setup
        if (me.entityStore == null)  {
            me.setup();
        }
        
    },
    /**
    * Checks the version of the entity record loaded is consistent with the client data cache via 
    * {@link Utils #versionManager} if {@link useVersionManager} and {@link checkVersionOnView} 
    * are both true.  This is dependent on the version being set by the service on entity load.
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @param {boolean}
    * @protected
    */
    checkVersionOnView: function(record) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::checkVersionOnView");
        var me = this;
        // Only process an failure if definetely false
        if (me.checkVersion(record) == false) {
            me.processOpLock(record, me.OPERATION.LOAD);
            return false;
        }
        return true;
    },
    /**
    * Checks the version of the entity record loaded is consistent with the client data cache via 
    * {@link Utils #versionManager} if {@link useVersionManager} is true. 
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @return {boolean} or null if not determined
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
                if (masterVer == null)  {
                    return null;
                }
                
                if (recVer !== masterVer)  {
                    return false;
                }
                else  {
                    return true;
                }
                
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
        if (me.getUseVersionManager() && me.getDependentOnMaster() && !me.entityModel.isMasterEntity()) {
            if (Utils.versionManager.getMaster(me.entityModel.getMasterEntityType(), me.masterEntityId) == null) {
                Utils.logger.error("ActivityController[" + this.identifier + "]::checkDataIntegrity - failed for type= " + me.entityModel.getMasterEntityType() + " , id= " + me.masterEntityId);
                var domainView = me.findParentView();
                domainView.fireEvent('dataintegrityissue', me);
                if (me.getView().isFloating())  {
                    me.getView().close();
                }
                
                return false;
            }
        }
        return true;
    },
    /**
    * Handles an external change to the master data entity as a result of the {@link #masterentitychange} 
    * event if {@link #dependentOnMaster} is true.
    * @param {Baff.app.controller.ActivityController} controller The activity controller that fired the event
    * @param {Baff.app.model.EntityModel} master The master entity record that has been selected
    * @param {String} type The master entity type
    * @protected
    */
    onMasterEntityChange: function(controller, master, type) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onMasterEntityChange");
        var me = this;
        // Check if should handle this event
        if (controller == me || !me.getDependentOnMaster() || me.entityModel.getMasterEntityType() != type)  {
            return;
        }
        
        if (me.entityModel.getEntityType() == type) {
            me.updateEntityFilter(master, true);
        }
        me.extMasterEntity = master;
        if (master == null)  {
            me.extMasterEntityId = null;
        }
        else  {
            me.extMasterEntityId = master.getEntityId();
        }
        
        me.manageViewState();
        if (me.masterEntityId != me.extMasterEntityId) {
            me.dataRefresh = true;
            me.setCurrentRecord(null);
            if (me.isActive && !me.activityView.isDisabled())  {
                me.setup(me.extMasterEntityId);
            }
            
        }
    },
    /**
    * Determines if the master has been set.
    * @return {boolean}
    */
    isMasterSet: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]::isMasterSet");
        var me = this;
        return (me.extMasterEntityId != null);
    },
    /**
    * Handles an external change to the the activity as a result of the {@link #entitychange} 
    * event if {@link #listenForEntityChange} is true.
    * Should be overridden by the subclass if required (bear in mind the entity passed in may be a phantom).
    * @param {Baff.app.controller.ActivityController} controller The activity controller that fired the event
    * @param {Baff.app.model.EntityModel} entity The entity record that has been selected or changed.
    * @param {String} type The entity type
    * @protected
    */
    onEntityChange: function(controller, entity, type) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onEntityChange");
        var me = this;
        me.extEntity = entity;
        if (controller != me && type == me.entityModel.getEntityType()) {
            me.updateEntityFilter(entity, true);
            if (me.dataRefresh && me.isActive && !me.activityView.isDisabled())  {
                me.setup(me.extMasterEntityId, entity);
            }
            
        }
    },
    /**
     * Updates the filter for a single entity if {@link #manageSingleRecord} is true.
     * @param {Baff.model.EntityModel} entity The external entity to filter on
     * @param {boolean} isExternal If the update was provided externally
     */
    updateEntityFilter: function(entity, isExternal) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::updateEntityFilter");
        var me = this;
        // Only set the filter for activities managing single entities and 
        // if the filter is being or has been set externally (so we know it is required)
        if (me.getManageSingleRecord() && (isExternal || me.entityFilter != false)) {
            var entityId = (entity != null ? entity.getEntityId() : null);
            var currentEntityId = (me.currentRecord != null ? me.currentRecord.getEntityId() : null);
            if (me.getDependentOnMaster())  {
                me.extMasterEntityId = (entity != null ? entity.getMasterEntityId() : me.extMasterEntityId);
            }
            
            me.entityFilter = entityId;
            if (entityId != currentEntityId || me.masterEntityId != me.extMasterEntityId) {
                me.dataRefresh = true;
                me.setCurrentRecord(null);
                me.manageViewState();
            }
        }
    },
    /**
    * Handles an external change to the activity as a result of the {@link #contextchange} event.
    * @param {Baff.app.controller.ActivityController} controller The activity controller that fired the event.
    * @param {HashMap} context The context that has been changed.
    * @protected
    */
    onContextChange: function(controller, context) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onContextChange");
        var me = this;
        if (me == controller)  {
            return;
        }
        
        // Check if this context is relevant
        var contextMap = me.getContextHandlerMap();
        var hasChanged = false;
        context.each(function(key, value) {
            me.extContext.add(key, value);
            Ext.Array.each(contextMap, function(item) {
                if (key == item.contextMap)  {
                    if (me.changeContext(item.fieldName, value))  {
                        hasChanged = true;
                    }
                    ;
                }
                
            });
        });
        me.manageViewState();
        if (hasChanged && me.getResetOnContextChange()) {
            me.dataRefresh = true;
            me.setCurrentRecord(null);
            if (me.isActive && !me.activityView.isDisabled())  {
                me.setup(me.extMasterEntityId);
            }
            
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
    * Sets internal filtering context {@link #filterContext}.  
    * @param {String} fieldName The field associated with the context
    * @param {Objectl} value The value of the context
    * @return {boolean} If the context has changed
    * @protected
    */
    changeContext: function(fieldName, value) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::changeContext");
        var me = this;
        var hasChanged = false;
        var currentValue = me.filterContext.get(fieldName);
        if (value !== null && value != '') {
            if (value != currentValue) {
                me.filterContext.add(fieldName, value);
                hasChanged = true;
            }
        } else {
            // Don't put null values into filter context, but check if we are changing  the context  
            if (currentValue != null) {
                me.filterContext.removeAtKey(fieldName);
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
    prepareRecord: function(operationType, record) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::prepareRecord");
        var me = this;
        // Set the action code
        if (operationType == me.OPERATION.SAVE)  {
            record.setActionCode(me.getDefaultSaveActionCode());
        }
        else if (operationType == me.OPERATION.REMOVE)  {
            record.setActionCode(me.getDefaultRemoveActionCode());
        }
        
        if (me.getUseVersionManager() && me.getSetVersionFromMaster()) {
            var id = me.getMasterId(record);
            var type = me.getMasterType(record);
            var masterVersion = Utils.versionManager.getVersion(type, id);
            // Only set the version if it is not already set (by the service on load) 
            // and we have a valid master version
            if (masterVersion != null && record.getVersion() == null)  {
                record.setVersion(masterVersion);
            }
            
        }
        // Set the username
        if (Utils.userSecurityManager != null && Utils.userSecurityManager.getUserName() != null)  {
            record.setParam("username", Utils.userSecurityManager.getUserName());
        }
        
        // Set the entityId
        record.setParam("entityId", record.getEntityId());
    },
    /**
    * Executes a save operation, which will send the request to the server via the 
    * {@link Baff.app.model.EntityModel}'s proxy.
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @protected
    */
    saveExec: function(record) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::saveExec");
        var me = this;
        me.showWaitMask(true);
        record.save({
            scope: me,
            success: me.saveRecordSuccess,
            failure: me.saveRecordFail
        });
    },
    /**
    * Following a successful record save
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @param {Ext.data.operation.Operation} operation The proxy operation
    * @protected
    */
    saveRecordSuccess: function(record, operation) {
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
    saveRecordFail: function(record, operation) {
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
    saveSuccess: function(record, response) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::saveSuccess");
        var me = this;
        me.showWaitMask(false);
        // Acknowledge
        if (me.getAckSave() || response.message != null) {
            var message = me.getAckSaveMessage();
            if (response.message != null)  {
                message = response.message;
            }
            
            me.showAlertMessage(me.dtAckTitle, message);
        }
        // Set the current record
        me.setCurrentRecord(record);
        me.updateEntityFilter(record, false);
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
            failure: me.removeRecordFail
        });
    },
    /**
    * Following a successful record remove
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @param {String} response The Json encoded response
    * @protected
    */
    removeRecordSuccess: function(record, operation) {
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
    removeRecordFail: function(record, operation) {
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
            if (response.message != null)  {
                message = response.message;
            }
            
            me.showAlertMessage(me.dtAckTitle, message);
        }
        // Set the current record
        me.setCurrentRecord(null);
        me.updateEntityFilter(null, false);
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
    onRecordUpdate: function(operationType, record, master) {
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
                if (opResponse != null && opResponse.status != me.HTTP_RESPONSE_OK)  {
                    message = me.dtResponseFailMsg + opResponse.status + " (" + opResponse.statusText + ")";
                }
                
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
        if (response.message !== null) {
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
    * @param response The raw data returned by the service
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
            if (me.getAutoRefreshOnLock())  {
                msg = me.getMsgAckOptLockRefresh();
            }
            else  {
                msg = me.getMsgAckOptLock();
            }
            
            me.showAlertMessage(me.dtWarningTitle, msg);
            if (me.getAutoRefreshOnLock()) {
                // This will invoke a refresh on any active views when the store is flushed
                me.setCurrentRecord(null);
                me.refreshCache();
            }
            me.procOpLock = false;
        } else {
            if (Utils.globals.application != null)  {
                Utils.globals.application.fireEvent('systemfailure');
            }
            
        }
    },
    /**
    * Handles a system error by prompting the user and firing a {@link #systemfailure} event.
    * @param response The raw data returned by the service
    * @param {Baff.app.model.EntityModel} record The entity record that was processed
    * @param {String} operationType The type of operation being performed defined by {@link #OPERATION}
    * @protected
    * @fires systemfailure
    */
    processSystemFailure: function(message) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::processSystemFailure");
        var me = this;
        if (message == null || message == '') {
            message = me.dtSystemError;
        }
        // Only other result supported by the framework is system error
        me.showAlertMessage(me.dtSystemErrorTitle, message, function() {
            if (Utils.globals.application != null)  {
                Utils.globals.application.fireEvent('systemfailure');
            }
            
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
        if (widget == null)  {
            return;
        }
        
        if (enable == null || enable == true)  {
            widget.enable();
        }
        else  {
            widget.disable();
        }
        
    },
    /**
    * Helper method for showing view elements.
    * This can also be overriddent to synchronize showing of widgets.
    * @param {Ext.Widget} widget The widget to be updated
    * @param {boolean} [show="false"]
    * @protected
    */
    showWidget: function(widget, show) {
        if (widget == null)  {
            return;
        }
        
        if (show == null || show == true)  {
            widget.show();
        }
        else  {
            widget.hide();
        }
        
    },
    /**
    * Displayes a pop-up window and sets it's context etc.
    * @param {String} popupselector  The widget type of the popup
    * @return {Baff.app.view.ActivityView} popup A reference to the popup if previously obtained
    * @param {Baff.app.model.EntityModel} record A record to passed to {@link Baff.app.controller.ActivityController #onEntityChange}
    * @return {Baff.app.view.ActivityView} The popup
    * @protected
    */
    showPopup: function(popupselector, popup, record) {
        var me = this;
        var popup = null;
        var mainController = me.activityView.domainController;
        if (mainController == null) {
            var domainView = me.findParentView();
            if (domainView != null)  {
                mainController = domainView.getController();
            }
            
        }
        if (mainController != null)  {
            popup = mainController.showPopup(popupselector, popup, record);
        }
        
        if (popup != null)  {
            me.isActive = false;
        }
        
        return popup;
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
    */
    setAccessRights: function(allowRead, allowUpdate) {
        this.allowRead = false;
        this.allowUpdate = false;
        if (allowRead == true) {
            this.allowRead = true;
            if (allowUpdate == true)  {
                this.allowUpdate = true;
            }
            
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
    showWaitMask: function(show) {
        var me = this;
        if (!me.getView().isFloating() && Utils.globals.viewport != null) {
            Utils.globals.viewport.showWaitMask(show, me.ID);
        } else {
            if (show)  {
                me.getView().setLoading(me.dtLoading);
            }
            else  {
                me.getView().setLoading(false);
            }
            
        }
    },
    /**
     * Displays an alert message
     * @param {String} title
     * @param {String} message
     * @param {Function} a function to be called on message close
     * @protected
     */
    showAlertMessage: function(title, message, callback) {
        if (Utils.globals.viewport != null)  {
            Utils.globals.viewport.showAlertMessage(title, message, callback);
        }
        else  {
            Ext.Message.alert(title, message, callback);
        }
        
    },
    /**
    * Helper to determine the master entity type for a given entity record.
    * @param {Baff.app.model.EntityModel} record The entity record to be queried
    * @return {String} The master type
    * @protected
    */
    getMasterType: function(record) {
        var me = this;
        var type = null;
        if (record != null)  {
            type = record.getMasterEntityType();
        }
        
        if (type == null || type == '')  {
            if (me.entityModel != null)  {
                type = me.entityModel.getMasterEntityType();
            }
            ;
        }
        
        if (type == '')  {
            type = null;
        }
        
        return type;
    },
    /**
    * Helper to determine the master entity identifier for a given entity record.
    * @param {Baff.app.model.EntityModel} record The entity record to be queried
    * @return {String} The master identifier
    * @protected
    */
    getMasterId: function(record) {
        var me = this;
        var id = null;
        if (record != null)  {
            id = record.getMasterEntityId();
        }
        
        if (id == null || id == '')  {
            id = me.masterEntityId;
        }
        
        if (id == '')  {
            id = null;
        }
        
        return id;
    },
    /**
     * Finds the parent of this activity's view
     * @return The parent view
     */
    findParentView: function() {
        var me = this;
        return me.activityView.findParentView();
    }
});

/**
 *  A Base Domain Controller provides the foundation for the general {@link Baff.app.controller.DomainController} 
 *  as well as for the more specific {@link Baff.app.controller.DashboardController}.
 *  It provides common processing for managing the domain view and relaying context, however does not provide
 *  underlying domain / activity view management.  Refer to the relevant sub-class documentation for more details.
 */
Ext.define('Baff.app.controller.BaseDomainController', {
    extend: 'Ext.app.ViewController',
    requires: [
        'Baff.utility.Utilities'
    ],
    alias: 'controller.basedomain',
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
     * The title originally specified on the entity view
     * @readonly 
     */
    originalTitle: null,
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
    dtLoading: "Please wait....",
    dtAckTitle: 'Acknowledge',
    dtDataIntegrityIssue: 'Data integrity issue detected...',
    dtContinueWithoutSavingMsg: "Continue without saving changes ?",
    dtConfirmTitle: 'Confirm',
    config: {
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
        titleLength: 20,
        /**
        * Specifies if the original title specified in the view configuration should be included in the
        * re-formatted title
        */
        includeOriginalTitle: true,
        /**
        * The title ext to display for a new record or if no record selected
        */
        newTitle: '',
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
         * Defaults to false; even through context may be set more broadly careful setup is required to avoid 
         * execssive context handling; if set to true then consider specifiing context fields in {@link cascadeContextFields}
         */
        cascadeContext: false,
        /**
         * Specifies an array of context fields to relay if cascaded, e.g. ['contextA', 'contextB', ... ]
         * Defaults to null in which case all context will be relayed
         */
        cascadeContextFields: null,
        /**
         * Specifies if entity change events should be cascaded to this domain from parent domain controller
         * Defaults to false.
         */
        cascadeEntity: false
    },
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
    */
    init: function(application) {
        var me = this;
        // Set the unique id for this instance and the identifier
        me.ID = Ext.id(this, "DC");
        me.identifier = me.self.getName() + "-" + me.ID;
        Utils.logger.info("BaseDomainController[" + this.identifier + "]:init");
        // Get the view and setup listeners
        me.domainView = me.getView();
        me.originalTitle = me.domainView.getTitle();
        // Setup context
        me.currentContext = new Ext.util.HashMap();
        me.domainView.on('dataintegrityissue', me.onDataIntegrityIssue, me);
        // Setup access rights
        me.setupAccessRights();
        me.setupAccessControl();
        // Get parent view
        var parentView = me.findParentView();
        if (parentView != null) {
            // Listen to change events from the parent
            if (me.getCascadeMasterEntity())  {
                parentView.on('masterentitychange', me.onMasterEntityChange, me);
            }
            
            if (me.getCascadeContext())  {
                parentView.on('contextchange', me.onContextChange, me);
            }
            
            if (me.getCascadeEntity())  {
                parentView.on('entitychange', me.onEntityChange, me);
            }
            
        }
    },
    /**
     * Enables or disables the view based on underlying activity view state
     * @protected
     */
    manageViewState: function() {},
    /**
    * Sets up access rights based on user permissions.  User permissions obtained from 
    * {@link Baff.utility.Utilities #userSecurityManager} are tested against the {@link accessRoles} specified..  
    * Sets {@link allowAccess} accordingly.  
    * Called during initialisation.
    * @protected
    */
    setupAccessRights: function() {
        Utils.logger.info("BaseDomainController[" + this.identifier + "]::setupAccessControl");
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
        Utils.logger.info("BaseDomainController[" + this.identifier + "]:setupAccessControl");
        var me = this;
        if (!me.allowAccess) {
            me.domainView.disable();
            me.domainView.hide();
            Utils.logger.info("BaseDomainController[" + this.identifier + "]:setupAccessControl - access not allowed");
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
    removeDisallowedChildren: function(selector) {
        Utils.logger.info("BaseDomainController[" + this.identifier + "]:removeChildren");
        var me = this;
        var children = Ext.ComponentQuery.query(selector, me.domainView);
        Ext.Array.each(children, function(child, index) {
            if (!child.getController().isAccessAllowed() || !me.allowAccess) {
                child.hide();
            }
        });
    },
    /**
    * Handle a data integrity issue, default behaviour is to select the first tab, so override if required
    * @protected
    */
    onDataIntegrityIssue: function(controller) {
        Utils.logger.info("BaseDomainController[" + this.identifier + "]:onDataIntegrityIssue");
        var me = this;
        Ext.Msg.alert(me.dtAckTitle, me.dtDataIntegrityIssue, function() {
            if (Utils.globals.application != null)  {
                Utils.globals.application.fireEvent('systemfailure');
            }
            
        });
    },
    /**
    * Handles a change to the master data entity as a result of the {@link #masterentitychange} 
    * event. Sets the tab title, stores the master if {@link #useVersionManager} is true, and relays 
    * the event to underlying activity controllers.
    * @param {Baff.app.controller.ActivityController} controller The activity controller that fired the event
    * @param {Baff.app.model.EntityModel} master The master entity record that has been selected
    * @param {Baff.app.controller.DomainController} controller The domain controller that relayed the event
    * @param {String} type The master entity type
    * @protected
    */
    onMasterEntityChange: function(controller, record, type, relayController) {
        Utils.logger.info("BaseDomainController[" + this.identifier + "]:onMasterEntityChange");
        var me = this;
        me.currentMasterEntity = record;
        me.currentMasterEntityType = type;
        // Set the tab title
        me.setTitleFromRecord(record, type);
        // Relay the event
        me.fireViewEvent('masterentitychange', controller, record, type, me);
        me.manageViewState();
    },
    /**
    * Handles a change to a data entity as a result of the {@link #entitychange} 
    * event. 
    * @param {Baff.app.controller.ActivityController} controller The activity controller that fired the event
    * @param {Baff.app.model.EntityModel} entity The entity record that has been selected
    * @param {String} type The entity type
    * @param {Baff.app.controller.DomainController} controller The domain controller that relayed the event
    * @protected
    */
    onEntityChange: function(controller, record, type, relayController) {
        Utils.logger.info("BaseDomainController[" + this.identifier + "]:onEntityChange");
        var me = this;
        // Set the tab title
        me.setTitleFromRecord(record, type);
        // Relay the event
        me.fireViewEvent('entitychange', controller, record, type, me);
        me.manageViewState();
    },
    /**
    * Handles a change to a context as a result of the {@link #contextchange} 
    * event. 
    * @param {Baff.app.controller.ActivityController} controller The activity controller that fired the event
    * @param {Baff.app.model.EntityModel} context The context that has been changed
    * @param {Baff.app.controller.DomainController} controller The domain controller that relayed the event
    * @protected
    */
    onContextChange: function(controller, context, relayController) {
        Utils.logger.info("BaseDomainController[" + this.identifier + "]:onContextChange");
        var me = this;
        var relayContextMap = null;
        var relayContext = context;
        if (relayController != null && me.getCascadeContextFields() != null) {
            relayContextMap = me.getCascadeContextFields();
            relayContext = new Ext.util.HashMap();
        }
        // Set the context property
        context.each(function(key, value) {
            var relay = true;
            if (relayContextMap != null) {
                if (Ext.Array.contains(relayContextMap, key))  {
                    relayContext.add(key, value);
                }
                else  {
                    relay = false;
                }
                
            }
            if (relay) {
                if (value !== null && value != '')  {
                    me.currentContext.add(key, value);
                }
                else  {
                    me.currentContext.removeAtKey(key);
                }
                
            }
        });
        // Relay the event
        if (relayContext.getCount() > 0)  {
            me.fireViewEvent('contextchange', controller, relayContext, me);
        }
        
        me.manageViewState();
    },
    /**
    * Gets extenernally set context from {@link #currentContext}
    * @param {String}  The context key
    * @return The context
    * @protected
    */
    getCurrentContext: function(fieldName) {
        Utils.logger.info("BaseDomainController[" + this.identifier + "]::getCurrentContext");
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
        Utils.logger.info("BaseDomainController[" + this.identifier + "]:setTitleFromRecord");
        var me = this;
        var selector = me.getTitleSelector();
        var entity = me.getTitleEntity();
        if (selector == null || entity == null || entity != type)  {
            return;
        }
        
        var title = '';
        var tooltip = '';
        if (me.getIncludeOriginalTitle())  {
            title = me.originalTitle;
        }
        
        if (record == null) {
            var newTitle = me.getNewTitle();
            if (newTitle != '')  {
                title += ": " + newTitle;
            }
            
        } else {
            var recordText = record.get(selector);
            var maxLength = me.getTitleLength();
            if (recordText.length > maxLength) {
                tooltip = recordText;
                recordText = recordText.substring(0, maxLength - 3) + "...";
            } else {
                recordText = recordText.substring(0, maxLength);
            }
            title += ":" + recordText;
        }
        me.domainView.setTitle(title);
        if (me.domainView.tab != null)  {
            me.domainView.tab.setTooltip(tooltip);
        }
        
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
    * Shows / hides the wait mask.
    * @param {boolean} [show="false"]
    * @protected
    */
    showWaitMask: function(show) {
        var me = this;
        if (Utils.globals.viewport != null) {
            Utils.globals.viewport.showWaitMask(show, me.ID);
        } else {
            if (show)  {
                me.getView().setLoading(me.dtLoading);
            }
            else  {
                me.getView().setLoading(false);
            }
            
        }
    },
    /**
     * Returns the parent of this controllers view - this should be a type of {@link Baff.app.view.DomainView} 
     * or else null if this controller manages the top level view.
     * @returns {Baff.app.view.DomainView}
     * @protected
     */
    findParentView: function() {
        var me = this;
        return me.domainView.findParentByType('domainview');
    },
    /**
     * Determine if de-activation prompt is required (overried for low-level domain views only
     * @returns {boolean}
     */
    isDeactivationPromptRequired: function() {
        return false;
    }
});

/**
 *  A Card Domain Controller controls a {@link Baff.app.view.CardView}, which manages a set of activity views
 *  in card layout, typically {@link Baff.app.view.FormView}s with a {@link Baff.app.view.TrreView} to select the
 *  entity to be managed in the form. 
 *  
 * A typical implementation is simply as follows, assuming that any user can access the dashboard and that its 
 * title is not selected from any particular entity record.  
 * 
 *     Ext.define('MyApp.controller.MyMainCardController', {
 *         extend: 'Baff.app.controller.CardController',           
 *         alias: 'controller.maincardcontroller',
 *          
 *     });
 *  
 */
Ext.define('Baff.app.controller.CardController', {
    extend: 'Baff.app.controller.BaseDomainController',
    requires: [
        'Baff.utility.Utilities'
    ],
    alias: 'controller.card',
    /**
    * The selector view, typically a {@link Baff.app.view.TreeView}
    * @private
    */
    selectorView: null,
    /**
     * The {Baff.app.view.CardView}
     * @private
     */
    cardView: null,
    /**
     * The currently selected card
     * @private
     */
    currentCard: 0,
    /**
    * Initialises the controller.    
    */
    init: function() {
        var me = this;
        me.callParent(arguments);
        me.selectorView = me.lookupReference(me.domainView.selectorViewRef);
        me.cardView = me.lookupReference(me.domainView.cardViewRef);
        // Set the card activities to listen to an fire entity change events and not reset on context change since
        // this controller will manage their state directly
        Ext.Array.each(me.cardView.getLayout().getLayoutItems(), function(card) {
            if (card.isXType('activityview')) {
                card.on('entitychange', me.onEntityChange, me);
                card.getController().setFireOnEntityChange(true);
                card.getController().setResetOnContextChange(false);
            }
        });
    },
    /**
    * Called by the framework to activate the activity.
    * Activates underlying activities.
    * @protected
    */
    onActivateView: function() {
        Utils.logger.info("CardController[" + this.identifier + "]::onActivateView");
        var me = this;
        // Activate sub views
        var currentCard = me.cardView.getLayout().getActiveItem();
        if (currentCard.isXType('activityview'))  {
            currentCard.getController().onActivateView();
        }
        
        if (me.selectorView != null)  {
            me.selectorView.getController().onActivateView();
        }
        
    },
    /**
    * Called by the framework to deactivate the activity.
    * Deactivates underlying activities. 
    * @protected
    */
    onDeactivateView: function() {
        Utils.logger.info("CardController[" + this.identifier + "]::onDeactivateView");
        var me = this;
        // Dectivate sub views
        if (me.selectorView != null)  {
            me.selectorView.getController().onDeactivateView();
        }
        
        var currentCard = me.cardView.getLayout().getActiveItem();
        if (currentCard.isXType('activityview'))  {
            currentCard.getController().onDeactivateView();
        }
        
    },
    /**
     * Override super class so as not to relay master entity change events to child activities.
     * @protected
     */
    onMasterEntityChange: function() {},
    // Do Nothing 
    /**
    * Handles a change to a data entity as a result of the {@link #entitychange} event. 
    * Activates the relevant card view.
    * @param {Baff.app.controller.ActivityController} controller The activity controller that fired the event
    * @param {Baff.app.model.EntityModel} record The entity record or{@link Baff.app.model.TreeModel} 
    * that has been selected
    * @param {String} type The entity type
    * @protected
    */
    onEntityChange: function(controller, record, type) {
        Utils.logger.info("CardController[" + this.identifier + "]:onEntityChange");
        var me = this;
        var currentCard = me.cardView.getLayout().getActiveItem();
        if (currentCard.isXType('activityview') && currentCard.getController() == controller) {
            // Need to sync as may have added a record
            // But don't sync if null - even if deleted a record then the selector should reset
            if (record != null) {
                me.setCurrentRecord(record, type);
                if (me.selectorView != null)  {
                    me.selectorView.getController().syncWithExternal(record);
                }
                
            }
        } else if (me.selectorView != null && me.selectorView.getController() == controller) {
            var node = null;
            if (record != null)  {
                node = record.isNodeEntity ? record : record.node;
            }
            
            if (!me.matchCurrentRecord(record, type) && me.isDeactivationPromptRequired()) {
                Ext.Msg.confirm(me.dtConfirmTitle, me.dtContinueWithoutSavingMsg, function(btn) {
                    if (btn == 'yes') {
                        me.setCurrentRecord(record, type);
                        //me.selectCard(record, type);
                        me.currentNode = node;
                        me.selectCard(type, record);
                    } else if (me.selectorView != null) {
                        me.selectorView.getController().syncWithExternal(me.currentNode);
                    }
                });
            } else {
                // Only update if the node is different, which may also be due to refresh
                if (me.currentNode != node) {
                    me.currentNode = node;
                    me.setCurrentRecord(record, type);
                    me.selectCard(type, record);
                }
            }
        }
    },
    /**
    * Set the current record
    * @param {Baff.app.model.EntityModel} record The entity record or{@link Baff.app.model.TreeModel} 
    * that has been selected
    * @param {String} type The entity type
    * @protected
    */
    setCurrentRecord: function(record, type) {
        var me = this;
        me.currentEntityId = (record == null ? null : record.getEntityId());
        // Make sure we are not holding an ailias
        var name = Ext.ClassManager.getNameByAlias(type);
        me.currentEntityType = (name != "" ? name : type);
    },
    /**
    * Checks if the provided record matches the current record
    * @param {Baff.app.model.EntityModel} record The entity record or{@link Baff.app.model.TreeModel} 
    * that has been selected
    * @param {String} type The entity type
    * @returns {Boolean}
    * @protected
    */
    matchCurrentRecord: function(record, type) {
        var me = this;
        var entityId = (record == null ? null : record.getEntityId());
        return (entityId == me.currentEntityId && type == me.currentEntityType);
    },
    /**
    * Selects and activates a card based on the record provided
    * @param {Baff.app.model.EntityModel} record The entity record or{@link Baff.app.model.TreeModel} 
    * that has been selected
    * @param {String} type The entity type
    * @protected
    */
    selectCard: function(type, record) {
        Utils.logger.info("CardController[" + this.identifier + "]:selectCard");
        var me = this;
        var currentCard = me.cardView.getLayout().getActiveItem();
        var cardViews = me.cardView.getLayout().getLayoutItems();
        var card = me.getCardForEntity(cardViews, type);
        if (currentCard.isXType('activityview'))  {
            currentCard.getController().onDeactivateView();
        }
        
        if (card == null)  {
            card = cardViews[0];
        }
        
        if (card.isXType('activityview')) {
            // If the record is an node then update the filters before calling onActivateView with no record
            // Otherwise we can pass the record directly
            if (record.isNodeEntity) {
                card.getController().updateEntityFilter(record, true);
                card.getController().onActivateView();
            } else {
                card.getController().onActivateView(record);
            }
        }
        me.cardView.getLayout().setActiveItem(card);
    },
    /**
     * Determines the card associated with an entity type
     * @param {Array} cardViews The array of {Baff.app.view.CardView}
     * @param {String} type The entity type
     * @returns {Baff.app.view.CardView}
     * @protected
     */
    getCardForEntity: function(cardViews, type) {
        Utils.logger.info("CardController[" + this.identifier + "]:getCardForEntity");
        var me = this;
        if (type == null || type == '')  {
            return null;
        }
        
        var card = null;
        Ext.Array.each(cardViews, function(view) {
            if (view.isXType('activityview') && view.getController().getModelSelector() == type) {
                card = view;
                return false;
            }
        });
        return card;
    },
    /**
    * Determines if the user should be prompted when the activity's view is de-activated / hidden.
    * @return {boolean}
    */
    isDeactivationPromptRequired: function() {
        var me = this;
        var currentCard = me.cardView.getLayout().getActiveItem();
        if (currentCard.isXType('activityview'))  {
            return currentCard.getController().isDeactivationPromptRequired();
        }
        else  {
            return false;
        }
        
    }
});

/**
 *  A Dashboard Controller controls a {@link Baff.app.view.DashboardView}that presents multiple read only
 *  activity 'dashlets'.
 *  
 * A typical implementation is simply as follows, assuming that any user can access the dashboard and that its 
 * title is not selected from any particular entity record.  
 * 
 *     Ext.define('MyApp.controller.MyMainDashboardController', {
 *         extend: 'Baff.app.controller.DashboardController',           
 *         alias: 'controller.maindashboardcontroller',
 *          
 *     });
 *     
 */
Ext.define('Baff.app.controller.DashboardController', {
    extend: 'Baff.app.controller.BaseDomainController',
    requires: [
        'Baff.utility.Utilities'
    ],
    alias: 'controller.dashboard',
    /**
    * Called by the framework to activate the activity.
    * Activates underlying activities.
    */
    onActivateView: function() {
        Utils.logger.info("DashboardController[" + this.identifier + "]::onActivateView");
        var me = this;
        // Activate sub views
        var views = Ext.ComponentQuery.query('activityview', me.domainView);
        Ext.Array.each(views, function(item) {
            item.getController().onActivateView();
        });
    },
    /**
    * Called by the framework to deactivate the activity.
    * Deactivates underlying activities. 
    */
    onDeactivateView: function() {
        Utils.logger.info("DashboardController[" + this.identifier + "]::onDeactivateView");
        var me = this;
        // Dectivate sub views
        var views = Ext.ComponentQuery.query('activityview', me.domainView);
        Ext.Array.each(views, function(item) {
            item.getController().onDeactivateView();
        });
    }
});

/**
 *  A DomainController controls a set of related activities, typically related to maintaining a master business 
 *  data entity, where each activity is controlled by a {@link Baff.app.controller.ActivityController}.  The
 *  DomainController controls a {@link Baff.app.view.DomainView}, which tabulates the various
 *  {@link Baff.app.view.ActivityView}s assocated with the activities.  The DomainController manages
 *  navigation and communication between activities.
 *   
 *  A DomainController can also control a set of other DomainControllers in order to define a hierarchical
 *  navigation structure for the application, for example:
 *  
 *  EntityNavigationController --> MultiDomainController --> MainDomainController
 *  
 *  where:
 *    
 *    - EntityNavigationController manages views for each entity type, e.g. Customer, Product, etc.    
 *    - MultipleDomainController manages views for different instances of the same entity type  
 *    - MainDomainController manages views for the activities relating to a specific entity instance    
 *                       
 * A typical implementation is as follows.  Only {@link #readRoles} need be specified, and {@link #titleSelector}
 * if the tab title should be based on a field of an entity record, along with a unique alias for the 
 * {@link Baff.app.view.DomainView} to reference.
 * 
 *     Ext.define('MyApp.controller.MyMainDomainController', {
 *         extend: 'Baff.app.controller.DomainController',           
 *         alias: 'controller.maindomaincontroller',
 *            
 *         config: {                      
 *             readRoles: ['myentity.read', 'myentity.update'],
 *             titleEntity: 'myentityname',
 *             titleSelector: 'myentityfield'
 *         }
 *         
 *    });
 * 
 * If a popup window is to be initially presented in order to select the master entity to be operated on 
 * then {@link #popupSelector} should specify the type.
 *                         
 * Higher level "Multi" and "Navigation" controllers do not require any specific configuration.  Also refer 
 * to the documentation for the associated {@link Ext.foundation.domainView}, which specifies 
 * configuration for user interface components this controller manages, including some specific 
 * configuration options for "Mutli" types. 
 * 
 * The domain controller defines workflows via {@link #workflows} and executes the associated steps
 * that are initiated by a {@link Baff.utility.workflow.WorkflowManager}.
 *  
 *  This class extends {Ext.app.ViewController}, however subclasses should generally not require to 
 *  configure the superclass properties.
 *  
 */
Ext.define('Baff.app.controller.DomainController', {
    extend: 'Baff.app.controller.BaseDomainController',
    requires: 'Baff.utility.Utilities',
    alias: 'controller.domain',
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
    dtWorkflowStoppedMsg: "Current workflow will be stopped",
    dtWorkflowStoppedContinueMsg: "Current workflow will be stopped, continue?",
    dtHideDashlet: 'Hide summary view',
    dtShowDashlet: 'Show summary view',
    config: {
        /**
        * The title text to display for a new record or if no record selected
        */
        newTitle: '',
        /**
        * Specifies the popup window widget type, e.g. a {@link Baff.app.view.SelectorPopup} that 
        * should be initially displayed in order to select the master entity.
        * If not set then any selector specified by the view will be used instead.
        */
        popupSelector: '',
        /**
         * Specifies workflows that this controller manages.  In the below example the first workflow
         * comprises two activities, and the second workflow two child workflows.
         *    
         *     workflows: [
         *          {workflow: "Workflow A", resume: true, replay: true, previous: true, steps: [
         *              {step: "Activity Foo", view: "fooactivityview", instruction: "Update foo"},
         *              {step: "Activity Bar", view: "baractivityview", instruction: "Update bar"},
         *              roles: [userRole]
         *          },
         *          {workflow: "Workflow B", visible: false, steps: [
         *              {step: "Workflow Foo", view: "foodomainview", newView: true},
         *              {step: "Worfklow Bar, view: "bardomainview}
         *          }
         *      ]
         * 
         * Workflow properties are:
         *  - resume: Allows the user to subsequently resume a worklfow after navigating away
         *  - replay: Will prompt the user to replay the workflow; this allows looping in child workflows
         *  - previous: Allows the user to go back, but only to the start of the current workflow
         *  - roles: A list of roles that can access this workflow; should be consistent with related activity access rights
         *  - visible: Set to false if not selectable, e.g. a child workflow only available via a parent; also can by set 
         *  dynamically by overrideing {@link #isWorkflowVisible}
         *  - steps: A sequence of steps, properties as follows:
         *  - step: the step name; if calling a child workfow then the step name should reference this
         *  - view: the related domain (for child workflow) or activity view
         *  - instruction: for an activity, the user instruction to be displayed
         *  - newView: only relevant for child workflows where the domain view has dynamic tab, so a new view will
         *  be used if possible 
         */
        workflows: null
    },
    /**
     * @event newtab
     * Fires when a new tab is to be created (refer to {@link Baff.app.view.DomainView} for
     * more details on how a new tab is configured)
     * @param {Ext.tab.Panel} view The "new tab" tab 
     */
    /**
    * Initialises the controller.    
    */
    init: function(application) {
        var me = this;
        me.callParent(arguments);
        me.domainView.on('beforetabchange', me.beforeTabChange, me);
        me.domainView.on('newtab', me.onNewTab, me);
        me.domainView.on('beforeclose', me.beforeClose, me);
        var selector = me.getPopupSelector();
        if (selector === '')  {
            me.setPopupSelector(me.domainView.getPopupSelector());
        }
        
        selector = me.domainView.getDashletSelector();
        if (selector != '') {
            if (me.domainView.getDashletDock() == 'popup') {
                me.dashlet = me.showPopup(selector, me.dashlet, null, false);
                if (me.domainView.getHideDashlet())  {
                    me.dashlet.hide();
                }
                
            } else {
                me.dashlet = me.lookupReference(selector);
            }
            if (me.domainView.getToggleDashlet()) {
                var iconCls = 'dash-open';
                var tooltip = me.dtShowDashlet;
                if (me.dashlet.isVisible()) {
                    iconCls = 'dash-close';
                    tooltip = me.dtHideDashlet;
                }
                me.domainView.tabBar.add({
                    xtype: 'tbfill'
                });
                me.toggleDashButton = me.domainView.tabBar.add({
                    iconCls: iconCls,
                    closable: false,
                    tooltip: tooltip,
                    handler: function() {
                        me.showDashlet();
                    },
                    scope: me
                });
            }
        }
        me.manageViewState();
        var parentView = me.findParentView();
        if (parentView == null && !me.domainView.getFromNew())  {
            me.activateView(me.domainView);
        }
        
    },
    /**
     * Eanbles or disables the view based on underlying activity view state
     * @protected
     */
    manageViewState: function() {
        Utils.logger.info("DomainController[" + this.identifier + "]::manageViewState");
        var me = this;
        if ((me.getPopupSelector() != '' && me.popupView == null) || !me.domainView.items.getAt(0).isDisabled() || !me.domainView.getActiveTab().isDisabled()) {
            if (me.domainView.isDisabled()) {
                me.domainView.enable();
                me.domainView.tabBar.setActiveTab(me.domainView.getActiveTab().tab);
            }
        } else {
            me.domainView.disable();
        }
    },
    /**
    * Sets up access to view components based on {@link #allowAccess}.
    * Called during initialisation.
    * @protected
    */
    setupAccessControl: function() {
        Utils.logger.info("DomainController[" + this.identifier + "]:setupAccessControl");
        var me = this;
        me.callParent(arguments);
        // Initialise workflows
        var workflows = me.getWorkflows();
        if (workflows != null) {
            for (i = 0; i < workflows.length; i++) {
                if (workflows[i].roles != null && !Utils.userSecurityManager.isUserInRole(workflows[i].roles))  {
                    workflows[i].isAllowed = false;
                }
                else  {
                    workflows[i].isAllowed = true;
                }
                
            }
        }
    },
    /**
    * Gets workflows based on user role
    * @protected
    */
    getAvailableWorkflows: function() {
        Utils.logger.info("DomainController[" + this.identifier + "]:setupWorkflow");
        var me = this;
        var workflows = me.getWorkflows();
        if (workflows != null) {
            for (i = 0; i < workflows.length; i++) {
                if (!workflows[i].isAllowed)  {
                    workflows[i].visible = false;
                }
                else  {
                    workflows[i].visible = me.isWorkflowVisible(workflows[i]);
                }
                
            }
        }
        return workflows;
    },
    /**
    * Override to setup custom workflow access control
    * Called during initialisation.
    * @protected
    */
    isWorkflowVisible: function(workflow) {
        return workflow.visible != false;
    },
    /**
    * Handle a data integrity issue, default behaviour is to select the first tab, so override if required
    * @protected
    */
    onDataIntegrityIssue: function() {
        Utils.logger.info("DomainController[" + this.identifier + "]:onDataIntegrityIssue");
        var me = this;
        // Reset and select the first tab; this should typically manage the master entity, otherwise 
        // this should be overridden as required
        Ext.Msg.alert(me.dtAckTitle, me.dtDataIntegrityIssue, function() {
            var firstTab = me.domainView.items.getAt(0);
            if (firstTab.isXType('activityview')) {
                firstTab.getController().reset();
            }
            me.changeTab(firstTab);
        });
    },
    /**
    * Called by the framework to activate the activity.
    * Activates underlying activities. Launches the pop-up window if {@link #popupSelector} is specified.
    * @protected
    */
    onActivateView: function() {
        Utils.logger.info("DomainController[" + this.identifier + "]:onActivateView");
        var me = this;
        // Set the title if lowest level
        if (me.domainView.getActiveTab() != null && me.isLowLevelView(me.domainView.getActiveTab()))  {
            me.setTitleFromRecord(me.currentMasterEntity);
        }
        
        // Get the popup and display it
        if (me.getPopupSelector() != '' && me.popupView == null) {
            me.popupView = me.showPopup(me.getPopupSelector(), me.popupView);
        } else {
            me.activateView(me.domainView.getActiveTab());
        }
    },
    /**
     * Shows or hides the dashlet
     * @param {boolean} Indicates to show or hide the dashlet, if null it will be toggled
     */
    showDashlet: function(show) {
        Utils.logger.info("DomainController[" + this.identifier + "]:showDashlet");
        var me = this;
        if (me.dashlet == null)  {
            return;
        }
        
        show = (show == null ? !me.dashlet.isVisible() : show);
        if (!show) {
            me.dashlet.hide();
            me.dashlet.getController().onDeactivateView();
            me.toggleDashButton.setIconCls('dash-open');
            me.toggleDashButton.setTooltip(me.dtShowDashlet);
        } else if (show) {
            me.dashlet.getController().onActivateView();
            me.dashlet.show();
            me.toggleDashButton.setIconCls('dash-close');
            me.toggleDashButton.setTooltip(me.dtHideDashlet);
        }
    },
    /**
    * Displayes a pop-up window and sets it's context etc.
    * @param {String} popupselector  The widget type of the popup
    * @param {Baff.app.view.ActivityView} popup A reference to the popup if previously obtained
    * @param {Baff.app.model.EntityModel} record A record to passed to {@link Baff.app.controller.ActivityController #onEntityChange}
    * @param {boolean} activateOnClose Whether to re-activate the underlying view on close (default to true)
    * @return {Baff.app.view.ActivityView} The popup
    * @protected
    */
    showPopup: function(popupselector, popup, record, activateOnClose) {
        Utils.logger.info("DomainController[" + this.identifier + "]:showPopup");
        var me = this;
        if (popup == null) {
            if (popupselector == me.domainView.getDashletSelector())  {
                popup = Ext.widget(popupselector, {
                    modal: false
                });
            }
            else  {
                popup = Ext.widget(popupselector);
            }
            
            if (popup == null) {
                Utils.logger.error("Failed to instansiate popup");
                return null;
            }
            // Listen to the popup events
            popup.on('masterentitychange', me.onMasterEntityChange, me);
            popup.on('contextchange', me.onContextChange, me);
            popup.on('beforeclose', me.closePopup, me);
            popup.on('close', function() {
                if (popup != me.dashlet)  {
                    popup.getController().onDeactivateView();
                }
                
                if (activateOnClose !== false)  {
                    me.onPopupClose();
                }
                
            }, me);
        }
        // Set popup
        popup.getController().onMasterEntityChange(me, me.currentMasterEntity, me.currentMasterEntityType);
        popup.getController().onContextChange(me, me.currentContext);
        popup.getController().onEntityChange(me, record, record != null ? record.self.getName() : null);
        // Display the popup
        popup.display(me);
        popup.getController().addApplicationListeners();
        return popup;
    },
    closePopup: function(popup) {
        Utils.logger.info("DomainController[" + this.identifier + "]:closePopup");
        var me = this;
        if (popup == me.dashlet) {
            me.showDashlet(false);
            return;
        }
        if (popup.getController().isDeactivationPromptRequired()) {
            Ext.Msg.confirm(me.dtConfirmTitle, me.dtContinueWithoutSavingMsg, function(btn) {
                if (btn == 'yes') {
                    popup.un('beforeclose', me.closePopup, me);
                    popup.close();
                    popup.on('beforeclose', me.closePopup, me);
                }
            });
            return false;
        }
        return true;
    },
    /**
    * Closes the entity view if the popup is closed and no activity views have been enabled.
    * @protected
    */
    onPopupClose: function() {
        Utils.logger.info("DomainController[" + this.identifier + "]:onPopupClose");
        var me = this;
        if (me.domainView.getActiveTab().isDisabled()) {
            me.domainView.close();
        } else {
            me.domainView.tabBar.setActiveTab(me.domainView.getActiveTab().tab);
            me.activateView(me.domainView.getActiveTab());
        }
    },
    /**
    * Called by the framework to deactivate the activity.
    * Deactivates underlying activities. 
    * @protected
    */
    onDeactivateView: function() {
        Utils.logger.info("DomainController[" + this.identifier + "]:onDeactivateView");
        var me = this;
        me.deactivateView(me.domainView.getActiveTab());
        if (me.dashlet != null)  {
            me.dashlet.getController().onDeactivateView();
        }
        
    },
    /**
    * Queries underlying activities to determine if the user should be prompted before closing.
    * Selects the tab to the left of this one on close.   
    * Called whe entity view is requested to be closed.  
    * @protected
    */
    beforeClose: function() {
        Utils.logger.info("DomainController[" + this.identifier + "]:beforeClose");
        var me = this;
        var parentView = me.findParentView();
        // Prompt the user if required
        var prompt = me.getDeactivationPrompt();
        if (prompt != "") {
            Ext.Msg.confirm(me.dtConfirmTitle, prompt, function(btn) {
                if (btn == 'yes') {
                    // Close the view - don't respond to close events whilst were doing it
                    me.domainView.un('beforeclose', me.beforeClose, me);
                    // Activate tab to the left of this one
                    parentView.getController().activateRelativeView(me.domainView, -1);
                    me.domainView.close();
                    me.domainView.on('beforeclose', me.beforeClose, me);
                }
            });
            return false;
        }
        // Activate tab to the left of this one
        parentView.getController().activateRelativeView(me.domainView, -1);
        return true;
    },
    /**
    * Activates a view relative to the position of the one input
    * @param {Baff.app.view.DomainView} view The reference view
    * @param {Number} relativePosition The relative position of the view to be activated
    * @protected
    */
    activateRelativeView: function(view, relativePosition) {
        Utils.logger.info("DomainController[" + this.identifier + "]:activateRelativeView");
        var me = this;
        var activeTabIndex = me.domainView.items.findIndex('id', view.id);
        var newIndex = activeTabIndex + relativePosition;
        if (newIndex >= 0) {
            me.changeTab(me.domainView.items.getAt(newIndex));
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
    * @protected
    */
    beforeTabChange: function(tabPanel, newView, oldView) {
        Utils.logger.info("DomainController[" + this.identifier + "]:beforeTabChange");
        var me = this;
        // Prompt the user if required
        var prompt = me.getDeactivationPrompt();
        if (prompt != "") {
            me.domainView.un('beforetabchange', me.beforeTabChange, me);
            Ext.Msg.confirm(me.dtConfirmTitle, prompt, function(btn) {
                if (btn == 'yes') {
                    // If an "add new" tab was not requested then make the change
                    if (!me.isNewTab(newView, oldView)) {
                        me.changeTab(newView, oldView);
                    }
                } else {
                    // Reset to the old (current) view
                    me.domainView.setActiveTab(oldView);
                    me.domainView.on('beforetabchange', me.beforeTabChange, me);
                }
            });
            return false;
        }
        // Don't handle an "add new" request
        if (me.isNewTab(newView, oldView))  {
            return false;
        }
        
        // Manage the underlying activity states
        me.deactivateView(oldView);
        me.activateView(newView);
        return true;
    },
    /**
    * Check if the request is to add a new view instance and if so fire the associated event.
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} newView The view being requested
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} oldView The current view
    * @return {boolean}
    * @fires newtab
    * @protected
    */
    isNewTab: function(newView, oldView) {
        Utils.logger.info("DomainController[" + this.identifier + "]:isNewTab");
        var me = this;
        if (newView.newType != null) {
            me.fireViewEvent('newtab', newView, oldView);
            return true;
        } else {
            return false;
        }
    },
    /**
    * Creates a new tab.  Invoked by the the internal 'newtab' event.
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} newView The view being requested
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} oldView The current view
    * @return {Baff.app.view.DomainView or Baff.app.view.ActivityView} The new view
    * @protected
    */
    onNewTab: function(newView, oldView) {
        Utils.logger.info("DomainController[" + this.identifier + "]::onNewTab");
        var me = this;
        var popup = (newView.popupSelector != null ? newView.popupSelector : '');
        var addtab = newView.cloneConfig();
        me.domainView.remove(newView);
        var newtab = me.domainView.add({
                xtype: newView.newType,
                title: newView.newTitle,
                fromNew: true,
                popupSelector: popup
            });
        me.domainView.add(addtab);
        // Setup context
        if (me.currentMasterEntity != null)  {
            newtab.getController().onMasterEntityChange(me, me.currentMasterEntity, me.currentMasterEntityType);
        }
        
        if (me.currentContext.getCount() > 0)  {
            newtab.getController().onContextChange(me, me.currentContext);
        }
        
        me.changeTab(newtab, oldView);
        return newtab;
    },
    /**
    * Changes the currently selected tab without triggering a tab change event.
    * This should only be called for this controllers' view's tabs.
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} newView The view being requested
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} oldView The current view
    * @protected
    */
    changeTab: function(newView, oldView) {
        Utils.logger.info("DomainController[" + this.identifier + "]::changeTab");
        var me = this;
        if (oldView == null)  {
            oldView = me.domainView.getActiveTab();
        }
        
        me.domainView.un('beforetabchange', me.beforeTabChange, me);
        if (oldView != newView) {
            me.domainView.setActiveTab(newView);
            me.deactivateView(oldView);
        }
        me.activateView(newView);
        me.domainView.on('beforetabchange', me.beforeTabChange, me);
    },
    /**
    * Deactivates the view and all underlying entity and activity views via their controllers
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} view The view to be deactivated.
    * @protected
    */
    deactivateView: function(view) {
        Utils.logger.info("DomainController[" + this.identifier + "]::deactivateView");
        var me = this;
        if (view == null)  {
            return;
        }
        
        var targetView = view;
        // Cycle through lower level entity views
        while (targetView != null && targetView.isXType('domainview')) {
            targetView.getController().onDeactivateView();
            targetView = targetView.getActiveTab();
        }
        // Deactivate the currently selected activity view
        if (targetView != null && me.isLowLevelView(targetView)) {
            targetView.getController().onDeactivateView();
        }
        
    },
    /**
    * Activates the view and all underlying entity and activity views via their controllers
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} view The view to be activate.
    * @protected
    */
    activateView: function(view) {
        Utils.logger.info("DomainController[" + this.identifier + "]::activateView");
        var me = this;
        var targetView = view;
        // Cycle through lower level domain views
        if (targetView != null && targetView.isXType('domainview')) {
            // If the tab is disabled try to select one that isn't
            if (targetView.isDisabled()) {
                var parent = targetView.findParentByType('domainview');
                parent.items.each(function(item) {
                    if (item.isXType('domainview') && !item.isDisabled()) {
                        parent.getController().changeTab(item, targetView);
                        return false;
                    }
                });
                // The above should trigger this function again so don't continue
                return;
            }
            targetView.getController().onActivateView();
            // Don't display any summary dashlet for domain views
            me.showDashlet(false);
        }
        // Activate the currently selected view
        else if (targetView != null && me.isLowLevelView(targetView)) {
            // If the tab is disabled try to select one that isn't
            if (targetView.isDisabled()) {
                var parent = targetView.findParentByType('domainview');
                parent.items.each(function(item) {
                    if (me.isLowLevelView(item) && !item.isDisabled()) {
                        parent.getController().changeTab(item, targetView);
                        return false;
                    }
                });
                // The above should trigger this function again so don't continue
                return;
            }
            targetView.getController().onActivateView();
            Utils.globals.activeView = targetView;
            if (me.dashlet != null) {
                var views = me.domainView.getAutoHideDashletOnView();
                var activeTabIndex = me.domainView.items.findIndex('id', targetView.id);
                var activeTabName = targetView.self.getName();
                if (views != null && (Ext.Array.contains(views, activeTabName) || Ext.Array.contains(views, activeTabIndex)))  {
                    me.showDashlet(false);
                }
                else if (me.domainView.getAutoShowDashlet())  {
                    me.showDashlet(true);
                }
                
            }
            // Notify the workflow manager of the change
            // Hard wired for efficiency
            if (Utils.workflowManager != null)  {
                Utils.workflowManager.onActiveViewChange(targetView);
            }
            
        }
    },
    /**
    * Queries the active actvity to see if changes have been made - any other activities with amended 
    * details should have been prompted for previously.
    * @param {Baff.app.model.EntityModel} record The entity record to query
    * @param {boolean} ignoreWorklfow Indicates if workflow state should be ignored
    * @return {String} The message to be displayed.
    */
    getDeactivationPrompt: function(ignoreWorkflow) {
        Utils.logger.info("DomainController[" + this.identifier + "]:getDeactivationPrompt");
        var me = this;
        var message = "";
        // Check underlying activities
        var targetView = me.domainView.getActiveTab();
        while (targetView != null && targetView.isXType('domainview')) {
            targetView = targetView.getActiveTab();
        }
        if (targetView != null && me.isLowLevelView(targetView) && targetView.getController().isDeactivationPromptRequired())  {
            message = me.dtContinueWithoutSavingMsg;
        }
        
        if (!ignoreWorkflow && Utils.workflowManager != null && Utils.workflowManager.isDeactivationPromptRequired()) {
            if (message != "")  {
                message += "</br></br>" + me.dtWorkflowStoppedMsg;
            }
            else  {
                message = me.dtWorkflowStoppedContinueMsg;
            }
            
        }
        return message;
    },
    /**
     * Navigates to and displays the associated {@link #domainView}.
     * @protected
     */
    showView: function() {
        Utils.logger.info("DomainController[" + this.identifier + "]:showView");
        var me = this;
        var view = me.domainView;
        var parent = me.domainView.findParentByType('domainview');
        while (parent != null) {
            if (view != parent.getActiveTab())  {
                parent.getController().changeTab(view, parent.getActiveTab());
            }
            
            view = parent;
            parent = parent.findParentByType('domainview');
        }
    },
    /**
    * Executes a workflow step initiated by {@link Baff.utility.workflow.WorkflowManager}.
    * @param wfContext The workflow context object.
    * @return wfContext
    */
    onNextStep: function(wfContext) {
        Utils.logger.info("DomainController[" + this.identifier + "]:onNextStep");
        var me = this;
        // If the view has been removed or disabled stop the workflow
        if (me.domainView == null) {
            wfContext.workflow = null;
            return wfContext;
        }
        // Check if the context has changed
        if (wfContext.stateResuming && wfContext.context != me.getWorkflowContext()) {
            wfContext.workflow = null;
            return wfContext;
        }
        // Workflow manager is responsible for prompting user beforehand
        me.showView();
        me.showWaitMask(true);
        // Clone the current context
        var oldWfContext = Ext.clone(wfContext);
        var nextStep = me.selectNextStep(wfContext);
        if (nextStep == null) {
            // Must have finished
            wfContext.step = null;
            me.showWaitMask(false);
            return wfContext;
        }
        var view = null;
        // Old view is the active tab this controller
        var oldView = me.domainView.getActiveTab();
        // Get the view and display it
        if (nextStep.newView) {
            // Check if a popup is being displayed, if so assume we just use the related view
            // otherwise create a new one
            var popup = Ext.ComponentQuery.query('selectorpopup');
            if (popup != null && popup.length > 0)  {
                view = oldView;
            }
            else if (me.getReferences().newtab != null)  {
                view = me.onNewTab(me.getReferences().newtab, oldView);
            }
            
        } else {
            // Find the first existing view
            var children = Ext.ComponentQuery.query(nextStep.view, me.domainView);
            if (children.length > 0) {
                view = children[0];
            }
        }
        if (view == null) {
            // Couldn't find the view
            Utils.logger.error(nextStep.view, " .... not found");
            wfContext.workflow = null;
            me.showWaitMask(false);
            return wfContext;
        }
        // If view is disabled then return
        if (view.isDisabled()) {
            Ext.copyTo(wfContext, oldWfContext, 'step, instruction, resume, replay, previous, allowPrev');
            me.showWaitMask(false);
            return wfContext;
        }
        if (!nextStep.newView && view != oldView)  {
            me.changeTab(view, oldView);
        }
        
        // Check if it's a AV or DV
        if (view.isXType('activityview')) {
            // Activity
            wfContext.step = nextStep.step;
            wfContext.instruction = nextStep.instruction;
        } else {
            // Sub workflow
            wfContext.workflow = nextStep.step;
            wfContext.controller = view.getController();
            wfContext.step = null;
        }
        wfContext.activeView = view;
        me.showWaitMask(false);
        return wfContext;
    },
    /**
     * Select the next step. Default is to select next one in sequence - otherwise subclass should
     * override to provide necessary control logic (in which case steps do not have to be specified
     * in configuration).  The step should include:
     * step: the name of the step,
     * view: the activity or domain view name to be displayed
     * instruction: any instruction to be displayed (for an activity)
     * The following can be updated in wfContext:
     * resume: if its possible to resume from this activity
     * replay: if the workflow can be replayed (for the last activity)
     * previous: if it's possible to go back to the previous activity
     * allowPrev: if it's allowed to go back to the previous activity (i.e. not at the first activity)
     * @param wfContext The workflow context
     * @return The next step
     * @protected
     */
    selectNextStep: function(wfContext) {
        Utils.logger.info("DomainController[" + this.identifier + "]:selectNextStep");
        var me = this;
        var workflow = me.getWorkflow(wfContext);
        if (workflow == null)  {
            return null;
        }
        
        wfContext.resume = workflow.resume;
        wfContext.replay = workflow.replay;
        wfContext.previous = workflow.previous;
        wfContext.allowPrev = false;
        var steps = workflow.steps;
        if (wfContext.step == null) {
            return steps[0];
        }
        for (i = 0; i < steps.length; i++) {
            if (steps[i].step == wfContext.step) {
                var stepSel;
                if (wfContext.stateResuming)  {
                    stepSel = i;
                }
                else if (wfContext.statePrev)  {
                    stepSel = i - 1;
                }
                else if (i == steps.length - 1)  {
                    stepSel = -1;
                }
                else  {
                    stepSel = i + 1;
                }
                
                if (stepSel >= 0) {
                    if (stepSel > 0)  {
                        wfContext.allowPrev = true;
                    }
                    
                    return steps[stepSel];
                } else {
                    return null;
                }
            }
        }
        return null;
    },
    /**
     * Gets the workflows for the given context. 
     * @param wfContext
     * @return {Array}
     * @protected
     */
    getWorkflow: function(wfContext) {
        var me = this;
        var workflows = me.getWorkflows();
        for (var i = 0; i < workflows.length; i++) {
            if (workflows[i].workflow == wfContext.workflow) {
                return workflows[i];
            }
        }
        return null;
    },
    /**
     * Gets a unique context to ensure the workflow is still valid on resumption. Override if required.
     * @return {String}
     * @protected
     */
    getWorkflowContext: function() {
        var me = this;
        if (me.currentMasterEntity != null)  {
            return me.currentMasterEntity.getEntityId();
        }
        else  {
            return null;
        }
        
    },
    /**
     * Tests if the view is at the lowest level
     * @param {Container} The container to be tested
     * @return {boolean}
     */
    isLowLevelView: function(view) {
        return (view.isXType('activityview') || view.isXType('dashboardview') || view.isXType('cardview'));
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
 *  to be specified as follows:
 *  
 *      Ext.define('MyApp.controller.MyFormController', {
 *          extend: 'Baff.app.controller.FormController',
 *          alias: 'controller.myformcontroller',
 *   
 *          requires: ['MyApp.store.MyEntityStore',
 *                          'MyApp.model.MyEntityModel'],
 *   
 *          config: {
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
    requires: [
        'Baff.utility.Utilities'
    ],
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
    dtReviewFields: 'Review the highlighted fields',
    dtConfirmTitle: 'Confirm',
    dtConfirmDelete: 'Delete this record?',
    dtConfirmRevert: 'Discard all changes?',
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
        * Specifies if this activity only acts on a single entity record, e.g. in a 1-1 relationship with a master entity
        * or if the entity to act on is provided via external context
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
        revertOnDeactivate: true,
        /**
         * Specifies a url for form submission, which will be used for any save operation
         */
        submitFormUrl: null,
        /**
         * Specifies if a new record should have its fields populated from context specified by 
         * {@link contextHandlerMap}, since this may typically be applied as a filter on the records fields
         */
        setupNewRecordFromContext: true,
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
        // Form
        selector = me.getFormPanelSelector();
        if (selector === '')  {
            selector = me.activityView.getFormPanel();
        }
        
        if (selector !== '') {
            me.formPanel = me.lookupReference(selector);
        } else {
            me.formPanel = Ext.create('Baff.app.view.FormPanel');
            me.setUpdateEnabled(false);
            me.setCreateEnabled(false);
        }
        me.formPanel.setCleanRecord();
        me.formPanel.on('dirtychange', me.onFormDirtyChange, me);
        // Add Button
        selector = me.getAddButtonSelector();
        if (selector === '')  {
            selector = me.activityView.getAddButton();
        }
        
        if (selector !== '') {
            me.addButton = me.lookupReference(selector);
            me.addButton.on('click', me.onAddButton, me);
        }
        // Remove Button
        selector = me.getRemoveButtonSelector();
        if (selector === '')  {
            selector = me.activityView.getRemoveButton();
        }
        
        if (selector !== '') {
            me.removeButton = me.lookupReference(selector);
            me.removeButton.on('click', me.onRemoveButton, me);
        }
        // Save Button
        selector = me.getSaveButtonSelector();
        if (selector === '')  {
            selector = me.activityView.getSaveButton();
        }
        
        if (selector !== '') {
            me.saveButton = me.lookupReference(selector);
            me.saveButton.on('click', me.onSaveButton, me);
        }
        // Revert Button
        selector = me.getRevertButtonSelector();
        if (selector === '')  {
            selector = me.activityView.getRevertButton();
        }
        
        if (selector !== '') {
            me.revertButton = me.lookupReference(selector);
            me.revertButton.on('click', me.onRevertButton, me);
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
                Utils.logger.info("FormController[" + this.identifier + "]:setupAccessControl - access not allowedl");
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
        if (readonly != false)  {
            readonly = true;
        }
        
        me.formPanel.makeReadOnlyForAll(readonly);
        me.showWidget(me.removeButton, !readonly);
        me.showWidget(me.saveButton, !readonly);
        me.showWidget(me.revertButton, !readonly);
        me.showWidget(me.addButton, !readonly);
        me.isReadOnly = readonly;
    },
    /**  
    * Called by the framework when view is deactivated.
    * @protected
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
    * @protected
    */
    onFormDirtyChange: function(form, dirty) {
        var me = this;
        me.dirtyChange(form, dirty);
    },
    /**
    * Prompts the user if changes have been made before proceeding to create a record.   
    * Called whe add button is clicked.    
    * @protected
    */
    onAddButton: function() {
        Utils.logger.info("FormController[" + this.identifier + "]::onAddButton");
        var me = this;
        if (me.formPanel.isDirty()) {
            Ext.Msg.confirm(me.dtConfirmTitle, me.dtConfirmRevert, function(btn) {
                if (btn === 'yes')  {
                    me.addRecord();
                }
                
            });
        } else {
            me.addRecord();
        }
    },
    /**
    * Proceeds to save a record.    
    * Called when the save button is clicked.   
    * @protected 
    */
    onSaveButton: function() {
        Utils.logger.info("FormController[" + this.identifier + "]::onSaveButton");
        this.saveRecord();
    },
    /**
    * Prompts the user if changes have been made before proceeding to remove a record.     
    * Called when the remove button is clicked. 
    * @protected   
    */
    onRemoveButton: function() {
        Utils.logger.info("FormController[" + this.identifier + "]::onRemoveButton");
        var me = this;
        if (me.formPanel.isDirty()) {
            Ext.Msg.confirm(me.dtConfirmTitle, me.dtConfirmRevert, function(btn) {
                if (btn === 'yes')  {
                    me.removeRecord();
                }
                
            });
        } else {
            me.removeRecord();
        }
    },
    /**
    * Prompts the user if changes have been made before proceeding to revert the entity record.      
    * Called when the revert button is clicked.   
    * @protected 
    */
    onRevertButton: function() {
        Utils.logger.info("FormController[" + this.identifier + "]::onRevertButton");
        var me = this;
        if (me.formPanel.isDirty()) {
            Ext.Msg.confirm(me.dtConfirmTitle, me.dtConfirmRevert, function(btn) {
                if (btn === 'yes')  {
                    me.revertRecord();
                }
                
            });
        } else {
            me.revertRecord();
        }
    },
    /**
    * Prompts the user if changes have been made before proceeding to refresh the activity.      
    * Called when the refresh button is clicked.    
    * @protected
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
    onStoreFirstLoaded: function() {
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
        } else if (me.currentRecord.getEntityId() == null) {
            // Passed a 'dummy' record that indicates a request to add a record
            me.onLoadAdd();
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
        var me = this;
        // Try to get the current record from the store
        var record = me.entityStore.findEntity(me.currentRecord);
        if (record != null) {
            //me.currentRecord = record;  // Is essentially the same as the current record
            me.setCurrentRecord(record);
            // SCR
            me.modifyRecord(me.currentRecord, true);
        }
        // Reload current record if unless we're sure it's ok
        else if (me.checkVersion(me.currentRecord) != true) {
            // Set the username
            var username = (Utils.userSecurityManager != null ? Utils.userSecurityManager.getUserName() : '');
            me.showWaitMask(true);
            me.currentRecord.load({
                scope: me,
                params: {
                    'entityId': me.currentRecord.getEntityId(),
                    'username': username,
                    'actionCode': ''
                },
                callback: function(record, operation) {
                    if (!operation.success) {
                        me.doLoadException(record.getProxy().getResponse());
                    } else if (operation.getRecords().length == 0) {
                        me.setCurrentRecord(null);
                        // No need as will be called later
                        //me.currentRecord = null;  SCR
                        me.onStoreFirstLoaded();
                    } else {
                        //me.setCurrentRecord(record);  // No need as will be called in modifyRecord                        
                        me.modifyRecord(record, true);
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
        if (record != null && record.getEntityId() != null)  {
            me.modifyRecord(record, true);
        }
        else  {
            me.addRecord(true, record);
        }
        
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
            if (record != null && record.getEntityId() != null && me.getViewExistingRecord())  {
                me.modifyRecord(record, isAfterRefresh);
            }
            else  {
                me.addRecord(isAfterRefresh, record);
            }
            
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
        if (me.currentRecord != null && me.currentRecord.getEntityId() != null) {
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
        if (record.getEntityId() == null) {
            me.addRecord(isAfterRefresh, record);
            return;
        }
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
    * @param {Baff.app.model.EntityModel} record A record to be used as a default   
    * @protected
    */
    addRecord: function(isAfterRefresh, newRecord) {
        Utils.logger.info("FormController[" + this.identifier + "]::addRecord");
        var me = this;
        me.recordAction = me.entityModel.ACTION.CREATE;
        me.setCurrentRecord(null);
        // Create a new entity record
        if (newRecord == null)  {
            newRecord = Ext.create(me.entityModel.getName());
        }
        
        me.setNewRecordDefaults(newRecord);
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
        record.setEntityId(null);
        record.setMasterEntityId(me.masterEntityId);
        if (me.getSetupNewRecordFromContext() && me.filterContext.getCount() > 0)  {
            record.set(me.filterContext.map);
        }
        
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
        me.formPanel.loadRecord(record);
    },
    /**
     * Sets all fields to read only and disables the delete button
     * @param {boolean} readOnly 
     */
    setFieldsReadOnly: function(readOnly) {
        var me = this;
        if (readOnly != false)  {
            readOnly = true;
        }
        
        me.formPanel.makeReadOnlyForAll(readOnly);
        if (readOnly)  {
            me.enableWidget(me.removeButton, false);
        }
        
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
            me.formPanel.getForm().markInvalid(revRecord.getErrors());
            Ext.Msg.alert(me.dtValidationErrorTitle, me.dtReviewFields);
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
            me.formPanel.getForm().markInvalid(revRecord.getErrors());
            Ext.Msg.alert(me.dtValidationErrorTitle, me.dtReviewFields);
        } else {
            if (me.getConfirmRemove()) {
                Ext.Msg.confirm(me.dtConfirmTitle, me.dtConfirmDelete, function(btn) {
                    if (btn === 'yes') {
                        // Prepare the entity record for removal and then remove
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
    doValidation: function(revisedRecord, originalRecord) {
        Utils.logger.info("FormController[" + this.identifier + "]::doValidation");
        var me = this;
        var isValid = revisedRecord.isValid(me.recordAction, originalRecord);
        var isFeas = me.doFeasibilityValidation(revisedRecord, originalRecord);
        if (isValid && isFeas)  {
            return true;
        }
        
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
    doFeasibilityValidation: function(revisedRecord, originalRecord) {
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
    saveExec: function(record) {
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
    saveFormSuccess: function(form, action) {
        Utils.logger.info("FormController[" + this.identifier + "]::saveFormSuccess");
        var me = this;
        var record = Ext.create(me.getModelSelector());
        if (action.result.data != null)  {
            record.set(action.result.data);
        }
        
        me.saveSuccess(record, action.result);
    },
    /**
    * Following a successful form submission
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @param {Ext.data.operation.Operation} operation The proxy operation
    * @protected
    */
    saveFormFail: function(form, action) {
        Utils.logger.info("FormController[" + this.identifier + "]::saveFormFail");
        var me = this;
        var record = Ext.create(me.getModelSelector());
        var response = null;
        if (action.result.data != null)  {
            record.set(action.result.data);
        }
        
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
        if (response.message !== null) {
            me.showAlertMessage(me.dtValidationErrorTitle, response.message);
        } else {
            me.formPanel.getForm().markInvalid(response.errors);
            me.showAlertMessage(me.dtValidationErrorTitle, me.dtReviewFields);
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
        if (scope == null)  {
            scope = me;
        }
        
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
    requires: [
        'Baff.utility.Utilities'
    ],
    alias: 'controller.listform',
    /**
    * The {@link Baff.app.view.ListPanel} that contains the list
    * @readonly
    */
    listPanel: null,
    config: {
        /**
        * Specifies if this activity only acts on a single entity record
        */
        manageSingleRecord: false,
        /**
        * Specifies a selector for the list panel. If not set (by default)  it is determined automatically
        * from the associated {@link Baff.app.view.ListFormView}
        */
        listPanelSelector: ''
    },
    /**
    * Initialises the controller.  
    * Calls the overriden superclass method. 
    */
    init: function(application) {
        this.callParent(arguments);
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
        if (selector === '')  {
            selector = me.activityView.getListPanel();
        }
        
        if (selector !== '') {
            me.listPanel = me.lookupReference(selector);
            me.listPanel.on('select', me.onSelectList, me);
            me.listPanel.on('refreshList', me.onRefreshList, me);
        }
        me.callParent(arguments);
    },
    /**
    * Proceeds as if the refresh button was selected.     
    * Called when the refresh button on the list is clicked.    
    * @protected
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
    * @protected
    */
    onSelectList: function(selModel, record) {
        Utils.logger.info("ListFormController[" + this.identifier + "]::onSelectList");
        var me = this;
        if (!me.getViewExistingRecord())  {
            return;
        }
        
        // Check id's because a saved current record will not be the same instance as the one in the store
        if (me.currentRecord != null && record.getEntityId() == me.currentRecord.getEntityId())  {
            return;
        }
        
        // Check if store is loaded - otherwise post flush
        if (!me.entityStore.hasLoaded)  {
            return;
        }
        
        if (me.formPanel.isDirty()) {
            Ext.Msg.confirm(me.dtConfirmTitle, me.dtConfirmRevert, function(btn) {
                if (btn === 'yes') {
                    me.modifyRecord(record);
                } else {
                    me.selectCurrentRecord();
                }
            });
        } else {
            me.modifyRecord(record);
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
    onStoreFirstLoaded: function() {
        Utils.logger.info("ListFormController[" + this.identifier + "]::onStoreFirstLoaded");
        var me = this;
        me.callParent(arguments);
        me.listPanel.updateSearchCount();
    },
    /**
    * Updates the list search count and attempts to select the current record since it may have
    * been fetched as part of buffer processing (following an update it may not have been retrieved
    * in the initial load).
    * Called after the store retrieves more data.
    * @protected
    */
    onStoreFetchMore: function() {
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
    selectRecord: function(record) {
        Utils.logger.info("ListFormController[" + this.identifier + "]::selectRecord");
        var me = this;
        // Selects the record in the grid
        if (me.listPanel != null) {
            if (me.entityStore != null && record != null) {
                // See if we can find the record in the store (and therefore the list)
                var storeRecord = me.entityStore.findEntity(record);
                if (storeRecord != null) {
                    me.listPanel.getSelectionModel().select(storeRecord, false, true);
                } else //me.checkVersionOnView(storeRecord);  -- only relevant if was not selected initially due to buffering
                // however, results in mutliple checks if not and may be confusing for user
                {
                    // This may be the case if the currently selected record is not yet visible post an update
                    // due to store buffering, but make sure we haven't got anything else selected
                    var records = me.listPanel.getSelectionModel().getSelection();
                    if (records.length != 1 || records[0].getEntityId() != record.getEntityId())  {
                        me.listPanel.getSelectionModel().deselectAll(true);
                    }
                    
                }
            } else {
                me.listPanel.getSelectionModel().deselectAll(true);
            }
        }
    },
    /**
    * Sets the list selection prior to superclass processing.
    * Calls the overridden superclass method. 
    * @protected
    */
    addRecord: function(isAfterRefresh, record) {
        Utils.logger.info("ListFormController[" + this.identifier + "]::addRecord");
        var me = this;
        me.selectRecord(record);
        me.callParent(arguments);
    },
    /**
    * Sets the list selection prior to superclass processing.
    * Calls the overridden superclass method. 
    * @param {Ext.foundation.EntityModel} record The entity record to be selected
    * @protected
    */
    modifyRecord: function(record, isAfterRefresh) {
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
 *  to be specified, as follows:
 *  
 *      Ext.define('MyApp.controller.MySelectorController', {
 *          extend: 'Baff.app.controller.SelectorController',
 *          alias: 'controller.myselectorcontroller',
 *   
 *          requires: ['MyApp.store.MyEntityStore',
 *                          'MyApp.model.MyEntityModel'],
 *   
 *          config: {
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
    requires: [
        'Baff.utility.Utilities'
    ],
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
        selectButtonSelector: ''
    },
    /**
    * Initialises the controller.  
    * Calls the overriden superclass method. 
    */
    init: function(application) {
        this.callParent(arguments);
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
        //Listbox
        selector = me.getListPanelSelector();
        if (selector === '')  {
            selector = me.activityView.getListPanel();
        }
        
        if (selector !== '') {
            me.listPanel = me.lookupReference(selector);
            me.listPanel.on('select', me.onSelectList, me);
            me.listPanel.on('refreshList', me.onRefreshList, me);
        }
        // Add Button
        selector = me.getAddButtonSelector();
        if (selector === '')  {
            selector = me.activityView.getAddButton();
        }
        
        if (selector !== '') {
            me.addButton = me.lookupReference(selector);
            me.addButton.on('click', me.onAddButton, me);
        }
        // Select Button
        selector = me.getSelectButtonSelector();
        if (selector === '')  {
            selector = me.activityView.getSelectButton();
        }
        
        if (selector !== '') {
            me.selectButton = me.lookupReference(selector);
            me.selectButton.on('click', me.onSelectButton, me);
        }
        me.callParent(arguments);
    },
    /**
    * Sets the current entity record to null and closes the view if a popup.   
    * Called whe add button is clicked.   
    * @protected 
    */
    onAddButton: function() {
        Utils.logger.info("SelectorController[" + this.identifier + "]::onAddButton");
        var me = this;
        me.setCurrentRecord(null);
        me.listPanel.getSelectionModel().deselectAll(true);
        me.enableWidget(me.selectButton, false);
        if (me.getView().isXType('selectorpopup'))  {
            me.getView().close();
        }
        
    },
    /**
    * Closes the view if a popup
    * Called whe select button is clicked.  
    * @protected  
    */
    onSelectButton: function() {
        Utils.logger.info("SelectorController[" + this.identifier + "]::onSelectButton");
        var me = this;
        if (me.getView().isXType('selectorpopup'))  {
            me.getView().close();
        }
        
    },
    /**
    * Proceeds as if the refresh button had been clicked
    * Called whe list refresh button is clicked.    
    * @protected
    */
    onRefreshList: function() {
        this.onRefreshButton();
    },
    /**
    * Sets the current record to the one selected in the list.
    * Called when an item in the list is selected.
    * @param {Ext.Selection.RowModel} selModel The selection model
    * @param {Baff.app.model.EntityModel} record The selected record
    * @protected
    */
    onSelectList: function(selModel, record) {
        Utils.logger.info("SelectorController[" + this.identifier + "]::onSelectList");
        var me = this;
        var rec = record;
        me.setCurrentRecord(record);
        me.enableWidget(me.selectButton, true);
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
    onStoreFirstLoaded: function(store) {
        Utils.logger.info("SelectorController[" + this.identifier + "]::onStoreFirstLoaded");
        var me = this;
        if (me.checkDataIntegrity() == true) {
            if (me.getSelectFirstRecord()) {
                me.selectFirstRecord();
            } else {
                // Selectors do not attempt to select the current record since this 
                // may not be visible due to list and/or page buffering
                me.setCurrentRecord(null);
                me.selectCurrentRecord();
            }
            var allowModify = (me.allowUpdate && !me.isReadOnly);
            me.prepareView(true, allowModify, null, null);
            if (me.listPanel != null)  {
                me.listPanel.updateSearchCount();
            }
            
        }
        this.showWaitMask(false);
    },
    /**
    * Updates the list search count.
    * Called after the store retrieves more data.
    * @protected
    */
    onStoreFetchMore: function() {
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
        if (me.entityStore != null && me.entityStore.getTotalCount() != 0)  {
            record = me.entityStore.getAt(0);
        }
        
        me.setCurrentRecord(record);
        me.selectCurrentRecord();
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
    selectRecord: function(record) {
        Utils.logger.info("SelectorController[" + this.identifier + "]::selectRecord");
        var me = this,
            found = false;
        // If a record is provided then try to select it
        if (me.entityStore != null && record != null) {
            // See if we can find the record in the store (and therefore the list)
            var storeRecord = me.entityStore.findEntity(record);
            if (storeRecord != null) {
                me.listPanel.getSelectionModel().select(storeRecord, false, true);
                me.enableWidget(me.selectButton, true);
                me.checkVersionOnView(storeRecord);
                found = true;
            }
        }
        // If no record provided or the provided one was not found
        // then select nothing
        if (!found) {
            me.listPanel.getSelectionModel().deselectAll(true);
            me.enableWidget(me.selectButton, false);
            if (record != null)  {
                me.setCurrentRecord(null);
            }
            
        }
    }
});

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
        {
            name: 'nodeId',
            type: 'string'
        },
        {
            name: 'nodeType',
            type: 'string'
        },
        {
            name: 'entityId',
            type: 'string'
        },
        {
            name: 'entityType',
            type: 'string'
        },
        {
            name: 'masterEntityId',
            type: 'string'
        },
        {
            name: 'isNewEntity',
            type: 'boolean'
        }
    ],
    // To indicate this is a phantom record to support adding     
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
        if (iconCls != null)  {
            me.set('iconCls', iconCls);
        }
        
    },
    /**
     * Override to set the icon for the node
     * @returns {String} the iconCls
     * @protected
     */
    setIconCls: function() {
        if (this.get('newEntity') == true)  {
            return 'newnode';
        }
        
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
            if (entity != null)  {
                entity.set(data);
            }
            
        }
        if (entity != null)  {
            entity.node = me;
        }
        
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
        if (name != "")  {
            return name;
        }
        else  {
            return type;
        }
        
    },
    /**
     * Gets the data entity id for the node
     * @returns {String}
     */
    getEntityId: function() {
        var entityId = this.get('entityId');
        if (entityId == '')  {
            entityId = null;
        }
        
        return entityId;
    },
    getMasterEntityId: function() {
        var entityId = this.get('masterEntityId');
        if (entityId == '')  {
            entityId = null;
        }
        
        return entityId;
    },
    /**
     * Checks if this node matches the entity identifiers
     * @ param {String} entityType the entity name or alias
     * @ param {String} entityId the entity id
     * @ return {boolean}
     */
    isEntity: function(entityType, entityId) {
        var me = this;
        if (entityId != me.get('entityId'))  {
            return false;
        }
        
        // Check against the node entity type
        var nodeEntityType = me.get('entityType');
        if (nodeEntityType == entityType)  {
            return true;
        }
        
        // As node entity type may be an alias try to get a related model name
        var nodeEntityName = Ext.ClassManager.getNameByAlias(nodeEntityType);
        if (nodeEntityName == entityType)  {
            return true;
        }
        
        // Finally as the entityType passed in may be an alias...
        var entityName = Ext.ClassManager.getNameByAlias(entityType);
        if (entityName == nodeEntityType || entityName == nodeEntityName)  {
            return true;
        }
        
        return false;
    }
});

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
    requires: [
        'Baff.app.model.TreeModel'
    ],
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
        if (Utils.userSecurityManager != null && Utils.userSecurityManager.getUserName() != null)  {
            me.setParam("username", Utils.userSecurityManager.getUserName());
        }
        
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
    setKeys: function(ownerId, masters) {
        var me = this;
        me.storeKey = Ext.getClassName(this);
        me.masterKey = '#' + me.getModel().getMasterEntityType() + '#';
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
                if (node.isEntity(entityType, entityId))  {
                    return true;
                }
                
            });
        if (index == -1)  {
            return null;
        }
        else  {
            return me.getAt(index);
        }
        
    },
    clearFieldFilters: function(auto) {},
    setContextFilters: function(filters) {}
});

/**
 * A TreeController extends {@link Baff.app.controller.SelectorController} to support an activity that 
 *  involves selecting a data entity presented in a {@link Baff.app.view.TreeView}.
 *  
 * Records managed in a tree are based on {@link Baff.app.model.TreeModel} and held in a
 * {Baff.app.model.TreeStore}.  Each record is a node in the tree and represents a specific type of
 * {Baff.app.model.EntityModel}.
 * 
 *  A minimal setup only requires the {@link #entityModelSelector} and {@link #entityStoreSelector}
 *  to be specified, as follows:
 *  
 *      Ext.define('MyApp.controller.MyTreeController', {
 *          extend: 'Baff.app.controller.TreeController',
 *          alias: 'controller.mytreecontroller',
 *   
 *          requires: ['MyApp.store.MyTreeStore',
 *                          'MyApp.model.MyTreeModel'],
 *   
 *          config: {
 *              storeSelector: 'MyApp.store.MyTreeStore',
 *              modelSelector: 'MyApp.model.MyTreeModel'
 *          }
 *
 *      });  
 *    
 */
Ext.define('Baff.app.controller.TreeController', {
    extend: 'Baff.app.controller.SelectorController',
    alias: 'controller.tree',
    requires: [
        'Baff.app.model.TreeStore',
        'Baff.app.model.TreeModel'
    ],
    /*
     * The path to the current node
     * @private
     */
    nodePath: null,
    /*
     * The {Baff.app.model.EntityModel} instance represented by the current node
     * @private
     */
    currentEntity: null,
    /**
     * A record provided externally to synchronize with
     * @private 
     */
    syncEntity: null,
    config: {
        /**
        * The type of {@link Baff.app.model.TreeModel} managed by the activity.  
        * **IMPORTANT**: This must be set by the subclass.
        * @cfg modelSelector (required) 
        */
        modelSelector: 'Baff.app.model.TreeModel',
        /**
        * Specifies that this activity is dependent on a master having been determined.
        * This is set to false for a TreeController as it processes different types of entity.
        */
        dependentOnMaster: false,
        /**
        * Specifies if the first entity should be selected in the list.  
        */
        selectFirstRecord: false,
        /**
        * Specifies that this controller should fire an {@link #entitychange} event if it changes
        * its data entity being operated on.
        */
        fireOnEntityChange: true
    },
    /**
    * Refreshes the activity and associated data.   
    * Called when the refresh button is clicked.    
    * @protected
    */
    onRefreshButton: function() {
        Utils.logger.info("TreeController[" + this.identifier + "]::onRefreshButton");
        var me = this;
        // Refresh the node path
        me.nodePath = null;
        me.syncEntity = null;
        me.callParent(arguments);
    },
    /**
    * Sets the selected record following the store load and updates the search count.
    * Called after the store is first loaded.  
    * @protected
    */
    onStoreFirstLoaded: function(store) {
        Utils.logger.info("TreeController[" + this.identifier + "]::onStoreFirstLoaded");
        var me = this;
        if (me.checkDataIntegrity() == true) {
            // Try to select the current record
            if (me.currentRecord != null || me.syncEntity != null) {
                me.selectCurrentRecord();
            } else if (me.getSelectFirstRecord()) {
                me.selectFirstRecord();
            } else {
                me.selectRecord(null);
            }
            var allowModify = (me.allowUpdate && !me.isReadOnly);
            me.prepareView(true, allowModify, null, null);
            if (me.listPanel != null)  {
                me.listPanel.updateSearchCount();
            }
            
        }
        this.showWaitMask(false);
    },
    /**
    * Sets the current record to the one selected in the list.
    * Called when an item in the list is selected.
    * @param {Ext.Selection.RowModel} selModel The selection model
    * @param {Baff.app.model.EntityModel} record The selected record
    */
    onSelectList: function(selModel, record) {
        Utils.logger.info("TreeController[" + this.identifier + "]::onSelectList");
        var me = this;
        var rec = record;
        me.nodePath = record.getPath();
        me.setCurrentRecord(record);
        me.enableWidget(me.selectButton, true);
    },
    /**
    * Selects {@link #currentRecord} in the list if not already selected.
    * @protected
    */
    selectCurrentRecord: function() {
        Utils.logger.info("TreeController[" + this.identifier + "]::selectCurrentRecord");
        var me = this;
        var node = me.currentRecord;
        if (me.extEntityType != null) {
            // Try to find a matching record
            var newNode = me.getEntityNode(me.extEntityType, me.extEntityId);
            if (newNode != null)  {
                node = newNode;
            }
            
        }
        me.selectRecord(node);
    },
    /**
    * Selects a node record in the list.
    * @param {Ext.foundation.EntityModel} record The entity record to be selected
    * @protected
    */
    selectRecord: function(record) {
        Utils.logger.info("TreeController[" + this.identifier + "]::selectRecord");
        var me = this,
            found = false;
        if (record != null) {
            me.nodePath = record.getPath();
        }
        // Always try to select a record based on the previously set node path
        if (me.nodePath != null) {
            Ext.Array.each(me.nodePath.split('/'), function(nodeId, index, nodePath) {
                var storeRecord = me.entityStore.getNodeById(nodeId);
                if (storeRecord != null) {
                    if (index != (nodePath.length - 1) && !storeRecord.isExpanded() && storeRecord.isExpandable()) {
                        me.listPanel.expandNode(storeRecord);
                    } else {
                        me.listPanel.getSelectionModel().select(storeRecord, false, true);
                        me.nodePath = storeRecord.getPath();
                        me.enableWidget(me.selectButton, true);
                        me.setCurrentRecord(storeRecord);
                    }
                    found = true;
                    return false;
                }
            }, me, true);
        }
        // If no record provided or the provided one was not found
        // then select nothing
        if (!found) {
            me.listPanel.getSelectionModel().deselectAll(true);
            me.enableWidget(me.selectButton, false);
            me.setCurrentRecord(null);
            me.nodePath = null;
        }
    },
    /**
    * Synchronisises with an associated form, typically via a {Baff.app.controller.CardController}
    * @param {Baff.app.model.EntityModel} entity The entity record that has been selected or changed.
    */
    syncWithExternal: function(record) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::syncWithExternal");
        var me = this;
        var node = null;
        if (record != null) {
            if (record.isNodeEntity) {
                node = record;
            }
            // This should be an existing node
            else if (me.currentRecord.getEntityId() != record.getEntityId() || me.currentRecord.getEntityType() != record.getEntityType()) {
                // Try to find a matching record
                node = me.getEntityNode(record.getEntityType(), record.getEntityId());
                // If we didn't find it, it could be because we need to refresh
                if (node == null) {
                    me.extEntityId = record.getEntityId();
                    me.extEntityType = record.getEntityType();
                }
            }
            if (node != null)  {
                me.selectRecord(node);
            }
            
        } else {
            me.selectRecord(null);
        }
    },
    /**
    * Sets {@link #currentRecord} and fires {@link #masterentitychange} if processing a master 
    * entity record and {@link #fireOnMasterChange} is true.
    * @param {Baff.app.model.EntityModel} record The entity record being 
    * @param {boolean} fireContext Indicates to fire context even if there is no change (defaults to true)
    * @fires masterentitychange
    * @fires entitychange
    * @protected
    */
    setCurrentRecord: function(record) {
        Utils.logger.info("TreeController[" + this.identifier + "]::setCurrentRecord");
        var me = this;
        var fireContext = (me.isActive && !me.dataRefresh);
        var fireEntityChange = false;
        if (record == false)  {
            record = null;
        }
        
        if (me.currentRecord != record || record == null) {
            me.currentRecord = record;
            me.extEntityType = null;
            me.extEntityId = null;
            me.currentEntity = me.getEntity(me.currentRecord);
            fireEntityChange = true;
            fireContext = true;
        }
        if (fireContext)  {
            me.fireContextEvent(record);
        }
        
        if (fireEntityChange) {
            // If we have a valid entity then send that otherwise send node
            // In the event nothing is selected then null / null will be sent out
            // NB entity could reflect a "new" record                
            if (me.currentEntity != null)  {
                me.fireViewEvent('entitychange', me, me.currentEntity, me.currentEntity.getEntityType());
            }
            else  {
                me.fireViewEvent('entitychange', me, me.currentRecord, me.currentRecord == null ? null : me.currentRecord.getEntityType());
            }
            
        }
    },
    /**
    * Fires a {@link #contextchange} event if required.
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @fires contextchange
    * @protected
    */
    fireContextEvent: function(record, contextSetterMap) {
        Utils.logger.info("TreeController[" + this.identifier + "]::fireContextEvent");
        var me = this;
        if (contextSetterMap != null) {
            // Not called by the framework, so perform standard processing
            me.callParent(arguments);
            return;
        }
        if (me.nodePath != null) {
            // Iterate back along the node path to find the first matching node
            // Nodes matched based on nodeType and/or entityType property (if neither specified then will match)
            Ext.Array.each(me.nodePath.split('/'), function(nodeId, index, nodePath) {
                var storeRecord = me.entityStore.getNodeById(nodeId);
                if (storeRecord != null) {
                    var entity = me.getEntity(storeRecord);
                    // Fire context based on entity data - this requires the entity data to be present
                    if (me.getContextSetterMap() != null && entity != null) {
                        Ext.Array.each(me.getContextSetterMap(), function(contextSetting) {
                            if ((contextSetting.nodeType == null || storeRecord.get('nodeType') == contextSetting.nodeType) && (contextSetting.entityType == null || storeRecord.get('entityType') == contextSetting.entityType)) {
                                me.fireContextEvent(entity, contextSetting.contextMapping);
                                return false;
                            }
                        });
                    }
                }
            }) , me , true;
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
        Utils.logger.info("TreeController[" + this.identifier + "]::checkVersionOnView");
        var me = this;
        me.callParent(me.getEntity(record));
    },
    /**
     * Gets the entity for the given node
     * @param {Baff.app.model.TreeNode} node
     * @returns {Baff.app.model.EntityModel}
     */
    getEntity: function(node) {
        Utils.logger.info("TreeController[" + this.identifier + "]::getEntity");
        var me = this;
        if (node == null)  {
            return null;
        }
        else  {
            return node.getEntity();
        }
        
    },
    /**
     * Gets the node for the given entity - override if entity type is not the entity alias
     * @param {String} entityType
     * @param {String} entityId
     * @retruns {Baff.app.model.TreeNode} 
     */
    getEntityNode: function(entityType, entityId) {
        Utils.logger.info("TreeController[" + this.identifier + "]::getEntityNode");
        var me = this;
        if (entityType == null)  {
            return null;
        }
        
        return me.entityStore.findNodeForEntity(entityType, entityId);
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
    extend: 'Ext.panel.Panel',
    xtype: 'activityview',
    // Display text
    dtRefresh: 'Refresh',
    config: {
        /**
        * Specifies the {@link Baff.app.controller.ActivityController} that controls this view
        */
        controller: 'activity',
        /**
        * Specifies a reference to the refresh button for this view. If set to '' the add button will not be
        * created, however generally this is not necessary as the controller will manage button state.
        */
        refreshButton: 'refreshBtn',
        /**
        * Specifies additional items created by the subclass that should be added to the view.
        */
        myItems: [],
        /**
        * Specifies a title for the view
        */
        title: '',
        /**
         * Specifies if this is view is to be displayed in a dashboard - see @link Baff.app.view.DashboardView}
         * If this is the case it should be read-only; and typically present a single component (e.g. list, form, etc.)
         */
        dashlet: false,
        /**
         * Specifies the layout; change to 'vbox' if desired
         */
        layout: {
            type: 'hbox',
            align: 'stretch'
        }
    },
    // The following styles are required to ensure the background is painted correctly
    border: false,
    cls: 'x-tab x-tab-active x-tab-default',
    bodyPadding: 5,
    bodyStyle: {
        background: 'transparent'
    },
    /**
    * Creates the view components, using the specified configuration such as {@link #refreshButton}. etc.
    * Calls the overridden superclass method.    
    */
    initComponent: function() {
        var me = this;
        var dockedItems = me.setupDockedItems();
        var items = me.setupItems();
        if (dockedItems != null && !me.getDashlet()) {
            Ext.apply(me, {
                dockedItems: [
                    {
                        xtype: 'toolbar',
                        cls: 'x-tab x-tab-active x-tab-default',
                        dock: 'top',
                        items: dockedItems
                    }
                ]
            });
        }
        if (items != null) {
            Ext.apply(me, {
                items: items
            });
        }
        me.callParent(arguments);
    },
    setupDockedItems: function() {
        var me = this,
            refreshBtn;
        if (me.getDashlet()) {
            me.refreshButton = '';
            return null;
        }
        // Refresh Button
        if (typeof me.refreshButton == "object") {
            refreshBtn = me.refreshButton;
            me.refreshButton = refreshBtn.reference;
        } else if (me.refreshButton != '') {
            refreshBtn = {
                xtype: 'button',
                reference: me.refreshButton,
                iconCls: 'refresh',
                text: me.dtRefresh
            };
        }
        return [
            '    ',
            refreshBtn
        ];
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
    display: function(dc) {
        var me = this;
        me.domainController = dc;
        if (me.config.title != '')  {
            me.setTitle(dc.domainView.getTitle() + " - " + me.config.title);
        }
        
        this.show();
        this.getController().onActivateView();
    },
    /**
     * Finds the parent of this activity's view
     * @return The parent view
     */
    findParentView: function() {
        var me = this;
        if (me.domainController != null)  {
            return me.domainController.domainView;
        }
        
        return me.findParentBy(function(container) {
            if (container.isXType('domainview') || container.isXType('dashboardview') || container.isXType('cardview'))  {
                return true;
            }
            
        });
    }
});

/**
 *  An ActivityPopup extends {@link Baff.app.view.ActivityView} to provide a popup windowed version 
 *  (as opposed the superclass tab based version).  Please refer to the superclass description for more
 *  details.
 */
Ext.define('Baff.app.view.ActivityPopup', {
    extend: 'Baff.app.view.ActivityView',
    xtype: 'activitypopup',
    config: {
        /**
        * Specifies the width of the popup window
        */
        width: 800,
        /**
        * Specifies the height of the popup window
        */
        height: 600,
        /**
         * Sepecifies if the popup is modal.
         * Defaults to true - set to false for a floating cross-domain window, e.g. to present summary view
         */
        modal: true,
        // The following specify the required user interface configuration for a popup window
        draggable: true,
        resizable: true,
        closable: true,
        border: true,
        frame: false,
        floating: true,
        // Don't destroy the view when it's closed
        closeAction: 'hide'
    }
});

/**
 *  A CardView provides the view for a set of 'cards' typically provided by child instances of 
 *  {@link  Baff.app.view.FormView}. It is controlled by a {@link Baff.app.controller.CardController}
 *  and should be setup as a tab in a parent {@link  Baff.app.view.DomainView} configuration.
 * 
 *  It may also control a 'selector' that is used to select the entity to be presented in one of the cards,
 *  typically provided by a {@link Baff.app.view.TreeView}.
 *  
 *  A typical setup is as follows:
 * 
 *      Ext.define('MyApp.view.MyCardView', {
 *          extend: 'Baff.app.view.CardView',
 *          
 *          alias: 'widget.mycardview',
 *          
 *          requires: ['MyApp.view.MyTreeViewl',
 *                          'MyApp.view.MyCardA',
 *                          'MyApp.view.MyCardB',
 *                          'MyApp.view.MyCardC'],
 *   
 *          config : {
 *                    
 *                    controller: 'mycardcontroller',    // alias of MyApp.controller.MyCardController       
 *                    emptyCard: true, // To display an empty card if nothing is selected
 *                    
 *                    cards: [{
 *                                      xtype: 'mycarda'.  // alias of MyApp.view.MyCardA
 *                                      reference: 'mycarda'
 *                                 },
 *                                 {
 *                                      xtype: 'mycardb'.  // alias of MyApp.view.MyCardB
 *                                      reference: 'mycardb'
 *                                 },
 *                                 {
 *                                      xtype: 'mycardc'.  // alias of MyApp.view.MyCardC
 *                                      reference: 'mycardc'
 *                                 }]
 *                                        
 *           }
 *      });
 *           
 */
Ext.define('Baff.app.view.CardView', {
    extend: 'Ext.panel.Panel',
    xtype: 'cardview',
    /**
     * The reference for the card container
     * @private
     */
    cardViewRef: 'cardview',
    /**
     * The reference for the selector
     * @private
     */
    selectorViewRef: 'selectorview',
    config: {
        /**
        * Specifies the {@link Baff.app.controller.CardDomainController} that controls this view
        */
        controller: 'carddomain',
        /**
         * Specifies the alias for the selector, typically a {@link Baff.app.view.TreeView}
         */
        selectorView: '',
        /**
         * The flex for the selector relative to the cards; both default to 10
         */
        selectorFlex: 10,
        /**
         * An array card item configurations 
         */
        cards: [],
        /**
         * Specifies to disable the refresh button for each card; this is typically not required if there is a selector
         * that supports refresh.
         */
        disableCardRefresh: true,
        /**
         * Specifies if an empty card should be displayed if nothing is selected, otherwise the first card will be
         * displayed. 
         * Set to true to display the default empty card or else provide a card configuraiton.
         */
        emptyCard: true,
        /**
         * The text to be displayed for the default empty card.
         */
        emptyCardText: 'Please select an item to view...'
    },
    // The following styles are required to ensure the background is painted correctly
    border: false,
    cls: 'x-tab x-tab-active x-tab-default',
    bodyPadding: 5,
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    bodyStyle: {
        background: 'transparent'
    },
    /**
    * Creates the view components, using the specified configuration such as {@link #refreshButton}. etc.
    * Calls the overridden superclass method.    
    */
    initComponent: function() {
        var me = this;
        var items = [];
        var selectorView = me.getSelectorView;
        if (selectorView != null && selectorView != '') {
            if (typeof selectorView == "object") {
                me.selectorViewRef = selectorView.reference;
            } else {
                me.selectorViewRef = me.getSelectorView();
                selectorView = {
                    xtype: me.selectorViewRef,
                    reference: me.selectorViewRef,
                    margin: '0 5 0 0',
                    flex: me.getSelectorFlex()
                };
            }
            items.push(selectorView);
        }
        var cards = me.getCards();
        var emptyCard = me.getEmptyCard();
        if (me.getDisableCardRefresh()) {
            Ext.Array.each(cards, function(card) {
                card.refreshButton = '';
            });
        }
        if (typeof emptyCard == "object") {
            cards.unshift(emptyCard);
        } else if (emptyCard == true) {
            emptyCard = {
                xtype: 'container',
                reference: 'emptyCard',
                layout: {
                    type: 'hbox',
                    align: 'center'
                },
                items: [
                    {
                        xtype: 'container',
                        flex: 1,
                        layout: {
                            type: 'vbox',
                            align: 'center'
                        },
                        items: [
                            {
                                xtype: 'container',
                                flex: 1,
                                html: me.getEmptyCardText()
                            }
                        ]
                    }
                ]
            };
            cards.unshift(emptyCard);
        }
        var cardView = {
                xtype: 'container',
                reference: me.cardViewRef,
                flex: 10,
                layout: 'card',
                items: cards
            };
        items.push(cardView);
        Ext.apply(me, {
            items: items
        });
        me.callParent(arguments);
    }
});

/**
 *  A DashboardView provides the view for a set of 'dashlets' provided by child instances of 
 *  {@link  Baff.app.view.ActivityView}. It is controlled by a {@link Baff.app.controller.DashboardController}
 *  and should be setup as a tab in a parent {@link  Baff.app.view.DomainView} configuration.
 *  
 *  Underlying activity views may be configured using a combination of vbox and hbox layouts, e.g. 
 *   
 *    config: {
 *    
 *       controller: 'mydashboard',
 *       
 *       items: [{
 *          // Row 1
 *          flex:1,
 *          layout: {
 *               type: 'hbox',
 *               align: 'stretch',
 *               pack: 'start'
 *           },
 *           items: [{
 *               xtype: 'myfirstdashlet',
 *               dashlet: true,
 *               flex: 1
 *               },{
 *               xtype: 'myseconddashlet',
 *               dashlet: true,
 *               flex: 1
 *               }
 *           ]}, {
 *          // Row 2
 *          flex: 1,
 *          layout: {
 *               type: 'hbox',
 *               align: 'stretch',
 *               pack: 'start'
 *          },
 *          items: [{
 *               xtype: 'mythirddashlet',
 *               dashlet: true,
 *               flex: 1
 *               }]
 *       }]
 *  
 */
Ext.define('Baff.app.view.DashboardView', {
    extend: 'Ext.panel.Panel',
    xtype: 'dashboardview',
    config: {
        /**
        * Specifies the {@link Baff.app.controller.DashboardController} that controls this view
        */
        controller: 'dashboard'
    },
    bodyStyle: {
        background: 'transparent'
    },
    // The following styles are required to ensure the background is painted correctly
    border: false,
    cls: 'x-tab x-tab-active x-tab-default',
    bodyPadding: 5,
    layout: {
        type: 'vbox',
        align: 'stretch',
        pack: 'start'
    }
});

/**
 *  A domainView tabulates a set of {@link Baff.app.view.ActivityView}s assocated with activities,
 *  and is controlled by a {@link Baff.app.controller.DomainController}, which manages navigation and
 *  communication between the activities.
 *  
 *  A domainView can also contain a set of other domainViews in order to define a hierarchical
 *  navigation structure for the application, for example:
 *  
 *  EntityNavigationView --> MultidomainView --> MaindomainView
 *  
 *  where:
 *    
 *    - EntityNavigationController presents views for each master entity type, e.g. Customer, Product, etc.    
 *    - MultipleDomainController presents views for different instances of the same master entity type  
 *    - MainDomainController presents views for the activities relating to a specific master entity instance    
 *  
 * A typical implementation for a "MaindomainView" that presents a set of views for activities associated with
 * a master entity is as follows; only the {@link controller} and the references to the various activity
 * views need to be specified.
 * 
 *     Ext.define('MyApp.view.MyMainEntitytView', {
 *          extend: 'Baff.app.view.DomainView',
 *          alias: 'widget.mymaindomainView',
 *            
 *          requires: ['MyApp.controller.MyMainDomainController',
 *                          'MyApp.view.MyActivityFooView',
 *                          'MyApp.view.MyActivityBarView'],
 *          
 *          config: {    
 *              controller: 'mymainentity',        
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
 *  The configuration for entity views containing other entity views is very similar, with the various entity
 *  views referenced instead.  For "Multi" views to specify an "add new" tab, which will dynamically
 *  create a new activity instance, for example:
 *  
 *     Ext.define('MyApp.view.MyMultiEntitytView', {
 *          extend: 'Baff.app.view.DomainView',
 *          alias: 'widget.mymultidomainView',
 *            
 *          requires: ['MyApp.controller.MyMultiDomainController',
 *                          'MyApp.view.MyMaindomainView'],
 *          
 *          config: {    
 *              controller: 'mymultientity',        
 *              
 *              defaults: {
 *                   closable: true    // added views will be able to be closed
 *              },
 *              
 *              items: [{
 *                      title: 'MyEntity',    // An optional default view as a new view will be created automatically
 *                      xtype: 'mymaindomainview', 
 *                      closable: false    // Optional
 *                  }, {     
 *                      title: '<i>New Entity...<i>',    // The "add new" tab, with title in italics
 *                      reference: 'newtab',    // IMPORTANT: must be set to 'newtab'
 *                      newType: 'mymaindomainview',    // type of the view to be added
 *                      newTitle: 'MyEntity',    // The title of the new tab 
 *                      closable: false    // Must set otherwise user can close the "add new" tab
 *                      popupSelector: 'myPopup' // A popup selector, if required
 *                  }]
 *               }
 *     });
 *                         
 *                                                                  
 */
Ext.define('Baff.app.view.DomainView', {
    extend: 'Ext.tab.Panel',
    xtype: 'domainview',
    config: {
        /**
        * Specifies the {@link Baff.app.controller.DomainController} that controls this view
        */
        controller: 'domain',
        /**
         * Indicates if this view was dynamically created
         * @private
         */
        fromNew: false,
        /**
        * Specifies the popup window widget type, e.g. a {@link Baff.app.view.SelectorPopup} that 
        * should be initially displayed in order to select the master entity.
        */
        popupSelector: '',
        /**
         * Specifies a dashlet window to be displayed, e.g. to present summary details
         */
        dashletSelector: '',
        /**
         * Specifies where to dock the dashlet window or specify 'popup' if a floating modal window
         */
        dashletDock: 'right',
        /**
         * Specifies a list of views or view indexes where the dashlet should auto-hide if visible.
         * Defaults to the first tab
         */
        autoHideDashletOnView: [
            0
        ],
        /** 
         * Specifies the dashlet should automatically be shown for any views where it is not automatically hidden
         * as specified by #autoHideDashletOnView}
         */
        autoShowDashlet: false,
        /**
         * Specifies if the dashlet is initially hidden
         * Note that the {@link #autoHideDashletOnView} should also be set accordingly
         */
        hideDashlet: false,
        /**
         * Specifies if any dashlet can be toggled between visibile and hidden states
         */
        toggleDashlet: true
    },
    // The following styles are required to ensure the background is painted correctly
    border: false,
    bodyStyle: {
        background: 'transparent'
    },
    defaults: {
        bodyStyle: {
            background: 'transparent'
        }
    },
    /**
    * Creates the view components, using the specified configuration such as {@link #refreshButton}. etc.
    * Calls the overridden superclass method.    
    */
    initComponent: function() {
        var me = this;
        if (me.getDashletSelector() !== '' && me.getDashletDock() != 'popup') {
            Ext.apply(me, {
                dockedItems: [
                    {
                        xtype: me.getDashletSelector(),
                        dock: me.getDashletDock(),
                        reference: me.getDashletSelector(),
                        dashlet: true,
                        hidden: me.getHideDashlet()
                    }
                ]
            });
        }
        me.callParent(arguments);
    }
});

/**
 *  A FilterField provides a form text field to capture search criteria and filters a 
 *  {@link Baff.app.model.EntityStore}.  The field is typically defined on a parent 
 *  {@link Baff.app.view.FilterPanel} through it's 'xtype', which in turn is associated with a 
 *  parent {@link Baff.app.view.ListPanel}.
 */
Ext.define('Baff.utility.widget.FilterField', {
    extend: 'Ext.form.field.Text',
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
     * Handlers for the 'clear' and 'search' widgets
     * @private
     */
    triggers: {
        clear: {
            weight: 0,
            cls: Ext.baseCSSPrefix + 'form-clear-trigger',
            hidden: true,
            handler: 'onClearClick',
            scope: 'this'
        },
        search: {
            weight: 1,
            cls: Ext.baseCSSPrefix + 'form-search-trigger',
            handler: 'onSearchClick',
            scope: 'this'
        }
    },
    /**
     * Specifies the field name to be filtered
     * @cfg (required)
     */
    filterFieldName: 'filterFieldName not defined',
    /**
    * Sets a handler so that the the search will be initiated if the the field is navigated away from via
    * one of the 'special' keys.
    * Calls the overridden superclass method.
    */
    initComponent: function() {
        var me = this;
        
        me.callParent(arguments);
        me.on('specialkey', function(f, e) {
            if (e.getKey() == e.ENTER) {
                me.onSearchClick();
            }
        });
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
    onClearClick: function() {
        var me = this,
            activeFilter = me.activeFilter;
        if (activeFilter) {
            me.setValue('');
            if (me.entityStore)  {
                me.entityStore.removeFieldFilter(activeFilter);
            }
            
            me.activeFilter = null;
            me.getTrigger('clear').hide();
            me.updateLayout();
        }
    },
    /**
    * Sets the {@link #activeFilter}.  Notifies any parent {@link Baff.app.view.ListPanel}.
    * Called when the search widget is clicked.
    */
    onSearchClick: function() {
        var me = this,
            value = me.getValue(),
            oldActiveFilter = me.activeFilter;
        if (value.length > 0) {
            me.activeFilter = new Ext.util.Filter({
                property: me.filterFieldName,
                value: "%" + value + "%"
            });
            if (me.entityStore)  {
                me.entityStore.addFieldFilter(me.activeFilter);
            }
            
            me.getTrigger('clear').show();
            me.updateLayout();
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
 *           fieldLabel: 'Bar',
 *           refdataClass: 'REFDATA.BAR',
 *           flex: 1
 *       }
 *       ...
 *                  
 */
Ext.define('Baff.utility.refdata.RefDataComboBox', {
    extend: 'Ext.form.ComboBox',
    requires: [
        'Baff.utility.refdata.RefDataManager'
    ],
    xtype: 'refdatacombobox',
    /**
    * Specifies the value field for the underlying combo box
    * @private
    */
    valueField: 'code',
    /**
    * Specifies the display field for the underlying combo box
    * @private
    */
    displayField: 'decode',
    /**
    * Specifies that all data is held locally as far as the combo box is concerend
    * @private
    */
    queryMode: 'local',
    /**
    * Specifies that only values in the list can be selected
    * @private
    */
    forceSelection: true,
    initialKey: null,
    // Literals for the default values
    REF_DATA_NULL: 'REF.DATA.NULL',
    REF_DATA_NOCLASS: 'REF.DATA.NOCLASS',
    config: {
        /**
        * Specifes the reference data class to be used
        * @cfg refdataClass (required)
        */
        refdataClass: 'REF.DATA.NOCLASS',
        /**
        * Specifes the key for record to be displayed by default
        */
        defaultKey: 'REF.DATA.NULL',
        /**
        * Specifies if auto select is enabled 
        */
        typeAhead: true
    },
    /**
    * Setup the component by setting up the reference data class
    * Calls the overridden superclass method.
    * Called on initialisation.
    */
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
        me.setRefDataClass(me.refdataClass, me.defaultKey);
    },
    /**
    * Gets the key for the currently selected record
    * @returns {String} key
    * @private
    */
    getKey: function() {
        var me = this;
        var key = me.REF_DATA_NULL;
        if (me.store) {
            var code = me.getSubmitValue();
            var record = me.store.findRecord('code', code);
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
        //Utils.logger.info("RefDataComboBox::getKey");
        var code = null;
        if (me.store)  {
            code = me.getSubmitValue();
        }
        
        return code;
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
        // Set a listener on the store
        //me.getStore().on('loaded', me.setDefaultKey, me);
        if (me.getStore().isLoaded()) {
            me.setValueOnData();
        }
    },
    /**
    * Sets the default value when data is available in the store
    * @private
    */
    setValueOnData: function() {
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
                if (record)  {
                    value = record.get('code');
                }
                
            }
        }
        me.callParent(arguments);
    }
});

/**
 *  A RefDataFilterField is a form combo box bound to a reference data class that is used to filter
 *  a store. It provides similar functionality to a {@link Baff.app.view.FilterField}.
 *  
 *  A typical configuration when defining fields for a {@link Baff.app.view.FilterPanel} is:
 *          
 *        items: [{
 *              fieldLabel: 'Filter Bar',
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
     * Handlers for the 'clear' and 'search' widgets
     * @private
     */
    triggers: {
        clear: {
            weight: 0,
            cls: Ext.baseCSSPrefix + 'form-clear-trigger',
            hidden: true,
            handler: 'onClearClick',
            scope: 'this'
        },
        picker: {
            weight: 1,
            handler: 'onTriggerClick',
            scope: 'this'
        }
    },
    /**
     * Specifies the field name to be filtered
     * @cfg (required)
     */
    filterFieldName: 'filterFieldName not defined',
    /**
    * Sets a handler so that the the search will be initiated if a field is selected
    * Calls the overridden superclass method.
    */
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
        me.on('select', me.onSearchClick, me);
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
    onClearClick: function() {
        var me = this,
            activeFilter = me.activeFilter;
        if (activeFilter) {
            me.setValue(0);
            if (me.entityStore)  {
                me.entityStore.removeFieldFilter(activeFilter);
            }
            
            me.activeFilter = null;
            me.getTrigger('clear').hide();
            me.updateLayout();
        }
    },
    /**
    * Sets the {@link #activeFilter}.  Notifies any parent {@link Baff.app.view.ListPanel}.
    * Called when the search widget is clicked.
    */
    onSearchClick: function() {
        var me = this,
            value = me.getCode(),
            oldActiveFilter = me.activeFilter;
        if (value > 0) {
            me.activeFilter = new Ext.util.Filter({
                property: me.filterFieldName,
                value: value
            });
            if (me.entityStore)  {
                me.entityStore.addFieldFilter(me.activeFilter);
            }
            
            me.getTrigger('clear').show();
            me.updateLayout();
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
 *        items: [{
 *              fieldLabel: 'Search Foo',
 *              xtype: 'filterfield',
 *              filterFieldName: 'foo'
 *            },{
 *              fieldLabel: 'Filter Bar',
 *              xtype: 'refdatafilter',
 *              refdataClass: 'REFDATACLASS.BAR',
 *              filterFieldName: 'bar'
 *            }
 *        ]   
 *    }); 
 *
 */
Ext.define('Baff.app.view.FilterPanel', {
    extend: 'Ext.form.Panel',
    xtype: 'filterpanel',
    requires: [
        'Baff.utility.widget.FilterField',
        'Baff.utility.refdata.RefDataFilterField'
    ],
    //frame: true,
    padding: '5 5 0 5',
    border: false,
    //layout: 'form',
    bodyStyle: {
        background: 'transparent'
    },
    fieldDefaults: {
        labelAlign: 'left',
        labelWidth: 150
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
 *          items: [{              
 *              // Fieldset: FooBar               
 *              xtype: 'fieldset',
 *              title: 'Fieldset Foo',
 *              collapsible: true,
 *              items: [{                  
 *                  // Row: Foo and Bar                  
 *                  xtype: 'container',
 *                  layout: 'hbox',
 *                  items: [{
 *                      xtype: 'textfield',
 *                      name: 'foo',
 *                      fieldLabel: 'Foo',
 *                      flex: 2
 *                  },{
 *                      xtype: 'refdatacombobox',
 *                      name: 'bar',
 *                      fieldLabel: 'Bar',
 *                      refdataClass: 'REFDATA.BAR',
 *                      flex: 1
 *                  }]
 *              },{
 *                  // Row: Another Row
 *                  ...
 *              }],
 *          },{
 *              // Fieldset: Another Fieldset
 *              ...
 *          }]
 *      });
 *
 */
Ext.define('Baff.app.view.FormPanel', {
    extend: 'Ext.form.Panel',
    xtype: 'formpanel',
    requires: [
        'Ext.form.FieldSet',
        'Ext.form.field.Radio',
        'Ext.form.RadioGroup',
        'Ext.toolbar.Toolbar',
        'Ext.form.ComboBox',
        'Baff.utility.refdata.RefDataManager',
        'Baff.utility.refdata.RefDataComboBox'
    ],
    // The following config sets up the user interface
    bodyPadding: 10,
    frame: true,
    scrollable: 'vertical',
    fieldDefaults: {
        labelAlign: 'right'
    },
    /**
     * Resets all the fields in the form to their original values
     */
    setCleanRecord: function() {
        this.getForm().getFields().each(function(field) {
            field.resetOriginalValue();
            field.reset();
        });
    },
    /**
     * Sets all the fields in the form read only (or editable if false)
     * @param {boolean}
     */
    makeReadOnlyForAll: function(readOnly) {
        Ext.suspendLayouts();
        this.getForm().getFields().each(function(field) {
            if (readOnly || field.config.readOnly !== true)  {
                field.setReadOnly(readOnly);
            }
            
        });
        Ext.resumeLayouts();
    }
});

/**
 *  A FormView extends {@link Baff.app.view.ActivityView} to provide the view for a discrete activity 
 *  controlled by a {@link Ext.foundation.FormController}. It provides the various user interface components
 *  for the activity include the form and various buttons.
 *  
 *  A minimal setup only requires the {@link #controller} and {@link #formPanel} to be specified, along
 *  with an alias so that the view can be referenced by an {@link Baff.app.view.DomainView}.
 * 
 *      Ext.define('MyApp.view.MyFormView', {
 *          extend: 'Baff.app.view.FormView',
 *          
 *          alias: 'widget.myformview',
 *          
 *          requires: ['MyApp.view.MyFormPanel',
 *                          'MyApp.controller.MyFormController'],
 *   
 *          config : {
 *                    
 *                    controller: 'myformcontroller',    // alias of MyApp.controller.MyFormController       
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
 *                      reference: 'removeBtn',
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
        'Ext.toolbar.Toolbar',
        'Baff.app.view.FormPanel'
    ],
    // Display text
    dtAdd: 'Add',
    dtRemove: 'Delete',
    dtSave: 'Save',
    dtRevert: 'Undo',
    config: {
        /**
        * Specifies the type of {@link Baff.app.controller.FormController} that controls this view.
        * **IMPORTANT**: This view's subclass should specify a subclass of the above controller.
        * @cfg controller (required)
        */
        controller: 'form',
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
        var me = this,
            addBtn, removeBtn, revertBtn, saveBtn, refreshBtn;
        if (me.getDashlet()) {
            me.addButton = '';
            me.refreshButton = '';
            me.removeButton = '';
            me.revertButton = '';
            me.saveButton = '';
            return null;
        }
        // Add Button
        if (typeof me.addButton == "object") {
            addBtn = me.addButton;
            me.addButton = addBtn.reference;
        } else if (me.addButton != '') {
            addBtn = {
                xtype: 'button',
                reference: me.addButton,
                iconCls: 'addnew',
                text: me.dtAdd
            };
        }
        // Remove Button
        if (typeof me.removeButton == "object") {
            removeBtn = me.removeButton;
            me.removeButton = removeBtn.reference;
        } else if (me.removeButton != '') {
            removeBtn = {
                xtype: 'button',
                reference: me.removeButton,
                iconCls: 'delete',
                text: me.dtRemove
            };
        }
        // Revert Button
        if (typeof me.revertButton == "object") {
            revertBtn = me.revertButton;
            me.revertButton = revertBtn.reference;
        } else if (me.revertButton != '') {
            revertBtn = {
                xtype: 'button',
                reference: me.revertButton,
                iconCls: 'undo',
                text: me.dtRevert
            };
        }
        // Save Button
        if (typeof me.saveButton == "object") {
            saveBtn = me.saveButton;
            me.saveButton = saveBtn.reference;
        } else if (me.saveButton != '') {
            saveBtn = {
                xtype: 'button',
                reference: me.saveButton,
                iconCls: 'save',
                text: me.dtSave
            };
        }
        // Refresh Button
        if (typeof me.refreshButton == "object") {
            refreshBtn = me.refreshButton;
            me.refreshButton = refreshBtn.reference;
        } else if (me.refreshButton != '') {
            refreshBtn = {
                xtype: 'button',
                reference: me.refreshButton,
                iconCls: 'refresh',
                text: me.dtRefresh
            };
        }
        return [
            '    ',
            refreshBtn,
            addBtn,
            removeBtn,
            '->',
            revertBtn,
            saveBtn,
            '    '
        ];
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
                reference: me.getFormPanel(),
                flex: 10
            });
        }
        return items;
    }
});

/**
 *  An ActivityPopup extends {@link Baff.app.view.ActivityView} to provide a popup windowed version 
 *  (as opposed the superclass tab based version).  Please refer to the superclass description for more
 *  details.
 */
Ext.define('Baff.app.view.FormPopup', {
    extend: 'Baff.app.view.FormView',
    xtype: 'formpopup',
    config: {
        /**
        * Specifies the width of the popup window
        */
        width: 800,
        /**
        * Specifies the height of the popup window
        */
        height: 600,
        /**
         * Sepecifies if the popup is modal.
         * Defaults to true - set to false for a floating cross-domain window, e.g. to present summary view
         */
        modal: true,
        // The following specify the required user interface configuration for a popup window
        draggable: true,
        resizable: true,
        closable: true,
        border: true,
        frame: false,
        floating: true,
        dock: 'bottom',
        // Don't destroy the view when it's closed
        closeAction: 'hide'
    }
});

/**
 *  A RefDataColumn is a grid column bound to a reference data class, and which can be filtered
 *  on the values of the reference data.
 *  
 *  Note: If the view that this belongs to is displayed early it may be necessary to pre-load the
 *  reference data store.
 *  
 *  A typical configuration when defining columns for a {@link Baff.app.view.ListPanel} is:
 *  
 *      columns: [{
 *             text: 'Foo',
 *             dataIndex: 'foo',
 *             xtype: 'refdatacolumn',  
 *             refdataClass: "REFDATA.FOO",
 *             filter: true,        // Sets a filter widget on the column header           
 *             hideable: false,                
 *             flex: 1
 *             },{
 *             ....
 *  
 */
Ext.define('Baff.utility.refdata.RefDataColumn', {
    extend: 'Ext.grid.column.Column',
    xtype: 'refdatacolumn',
    requires: [
        'Baff.utility.Utilities'
    ],
    config: {
        /**
        * Specifes the reference data class to be used
        * @cfg refdataClass (required)
        */
        refdataClass: null,
        /**
        * Specifes if this column is sortable
        */
        sortable: false,
        /**
        * Specifes if this column can be filtered (using the reference data values)
        */
        filter: true
    },
    /**
    * Setup the component by defining a renderer and applying the filter.
    * Calls the overridden superclass method.
    * Called on initialisation.
    */
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
        // Render the field by decoding the reference data
        Ext.apply(me, {
            renderer: function(value) {
                return Utils.refDataManager.getDecode(value, me.refdataClass);
            }
        });
        if (!me.filter)  {
            return;
        }
        
        // Setup the filter
        var filterVals = Utils.refDataManager.getCodeDecodeArray(me.refdataClass);
        Ext.apply(me, {
            filter: {
                type: 'list',
                options: filterVals,
                single: true,
                idField: 'code',
                labelField: 'decode'
            }
        });
    },
    /**
    * Enable the menu if the filter is available.
    * Calls the overridden superclass method.
    * Called before rendering the component.
    */
    beforeRender: function() {
        var me = this;
        me.callParent(arguments);
        if (me.filter != null && me.filter != false) {
            me.menuDisabled = false;
        }
    }
});

/**
 *  A ListPanel provides a panel for presenting a list of business entity data.  It is typically presented in 
 *  a {@link Baff.app.view.ListFormView} or {@link Baff.app.view.SelectorView}.
 *  
 *  An example implementation is as follows.  
 *  
 *      Ext.define('MyApp.view.MyListPanel', {
 *         extend: 'Baff.app.view.ListPanel',
 *         alias: 'widget.mylistpanel',
 *         requires: ['MyApp.view.MySearchPanel'],
 *                 
 *         title: 'My List',
 *         filterPanel: 'myfilterpanel',  // alias of MyApp.view.MySearchPanel (optional)
 *         hideSearchPanel: true,
 *         
 *         columns: [{
 *             xtype: 'refdatacolumn',  
 *             text: 'Foo',
 *             dataIndex: 'foo',
 *             refdataClass: "REFDATA.FOO",
 *             filter: true,        // Sets a filter widget on the column header           
 *             hideable: false,                
 *             flex: 1
 *             },{
 *             xtype: 'gridcolumn',  // default, so does not need to be specified
 *             text: 'Bar',
 *             dataIndex: 'bar',
 *             sortable: true, // default
 *             filter: false,                
 *             hideable: false,               
 *             flex: 3
 *             },{
 *             ...
 *             }]
 *         });
 *
 */
Ext.define('Baff.app.view.ListPanel', {
    extend: 'Ext.grid.Panel',
    xtype: 'listpanel',
    requires: [
        'Ext.grid.filters.Filters',
        'Baff.app.view.FilterPanel',
        'Baff.utility.refdata.RefDataColumn'
    ],
    // Display text for override in locale file 
    dtRecordsFound: "Records found",
    dtFiltered: "(filtered)",
    dtShowSearch: 'Show search panel',
    dtHideSearch: 'Hide search panel',
    dtRefreshList: 'Refresh view',
    frame: true,
    config: {
        /**
        * Specifies a reference to a {@link Baff.app.view.FilterPanel} that provides filtering
        */
        filterPanel: '',
        /**
        * Specifies if the record count is to be displayed
        */
        listCount: true,
        /**
        * Specifies if the list can be refreshed (will display a refresh widget)
        * Set to false by default as assume there will be a refresh button on the view
        */
        allowRefresh: false,
        /**
        * Specifies if the associated {@link Baff.app.view.FilterPanel} specified by {@link #filterPanel}
        * can be shown and hidden
        */
        hideSearchPanel: false
    },
    // Config for correct user interface
    height: 1000,
    // won't display records from a buffered store if not set
    selModel: {
        pruneRemoved: false
    },
    viewConfig: {
        markDirty: false,
        stripeRows: true,
        trackOver: false
    },
    //reserveScrollbar: true,
    /**
     * @event refreshList
     * Fires when the list has been refreshed.
     */
    /**
    * Sets up the user interface components
    * Calls the overridden superclass method.
    */
    initComponent: function() {
        var me = this;
        Ext.apply(me, {
            plugins: [
                'gridfilters'
            ]
        });
        var tools = [];
        var dockedItems = [];
        // Setup the filter panel
        if (me.filterPanel != "") {
            dockedItems.push({
                xtype: 'toolbar',
                dock: 'top',
                itemId: 'filterPanel',
                layout: 'anchor',
                padding: 5,
                hidden: me.hideSearchPanel,
                items: [
                    {
                        xtype: me.filterPanel
                    }
                ]
            });
            // Set up the toolbar widgets                             
            tools.push({
                type: 'up',
                tooltip: me.dtHideSearch,
                itemId: 'hideSearch',
                callback: me.onHideSearch,
                hidden: me.hideSearchPanel
            });
            tools.push({
                type: 'search',
                tooltip: me.dtShowSearch,
                itemId: 'showSearch',
                callback: me.onShowSearch,
                hidden: !me.hideSearchPanel
            });
        }
        // Setup the refresh widget
        if (me.allowRefresh) {
            tools.push({
                type: 'refresh',
                itemId: 'refreshList',
                callback: me.onRefreshList,
                tooltip: me.dtRefreshList
            });
        }
        // Setup the counter
        if (me.listCount) {
            dockedItems.push({
                dock: 'bottom',
                minHeight: 20,
                xtype: 'toolbar',
                cls: 'x-tab x-tab-active x-tab-default',
                items: [
                    '->',
                    {
                        xtype: 'component',
                        itemId: 'listCount',
                        style: 'margin-right:5px'
                    }
                ]
            });
        }
        if (tools.length > 0) {
            Ext.apply(me, {
                tools: tools
            });
        }
        if (dockedItems.length > 0) {
            Ext.apply(me, {
                dockedItems: dockedItems
            });
        }
        me.on('beforedestroy', me.beforeDestroy, me);
        me.callParent(arguments);
    },
    /**
    * Notifies that the refresh widget has been selected
    * @fires refreshList
    */
    onRefreshList: function(owner, tool) {
        owner.fireEvent('refreshList', owner);
    },
    /**
    * Hides the associated {@link Baff.app.view.FilterPanel}.
    * Called when the hide widget is clicked.
    */
    onHideSearch: function(owner, tool) {
        var me = owner;
        tool.hide();
        me.down('#filterPanel').hide();
        me.down('#showSearch').show();
    },
    /**
    * Shows the associated {@link Baff.app.view.FilterPanel}.
    * Called whe the show widget is clicked.
    */
    onShowSearch: function(owner, tool) {
        var me = owner;
        tool.hide();
        me.down('#filterPanel').show();
        me.down('#hideSearch').show();
    },
    /**
    * Sets the store used by the list and applies any filters.
    * @param {Baff.app.model.EntityStore} store
    */
    setEntityStore: function(store) {
        var me = this,
            i;
        var filters = Ext.ComponentQuery.query('filterfield', me);
        for (i = 0; i < filters.length; i++) {
            filters[i].setEntityStore(store);
        }
        var refdataFilters = Ext.ComponentQuery.query('refdatafilter', me);
        for (i = 0; i < refdataFilters.length; i++) {
            refdataFilters[i].setEntityStore(store);
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
        if (me.getStore().getFieldFilterCount() > 0) {
            text += " " + me.dtFiltered;
        }
        if (listCount != null) {
            text += ": " + me.store.getTotalCount();
            listCount.update(text);
        }
    },
    /**
     * Override to fix binding order (this, then view, then renderer)
     */
    bindStore: function(store, initial) {
        var me = this,
            view = me.getView(),
            bufferedRenderer = me.bufferedRenderer;
        if (store) {
            me.store = store;
            // This needs to happen before binding th renderer otherwise it can result in the view
            // attempting to work on a null store
            if (view.store !== store) {
                view.bindStore(store, false);
            }
            if (bufferedRenderer && bufferedRenderer.isBufferedRenderer && bufferedRenderer.store) {
                bufferedRenderer.bindStore(store);
            }
            me.mon(store, {
                load: me.onStoreLoad,
                scope: me
            });
            me.storeRelayers = me.relayEvents(store, [
                'filterchange',
                'groupchange'
            ]);
        } else {
            me.unbindStore();
        }
    }
});

/**
 *  A ListFormView extends {@link Baff.app.view.FormView} to provide the view for a discrete activity 
 *  controlled by a {@link Ext.foundation.ListFormController}. It provides the various user interface 
 *  components for the activity include the list, form and various buttons.
 *  
 *  A minimal setup only requires the {@link #controller}, {@link #listPanel} and {@link #formPanel} 
 *  to be specified, along with an alias so that the view can be referenced by an {@link Baff.app.view.DomainView}.
 * 
 *      Ext.define('MyApp.view.MyListFormView', {
 *          extend: 'Baff.app.view.ListFormView',
 *          
 *          alias: 'widget.mylistformview',
 *          
 *          requires: ['MyApp.view.MyFormPanel',
 *                          'MyApp.view.MyListPanel',
 *                          'MyApp.controller.MyListFormController'],
 *   
 *          config : {
 *                    
 *                    controller: 'myformcontroller',    // alias of MyApp.controller.MyFormController       
 *                    formPanel: 'myform'     // alias of MyApp.view.MyForm 
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
    config: {
        /**
        * Specifies the type of {@link Baff.app.controller.ListFormController} that controls this view.
        * **IMPORTANT**: This view's subclass should specify a subclass of the above controller.
        * @cfg controller (required)
        */
        controller: 'listform',
        /**
        * Specifies the type of {@link Baff.app.view.ListPanel} that provides the form for this view.
        * **IMPORTANT**: This view's subclass should specify a subclass of the above form panel.
        * @cfg listPanel (required)
        */
        listPanel: '',
        /**
         * Specifies the flex of the list (defaults to 10 relative to the form flex of 10)
         */
        listFlex: 10
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
        var margin = (me.getLayout().type == 'hbox' ? '0 5 0 0' : '0 0 5 0');
        var listPanel = {
                xtype: me.getListPanel(),
                reference: me.getListPanel(),
                margin: margin,
                flex: me.getListFlex()
            };
        if (me.getDashlet())  {
            listPanel.allowRefresh = true;
        }
        
        items.push(listPanel);
        me.callParent(arguments);
        return items;
    }
});

/**
 *  An ActivityPopup extends {@link Baff.app.view.ActivityView} to provide a popup windowed version 
 *  (as opposed the superclass tab based version).  Please refer to the superclass description for more
 *  details.
 */
Ext.define('Baff.app.view.ListFormPopup', {
    extend: 'Baff.app.view.ListFormView',
    xtype: 'listformpopup',
    config: {
        /**
        * Specifies the width of the popup window
        */
        width: 800,
        /**
        * Specifies the height of the popup window
        */
        height: 600,
        /**
         * Sepecifies if the popup is modal.
         * Defaults to true - set to false for a floating cross-domain window, e.g. to present summary view
         */
        modal: true,
        // The following specify the required user interface configuration for a popup window
        draggable: true,
        resizable: true,
        closable: true,
        border: true,
        frame: false,
        floating: true,
        // Don't destroy the view when it's closed
        closeAction: 'hide'
    }
});

/**
 *  A SelectorView extends {@link Baff.app.view.ActivityView} to provide the view for a discrete activity 
 *  controlled by a {@link Ext.foundation.SelectorController}. It provides the various user interface components
 *  for the activity include the list and various buttons.  Also refer to {@link Baff.app.view.SelectorPopup}
 *  for a popup version of this view.
 *  
 *  A minimal setup only requires the {@link #controller} and {@link #listPanel} to be specified, along
 *  with an alias so that the view can be referenced by an {@link Baff.app.view.DomainView}.
 * 
 *      Ext.define('MyApp.view.MySelectorView', {
 *          extend: 'Baff.app.view.SelectorView',
 *          
 *          alias: 'widget.myselectorview',
 *          
 *          requires: ['MyApp.view.MyListPanel',
 *                          'MyApp.controller.MySelectorController'],
 *   
 *          config : {
 *                    
 *                    controller: 'myselectorcontroller',    // alias of MyApp.controller.MySelectorController       
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
 *                      reference: 'myreference',
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
        'Ext.toolbar.Toolbar',
        'Baff.app.view.ListPanel'
    ],
    // Display text
    dtAdd: 'None',
    dtSelect: 'Select',
    config: {
        /**
        * Specifies the type of {@link Baff.app.controller.SelectorController} that controls this view.
        * **IMPORTANT**: This view's subclass should specify a subclass of the above controller.
        * @cfg controller (required)
        */
        controller: 'selector',
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
        selectButton: ''
    },
    /**
    * Sets up the docked items.
    * @return {Array} The list of items
    * @protected    
    */
    setupDockedItems: function() {
        var me = this,
            addBtn, refreshBtn, selectBtn;
        if (me.getDashlet()) {
            me.addButton = '';
            me.refreshButton = '';
            me.selectButton = '';
            return null;
        }
        // Add Button
        if (typeof me.addButton == "object") {
            addBtn = me.addButton;
            me.addButton = addBtn.reference;
        } else if (me.addButton != '') {
            addBtn = {
                xtype: 'button',
                reference: me.addButton,
                iconCls: 'addnew',
                text: me.dtAdd
            };
        }
        if (typeof me.refreshButton == "object") {
            refreshBtn = me.refreshButton;
            me.refreshButton = refreshBtn.reference;
        } else if (me.refreshButton != '') {
            refreshBtn = {
                xtype: 'button',
                reference: me.refreshButton,
                iconCls: 'refresh',
                text: me.dtRefresh
            };
        }
        if (typeof me.selectButton == "object") {
            selectBtn = me.selectButton;
            me.selectButton = selectBtn.reference;
        } else if (me.selectButton != '') {
            selectBtn = {
                xtype: 'button',
                reference: me.selectButton,
                iconCls: 'go',
                text: me.dtSelect
            };
        }
        return [
            '    ',
            refreshBtn,
            addBtn,
            '->',
            selectBtn,
            '    '
        ];
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
        var listPanel = {
                xtype: me.getListPanel(),
                reference: me.getListPanel(),
                flex: 1
            };
        if (me.getDashlet())  {
            listPanel.allowRefresh = true;
        }
        
        items.push(listPanel);
        return items;
    }
});

/**
 *  A SelectorPopup extends {@link Baff.app.view.SelectorView} to provide a popup windowed version 
 *  (as opposed the superclass tab based version).  Please refer to the superclass description for more
 *  details.
 */
Ext.define('Baff.app.view.SelectorPopup', {
    extend: 'Baff.app.view.SelectorView',
    xtype: 'selectorpopup',
    config: {
        /**
        * Specifies the width of the popup window
        */
        width: 800,
        /**
        * Specifies the height of the popup window
        */
        height: 600,
        /**
         * Sepecifies if the popup is modal.
         * Defaults to true - set to false for a floating cross-domain window, e.g. to present summary view
         */
        modal: true,
        /**
        * Specifies a reference to the select button for this view. If set to '' the select button will not be
        * created, however generally this is not necessary as the controller will manage button state.
        */
        selectButton: 'selectBtn',
        /**
        * Specifies a reference to the refresh button for this view. If set to '' the select button will not be
        * created, which is the default
        */
        refreshButton: '',
        // The following specify the required user interface configuration for a popup window
        draggable: true,
        resizable: true,
        closable: true,
        border: true,
        frame: false,
        floating: true,
        // Don't destroy the view when it's closed
        closeAction: 'hide'
    }
});

/**
 *  A TreePanel provides a panel for presenting a tree of nodes that represent business entity data.  
 *  It is typically presented in a {@link Baff.app.view.SelectorView} or a {@link Baff.app.view.CardView}.
 *  
 *  An example implementation is as follows.  
 *  
 *      Ext.define('MyApp.view.MyTreePanel', {
 *         extend: 'Baff.app.view.TreePanel',
 *         alias: 'widget.mytreepanel'
 *         
 *         title: 'My Tree Panel',
 *         allowRefresh: true,
 *         allowExpand: true,
 *         
 *         columns: [{
 *             xtype: 'treecolumn',
 *             text: 'Foo',
 *             dataIndex: 'foo',  
 *             flex: 1
 *             },{
 *             text: 'Bar',
 *             dataIndex: 'bar',
 *             flex: 2
 *             },{
 *             ...
 *             }]
 *         });
 *         
 */
Ext.define('Baff.app.view.TreePanel', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.bafftreepanel',
    config: {
        /**
        * Specifies if the list can be refreshed (will display a refresh widget)
        * Set to false by default as assume there will be a refresh button on the view
        */
        allowRefresh: false,
        /**
        * Specifies if the tree can be fully expanded.
        * Defaults to false given potential processing involved
        * to retrieve all nodes
        */
        allowExpand: false,
        /**
        * Specifies if the tree can be fully collapsed.
        * Default to true
        */
        allowCollapse: true
    },
    // Display text for locale override
    dtRefreshList: 'Refresh view',
    dtExpand: 'Expand all',
    dtCollapse: 'Collapse all',
    // Superclass configuration
    rootVisible: false,
    frame: true,
    reserveScrollbar: true,
    lines: true,
    /**
    * Sets up the user interface components
    * Calls the overridden superclass method.
    */
    initComponent: function() {
        var me = this;
        var tools = [];
        if (me.allowExpand) {
            tools.push({
                type: 'expand',
                tooltip: me.dtExpand,
                itemId: 'expandAll',
                callback: function(owner) {
                    owner.expandAll();
                }
            });
        }
        if (me.allowCollapse) {
            tools.push({
                type: 'collapse',
                tooltip: me.dtCollapse,
                itemId: 'collapseAll',
                callback: function(owner) {
                    owner.collapseAll();
                }
            });
        }
        if (me.allowRefresh) {
            tools.push({
                type: 'refresh',
                itemId: 'refreshList',
                callback: me.onRefreshList,
                tooltip: me.dtRefreshList
            });
        }
        if (tools.length > 0) {
            Ext.apply(me, {
                tools: tools
            });
        }
        me.callParent(arguments);
    },
    /**
    * Notifies that the refresh widget has been selected
    * @fires refreshList
    */
    onRefreshList: function(owner, tool) {
        owner.fireEvent('refreshList', owner);
    },
    /**
     * Sets the tree store
     * @param {Baff.app.model.TreeStore} store
     */
    setEntityStore: function(store) {
        this.setStore(store);
    },
    /**
     * Does nothing
     */
    updateSearchCount: function() {}
});

/**
 *  A LogonWindow captures the user name and password.
 *  
 *  A detault user name and password can be set via Utils.globals.defaultUsername and
 *  Utils.globals.defaultPassword.
 *  
 */
Ext.define('Baff.utility.application.LogonWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.logonwindow',
    requires: [
        'Ext.form.field.Text',
        'Baff.utility.Utilities'
    ],
    closable: false,
    bodyPadding: '10 10 0 10',
    // Literals for locale override
    dtLogonTitle: 'Logon',
    dtLogonBtn: 'Logon',
    dtOptions: 'Setup',
    dtRegister: 'Register User',
    dtUpdate: 'Update Password',
    dtReset: 'Reset Password',
    dtUserName: 'User Name',
    dtPassword: 'Password',
    dtVersion: 'Version',
    buttonAlign: 'center',
    /**
     * Initialise the view
     */
    initComponent: function() {
        var me = this;
        var buttonConfig = [];
        if (Utils.globals.manageUsers) {
            buttonConfig.push({
                text: me.dtOptions,
                itemId: 'optionBtn',
                menu: [
                    {
                        text: me.dtRegister,
                        itemId: 'register'
                    },
                    {
                        text: me.dtReset,
                        itemId: 'reset'
                    },
                    {
                        text: me.dtUpdate,
                        itemId: 'update'
                    }
                ]
            });
            buttonConfig.push(' ');
        }
        buttonConfig.push({
            text: me.dtLogonBtn,
            itemId: 'logonBtn'
        });
        Ext.apply(me, {
            title: Utils.globals.applicationName + ' ' + me.dtLogonTitle,
            items: [
                {
                    xtype: 'fieldset',
                    border: false,
                    fieldDefaults: {
                        anchor: '100%',
                        labelAlign: 'right'
                    },
                    layout: 'anchor',
                    items: [
                        {
                            xtype: 'textfield',
                            fieldLabel: me.dtUserName,
                            name: 'username',
                            value: Utils.globals.defaultUsername,
                            allowBlank: false,
                            validateOnBlur: true
                        },
                        {
                            xtype: 'textfield',
                            name: 'password',
                            fieldLabel: me.dtPassword,
                            inputType: 'password',
                            value: Utils.globals.defaultPassword,
                            allowBlank: false,
                            validateOnBlur: true
                        }
                    ]
                },
                {
                    xtype: 'fieldset',
                    border: false,
                    autoEl: {
                        tag: 'center'
                    },
                    items: [
                        {
                            xtype: 'displayfield',
                            value: me.dtVersion + ': ' + Utils.globals.version
                        }
                    ]
                }
            ],
            buttons: buttonConfig
        });
        me.callParent(arguments);
    }
});

/**
 *  A LogonWindow captures the user name and password.
 *  
 *  A detault user name and password can be set via Utils.globals.defaultUsername and
 *  Utils.globals.defaultPassword.
 *  
 */
Ext.define('Baff.utility.application.UpdateUserWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.updateuserwindow',
    requires: [
        'Ext.form.field.Text',
        'Baff.utility.Utilities'
    ],
    closable: false,
    bodyPadding: '10 10 0 10',
    // Literals for locale override
    dtUpdateTitle: 'Update User',
    dtUpdateBtn: 'Update',
    tPassword: 'Current Password',
    dtPassword: 'New Password',
    dtConfirmPassword: 'Confirm Password',
    dtDisplayName: 'Display Name',
    dtCancelBtn: 'Cancel',
    buttonAlign: 'center',
    /**
     * Initialise the view
     */
    initComponent: function() {
        var me = this;
        Ext.apply(me, {
            title: Utils.globals.applicationName + ' ' + me.dtUpdateTitle,
            items: [
                {
                    xtype: 'fieldset',
                    border: false,
                    fieldDefaults: {
                        anchor: '100%',
                        labelAlign: 'right'
                    },
                    layout: 'anchor',
                    items: [
                        {
                            xtype: 'textfield',
                            name: 'password',
                            fieldLabel: me.dtPassword,
                            inputType: 'password',
                            allowBlank: false,
                            validateOnBlur: true,
                            labelWidth: 125
                        },
                        {
                            xtype: 'textfield',
                            name: 'confirmPassword',
                            fieldLabel: me.dtConfirmPassword,
                            inputType: 'password',
                            allowBlank: false,
                            validateOnBlur: true,
                            labelWidth: 125
                        }
                    ]
                }
            ],
            buttons: [
                {
                    text: me.dtCancelBtn,
                    itemId: 'cancelBtn'
                },
                ' ',
                {
                    text: me.dtUpdateBtn,
                    itemId: 'updateBtn'
                }
            ]
        });
        me.callParent(arguments);
    }
});

/**
 *  A LogonWindow captures the user name and password.
 *  
 *  A detault user name and password can be set via Utils.globals.defaultUsername and
 *  Utils.globals.defaultPassword.
 *  
 */
Ext.define('Baff.utility.application.RegisterUserWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.registeruserwindow',
    requires: [
        'Ext.form.field.Text',
        'Baff.utility.Utilities'
    ],
    closable: false,
    bodyPadding: '10 10 0 10',
    // Literals for locale override
    dtRegisterTitle: 'Register User',
    dtRegisterBtn: 'Register',
    dtEmail: 'Email',
    dtDisplayName: 'Display Name',
    dtCancelBtn: 'Cancel',
    buttonAlign: 'center',
    /**
     * Initialise the view
     */
    initComponent: function() {
        var me = this;
        Ext.apply(me, {
            title: Utils.globals.applicationName + ' ' + me.dtRegisterTitle,
            items: [
                {
                    xtype: 'fieldset',
                    border: false,
                    fieldDefaults: {
                        anchor: '100%',
                        labelAlign: 'right'
                    },
                    layout: 'anchor',
                    items: [
                        {
                            xtype: 'textfield',
                            fieldLabel: me.dtEmail,
                            name: 'email',
                            vtype: 'email',
                            allowBlank: false,
                            validateOnBlur: true
                        },
                        {
                            xtype: 'textfield',
                            name: 'displayName',
                            fieldLabel: me.dtDisplayName,
                            vtype: 'alpha',
                            allowBlank: Utils.globals.showDisplayName ? false : true,
                            hidden: Utils.globals.showDisplayName ? false : true,
                            validateOnBlur: true
                        }
                    ]
                }
            ],
            buttons: [
                {
                    text: me.dtCancelBtn,
                    itemId: 'cancelBtn'
                },
                ' ',
                {
                    text: me.dtRegisterBtn,
                    itemId: 'registerBtn'
                }
            ]
        });
        me.callParent(arguments);
    }
});

/**
 *  A WorkflowToolbar provides the user interface to support workflow selection, initiation and execution.
 *  It is controlled by a {@link Baff.utility.workflow.WorkflowManager}.
 */
Ext.define('Baff.utility.workflow.WorkflowToolbar', {
    extend: 'Ext.container.Container',
    alias: 'widget.workflowtoolbar',
    controller: 'workflow',
    border: false,
    requires: [
        'Ext.toolbar.Breadcrumb',
        'Baff.utility.Utilities'
    ],
    /**
     * Sets up the toolbar ui components.
     */
    initComponent: function() {
        var me = this;
        Ext.apply(me, {
            items: [
                {
                    xtype: 'breadcrumb',
                    reference: 'wfSelector'
                },
                {
                    xtype: 'toolbar',
                    cls: 'x-tab x-tab-active x-tab-default',
                    border: false,
                    items: [
                        {
                            xtype: 'container',
                            minWidth: 300,
                            reference: 'wfName',
                            html: ''
                        },
                        '-',
                        {
                            xtype: 'button',
                            reference: 'wfPrevButton',
                            iconCls: 'wfprev',
                            disabled: true
                        },
                        {
                            xtype: 'button',
                            reference: 'wfNextButton',
                            iconCls: 'wfnext',
                            disabled: true
                        },
                        '-',
                        {
                            xtype: 'container',
                            reference: 'wfInstruction'
                        }
                    ]
                }
            ]
        });
        me.callParent(arguments);
    }
});

/**
 *  A MainHeader presents the {@link Baff.utility.workflow.WorkflowToolbar} and log off button.
 */
Ext.define('Baff.utility.application.MainHeader', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.mainheader',
    requires: [
        'Ext.toolbar.Toolbar',
        'Baff.utility.workflow.WorkflowToolbar'
    ],
    layout: {
        align: 'stretch',
        type: 'hbox'
    },
    // Display text for locale override
    dtLoggedInAs: 'Logged in as',
    dtLogOffBtn: 'Logoff',
    /**
     * Initialise the view
     */
    initComponent: function() {
        var me = this;
        var username = Utils.userSecurityManager.getUserName();
        var logText = me.dtLoggedInAs + " <b>" + username + "<b>";
        Ext.apply(me, {
            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'top',
                    cls: 'x-tab x-tab-active x-tab-default',
                    items: [
                        {
                            xtype: 'workflowtoolbar'
                        },
                        '->',
                        {
                            xtype: 'container',
                            layout: {
                                type: 'vbox',
                                align: 'center'
                            },
                            items: [
                                {
                                    xtype: 'container',
                                    cls: 'x-tab x-tab-active x-tab-default',
                                    html: logText,
                                    padding: 10
                                },
                                {
                                    xtype: 'toolbar',
                                    cls: 'x-tab x-tab-active x-tab-default',
                                    border: false,
                                    items: [
                                        {
                                            xtype: 'button',
                                            itemId: 'logoffBtn',
                                            iconCls: 'logoff',
                                            text: me.dtLogOffBtn
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });
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
    requires: [
        'Ext.window.MessageBox',
        'Baff.utility.usersecurity.UserSecurityManager'
    ],
    views: [
        'Baff.utility.application.LogonWindow',
        'Baff.utility.application.RegisterUserWindow',
        'Baff.utility.application.UpdateUserWindow',
        'Baff.utility.application.LogonWindow',
        'Baff.utility.application.MainHeader'
    ],
    refs: [
        {
            ref: 'usernameField',
            selector: 'logonwindow textfield[name=username]'
        },
        {
            ref: 'passwordField',
            selector: 'logonwindow textfield[name=password]'
        },
        {
            ref: 'emailField',
            selector: 'registeruserwindow textfield[name=email]'
        },
        {
            ref: 'displayNameField',
            selector: 'registeruserwindow textfield[name=displayName]'
        },
        {
            ref: 'updatePasswordField',
            selector: 'updateuserwindow textfield[name=password]'
        },
        {
            ref: 'confirmPasswordField',
            selector: 'updateuserwindow textfield[name=confirmPassword]'
        }
    ],
    // Literals for locale override
    dtInvalidLogonTitle: 'Invalid Logon',
    dtInvalidLogonMsg: 'Please enter a valid username and password',
    dtInvalidRegisterUserTitle: 'Invalid Registration',
    dtInvalidRegisterUserMsg: 'Please enter a valid email and display name',
    dtAckRegisterUserTitle: 'Registration Successful',
    dtAckRegisterUserMsg: 'Please check your email for your login details',
    dtAckResetTitle: 'Reset Successful',
    dtAckResetMsg: 'Please check your email for your login details',
    dtInvalidResetTitle: 'Invalid Reset',
    dtInvalidResetMsg: 'Please enter a valid username',
    dtConfirmResetTitle: 'Confirm Reset',
    dtConfirmResetMsg: 'Are you sure you want to reset your password?',
    dtInvalidUpdateUserTitle: 'Invalid Update',
    dtInvalidUpdateUserMsg: 'Please enter a valid display name and password',
    dtAckUpdateUserTitle: 'Update Successful',
    dtAckUpdateUserMsg: 'Please login with your new password',
    dtConfirmLogoutTitle: 'Confirm Logout',
    dtConfirmLogoutMsg: 'Are you sure you want to log out?',
    dtLoading: 'Please wait....',
    dtFailTitle: 'Unrecoverable System Failure',
    dtRestartMsg: 'The application will be now be restarted. Sorry for any inconvenience caused.',
    HTTP_REQUEST_OK: 200,
    splashcreen: null,
    /**
     * Initialise the controller.
     */
    init: function() {
        Utils.logger.info("MainApplicationController::init");
        var me = this;
        me.control({
            'logonwindow #logonBtn': {
                click: me.onLogonButton
            },
            'logonwindow #optionBtn #register': {
                click: me.onShowRegisterUserButton
            },
            'logonwindow #optionBtn #reset': {
                click: me.onResetUserButton
            },
            'logonwindow #optionBtn #update': {
                click: me.onShowUpdateUserButton
            },
            'registeruserwindow #registerBtn': {
                click: me.onRegisterUserButton
            },
            'registeruserwindow #cancelBtn': {
                click: me.onCancelRegisterUserButton
            },
            'mainheader toolbar #logoffBtn': {
                click: me.onLogoffButton
            },
            'updateuserwindow #updateBtn': {
                click: me.onUpdateUserButton
            },
            'updateuserwindow #cancelBtn': {
                click: me.onCancelUpdateUserButton
            }
        });
        Utils.globals.application.on('systemfailure', me.onSystemFailure, me);
    },
    /**
     * Log the user off and restart the application when a system error ocurrs.
     */
    onSystemFailure: function() {
        Utils.logger.info("MainApplicationController::onSystemFailure");
        var me = this;
        Ext.Msg.alert(me.dtFailTitle, me.dtRestartMsg, function() {
            Utils.userSecurityManager.logoff();
            window.location.reload();
        });
    },
    /**
     * Display the logon window on application launch.
     */
    onLaunch: function() {
        Utils.logger.info("MainApplicationController::onLaunch");
        var me = this;
        var task = new Ext.util.DelayedTask(function() {
                var ss = Ext.fly('splashcreen');
                if (ss != null)  {
                    ss.destroy();
                }
                
                me.logonWindow = Ext.create('Baff.utility.application.LogonWindow');
                me.logonWindow.show();
            });
        task.delay(Utils.globals.splashScreenDelay);
    },
    /**
     * Authenticate the user when the logon button is clicked.
     */
    onLogonButton: function() {
        Utils.logger.info("MainApplicationController::onLogonButton");
        var me = this;
        if (me.getUsernameField().validate() && me.getPasswordField().validate()) {
            me.logonWindow.setLoading(me.dtLoading);
            Utils.userSecurityManager.logon(me.getUsernameField().getValue(), me.getPasswordField().getValue(), me.postLogon, me);
        } else {
            Ext.Msg.alert(me.dtInvalidLogonTitle, me.dtInvalidLogonMsg);
        }
    },
    onShowRegisterUserButton: function() {
        Utils.logger.info("MainApplicationController::onShowRegisterUserButton");
        var me = this;
        me.logonWindow.hide();
        me.registerUserWindow = Ext.create('Baff.utility.application.RegisterUserWindow');
        me.registerUserWindow.show();
    },
    onRegisterUserButton: function() {
        Utils.logger.info("MainApplicationController::onRegisterUserButton");
        var me = this;
        if (me.getEmailField().validate() && me.getDisplayNameField().validate()) {
            me.registerUserWindow.setLoading(me.dtLoading);
            Utils.userSecurityManager.registerUser(me.getEmailField().getValue(), me.getDisplayNameField().getValue(), null, // use default permissions
            me.postRegistration, me);
        } else {
            Ext.Msg.alert(me.dtInvalidRegisterUserTitle, me.dtInvalidRegisterUserMsg);
        }
    },
    onCancelRegisterUserButton: function() {
        Utils.logger.info("MainApplicationController::onCancelRegisterUserButton");
        var me = this;
        me.registerUserWindow.close();
        me.registerUserWindow.destroy();
        me.logonWindow.show();
    },
    onResetUserButton: function() {
        Utils.logger.info("MainApplicationController::onResetUserButton");
        var me = this;
        if (me.getUsernameField().validate()) {
            Ext.Msg.confirm(me.dtConfirmResetTitle, me.dtConfirmResetMsg, function(btn) {
                if (btn === 'yes') {
                    me.doResetUser();
                }
            });
        } else {
            Ext.Msg.alert(me.dtInvalidResetTitle, me.dtInvalidResetMsg);
        }
    },
    doResetUser: function() {
        Utils.logger.info("MainApplicationController::doResetUser");
        var me = this;
        me.logonWindow.setLoading(me.dtLoading);
        Utils.userSecurityManager.resetUser(me.getUsernameField().getValue(), me.postResetUser, me);
    },
    onShowUpdateUserButton: function() {
        Utils.logger.info("MainApplicationController::onShowUpdateUserButton");
        var me = this;
        if (me.getUsernameField().validate() && me.getPasswordField().validate()) {
            me.logonWindow.hide();
            me.updateUserWindow = Ext.create('Baff.utility.application.UpdateUserWindow');
            me.updateUserWindow.show();
        } else {
            Ext.Msg.alert(me.dtInvalidLogonTitle, me.dtInvalidLogonMsg);
        }
    },
    onUpdateUserButton: function() {
        Utils.logger.info("MainApplicationController::onUpdateUserButton");
        var me = this;
        if (me.getUpdatePasswordField().validate() && me.getUpdatePasswordField().getValue() == me.getConfirmPasswordField().getValue()) {
            me.updateUserWindow.setLoading(me.dtLoading);
            Utils.userSecurityManager.updateUser(me.getUsernameField().getValue(), null, // Don't update display name
            me.getPasswordField().getValue(), me.getUpdatePasswordField().getValue(), null, // Don't update permissions
            me.postUpdateUser, me);
        } else {
            Ext.Msg.alert(me.dtInvalidUpdateUserTitle, me.dtInvalidUpdateUserMsg);
        }
    },
    onCancelUpdateUserButton: function() {
        Utils.logger.info("MainApplicationController::onCancelUpdateUserButton");
        var me = this;
        me.updateUserWindow.close();
        me.updateUserWindow.destroy();
        me.logonWindow.show();
    },
    postLogon: function(operation, success, me) {
        Utils.logger.info("MainApplicationController::postLogon");
        //var me = this;  // passed in as scope
        me.logonWindow.setLoading(false);
        if (success) {
            if (Utils.globals.manageUsers) {
                Utils.userSecurityManager.loadUserAttributes(me.getUsernameField().getValue(), me.postGetUserAttributes, me);
            }
            me.logonWindow.destroy();
            Utils.globals.viewport = Ext.create('Baff.utility.application.Viewport');
            Utils.globals.viewport.show();
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
        if (!operation.success && (operation.getResponse() == null || operation.getResponse().status != me.HTTP_REQUEST_OK))  {
            me.onSystemFailure();
        }
        
    },
    postRegistration: function(success, response, me) {
        Utils.logger.info("MainApplicationController::postRegistration");
        //var me = this;  // passed in as scope
        me.registerUserWindow.setLoading(false);
        if (success) {
            var obj = Ext.decode(response.responseText);
            if (obj.success) {
                Ext.Msg.alert(me.dtAckRegisterUserTitle, me.dtAckRegisterUserMsg, function() {
                    me.registerUserWindow.destroy();
                    me.logonWindow.show();
                });
            } else if (obj.message != null) {
                Ext.Msg.alert(me.dtInvalidRegisterUserTitle, obj.message);
            } else {
                me.onSystemFailure();
            }
        } else {
            if (response != null && response.status == me.HTTP_REQUEST_OK) {
                Ext.Msg.alert(me.dtInvalidRegisterUserTitle, me.dtInvalidRegisterUserMsg);
            } else {
                me.onSystemFailure();
            }
        }
    },
    postResetUser: function(success, response, me) {
        Utils.logger.info("MainApplicationController::postReset");
        //var me = this;  // passed in as scope
        me.logonWindow.setLoading(false);
        if (success) {
            var obj = Ext.decode(response.responseText);
            if (obj.success) {
                Ext.Msg.alert(me.dtAckResetTitle, me.dtAckResetMsg);
            } else if (obj.message != null) {
                Ext.Msg.alert(me.dtInvalidResetTitle, obj.message);
            } else {
                me.onSystemFailure();
            }
        } else {
            if (response != null && response.status == me.HTTP_REQUEST_OK) {
                Ext.Msg.alert(me.dtInvalidResetTitle, me.dtInvalidResetMsg);
            } else {
                me.onSystemFailure();
            }
        }
    },
    postUpdateUser: function(success, response, me) {
        Utils.logger.info("MainApplicationController::postUpdateUser");
        //var me = this;  // passed in as scope
        me.updateUserWindow.setLoading(false);
        if (success) {
            var obj = Ext.decode(response.responseText);
            if (obj.success) {
                Ext.Msg.alert(me.dtAckUpdateUserTitle, me.dtAckUpdateUserMsg, function() {
                    me.getPasswordField().setValue(me.getUpdatePasswordField().getValue()) , me.updateUserWindow.destroy();
                    me.logonWindow.show();
                });
            } else if (obj.message != null) {
                Ext.Msg.alert(me.dtInvalidUpdateUserTitle, obj.message);
            } else {
                me.onSystemFailure();
            }
        } else {
            if (response != null && response.status == me.HTTP_REQUEST_OK) {
                Ext.Msg.alert(me.dtInvalidUpdateUserTitle, me.dtInvalidUpdateUserMsg);
            } else {
                me.onSystemFailure();
            }
        }
    },
    /**
     * Log the user off and restart the application when the log off button is clicked.
     */
    onLogoffButton: function() {
        var me = this;
        Ext.Msg.confirm(me.dtConfirmLogoutTitle, me.dtConfirmLogoutMsg, function(button) {
            if (button === 'yes') {
                Utils.userSecurityManager.logoff();
                window.location.reload();
            }
        });
    }
});

/**
 * A Viewport presents the {@link Baff.utility.application.MainHeader} and the main view specified by
 * Utils.globals.mainView .
 */
Ext.define('Baff.utility.application.Viewport', {
    extend: 'Ext.container.Viewport',
    //cls: 'app-background',
    requires: [
        'Baff.utility.application.MainHeader'
    ],
    //padding: 5,
    cls: 'x-tab-bar-default',
    dtLoading: "Please wait....",
    loaders: null,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    /**
     * Initialise the view.
     */
    initComponent: function() {
        var me = this;
        me.loaders = new Ext.util.HashMap();
        Ext.apply(me, {
            items: [
                {
                    xtype: 'mainheader',
                    frame: true
                },
                {
                    xtype: Utils.globals.mainView,
                    frame: true,
                    flex: 1
                }
            ]
        });
        me.callParent(arguments);
    },
    /**
    * Shows / hides the wait mask.
    * @param {boolean} [show="false"]
    * @param {String} The component requesting the load
    * @protected
    */
    showWaitMask: function(show, id) {
        var me = this;
        if (show) {
            me.loaders.add(id, "loading");
            me.setLoading(me.dtLoading);
        } else {
            me.loaders.removeAtKey(id);
            if (me.loaders.getCount() <= 0) {
                me.setLoading(false);
            }
        }
    },
    showAlertMessage: function(title, message, callback) {
        var me = this;
        Ext.Msg.alert(title, message, function(buttonId, text) {
            // Check if the load mask should be applied 
            if (me.loaders.getCount() > 0)  {
                me.setLoading(me.dtLoading);
            }
            
            if (callback != null)  {
                callback(buttonId, text);
            }
            
        });
    }
});

/**
 *  A RefDataCode data holds a code determined from a reference data class.  It is specified in an
 *  {@link Ext.foundation.EntityModel} as follws:
 *  
 *      fields: [
 *           { name: 'foo', type: 'refdatacode', defaultValue: 'DOMAIN.FOO.BAR' },
 *           ...
 *      ]
 */
Ext.define('Baff.utility.refdata.RefDataCode', {
    extend: 'Ext.data.field.Field',
    alias: 'data.field.refdatacode',
    /**
    * Sets the default value from reference data.
    * Calls the overridden superclass method.
    * @ignore
    */
    constructor: function() {
        var me = this;
        me.callParent(arguments);
    }
});

/**
 *  An ImageField displays an image and, optionally, provides a button to select an image to be uploaded. 
 * 
 */
Ext.define('Baff.utility.widget.ImageField', {
    extend: 'Ext.form.FieldContainer',
    xtype: 'imagefield',
    requires: [
        'Ext.Img',
        'Ext.form.field.File'
    ],
    mixins: [
        'Ext.form.field.Field'
    ],
    imageContainer: null,
    imageSelector: null,
    imageValue: null,
    config: {
        /**
         * Specifies the default encoding of the image
         */
        encoding: 'data:image/jpeg;base64',
        /**
         * Specifies the http request parameter for the image file.  If specified will present a file 
         * selector button, if not then no button will be presented.
         */
        uploadParameter: "imagefile",
        /**
         * Specifies the image height, or will by dynamically sized if null
         */
        imageHeight: 100,
        /**
         * Specifies the image width, or will by dynamically sized if null
         */
        imageWidth: 100,
        /**
         * Specifies the image field background color
         */
        backgroundColor: 'white',
        layout: {
            type: 'hbox',
            align: 'stretch'
        }
    },
    /**
     * Initialises the component
     */
    initComponent: function() {
        var me = this;
        var items = [];
        items.push({
            xtype: 'image',
            itemId: 'imagecontainer',
            height: me.getImageHeight(),
            width: me.getImageWidth(),
            cls: 'x-form-text-wrap-default',
            style: 'background-color: ' + me.getBackgroundColor()
        });
        if (me.getUploadParameter() != null) {
            items.push({
                xtype: 'filefield',
                name: me.getUploadParameter(),
                buttonText: 'Select Image...',
                hideLabel: true,
                buttonOnly: true,
                itemId: 'imageselector',
                padding: 5,
                listeners: {
                    change: me.onSelectFile,
                    scope: me
                }
            });
        }
        Ext.apply(me, {
            items: items
        });
        me.callParent(arguments);
        me.initField();
        me.imageContainer = me.getComponent('imagecontainer');
        me.imageSelector = me.getComponent('imageselector');
    },
    /**
     * Handles image file selection.
     */
    onSelectFile: function() {
        var me = this;
        var file = me.imageSelector.getValue();
        if (file != null && file != '') {
            var filename = file.replace(/^.*[\\\/]/, '');
            var el = me.imageContainer.imgEl;
            el.dom.src = '';
            el.dom.alt = filename;
        }
    },
    /**
     * Sets the value of the image field
     */
    setValue: function(value) {
        var me = this;
        var ic = me.imageContainer;
        if (ic != null && value != null) {
            if (value == "") {
                ic.setSrc(null);
            } else {
                ic.setSrc(me.encoding + ',' + value);
            }
        }
    },
    // Needs to be specified for field handling
    setReadOnly: Ext.emptyFn,
    /*
     * Resets the file selector
     */
    reset: function() {
        var me = this;
        var is = me.imageSelector;
        if (is != null)  {
            is.reset();
        }
        
    },
    /*
     * Resets the file selector
     */
    resetOriginalValue: function() {
        var me = this;
        var is = me.imageSelector;
        if (is != null)  {
            is.resetOriginalValue();
        }
        
    }
});
/*
    getBase64: function(str) {
        var me = this;
        
        return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1").replace(/ +$/, "").split(" ")));    
    
    }*/

/**
 *  An ImageField displays an image and, optionally, provides a button to select an image to be uploaded. 
 * 
 */
Ext.define('Baff.utility.widget.RatingField', {
    extend: 'Ext.form.FieldContainer',
    xtype: 'ratingfield',
    requires: [
        'Ext.form.TextField',
        'Ext.ux.rating.Picker'
    ],
    mixins: [
        'Ext.form.field.Field'
    ],
    config: {
        name: '',
        readOnly: false,
        color: null,
        minWidth: 300,
        scale: '300%',
        labelStyle: 'padding-top: 18px',
        ratingPickerConfig: {
            minimum: 0,
            limit: 5,
            width: 150,
            glyphs: [
                9675,
                9679
            ]
        }
    },
    // circles
    //glyphs: [9786, 9787]  // faces
    //glyphs: [9734, 9733]  // stars
    /**
     * Initialises the component
     */
    initComponent: function() {
        var me = this;
        me.readOnly = me.getReadOnly();
        var items = [];
        var ratingPickerConfig = me.getRatingPickerConfig();
        ratingPickerConfig.xtype = 'ratingpicker';
        ratingPickerConfig.scale = me.getScale();
        ratingPickerConfig.itemId = 'rp_' + me.getName();
        var col = me.getColor();
        if (col != null) {
            ratingPickerConfig.overStyle = 'color: ' + col;
            ratingPickerConfig.selectedStyle = 'color: ' + col;
        }
        items.push(ratingPickerConfig);
        if (!me.readOnly && me.ratingPickerConfig.minimum == 0) {
            var clearPickerConfig = {
                    xtype: 'ratingpicker',
                    itemId: 'rp_clear',
                    minimum: 0,
                    limit: 1,
                    scale: me.getScale(),
                    glyphs: [
                        9676,
                        9676
                    ],
                    // circles
                    //glyphs: [9785, 9785], // faces
                    //glyphs: [10024, 10024], // stars            
                    overStyle: 'color: red',
                    tooltip: 'clear rating'
                };
            items.push(clearPickerConfig);
        }
        Ext.apply(me, {
            items: items
        });
        me.callParent(arguments);
        me.initField();
        me.ratingPicker = me.getComponent('rp_' + me.getName());
        me.clearPicker = me.getComponent('rp_clear');
        if (me.isDisabled() || me.readOnly) {
            me.ratingPicker.setReadOnly(true);
            if (me.clearPicker != null)  {
                me.clearPicker.setReadOnly(true);
            }
            
        }
        me.on('change', me.onFieldChange, me);
        me.ratingPicker.on('change', me.onRatingChange, me);
        if (me.clearPicker != null)  {
            me.clearPicker.on('change', me.onClearChange, me);
        }
        
    },
    onRatingChange: function(picker, value) {
        var me = this;
        me.un('change', me.onFieldChange, me);
        me.setValue(value);
        me.on('change', me.onFieldChange, me);
    },
    onClearChange: function(picker, value) {
        var me = this;
        me.ratingPicker.setValue(0);
        me.clearPicker.setValue(0);
    },
    onFieldChange: function(field, value) {
        var me = this;
        me.ratingPicker.un('change', me.onRatingChange, me);
        me.ratingPicker.setValue(value);
        me.ratingPicker.on('change', me.onRatingChange, me);
    },
    setReadOnly: function(readOnly) {
        if (this.ratingPicker != null)  {
            this.ratingPicker.setReadOnly(readOnly || this.isDisabled());
        }
        
        if (this.clearPicker != null)  {
            this.clearPicker.setReadOnly(readOnly || this.isDisabled());
        }
        
        this.readOnly = readOnly;
    },
    enable: function() {
        if (this.ratingPicker != null && !this.readOnly)  {
            this.ratingPicker.setReadOnly(false);
        }
        
        if (this.clearPicker != null && !this.readOnly)  {
            this.clearPicker.setReadOnly(false);
        }
        
        this.callParent(arguments);
    },
    disable: function() {
        if (this.ratingPicker != null)  {
            this.ratingPicker.setReadOnly(true);
        }
        
        if (this.clearPicker != null)  {
            this.clearPicker.setReadOnly(true);
        }
        
        this.callParent(arguments);
    }
});

Ext.define('Baff.utility.widget.RatingPicker', {
    extend: 'Ext.ux.rating.Picker',
    xtype: 'ratingpicker',
    requires: [
        'Ext.ux.rating.Picker'
    ],
    readOnly: false,
    config: {
        glyphs: [
            9675,
            9679
        ]
    },
    // circles
    //glyphs: [9786, 9787]  // faces
    //glyphs: [9734, 9733]  // stars
    onClick: function() {
        if (this.readOnly)  {
            return;
        }
        else  {
            this.callParent(arguments);
        }
        
    },
    onMouseEnter: function() {
        if (this.readOnly)  {
            return;
        }
        else  {
            this.callParent(arguments);
        }
        
    },
    onMouseLeave: function() {
        if (this.readOnly)  {
            return;
        }
        else  {
            this.callParent(arguments);
        }
        
    },
    onMouseMove: function() {
        if (this.readOnly)  {
            return;
        }
        else  {
            this.callParent(arguments);
        }
        
    },
    setReadOnly: function(readOnly) {
        this.readOnly = readOnly;
    }
});

Ext.define('Baff.utility.widget.UrlField', {
    extend: 'Ext.form.field.Text',
    xtype: 'urlfield',
    config: {
        vtype: 'url',
        clearButton: true,
        searchButton: true
    },
    triggers: {
        clear: {
            weight: 0,
            cls: Ext.baseCSSPrefix + 'form-clear-trigger',
            handler: 'onClearClick',
            scope: 'this'
        },
        search: {
            weight: 1,
            cls: Ext.baseCSSPrefix + 'form-search-trigger',
            handler: 'onSearchClick',
            scope: 'this'
        }
    },
    setReadOnly: function(readOnly) {
        var me = this;
        me.callParent(arguments);
        if (!readOnly) {
            me.manageTriggerState();
        }
    },
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
        me.manageTriggerState();
    },
    manageTriggerState: function() {
        var me = this;
        if (!me.getClearButton())  {
            me.getTrigger('clear').hide();
        }
        
        if (!me.getSearchButton())  {
            me.getTrigger('search').hide();
        }
        
    },
    onClearClick: function() {
        var me = this,
            activeFilter = me.activeFilter;
        me.setValue('');
        me.updateLayout();
    },
    onSearchClick: function() {
        var me = this,
            url = me.getValue();
        if (url.length > 0 && me.isValid()) {
            window.open(url);
        }
        me.updateLayout();
    }
});

