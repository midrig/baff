Ext.define('Evaluator.store.ScoreStore', {
    extend: 'Baff.app.model.EntityStore',
    
    config: {
    
        model: 'Evaluator.model.Score', 

        sorters: [{
                property: 'criteria.name',
                direction: 'ASC'
            },{
                property: 'option.name',
                direction: 'ASC'
            }
        ],
        
        buffered: false,

        proxy: {
            type: 'serviceproxy',
            url: '/evaluator/eval/score/findAll.json'
        }
    }

    
});