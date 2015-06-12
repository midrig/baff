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
        
         if (selector === '')
            selector = me.activityView.getListPanel();
        
        if (selector !== '') {
            me.listPanel = me.lookupReference(selector);
            me.listPanel.on('select', me.onSelectList, me);
            me.listPanel.on('refreshList', me.onRefreshList, me);
        }
              
        // Add Button
        selector = me.getAddButtonSelector();
        
        if (selector === '')
            selector = me.activityView.getAddButton();
        
        if (selector !== '') {
            me.addButton = me.lookupReference(selector);
            me.addButton.on('click', me.onAddButton, me);
        }
        
        // Select Button
        selector = me.getSelectButtonSelector();
        
        if (selector === '')
            selector = me.activityView.getSelectButton();
        
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
        
        if (me.getView().isXType('selectorpopup'))
            me.getView().close(); 
       
    },
    
    /**
    * Closes the view if a popup
    * Called whe select button is clicked.  
    * @protected  
    */    
    onSelectButton: function() {
        Utils.logger.info("SelectorController[" + this.identifier + "]::onSelectButton");
        var me = this;

        if (me.getView().isXType('selectorpopup'))
            me.getView().close(); 
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
    onStoreFirstLoaded: function(store){
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

            if (me.listPanel != null) 
                me.listPanel.updateSearchCount();      

        }
        
        this.showWaitMask(false);
       
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
    selectRecord: function (record) {
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
            
            if (record != null)
               me.setCurrentRecord(null);
            
         }    
        
    }
}); 