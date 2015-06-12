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