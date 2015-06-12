Ext.define('Evaluator.controller.activity.AnalysisController', {
    extend: 'Baff.app.controller.SelectorController',
    
    alias: 'controller.analysis',
    
    requires: ['Evaluator.store.AnalysisStore',
                    'Evaluator.model.Analysis'],
                
    toggleAllScores: false,
    
    config: {
        
         refs: {       
           viewSelector: 'analysisview',
           toggleScopeButton: 'analysisview #toggleScopeButton',
           showChartButton:  'analysisview #showChartButton'
           
        },
        
        control: {
            toggleScopeButton: {tap: 'toggleScoreScope'},
            showChartButton: {tap: 'onShowChartButton'}
        },
         
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        storeSelector: 'Evaluator.store.AnalysisStore',
        modelSelector: 'Evaluator.model.Analysis',
        
        readOnly: true,
        contextListener: true
        
    },
    
    prepareActivity: function () {
        Utils.logger.info("AnalysisController::prepareActivity");
        var me = this, context;
        
        if (me.toggleAllScores) {
            me.evaluatorId = -1;
        }else {
            me.evaluatorId = me.getExternalContext("evaluatorId");
        }
        
        // Set to be sure in any case
        me.entityStore.setParam('evaluatorId', me.evaluatorId); 
        me.entityStore.setParam('scorecardId', me.masterEntityId); 
        
    },
    
     prepareView: function (isAfterRefresh, allowModify, record) {
        Utils.logger.info("AnalysisController::prepareView");
        var me = this;
       
        if (me.entityStore.getTotalCount() == 0)
            me.getShowChartButton().enable();
         else
           me.getShowChartButton().enable();

    },
    
    
     toggleScoreScope: function() {
        Utils.logger.info("ScoreController::toggleScoreScope");
        var me = this;
    
        me.toggleAllScores = !me.toggleAllScores;
        
        me.getToggleScopeButton().setText(me.toggleAllScores ? 'All' : 'Mine');
        me.getToggleScopeButton().setIconCls(me.toggleAllScores ? 'usergroup' : 'user');
        
        me.reset();
    },
    
    onShowChartButton: function () {
        Utils.logger.info("AnalysisController::onShowChartButton");
        var me = this;

        me.chartPopup = me.showPopup('chartview', me.chartPopup);
       
    }
   
        
    
}); 