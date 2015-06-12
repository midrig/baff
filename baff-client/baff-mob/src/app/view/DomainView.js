/**
 *  A domainView tabulates a set of {@link Baff.app.view.ActivityView}s assocated with activities,
 *  and is controlled by a {@link Baff.app.controller.DomainController}, which manages navigation and
 *  communication between the activities.
 *  
 *  For a mobile application there may typically be a single domain view, for which a  typical implementation 
 *  is as follows.  Only the references to the various activity  views need to be specified.
 * 
 *     Ext.define('MyApp.view.MyMainEntitytView', {
 *          extend: 'Baff.app.view.DomainView',
 *          alias: 'widget.mymaindomainView',
 *            
 *          requires: ['MyApp.view.MyActivityFooView',
 *                          'MyApp.view.MyActivityBarView'],
 *          
 *          config: {    
 *                 
 *              items: [{
 *                      title: 'Foo',
 *                      xtype: 'myactivityfooview'
 *                  }, {     
 *                      title: 'Bar',
 *                      xtype: 'myactivitybarview',
 *                  }]
 *               }
 *     });
 *                     
 */
Ext.define('Baff.app.view.DomainView', {
    extend: 'Ext.tab.Panel',
    xtype: 'domainview',
    
    config: {
       
        /**
        * Specifiies the title to display in the top toolbar
        */
        topTitle: '',    
        
        /*
         * Specifies the tab bar position
         */
        tabBarPosition: 'bottom',
        
        /*
         * Specifies the controller for this view, this will be set automatically by the framework
         * @private
         */
        controller: null
        
    },
    
     /**
    * Creates the view components, using the specified configuration such as {@link #refreshButton}. etc.
    * Calls the overridden superclass method.    
    */          
    initialize: function() {
        var me = this;
       
       var items = [];
        
        if (me.getTopTitle() != '') {
            items.push({
                            xtype: 'toolbar',   
                            docked: 'top',
                            itemId: 'titlebar',
                            title: me.getTopTitle(),
                            items: me.setupDockedItems()
                        });
        }
       
        me.add(items);
        
        me.callParent(arguments);      
        
    },
    
    /**
    * Sets up the docked items.
    * @return {Array} The list of items
    * @protected    
    */         
   setupDockedItems: function() {
       var items = [];
       return items;
   },   
       
   
   
    /**
    * Queries underlying activities to determine if the user should be prompted before changing
    * the view. 
    * Called whe active tab is requested to be changed.
    * @param {Ext.tab.Bar} tabBar The tab bar
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} newTab The view being requested
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} oldTab The current view
    * @param {boolean} isPrompting Indicates if already prompting the user
    * 
    */   
    doTabChange: function(tabBar, newTab, oldTab, delegate, eOpts, isPrompting) {
        var me = this;
        Utils.logger.info("DomainView::doTabChange");

        // This is called twice, second time around by doSetActiveItem, which wraps the call with forcedChange = true
        if (!me.forcedChange && !isPrompting) {
        
            // Prompt the user if required
            var oldView = me.getActiveItem();
            var prompt = me.getController().getDeactivationPrompt(oldView);

            if (prompt != "") {  

                Ext.Msg.confirm('Confirm', prompt, 
                    function(btn) {

                        if (btn == 'yes') {
                            me.doTabChange(tabBar, newTab, oldTab, delegate, eOpts, true);
                        }

                    }
                );

                return false;
            }
        }

        return me.callParent(arguments);
    }
     
});