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