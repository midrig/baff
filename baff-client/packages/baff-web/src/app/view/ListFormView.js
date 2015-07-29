/**
 *  A ListFormView extends {@link Baff.app.view.FormView} to provide the view for a discrete activity 
 *  controlled by a {@link Ext.foundation.ListFormController}. It provides the various user interface 
 *  components for the activity include the list, form and various buttons.
 *  
 *  A minimal setup only requires the {@link #controller}, {@link #listPanel} and {@link #formPanel} 
 *  to be specified, along with an alias so that the view can be referenced by an {@link Baff.app.view.DomainView}.
 * 
 *      Ext.define('MyApp.view.MyListFormView', {
 *          extend: 'Baff.app.view.ListFormView',
 *          
 *          alias: 'widget.mylistformview',
 *          
 *          requires: ['MyApp.view.MyFormPanel',
 *                          'MyApp.view.MyListPanel',
 *                          'MyApp.controller.MyListFormController'],
 *   
 *          config : {
 *                    
 *                    controller: 'myformcontroller',    // alias of MyApp.controller.MyFormController       
 *                    formPanel: 'myform'     // alias of MyApp.view.MyForm 
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
    
    
    config: {
        
        /**
        * Specifies the type of {@link Baff.app.controller.ListFormController} that controls this view.
        * **IMPORTANT**: This view's subclass should specify a subclass of the above controller.
        * @cfg controller (required)
        */
        controller: 'listform',
        
        /**
        * Specifies the type of {@link Baff.app.view.ListPanel} that provides the form for this view.
        * **IMPORTANT**: This view's subclass should specify a subclass of the above form panel.
        * @cfg listPanel (required)
        */
        listPanel: '', 
        
        /**
         * Specifies the flex of the list (defaults to 10 relative to the form flex of 10)
         */
         listFlex: 10
        
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
        var margin = (me.getLayout().type == 'hbox' ? '0 5 0 0' : '0 0 5 0');
        
        var listPanel = {
                        xtype: me.getListPanel(),
                        reference: me.getListPanel(),
                        margin: margin,
                        flex: me.getListFlex()
                    };
            
        if (me.getDashlet())
            listPanel.allowRefresh = true;
       
         items.push (listPanel);
        
        me.callParent(arguments);
        
        return items;
        
    }

});