Ext.define('Evaluator.store.EvalTreeStore', {
    extend: 'Baff.app.model.TreeStore',
    
    model: 'Evaluator.model.EvalTree',
    
    proxy: {
        type: 'serviceproxy',
        url: '/evaluator/eval/evaltree/findNode.json'
    }
    
    
});