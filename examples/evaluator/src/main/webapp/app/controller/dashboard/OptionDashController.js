Ext.define('Evaluator.controller.dashboard.OptionDashController', {
    extend: 'Baff.app.controller.SelectorController',
    
    alias: 'controller.optiondash',
    
    requires: ['Evaluator.store.OptionStore',
                    'Evaluator.model.Option'],
                
    toggleScore: 'absolute',
    showAllScores: false,
    
    config: {
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        storeSelector: 'Evaluator.store.OptionStore',
        modelSelector: 'Evaluator.model.Option',
        
        contextListener: true
               
    },
      
    prepareActivity: function() {
        Utils.logger.info("OptionController:prepareActivity");
        var me = this;
        
        if (me.showAllScores) {
            me.evaluatorId = -1;
        }else {
            me.evaluatorId = me.getExternalContext("evaluatorId");
        }
        
        // Set to be sure in any case
        me.entityStore.setParam('evaluatorId', me.evaluatorId); 
       
    },
    
    onToggleScore: function (owner, tool) {
        Utils.logger.info("OptionController::onToggleScore");
        var me = this;
        
        var refs = me.getReferences();
         
        if (me.toggleScore == 'absolute') {
             me.toggleScore = 'weighted';
             refs.absoluteCol.hide();
             refs.relAbsoluteCol.hide();
             refs.weightedCol.show();
             refs.relWeightedCol.show();
         
        } else if (me.toggleScore == 'weighted') {
             me.toggleScore = 'balanced';
             refs.relWeightedCol.hide();
             refs.weightedCol.hide();
             refs.relBalancedCol.show();
             refs.balancedCol.show();
             
         } else {
             me.toggleScore = 'absolute';
             refs.relBalancedCol.hide();
             refs.balancedCol.hide();
             refs.absoluteCol.show();
             refs.relAbsoluteCol.show();
         }
    },
    
    onAllScores: function (owner, tool) {
        Utils.logger.info("OptionController::onAllScores");
        var me = this;
        
        me.toggleScoreScope(true);
    },
    
    onMyScores: function (owner, tool) {
        Utils.logger.info("OptionController::onMyScores");
        var me = this;
        
        me.toggleScoreScope(false);

    },
    
    toggleScoreScope: function (isAllScores) {
        Utils.logger.info("OptionController::toggleScoreScope");
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
    
    onOptionListButton: function(grid, rowIndex) {
        Utils.logger.info("ScorecardDashController:onOptionListButton");
        var me = this;
        
        var rec = grid.getStore().getAt(rowIndex);
        
        // Fire an event for the main controller to handle
        me.fireViewEvent('selectoption', me, rec);
        
    }
    
}); 