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