/**
 *  A domainView tabulates a set of {@link Baff.app.view.ActivityView}s assocated with activities,
 *  and is controlled by a {@link Baff.app.controller.DomainController}, which manages navigation and
 *  communication between the activities.
 *  
 *  A domainView can also contain a set of other domainViews in order to define a hierarchical
 *  navigation structure for the application, for example:
 *  
 *  EntityNavigationView --> MultidomainView --> MaindomainView
 *  
 *  where:
 *    
 *    - EntityNavigationController presents views for each master entity type, e.g. Customer, Product, etc.    
 *    - MultipleDomainController presents views for different instances of the same master entity type  
 *    - MainDomainController presents views for the activities relating to a specific master entity instance    
 *  
 * A typical implementation for a "MaindomainView" that presents a set of views for activities associated with
 * a master entity is as follows; only the {@link controller} and the references to the various activity
 * views need to be specified.
 * 
 *     Ext.define('MyApp.view.MyMainEntitytView', {
 *          extend: 'Baff.app.view.DomainView',
 *          alias: 'widget.mymaindomainView',
 *            
 *          requires: ['MyApp.controller.MyMainDomainController',
 *                          'MyApp.view.MyActivityFooView',
 *                          'MyApp.view.MyActivityBarView'],
 *          
 *          config: {    
 *              controller: 'mymainentity',        
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
 *  The configuration for entity views containing other entity views is very similar, with the various entity
 *  views referenced instead.  For "Multi" views to specify an "add new" tab, which will dynamically
 *  create a new activity instance, for example:
 *  
 *     Ext.define('MyApp.view.MyMultiEntitytView', {
 *          extend: 'Baff.app.view.DomainView',
 *          alias: 'widget.mymultidomainView',
 *            
 *          requires: ['MyApp.controller.MyMultiDomainController',
 *                          'MyApp.view.MyMaindomainView'],
 *          
 *          config: {    
 *              controller: 'mymultientity',        
 *              
 *              defaults: {
 *                   closable: true    // added views will be able to be closed
 *              },
 *              
 *              items: [{
 *                      title: 'MyEntity',    // An optional default view as a new view will be created automatically
 *                      xtype: 'mymaindomainview', 
 *                      closable: false    // Optional
 *                  }, {     
 *                      title: '<i>New Entity...<i>',    // The "add new" tab, with title in italics
 *                      reference: 'newtab',    // IMPORTANT: must be set to 'newtab'
 *                      newType: 'mymaindomainview',    // type of the view to be added
 *                      newTitle: 'MyEntity',    // The title of the new tab 
 *                      closable: false    // Must set otherwise user can close the "add new" tab
 *                      popupSelector: 'myPopup' // A popup selector, if required
 *                  }]
 *               }
 *     });
 *                         
 *                                                                  
 */
Ext.define('Baff.app.view.DomainView', {
    extend: 'Ext.tab.Panel',
    xtype: 'domainview',
    
    config: {
        
        /**
        * Specifies the {@link Baff.app.controller.DomainController} that controls this view
        */
        controller: 'domain',

        /**
         * Indicates if this view was dynamically created
         * @private
         */ 
        fromNew: false,
        
        /**
        * Specifies the popup window widget type, e.g. a {@link Baff.app.view.SelectorPopup} that 
        * should be initially displayed in order to select the master entity.
        */
        popupSelector: '',
        
        /**
         * Specifies a dashlet window to be displayed, e.g. to present summary details
         */
        dashletSelector: '',
        
        /**
         * Specifies where to dock the dashlet window or specify 'popup' if a floating modal window
         */
        dashletDock: 'right',
        
        
        /**
         * Specifies a list of views or view indexes where the dashlet should auto-hide if visible.
         * Defaults to the first tab
         */
        autoHideDashletOnView: [0],        
        
        /** 
         * Specifies the dashlet should automatically be shown for any views where it is not automatically hidden
         * as specified by #autoHideDashletOnView}
         */
        autoShowDashlet: false,
        
        /**
         * Specifies if the dashlet is initially hidden
         * Note that the {@link #autoHideDashletOnView} should also be set accordingly
         */
        hideDashlet: false,
        
        /**
         * Specifies if any dashlet can be toggled between visibile and hidden states
         */
        toggleDashlet: true
 
    
    },
    
    
    // The following styles are required to ensure the background is painted correctly
    border: false,
    bodyStyle: {
            background: 'transparent'
        },

    defaults: {
        bodyStyle: {
            background: 'transparent'
        }
    },
     

    
    /**
    * Creates the view components, using the specified configuration such as {@link #refreshButton}. etc.
    * Calls the overridden superclass method.    
    */          
    initComponent: function() {
        var me = this;
        
        if (me.getDashletSelector() !== '' && me.getDashletDock() != 'popup') {
        
            Ext.apply(me, {
               dockedItems: [
                   {                  
                        xtype: me.getDashletSelector(),
                        dock: me.getDashletDock(),
                        reference: me.getDashletSelector(),
                        dashlet: true,
                        hidden: me.getHideDashlet()
                   }                       
                ]
            });
        }

        me.callParent(arguments);
    
    }
    
});