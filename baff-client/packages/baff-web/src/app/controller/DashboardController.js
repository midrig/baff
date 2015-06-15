/**
 *  A Dashboard Controller controls a {@link Baff.app.view.DashboardView}that presents multiple read only
 *  activity 'dashlets'.
 *  
 * A typical implementation is simply as follows, assuming that any user can access the dashboard and that its 
 * title is not selected from any particular entity record.  
 * 
 *     Ext.define('MyApp.controller.MyMainDashboardController', {
 *         extend: 'Baff.app.controller.DashboardController',           
 *         alias: 'controller.maindashboardcontroller',
 *          
 *     });
 *     
 */
Ext.define('Baff.app.controller.DashboardController', { 
    extend: 'Baff.app.controller.BaseDomainController',   
    requires: ['Baff.utility.Utilities'],
    alias: 'controller.dashboard',
   
    /**
    * Called by the framework to activate the activity.
    * Activates underlying activities.
    */   
    onActivateView: function() {
        Utils.logger.info("DashboardController[" + this.identifier + "]::onActivateView");
        var me=this;
        
        // Activate sub views
        var views = Ext.ComponentQuery.query('activityview', me.domainView);
        
        Ext.Array.each(views, function (item) {
                item.getController().onActivateView();
         });
             
    },
    
    /**
    * Called by the framework to deactivate the activity.
    * Deactivates underlying activities. 
    */   
    onDeactivateView: function() {
        Utils.logger.info("DashboardController[" + this.identifier + "]::onDeactivateView");
        var me=this;
        
        // Dectivate sub views
        var views = Ext.ComponentQuery.query('activityview', me.domainView);
        
        Ext.Array.each(views, function (item) {
                item.getController().onDeactivateView();
         });
    }

});