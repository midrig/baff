Ext.define('Evaluator.store.ScoreStore', {
    extend: 'Baff.app.model.EntityStore',
    model: 'Evaluator.model.Score', 

    sorters: [
           {
            property: 'criteria.name',
            direction: 'ASC'
        },
          {
            property: 'option.name',
            direction: 'ASC'
        },
        {
            property: 'evaluator.username',
            direction: 'ASC'
        }
    ],

    config: {
        isBuffered: false
    },

    proxy: {
        type: 'serviceproxy',
        url: '/evaluator/eval/score/findAll.json'
    }

    
});