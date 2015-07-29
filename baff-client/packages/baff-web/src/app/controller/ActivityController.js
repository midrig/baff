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
    onLaunch: function () {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onLaunch");
        var me = this;
         
        // Refresh Button
        var selector = me.getRefreshButtonSelector();
        
        if (selector === '')
            selector = me.activityView.getRefreshButton();
        
        if (selector !== '') {
            me.refreshButton = me.lookupReference(selector);
            me.refreshButton.on('click', me.onRefreshButton, me);
        }
        
        if (me.getStoreSelector() == '') // No store 
            me.showWidget(me.refreshButton, false);
        
        if (me.activityView.getDashlet())
            me.setReadOnly(true);
        
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
    makeReadOnly: function(readonly) {
        
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
        var domainView = me.findParentView();
        
        if (domainView != null) {
            
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
            if (me.getContextHandlerMap() != null || me.getContextListener())
                domainView.on('contextchange', me.onContextChange, me); 
            
            // If firing context change then have the main controller subscribe to change events fired from
            // this controllers view
            if (me.getContextSetterMap() != null) {
                
                if (mainController != null)
                    me.activityView.on('contextchange', mainController.onContextChange, mainController);
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
        var me=this;
        
        me.isActive = true;    
        
        // Test if a null record was explicity set, rather than no record being provided
        if (record !== undefined && arguments.length > 0)
            me.updateEntityFilter(record, true);
        
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
    * Sets up the {@link #entityStore} for this activity.  
    * @protected
    */    
    setupStore: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]::setupStore");
        var me = this,
                id;
        
        // Detach any existing current store
        me.detachStore();
        
        if (me.getStoreSelector() == '')
            return;  // No store for this activity
        
        // If dependent on master and no master is set 
        // then won't be able to set the filters necessary to load the store
        if (me.getDependentOnMaster() && me.masterEntityId  == null) {
            return;
        }
        
        // Get unique id for the store if a store owner
        if (me.getStoreOwner())
            id = me.ID;
        else 
            id = me.getSharedStoreId(); // This is null by default      
        
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
    prepareActivity: function (record) {
        
    },
    
     /**
    * Sets up context filters on the store if this activity responds to externally set context, including entity
    * filters if {@link #manageSingleRecord} is true.
    * @protected
    */    
    refreshContextFilters: function () {
        Utils.logger.info("ActivityController[" + this.identifier + "]::refreshContextFilters");
        var me = this;
       
        if (me.entityStore == null)
            return;
        
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
            if (me.entityFilter != false)
                entityIdFilter = me.entityFilter;          
            
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
            
            // Proceed even if an entityIdFilter was not set, as the record may be in 1-1 relationship
            // with it's master, or we may just be selecting the first record in a list
            
        }

        // Add any specific context filters
        if (me.filterContext != null) {

            me.filterContext.each( function (key, value) {

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
        if (record == null)
            record = me.currentRecord;
        
         me.setCurrentRecord(record);
        
        // Ensure any assocated master entity is loaded
        // NB if it is null and the activity is dependent on a master this is subject to a DI check during setup
        if (me.getUseVersionManager() && me.getDependentOnMaster()  && me.masterEntityId != null) {
            
            if (me.entityStore == null)  // At this stage most activities should have a store
                Utils.versionManager.on('masterload', me.onMasterLoad, me);
            
            if (Utils.versionManager.getMaster(me.entityModel.getMasterEntityType(), me.masterEntityId) == null)
                    return;  // Don't proceed if a valid master is not present - it will be attempted to be loaded, triggering a flush/load event
        
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
    onStoreFlush: function(store, invalid){
        Utils.logger.info("ActivityController[" + this.identifier + "]::onStoreFlush");
        var me = this;
        
        me.onCacheUpdate(invalid);
    }, 
    
    /**
    * Handles a cache update informed via a store flush or master load event
    * @param {boolean} invalid Indicates if the related master is valid
    * @protected
    */
    onCacheUpdate: function (invalid) {
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
        
        if (me.checkDataIntegrity() == false)        
            return;
        
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
    onPostFetch: function(store, response, firstLoad){
        Utils.logger.info("ActivityController[" + this.identifier + "]::onPostFetch, load state= " + firstLoad);
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
        
    },

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
        
        if (fireContext)
            me.fireContextEvent(record);
        
        if (fireEntityChange) {
            
            if (me.entityModel.isMasterEntity() && me.getFireOnMasterChange())
                me.fireViewEvent('masterentitychange', me, record, me.entityModel.getName());

            if (me.getFireOnEntityChange())
                me.fireViewEvent('entitychange', me, record, me.entityModel.getName());
            
        }
        
    },
    
    /** 
    * Gets {@link #currentRecord}.
    * @return {Baff.app.model.EntityModel}
    */
    getCurrentRecord: function () {
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

                if (mainController != null)
                    me.activityView.on('contextchange', mainController.onContextChange, mainController);

            }
            
            me.setContextSetterMap([]);
        
        }
        
        var contextMap = context;
        
        if (typeof context  !=  "object") {
            
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
        
        if (contextSetterMap == null)
            contextSetterMap = me.getContextSetterMap();
        
        if (contextSetterMap != null) {       
            
            var context = new Ext.util.HashMap();
            
            Ext.Array.each(contextSetterMap, function (item) {
                
                var contextValue = null;
                
                if (record != null)
                    contextValue = record.get(item.fieldName);

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
    refreshCache: function (record, master) {
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
        if (me.entityStore == null)
            me.setup();
        
        
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
           
            me.processOpLock (record, me.OPERATION.LOAD);
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
        
         if (me.getUseVersionManager() && me.getDependentOnMaster()  && !me.entityModel.isMasterEntity()) {             
             if (Utils.versionManager.getMaster(me.entityModel.getMasterEntityType(), me.masterEntityId) == null)  {                                 
                    
                    Utils.logger.error("ActivityController[" + this.identifier + "]::checkDataIntegrity - failed for type= " + me.entityModel.getMasterEntityType() + " , id= " + me.masterEntityId);
                    
                    var domainView = me.findParentView();
                    domainView.fireEvent('dataintegrityissue', me);                    
                    
                    if (me.getView().isFloating())
                        me.getView().close();
                    
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
    onMasterEntityChange: function (controller, master, type) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onMasterEntityChange");
        var me = this;
        
        // Check if should handle this event
        if (controller == me || !me.getDependentOnMaster() ||
            me.entityModel.getMasterEntityType() != type)
            return;
            
        if (me.entityModel.getEntityType() == type) {
            me.updateEntityFilter(master, true);
        }
        
        me.extMasterEntity = master;
        
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
    * Should be overridden by the subclass if required (bear in mind the entity passed in may be a phantom).
    * @param {Baff.app.controller.ActivityController} controller The activity controller that fired the event
    * @param {Baff.app.model.EntityModel} entity The entity record that has been selected or changed.
    * @param {String} type The entity type
    * @protected
    */    
    onEntityChange: function (controller, entity, type) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onEntityChange");
        var me = this;
        
        me.extEntity = entity;
        
        if (controller != me && type == me.entityModel.getEntityType()) {
            me.updateEntityFilter(entity, true); 
            
            if (me.dataRefresh && me.isActive && !me.activityView.isDisabled())
                me.setup(me.extMasterEntityId, entity);
        
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
            
            if (me.getDependentOnMaster())
                me.extMasterEntityId = (entity !=null ? entity.getMasterEntityId() : me.extMasterEntityId);
                
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
    onContextChange: function (controller, context) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::onContextChange");
        var me = this;
        
        if (me == controller)
            return;
        
        // Check if this context is relevant
        var contextMap = me.getContextHandlerMap();
        
        var hasChanged = false;
        
        context.each( function (key, value) {
            
            me.extContext.add(key, value);
            
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
                    });       
        
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
                        failure: me.removeRecordFail  });
        
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
            
            if (domainView != null)
                mainController = domainView.getController();
        }
        
        if (mainController != null)       
            popup = mainController.showPopup(popupselector, popup, record);
        
        if (popup != null)
            me.isActive = false;
        
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
         
        if (!me.getView().isFloating() && Utils.globals.viewport != null) {
            Utils.globals.viewport.showWaitMask(show, me.ID);
        
        } else {
        
            if (show)
                me.getView().setLoading(me.dtLoading);
            else
                me.getView().setLoading(false);
        }
    },
    
    /**
     * Displays an alert message
     * @param {String} title
     * @param {String} message
     * @param {Function} a function to be called on message close
     * @protected
     */
    showAlertMessage: function (title, message, callback) {
        
       if (Utils.globals.viewport != null)
            Utils.globals.viewport.showAlertMessage(title, message, callback);
       else
           Ext.Message.alert(title, message, callback);
        
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
    
    /**
     * Finds the parent of this activity's view
     * @return The parent view
     */
    findParentView: function() {
        var me = this;
        return me.activityView.findParentView();
       
    }

});

