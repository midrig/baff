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
        
         if (selector === '')
            selector = me.activityView.getListPanel();
        
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
        
        if (!me.getViewExistingRecord())
            return;
        
        // Check id's because a saved current record will not be the same instance as the one in the store
        if (me.currentRecord != null && record.getEntityId() == me.currentRecord.getEntityId())
            return;
        
        // Check if store is loaded - otherwise post flush
        if (!me.entityStore.hasLoaded)
            return;
        
        if (me.formPanel.isDirty()) {
            Ext.Msg.confirm(me.dtConfirmTitle, me.dtConfirmRevert, function(btn) {
                if (btn === 'yes') {
                    me.modifyRecord(record);
                } else {
                    me.selectCurrentRecord();
                }
            });
        }
        else {
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
    onStoreFirstLoaded: function(){
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
                var storeRecord = me.entityStore.findEntity(record);

                if (storeRecord != null) {
                    me.listPanel.getSelectionModel().select(storeRecord, false, true);
                    //me.checkVersionOnView(storeRecord);  -- only relevant if was not selected initially due to buffering
                    // however, results in mutliple checks if not and may be confusing for user
                } else {
                    // This may be the case if the currently selected record is not yet visible post an update
                    // due to store buffering, but make sure we haven't got anything else selected
                    var records = me.listPanel.getSelectionModel().getSelection();

                    if (records.length != 1 || records[0].getEntityId() != record.getEntityId())
                        me.listPanel.getSelectionModel().deselectAll(true);
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