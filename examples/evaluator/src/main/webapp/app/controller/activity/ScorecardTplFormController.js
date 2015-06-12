Ext.define('Evaluator.controller.activity.ScorecardTplFormController', {
    extend: 'Baff.app.controller.FormController',
    
    alias: 'controller.scorecardtplform',
    
    requires: ['Evaluator.model.ScorecardTpl'],
    
    config: {
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        // No store !
        modelSelector: 'Evaluator.model.ScorecardTpl',
       
        updateEnabled: false,
        deleteEnabled: false
        
    },
    
    prepareView: function (isAfterRefresh, allowModify, record, action) {
        Utils.logger.info("ScorecardTplFormController::prepareView");
        var me = this, context;
        
        if (action == me.entityModel.ACTION.CREATE) {
        
            var refs = me.getReferences();
            refs.name.setValue(me.extEntity.get('name'));
            refs.description.setValue(me.extEntity.get('description'));
            refs.username.setValue(Utils.userSecurityManager.getUserName());

            me.enableWidget(me.saveButton, true);
        }
        
    },
    
     prepareRecord: function (operationType, record) {
        Utils.logger.info("ScorecardTplFormController::prepareRecord");
        var me = this;
        
        me.callParent(arguments);
        record.setParam("scorecardId", me.extEntity.get('id'));
     
     }
  

}); 