Ext.define('Evaluator.controller.activity.CriteriaController', {
    extend: 'Baff.app.controller.ListFormController',
    
    alias: 'controller.criteria',
    
    requires: ['Evaluator.store.CriteriaStore',
                    'Evaluator.model.Criteria'],
    
    config: {
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        storeSelector: 'Evaluator.store.CriteriaStore',
        modelSelector: 'Evaluator.model.Criteria',
        
        contextSetterMap: [{fieldName: 'id', contextMap: 'criteriaId'}],
        contextListener: true,
        fireOnEntityChange:true
               
    },
    
    setupAccessControl: function() {
        Utils.logger.info("CriteriaController:setupAccessControl");
        var me = this;
        
        // Call superclass
        me.callParent(arguments);
        
        // Get user role context and set read only if not administrator
        var role = me.getExternalContext("userRole");
        
        // Do not allow updates if not an adminstrator
        if (role != Utils.refDataManager.getCode("ADMIN", "EVALGROUP.USERROLE"))
            me.makeReadOnly();
        
    }
    
}); 