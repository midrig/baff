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
    extend: 'Ext.panel.Panel',
    xtype: 'activityview',   

    // Display text
    dtRefresh: 'Refresh',

     config: {
         
         /**
        * Specifies the {@link Baff.app.controller.ActivityController} that controls this view
        */
        controller: 'activity',

        /**
        * Specifies a reference to the refresh button for this view. If set to '' the add button will not be
        * created, however generally this is not necessary as the controller will manage button state.
        */
        refreshButton: 'refreshBtn',

        /**
        * Specifies additional items created by the subclass that should be added to the view.
        */
        myItems: [], 
        
        /**
        * Specifies a title for the view
        */
        title: '', 
        
        /**
         * Specifies if this is view is to be displayed in a dashboard - see @link Baff.app.view.DashboardView}
         * If this is the case it should be read-only; and typically present a single component (e.g. list, form, etc.)
         */
        dashlet: false
        
    },

    // The following styles are required to ensure the background is painted correctly
    border: false,
    cls: 'x-tab x-tab-active x-tab-default',     
    bodyPadding: 5,
    
    bodyStyle: {
        background: 'transparent'
    },

    // Default layout
    layout: {
        type: 'hbox',  
        align:'stretch' 
    },

    /**
    * Creates the view components, using the specified configuration such as {@link #refreshButton}. etc.
    * Calls the overridden superclass method.    
    */          
    initComponent: function() {
        var me = this;
        var dockedItems = me.setupDockedItems();
        var items = me.setupItems();
       
        if (dockedItems != null && !me.getDashlet()) {
       
            Ext.apply(me, {
               dockedItems: [

                    {                                  
                    xtype: 'toolbar',
                    cls: 'x-tab x-tab-active x-tab-default',
                    dock: 'top',
                    items: dockedItems
                    }
                ]
            });
        
        }
        
        if (items != null) {
            
             Ext.apply(me, {
                items: items
            });
        }
  
        me.callParent(arguments);      
        
    },
    
    setupDockedItems: function() {
       var me = this,
                refreshBtn;
        
         if (me.getDashlet()) {
            me.refreshButton = '';
            return null;
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
                            refreshBtn
                        ];
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

        if (me.config.title != '')
            me.setTitle(dc.domainView.getTitle() + " - " + me.config.title);

        this.show();
        this.getController().onActivateView();
    },
    
    /**
     * Finds the parent of this activity's view
     * @return The parent view
     */
    findParentView: function() {
        var me = this;
        
        if (me.domainController != null)
            return me.domainController.domainView;
        
        return me.findParentBy(function(container) {
            if (container.isXType('domainview') || container.isXType('dashboardview') || container.isXType('cardview'))
                return true;
        })
    }
 

});