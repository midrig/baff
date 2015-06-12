Ext.define('Evaluator.controller.activity.CriteriaTplSelectorController', {
    extend: 'Baff.app.controller.SelectorController',
    
    alias: 'controller.criteriatplselector',
    
    requires: ['Evaluator.model.CriteriaTpl'],
    
    config: {
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        storeSelector: 'Evaluator.store.CriteriaTplStore',
        modelSelector: 'Evaluator.model.CriteriaTpl'
       
    },
    
   prepareActivity: function() {
        var me = this;
      
        me.getReferences().relWeightCol.hide();
      
    }
    
    

}); 