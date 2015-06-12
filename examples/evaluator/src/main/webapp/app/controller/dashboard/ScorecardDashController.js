Ext.define('Evaluator.controller.dashboard.ScorecardDashController', {
    extend: 'Baff.app.controller.SelectorController',
    
    alias: 'controller.scorecarddash',
    
    requires: ['Evaluator.store.ScorecardStore',
                    'Evaluator.model.Scorecard'],
    
    config: {
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        storeSelector: 'Evaluator.store.ScorecardStore',
        modelSelector: 'Evaluator.model.Scorecard',
        
        contextHandlerMap: [{fieldName: 'evalGroup.id', contextMap: 'evalGroupId'}],
        dependentOnContext: true,
        
        fireOnEntityChange: true
        
    },
    
    onScorecardListButton: function(grid, rowIndex) {
        Utils.logger.info("ScorecardDashController:onScorecardListButton");
        var me = this;
        
        var rec = grid.getStore().getAt(rowIndex);
        
        // Fire an event for the main controller to handle
        me.fireViewEvent('selectscorecard', me, rec);
        
    }
    

}); 