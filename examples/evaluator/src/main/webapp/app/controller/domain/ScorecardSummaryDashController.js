Ext.define('Evaluator.controller.domain.ScorecardSummaryDashController', {
    extend: 'Baff.app.controller.FormController',
    
    alias: 'controller.scorecardsummarydash',
    
    requires: ['Evaluator.store.ScorecardStore',
                    'Evaluator.model.Scorecard'],
    
    config: {
        
        readRoles: ['evaluator.read', 'evaluator.update'],
        
        storeSelector: 'Evaluator.store.ScorecardStore',
        modelSelector: 'Evaluator.model.Scorecard',
        
        dependentOnMaster: true,
        //listenForEntityChange: true,
        fireOnMasterChange: false
           
    }
}); 