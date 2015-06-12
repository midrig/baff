Ext.define('Evaluator.controller.activity.AnalysisController', {
    extend: 'Baff.app.controller.SelectorController',
    
    alias: 'controller.analysis',
    
    requires: ['Evaluator.store.AnalysisStore',
                    'Evaluator.model.Analysis'],
    
    config: {
        
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
        
        if (me.showAllScores) {
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
        
        var refs = me.getReferences();
        
        if (me.entityStore.getTotalCount() == 0)
            refs.chartButton.disable();
         else
            refs.chartButton.enable();

    },
     
    onAllScores: function (owner, tool) {
        Utils.logger.info("AnalysisController::onAllScores");
        var me = this;
        
        me.toggleScoreScope(true);
    },
    
    onMyScores: function (owner, tool) {
        Utils.logger.info("AnalysisController::onMyScores");
        var me = this;
        
        me.toggleScoreScope(false);

    },
    
    toggleScoreScope: function (isAllScores) {
        Utils.logger.info("AnalysisController::toggleScoreScope");
        var me = this;
        
        var refs = me.getReferences();
        
        me.showAllScores = isAllScores;
        
        if (isAllScores) {        
            refs.allScoresButton.hide();
            refs.myScoresButton.show();  
        }else{
            refs.allScoresButton.show();
            refs.myScoresButton.hide();
        }
        
        me.reset();

    },
    
    onChartButton: function () {
        Utils.logger.info("AnalysisController::onChartButton");
        var me = this;

        me.chartPopup = me.showPopup('chartpopup', me.chartPopup);
       
    }
        
    
}); 