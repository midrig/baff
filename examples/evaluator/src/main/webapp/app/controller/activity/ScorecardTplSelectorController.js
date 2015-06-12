Ext.define('Evaluator.controller.activity.ScorecardTplSelectorController', {
    extend: 'Baff.app.controller.SelectorController',
    
    alias: 'controller.scorecardtplselector',
    
    requires: ['Evaluator.store.ScorecardTplStore',
                    'Evaluator.model.ScorecardTpl'],
    
    config: {
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        storeSelector: 'Evaluator.store.ScorecardTplStore',
        modelSelector: 'Evaluator.model.ScorecardTpl'
       
    },
    
   prepareActivity: function() {
       Utils.logger.info("ScorecardTplSelectorController::prepareActivity");
        var me = this;
      
        me.changeContext("owningUsername",  Utils.userSecurityManager.getUserName());
        me.getReferences().ownerCol.hide();
        me.getReferences().tagCol.hide();
      
    },
    
    onCriteriaButton: function (grid, rowIndex) {
        Utils.logger.info("ScorecardTplSelectorController::onCriteriaButton");
        var me = this;
        
        var rec = grid.getStore().getAt(rowIndex);
        me.criteriaTplPopup = me.showPopup('criteriatplpopup', me.criteriaTplPopup, rec);
       
    }
}); 