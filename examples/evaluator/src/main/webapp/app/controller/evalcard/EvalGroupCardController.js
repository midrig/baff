Ext.define('Evaluator.controller.evalcard.EvalGroupCardController', {
    extend: 'Baff.app.controller.FormController',
    
    alias: 'controller.evalgroupcard',
    
    requires: ['Evaluator.model.EvalGroup'],
    
    config: {
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        //storeSelector: 'Evaluator.store.EvalGroupStore',
        modelSelector: 'Evaluator.model.EvalGroup'
        
    }
    
}); 