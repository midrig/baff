Ext.define('Evaluator.controller.domain.MainNavigationController', {
    extend: 'Baff.app.controller.DomainController',    
    alias: 'controller.mainnavigation',
    
    config: {
        
    },
    
    init: function(application) {        
        var me = this;
        
        var refs = me.getReferences();
        
        refs.mainadminview.on('contextchange', me.onEvalGroupContextChange, me); 
        refs.maindashboard.on('contextchange', me.onEvalGroupContextChange, me);      
        
        refs.maindashboard.getReferences().scorecarddash.on('selectscorecard', me.onSelectScorecard, me);
        refs.maindashboard.getReferences().optiondash.on('selectoption', me.onSelectOptionDash, me);
        
        refs.evaltreeview.on('selectscorecard', me.onSelectScorecard, me);
        refs.evaltreeview.on('selectoption', me.onSelectOption, me);
        
        
        me.callParent(arguments);
    
    },
    
    onEvalGroupContextChange: function(controller, context) {
        Utils.logger.info("MainNavigationController:onEvalGroupContextChange");
        var me = this;
        
         var refs = me.getReferences();      
         
         if (context.containsKey('evalGroupId')) {
              refs.mainscorecardview.getController().onContextChange(controller, context);
        
        }
        
    },
    
    onSelectScorecard: function(controller, scorecard) {
        Utils.logger.info("MainNavigationController:onSelectScorecard");
        var me = this;
        
        // Evaluation group context will already have been handled
        
        // Get the scorecard domain controller to set itself up
        var mainScorecardView = me.getReferences().mainscorecardview;
        mainScorecardView.getController().onSelectScorecard(scorecard);
        me.changeTab(mainScorecardView);

    },
    
    onSelectOptionDash: function (controller, option) {
        Utils.logger.info("MainNavigationController:onSelectOptionDash");
        var me = this;
        var refs = me.getReferences();
        
        // Get scorecard
        var scorecardList = refs.maindashboard.getReferences().scorecarddash.getReferences().scorecardlist;
        var rowIndex = scorecardList.getSelectionModel().getSelection()[0].index;
        var scorecard = scorecardList.getStore().getAt(rowIndex);
       
       me.onSelectOption(controller, option, scorecard);
                
    },
    
    onSelectOption: function(controller, option, scorecard) {
        Utils.logger.info("MainNavigationController:onSelectOption");
        var me = this;
        var refs = me.getReferences();
        
        refs.mainscorecardview.getController().onSelectOption(scorecard, option);
        me.changeTab(refs.mainscorecardview);
       
    }
    
});
