Ext.define('Evaluator.model.EvalGroup', {
    extend: 'Baff.app.model.EntityModel',
 
    statics: {                
        masterEntityType: 'Evaluator.model.EvalGroup',
        primaryStoreType: 'Evaluator.store.EvalGroupStore'
    }, 
    
    config: {

        fields: [
            { name: 'id', type: 'int', allowNull: true },
            { name: 'name', type: 'string' },
            { name: 'description', type: 'string' },
            { name: 'lastUpdated', type: 'string' },

            // These are used for group selection only
            { name: 'userrole', type: 'int' },
            { name: 'username', type: 'string' },
            { name: 'evaluator.id', type: 'int' }

        ],

        validators: [
            { field: 'name', type: 'present' },
            { field: 'name', type: 'length', max: 200 },
            { field: 'description', type: 'length', max: 65535 }
        ],

        proxy: {
            type: 'serviceproxy',
            api:{
                create: '/evaluator/eval/evalGroup/save.json',
                read: '/evaluator/eval/evalGroup/find.json',
                update: '/evaluator/eval/evalGroup/save.json',
                destroy: '/evaluator/eval/evalGroup/remove.json'
            }
        }   
    },
    
    doIntegrityValidation: function (action, origRecord) {      
        Utils.logger.info("EvalGroup::doFeasibilityValidation");      
        var me = this;
        
        
    }
    
});
