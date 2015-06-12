/**
 * The main application class. An instance of this class is created by app.js when it calls
 * Ext.application(). This is the ideal place to handle application launch and initialization
 * details.
 */
Ext.define('Evaluator.Application', {
    extend: 'Ext.app.Application',
    requires: [
        'Baff.utility.Utilities',
        'Baff.utility.application.MainApplicationController',
        'Baff.utility.application.Viewport',
        'Baff.app.model.ServiceProxy',
        'Evaluator.view.domain.MainNavigationView',
        'Ext.draw.Color',  // workaround fixed in v5.1.0
        'Ext.toolbar.Spacer'
        ],
    
    name: 'Evaluator',
    
    controllers: [
        'Baff.utility.application.MainApplicationController'
    ],
    
    init : function(application){
        
        // Setup globals
        Utils.globals.application = this;
        Utils.globals.applicationName = "Evaluator";
        Utils.globals.manageUsers = true;
        
        Utils.globals.logInfo =  Utils.getBuildProperty('$LOGGER_INFO$', true);
        Utils.globals.logDebug = Utils.getBuildProperty('$LOGGER_DEBUG$', true);
        Utils.globals.logError =  Utils.getBuildProperty('$LOGGER_ERROR$', true);     
        Utils.globals.version = Utils.getBuildProperty('$BUILD_VERSION$', '[Development]');
        
        if (Utils.globals.version == "[Development]" )  {     
            Utils.globals.defaultUsername = "testuser";
            Utils.globals.defaultPassword = "testuser";
        }
        
        Utils.userSecurityManager.setServiceRootUrl('eval/user');
        Utils.userSecurityManager.setDefaultPermissions('evaluator.read, evaluator.update');
        Utils.refDataManager.setServiceRootUrl('eval/refdata');
        
        // Get reference data classes needed for view initialisation
        Utils.refDataManager.getRefDataStore("EVALGROUP.USERROLE");
        
        
    }
    
    
    
});
