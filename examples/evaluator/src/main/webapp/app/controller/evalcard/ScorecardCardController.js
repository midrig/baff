Ext.define('Evaluator.controller.evalcard.ScorecardCardController', {
    extend: 'Baff.app.controller.FormController',
    
    alias: 'controller.scorecardcard',
    
    requires: ['Evaluator.model.Scorecard'],
    
    config: {
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        storeSelector: 'Evaluator.store.ScorecardStore',
        modelSelector: 'Evaluator.model.Scorecard',
        
        contextHandlerMap: [{fieldName: 'evalGroup.id', contextMap: 'evalGroupId'}],
        dependentOnContext: true,
        setupNewRecordFromContext: true
        
    }

}); 