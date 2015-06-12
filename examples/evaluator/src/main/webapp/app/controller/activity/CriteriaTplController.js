Ext.define('Evaluator.controller.activity.CriteriaTplController', {
    extend: 'Baff.app.controller.SelectorController',
    
    alias: 'controller.criteriatpl',
    
    requires: ['Evaluator.model.CriteriaTpl'],
    
    config: {
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        storeSelector: 'Evaluator.store.CriteriaTplStore',
        modelSelector: 'Evaluator.model.CriteriaTpl'
       
    }

}); 