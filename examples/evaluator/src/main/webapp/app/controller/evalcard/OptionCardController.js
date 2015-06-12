Ext.define('Evaluator.controller.evalcard.OptionCardController', {
    extend: 'Baff.app.controller.FormController',
    
    alias: 'controller.optioncard',
    
    requires: ['Evaluator.model.Option'],
                
    
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
        
        me.evaluatorId = me.getExternalContext("evaluatorId");
        me.entityStore.setParam('evaluatorId', me.evaluatorId); 
       
    },
}); 