Ext.define('Evaluator.controller.activity.EvalGroupSelectorController', {
    extend: 'Baff.app.controller.SelectorController',
    
    alias: 'controller.evalgroupselector',
    
    requires: ['Evaluator.store.EvalGroupStore',
                    'Evaluator.model.EvalGroup'],
    
    config: {
        
        refs: {       
           viewSelector: 'evalgroupselectorview' 
        },
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        storeSelector: 'Evaluator.store.EvalGroupStore',
        modelSelector: 'Evaluator.model.EvalGroup',
        
        contextSetterMap: [{fieldName: 'id', contextMap: 'evalGroupId'},
                                       {fieldName: 'userrole', contextMap: 'userRole'},
                                       {fieldName: 'evaluator.id', contextMap: 'evaluatorId'}],
                                   
        fireOnMasterChange: false
        
    },
    
    afterInit: function() {
        var me = this;
        
        me.callParent(arguments);
        
        // Steup context
        me.changeContext("username",  Utils.userSecurityManager.getUserName());
        
    }
    
}); 