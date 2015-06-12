Ext.define('Evaluator.model.Evaluator', {
    extend: 'Baff.app.model.EntityModel',
 
    statics: {    
        // entityIdProperty: 'id',  -- defaults to this
        masterEntityType: 'Evaluator.model.EvalGroup',
        masterEntityIdProperty: 'evalGroup.id'
    }, 
  
    fields: [
        { name: 'id', type: 'int', allowNull: true },
        { name: 'username', type: 'string' },
        { name: 'userrole', type: 'int' },
        { name: 'lastUpdated', type: 'string' },        
        { name: 'evalGroup.id', type: 'int', allowNull: true }

    ],

    validators: [
        { field: 'name', type: 'present' },
        { field: 'name', type: 'length', max: 200 },
        { field: 'userrole', type: 'rdpresent' }
    ],

    proxy: {
        type: 'serviceproxy',
        api:{
            create: 'eval/evaluator/save.json',
            read: 'eval/evaluator/find.json',
            update: 'eval/evaluator/save.json',
            destroy: 'eval/evaluator/remove.json'
        }
    },
    
    doIntegrityValidation: function (action, origRecord) {      
        Utils.logger.info("Evaluator::doFeasibilityValidation");      
        var me = this;
        
        
    }
    
});
