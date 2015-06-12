Ext.define('Evaluator.controller.dashboard.EvalGroupDashController', {
    extend: 'Baff.app.controller.SelectorController',
    
    alias: 'controller.evalgroupdash',
    
    requires: ['Evaluator.store.EvalGroupStore',
                    'Evaluator.model.EvalGroup'],
    
    config: {
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        storeSelector: 'Evaluator.store.EvalGroupStore',
        modelSelector: 'Evaluator.model.EvalGroup',
        
        contextSetterMap: [{fieldName: 'id', contextMap: 'evalGroupId'},
                                       {fieldName: 'userrole', contextMap: 'userRole'},
                                       {fieldName: 'evaluator.id', contextMap: 'evaluatorId'}],
        
        fireOnMasterChange: false,
        fireOnEntityChange: true
        
    },
    
    prepareActivity: function() {
        var me = this;
        
        me.callParent(arguments);
        
        // Steup context
        me.changeContext("username",  Utils.userSecurityManager.getUserName());
        
    }
    
}); 