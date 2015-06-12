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
                addBtn,
                refreshBtn,
                selectBtn;
        
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
                        reference:me.addButton,
                        iconCls: 'addnew',
                        text: me.dtAdd
                        };
        }
        
        if (typeof me.refreshButton == "object") {            
            refreshBtn = me.refreshButton;
            me.refreshButton = refreshBtn.reference;
            
        } else  if (me.refreshButton != '') {
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
        
        return [ '    ',
                    refreshBtn,
                    addBtn,
                    '->',
                    selectBtn,                         
                    '    ' ];
    
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
            
        if (me.getDashlet())
            listPanel.allowRefresh = true;
        
        items.push (listPanel);
        
        return items;
        
    }

});