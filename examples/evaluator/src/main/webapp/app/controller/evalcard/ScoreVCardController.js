Ext.define('Evaluator.controller.evalcard.ScoreVCardController', {
    extend: 'Baff.app.controller.FormController',
    
    alias: 'controller.scorevcard',
    
    requires: ['Evaluator.model.Score'],
                
    
    config: {
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        //storeSelector: 'Evaluator.store.ScoreStore',
        modelSelector: 'Evaluator.model.Score',
        
        createEnabled: false,
        deleteEnabled: false,
        
        //contextListener: true
               
    },
    /*  
    prepareActivity: function() {
        Utils.logger.info("OptionController:prepareActivity");
        var me = this;
        
        me.evaluatorId = me.getExternalContext("evaluatorId");
        me.entityStore.setParam('evaluatorId', me.evaluatorId); 
       
    }*/
}); 