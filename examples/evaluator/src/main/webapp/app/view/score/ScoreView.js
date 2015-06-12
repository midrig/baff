Ext.define('Evaluator.view.score.ScoreView', {
    extend: 'Baff.app.view.ListFormView',
    
    alias: 'widget.scoreview',
    
    requires: ['Evaluator.view.score.ScoreForm',
                    'Evaluator.view.score.ScoreList',
                    'Evaluator.controller.activity.ScoreController',
                    'Evaluator.view.evalscore.EvalScorePopup'],
                
    controller: 'score',
    
    config : {
   
        formPanel: 'scoreform',
        listPanel: 'scorelist'
        
    }
    
});

