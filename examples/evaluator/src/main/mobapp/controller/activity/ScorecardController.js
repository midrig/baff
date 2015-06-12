Ext.define('Evaluator.controller.activity.ScorecardController', {
    extend: 'Baff.app.controller.ListFormController',
    
    alias: 'controller.scorecard',
    
    requires: ['Evaluator.store.ScorecardStore',
                    'Evaluator.model.Scorecard'],
    
    config: {
        
        refs: {       
           viewSelector: 'scorecardview'
        },
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        storeSelector: 'Evaluator.store.ScorecardStore',
        modelSelector: 'Evaluator.model.Scorecard',
        
        contextHandlerMap: [{fieldName: 'evalGroup.id', contextMap: 'evalGroupId'}],
        setupNewRecordFromContext: true,
        fireOnEntityChange: true,
        ackSave: true
        
    },
    
    setupAccessControl: function() {
        Utils.logger.info("ScorecardController:setupAccessControl");
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