Ext.define('Evaluator.controller.activity.EvaluatorController', {
    extend: 'Baff.app.controller.ListFormController',
    
    alias: 'controller.evaluator',
    
    requires: ['Evaluator.store.EvaluatorStore',
                    'Evaluator.model.Evaluator'],
    
    config: {
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        storeSelector: 'Evaluator.store.EvaluatorStore',
        modelSelector: 'Evaluator.model.Evaluator',
        
        contextListener: true
        
    },
    
    
    setupAccessControl: function() {
        Utils.logger.info("EvaluatorController:setupAccessControl");
        var me = this;
        
       // Call superclass
        me.callParent(arguments);
        
        // Get user role context and set read only if not administrator
        var role = me.getExternalContext("userRole");
        
        // Do not allow updates if not an adminstrator
        if (role != Utils.refDataManager.getCode("ADMIN", "EVALGROUP.USERROLE"))
            me.makeReadOnly();
        
    },
    
    prepareView: function (isAfterRefresh, allowModify, record) {
        Utils.logger.info("EvaluatorController::prepareForm");
        var me = this;
        
        // Do nothing if modification is not allowed
        if (!allowModify)
            return;
        
        // Don't allow changes to the same user
        if (Utils.userSecurityManager.getUserName() == record.get('username')) {
            me.setFieldsReadOnly();   
        }       
        
    }
    
}); 