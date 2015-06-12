/*
    This file is generated and updated by Sencha Cmd. You can edit this file as
    needed for your application, but these edits will have to be merged by
    Sencha Cmd when it performs code generation tasks such as generating new
    models, controllers or views and when running "sencha app upgrade".

    Ideally changes to this file would be limited and most work would be done
    in other places (such as Controllers). If Sencha Cmd cannot merge your
    changes and its generated code, it will produce a "merge conflict" that you
    will need to resolve manually.
*/


Ext.Loader.setConfig({
    enabled: true,
    paths:{
        'Baff': 'packages/baff-mob/src'
    }
});


Ext.application({
    name: 'Evaluator',

    requires: [
        'Ext.MessageBox',
        'Baff.utility.Utilities',
        'Ext.util.DelayedTask',
        'Baff.utility.application.MainApplicationController'
    ],

    views: [
        'domain.MainNavigation',
        'scorecard.ScorecardView',
        'evalgroup.EvalGroupSelectorView',
        'criteria.CriteriaView',
        'option.OptionView',
        'score.ScoreView',
        'analysis.AnalysisView',
        'chart.ChartView'
        
    ],
    
    stores: [
        'ScorecardStore',
        'EvalGroupStore',
        'CriteriaStore',
        'OptionStore',
        'ScoreStore',
        'AnalysisStore',
        'ChartStore'
       
    ],
    
    controllers: [
        'domain.MainNavigationController',
        'activity.ScorecardController',
        'activity.EvalGroupSelectorController',
        'activity.CriteriaController',
        'activity.OptionController',
        'activity.ScoreController',
        'activity.AnalysisController',
        'activity.ChartController',
        'Baff.utility.application.MainApplicationController'
    ],
    
    launch: function() {
        console.debug("launching app");
        
        var me = this;
 
        // Setup globals
        Utils.globals.application = me;
        Utils.globals.applicationName = "Evaluator";
        
        Utils.globals.logInfo =  Utils.getBuildProperty('$LOGGER_INFO$', true);
        Utils.globals.logDebug = Utils.getBuildProperty('$LOGGER_DEBUG$', true);
        Utils.globals.logError =  Utils.getBuildProperty('$LOGGER_ERROR$', true);     
        Utils.globals.version = Utils.getBuildProperty('$BUILD_VERSION$', '[Development]');
        
        if (Utils.globals.version == "[Development]" )  {     
            Utils.globals.defaultUsername = "testuser";
            Utils.globals.defaultPassword = "testuser";
        }
        
        Utils.userSecurityManager.setServiceRootUrl('/evaluator/eval/user');
        Utils.userSecurityManager.setDefaultPermissions('evaluator.read, evaluator.update');
        Utils.refDataManager.setServiceRootUrl('/evaluator/eval/refdata');
        
        // Get reference data classes needed for view initialisation
        Utils.refDataManager.getRefDataStore("EVALGROUP.USERROLE");
        
        
        if (Ext.isSpace)
            Ext.onSpaceReady(me.initialiseForSpace);
        
         var mainController = me.getController('Baff.utility.application.MainApplicationController');
           
         var task = new Ext.util.DelayedTask(function() {
             mainController.onLaunch();
             Ext.fly('splashcreen').destroy();   
         });
         
         task.delay(2000);
         
    },

    onUpdated: function() {
        Ext.Msg.confirm(
            "Application Update",
            "This application has just successfully been updated to the latest version. Reload now?",
            function(buttonId) {
                if (buttonId === 'yes') {
                    window.location.reload();
                }
            }
        );
    },
    
    initialiseForSpace: function() {
        
        Utils.globals.defaultUsername = Ext.space.Profile.user.userId;
        Utils.globals.defaultPassword = "";
        
        
        Ext.space.Fullscreen.enter();
        
        Ext.space.Focus.onToggle(function(isForeground)  {
            if(isForeground) {
                Ext.space.Fullscreen.enter();
            } else {
                Ext.space.Fullscreen.leave();
            }
            
        });
        
    }
    
    
    
    
});
