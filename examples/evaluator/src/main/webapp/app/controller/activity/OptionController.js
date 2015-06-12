Ext.define('Evaluator.controller.activity.OptionController', {
    extend: 'Baff.app.controller.ListFormController',
    
    alias: 'controller.option',
    
    requires: ['Evaluator.store.OptionStore',
                    'Evaluator.model.Option'],
                
    toggleScore: 'absolute',
    showAllScores: false,
    
    config: {
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        storeSelector: 'Evaluator.store.OptionStore',
        modelSelector: 'Evaluator.model.Option',
        
        contextSetterMap: [{fieldName: 'id', contextMap: 'optionId'}],
        contextListener: true,
        fireOnEntityChange: true
               
    },
    
    setupAccessControl: function() {
        Utils.logger.info("OptionController:setupAccessControl");
        var me = this;
        
       // Call superclass
        me.callParent(arguments);
        
        // Get user role context and set read only if not administrator
        var role = me.getExternalContext("userRole");
        
        // Do not allow updates if not an adminstrator
        if (role != Utils.refDataManager.getCode("ADMIN", "EVALGROUP.USERROLE"))
            me.makeReadOnly();
        
    },
      
    prepareActivity: function() {
        Utils.logger.info("OptionController:prepareActivity");
        var me = this;
        
        me.getReferences().actionCol.hide();
        
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

    }
        

    
    
}); 