Ext.define('Evaluator.controller.evalcard.EvalTreeController', {
    extend: 'Baff.app.controller.TreeController',
    
    requires: ['Evaluator.store.EvalTreeStore'],
    
    alias: 'controller.evaltree',
    
    config: {
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        storeSelector: 'Evaluator.store.EvalTreeStore',
        modelSelector: 'Evaluator.model.EvalTree',
        
        contextSetterMap: [{nodeType: 'EG', entityType: 'GroupForEval', contextMapping:
                                            [{fieldName: 'id', contextMap: 'evalGroupId'},
                                            {fieldName: 'userrole', contextMap: 'userRole'},
                                            {fieldName: 'evaluator.id', contextMap: 'evaluatorId'}]
                                       }]                           
               
    },
    
    onListButton: function(grid, rowIndex) {
        Utils.logger.info("EvalTreeController:onListButton");
        var me = this;
        
        var node = grid.getStore().getAt(rowIndex);
        var entity = me.getEntity(node);
        
        if (entity != null) {
        
            if (entity.getEntityType() == 'Evaluator.model.Scorecard') {
                me.fireViewEvent('selectscorecard', me, entity);
                
            } else if (entity.getEntityType() == 'Evaluator.model.Option') {
                
                // Get the scorecard
                var scEntity = me.getEntity(node.parentNode);
                
                if (scEntity != null && scEntity.getEntityType() == 'Evaluator.model.Scorecard')
                    me.fireViewEvent('selectoption', me, entity, scEntity);
            
            }
        
        }
        
    }
    
}); 