Ext.define('Evaluator.controller.activity.ScorecardTplController', {
    extend: 'Baff.app.controller.ListFormController',
    
    alias: 'controller.scorecardtpl',
    
    requires: ['Evaluator.store.ScorecardTplStore',
                    'Evaluator.model.ScorecardTpl'],
    
    config: {
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        storeSelector: 'Evaluator.store.ScorecardTplStore',
        modelSelector: 'Evaluator.model.ScorecardTpl'
       
    },
    
   prepareActivity: function() {
       Utils.logger.info("ScorecardTplController::prepareActivity");
        var me = this;
      
        me.changeContext("owningUsername",  Utils.userSecurityManager.getUserName());
        me.getReferences().actionCol.hide();
  
    },
    
    prepareView: function (isAfterRefresh, allowModify, record) {
        Utils.logger.info("ScorecardTplController::prepareView");
        var me = this;

        if (record.get('owningUsername') == Utils.userSecurityManager.getUserName())
           me.enableWidget(me.removeButton, true);
        else
           me.enableWidget(me.removeButton, false);

    }
}); 