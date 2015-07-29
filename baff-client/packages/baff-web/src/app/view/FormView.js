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
                addBtn,
                removeBtn,
                revertBtn,
                saveBtn,
                refreshBtn;
        
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
                        reference:me.addButton,
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
        
        return [       '    ',
                            refreshBtn,
                            addBtn,
                            removeBtn,
                            '->',
                            revertBtn,
                            saveBtn ,
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