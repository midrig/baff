/**
 *  A ListFormView extends {@link Baff.app.view.FormView} to provide the view for a discrete activity 
 *  controlled by a {@link Ext.foundation.ListFormController}. It provides the various user interface 
 *  components for the activity include the list, form and various buttons.
 *  
 *  A minimal setup only requires the {@link #listPanel} and {@link #formPanel}to be specified,
 *  along with an alias so that the view can be referenced by an {@link Baff.app.view.DomainView}.
 *  A {@link #topTitle} may also be specified.
 * 
 *      Ext.define('MyApp.view.MyListFormView', {
 *          extend: 'Baff.app.view.ListFormView',
 *          
 *          alias: 'widget.mylistformview',
 *          
 *          requires: ['MyApp.view.MyFormPanel',
 *                          'MyApp.view.MyListPanel],
 *   
 *          config : {
 *                    
 *                    topTitle: 'My Titile',     
 *                    formPanel: 'myproductform'     // alias of MyApp.view.MyProductForm 
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
    
    // Display text
    dtTogForm: 'View',
    dtFilter: 'Filter',
    
    
    config: {
        
        /**
        * Specifies the type of {@link Baff.app.view.ListPanel} that provides the form for this view.
        * **IMPORTANT**: This view's subclass should specify a subclass of the above form panel.
        * @cfg listPanel (required)
        */
        listPanel: '' ,
        
        /**
        * Specifies a reference to the select button for this view. If set to '' the select button will not be
        * created, however generally this is not necessary as the controller will manage button state.
        */
        toggleButton: 'selectBtn',
        
        /**
        * Specifies a reference to the filter button for this view. If set to '' the filter button will not be
        * created, however generally this is not necessary as the controller will manage button state.
        */
        filterButton: 'filterBtn'
        
    },
    
    /**
    * Sets up the docked items.
    * @return {Array} The list of items
    * @protected    
    */         
   setupDockedItems: function() {
       var me = this;
       
       var items = me.callParent(arguments);
       
        if (typeof me.getToggleButton() == "object") {            
            items.push(me.getToggleButton());
            me.setToggleButton(me.getToggleButton().itemId);
            
        } else if (me.getToggleButton() != '') {
            items.push({  
                        xtype: 'button',
                        itemId: me.getToggleButton(),
                        iconCls: 'togform',
                        iconAlign: 'top',
                        text: me.dtTogForm,
                        cls: me.getButtonCls()
                        });
        }
        
        if (typeof me.getFilterButton() == "object") {            
            items.push(me.getFilterButton());
            me.setFilterButton(me.getFilterButton().itemId);
            
        } else  if (me.config.filterButton != '') {
            items.unshift({  
                        xtype: 'button',
                        itemId: me.getFilterButton(),
                        iconCls: 'search',
                        iconAlign: 'top',
                        text: me.dtFilter,
                        cls: me.getButtonCls()
                        });
        }       
        
        return items;
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
       
        if (me.getListPanel() != '') {
 
            items.push ({
                        xtype: me.getListPanel(),
                        itemId: me.getListPanel()     

            });
        }
        
        me.callParent(arguments);
        
        return items;
        
    }

});