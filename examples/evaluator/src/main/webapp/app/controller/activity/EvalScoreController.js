Ext.define('Evaluator.controller.activity.EvalScoreController', {
    extend: 'Baff.app.controller.SelectorController',
    
    alias: 'controller.evalscore',
    
    requires: ['Evaluator.store.ScoreStore',
                    'Evaluator.model.Score'],
    
    config: {
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        storeSelector: 'Evaluator.store.ScoreStore',
        modelSelector: 'Evaluator.model.Score',
        
        fireOnMasterChange: false,
        readOnly: true
      
    },
    
    onEntityChange: function(controller, entity, type) {
        Utils.logger.info("EvalScoreController::onEntityChange");
        var me = this;
        
        if (type == 'Evaluator.model.Score' && me.context != entity) {
            me.changeContext('option.id', entity.get('option.id'));
            me.changeContext('criteria.id', entity.get('criteria.id'));
            me.context = entity;
        }
            
    },
    
     prepareActivity: function() {
        Utils.logger.info("EvalScoreController:prepareActivity");
        var me = this;
        
        me.entityStore.setParam('evaluatorId', -2);

    },
    
    prepareView: function (isAfterRefresh, allowModify, record) {
        Utils.logger.info("EvalScoreController::onStoreFirstLoaded");
        var me = this, context;
        
        if (isAfterRefresh) 
            me.listPanel.setTitle('All Scores for Option "' + me.context.get('option.name') + '" and Criteria "' + me.context.get('criteria.name') + '"');
        
    }
}); 