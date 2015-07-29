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
        
        if (selector === '') 
            selector = me.activityView.getFormPanel();
        
        if (selector !== '') {
            me.formPanel = me.lookupReference(selector);
        }else {
            me.formPanel = Ext.create('Baff.app.view.FormPanel');
            me.setUpdateEnabled(false);
            me.setCreateEnabled(false);
        }

        me.formPanel.setCleanRecord();
        me.formPanel.on('dirtychange', me.onFormDirtyChange, me);
              
        // Add Button
        selector = me.getAddButtonSelector();
        
        if (selector === '')
            selector = me.activityView.getAddButton();
        
        if (selector !== '') {
            me.addButton = me.lookupReference(selector);
            me.addButton.on('click', me.onAddButton, me);
        }
        
        // Remove Button
        selector = me.getRemoveButtonSelector();
        
        if (selector === '')
            selector = me.activityView.getRemoveButton();
        
        if (selector !== '') {
            me.removeButton = me.lookupReference(selector);
            me.removeButton.on('click', me.onRemoveButton, me);
        }
        
        // Save Button
        selector = me.getSaveButtonSelector();
        
        if (selector === '')
            selector = me.activityView.getSaveButton();
        
        if (selector !== '') {
            me.saveButton = me.lookupReference(selector);
            me.saveButton.on('click', me.onSaveButton, me);
        }
        
        // Revert Button
        selector = me.getRevertButtonSelector();
        
        if (selector === '')
            selector = me.activityView.getRevertButton();
        
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

         if (readonly != false)
             readonly = true;

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
    * @protected 
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
        var me=this;
        
        // Try to get the current record from the store
        var record = me.entityStore.findEntity(me.currentRecord); 
        
        if (record != null) {
            
            //me.currentRecord = record;  // Is essentially the same as the current record
            me.setCurrentRecord(record); // SCR
            me.modifyRecord(me.currentRecord, true);
            
        // Reload current record if unless we're sure it's ok
        } else if (me.checkVersion(me.currentRecord) != true){
           
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
                        me.setCurrentRecord(null);  // No need as will be called later
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
        
        if (record != null && record.getEntityId() != null)
            me.modifyRecord(record, true);
        else
            me.addRecord(true, record);
        
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
            
            if (record != null && record.getEntityId() != null && me.getViewExistingRecord())
                me.modifyRecord(record, isAfterRefresh);
            else 
                me.addRecord(isAfterRefresh, record);
           
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
        if (newRecord == null)
            newRecord = Ext.create(me.entityModel.getName()); 
        
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
        
        record.setEntityId(null);
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
        me.formPanel.loadRecord(record);

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
            me.formPanel.getForm().markInvalid( revRecord.getErrors() );
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
            me.formPanel.getForm().markInvalid( revRecord.getErrors() );
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