Ext.define('Evaluator.controller.activity.EvalGroupController', {
    extend: 'Baff.app.controller.ListFormController',
    
    alias: 'controller.evalgroup',
    
    requires: ['Evaluator.store.EvalGroupStore',
                    'Evaluator.model.EvalGroup'],
    
    config: {
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        storeSelector: 'Evaluator.store.EvalGroupStore',
        modelSelector: 'Evaluator.model.EvalGroup',
      
        contextSetterMap: [{fieldName: 'id', contextMap: 'evalGroupId'},
                                       {fieldName: 'userrole', contextMap: 'userRole'},
                                       {fieldName: 'evaluator.id', contextMap: 'evaluatorId'}]
        
    },
    
    prepareActivity: function() {
        var me = this;
        
        me.callParent(arguments);
        
        // Steup context
        me.changeContext("username",  Utils.userSecurityManager.getUserName());
        //me.changeContext("role", Utils.refDataManager.getCode("ADMIN", "EVALGROUP.USERROLE"));
 
    },
    
     prepareView: function (isAfterRefresh, allowModify, record, action) {
        Utils.logger.info("EvalGroupController::prepareView");
        var me = this;
         
        // Do nothing if modification is not allowed
        if (!allowModify)
            return;
        
        // Don't allow changes if not admin
        if (action != me.entityModel.ACTION.CREATE &&
                 record.get('userrole') != Utils.refDataManager.getCode("ADMIN", "EVALGROUP.USERROLE")) {
            me.setFieldsReadOnly();   
        }       
        
    }
    
}); 