/**
 *  An ActivityView provides the view for a discrete activity controlled by a {@link Ext.foundation.ActivityController}.  
 *  
 *  All types of activity views such as those based on {@link Baff.app.view.FormView}, 
 *  {@link Baff.app.view.ListFormView} and {@link Baff.app.view.SelectorView} are based on this.
 *  
 *  This class extends {Ext.app.panel.Panel}, however subclasses should generally not require to configure
 *  the superclass properties.
 *  
 */
Ext.define('Baff.app.view.ActivityView', {
    extend: 'Ext.Panel',
    xtype: 'activityview',
    
    // Display text
    dtRefresh: 'Refresh',
    dtClose: 'Close',
        
       
        config: {
            
            /**
            * Specifiies the title to display in the top toolbar
            */
            topTitle: '', 

            /**
            * Specifiies the css class to use to style toolbar buttons
            */
            buttonCls: 'baff-button',    
            
            /*
             * Specifies the controller for this view, this will be set automatically by the framework
             * @private
             */
            controller: null, 
            
            
            /**
            * Specifies a reference to the refresh button for this view. If set to '' the add button will not be
            * created, however generally this is not necessary as the controller will manage button state.
            */
            refreshButton: 'refreshBtn',
            
            /**
            * Specifies a reference to the close button for this view (if a popup). If set to '' the close button will not be
            * created, however generally this is not necessary as the controller will manage button state.
            */
            closeButton: null,
            
            layout: {
                    type: 'vbox',
                    align: 'stretch'
                    },

            defaults: {
                    flex: 1
            },
            
            /*
             * Specifies if this view is a pup-up / sub-activity
             * @private
             */
            popup: false,
            
            /**
            * Specifies additional items created by the subclass that should be added to the view.
            */
            myItems: []
        
        },
        
    /**
    * Creates the view components, using the specified configuration such as {@link #refreshButton}. etc.
    * Calls the overridden superclass method.    
    */          
    initialize: function() {
        var me = this;
        
        if (me.getCloseButton() == null) {
            if (me.getPopup())
                me.setCloseButton('closeBtn');
            else
                me.setCloseButton('');
        }
        
        var dockedItems = me.setupDockedItems();
        var items = me.setupItems();
        
        if (me.getTopTitle() != '') {
            items.push({
                            xtype: 'toolbar',   
                            docked: 'top',
                            itemId: 'titlebar',
                            title: me.getTopTitle()
                        });
        }
         
        items.push({
	              	xtype: 'toolbar',         	
	                layout: { pack: 'center' },
	                docked: 'top',  
	                items: dockedItems	                             	
	             });
       
        me.add(items);
        
        me.callParent(arguments);      
        
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
    * Subclasses may override this and add the items in the required order.
    * @return {Array} The list of items
    * @protected    
    */         
    setupItems: function() {
        var me = this;
        
        var items = me.getMyItems();
        
        return items;
    },
    
    /**
     * Displays and activates a popup view.
     */
    display: function (dc) {
        var me = this;
        
        me.domainController = dc;

        me.enable();
        Ext.Viewport.animateActiveItem(me, { type: 'slide', direction: 'left' });       
        me.getController().onActivateView();
    }
               
 

});