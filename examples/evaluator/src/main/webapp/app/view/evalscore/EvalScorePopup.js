Ext.define('Evaluator.view.evalscore.EvalScorePopup', {
    extend: 'Baff.app.view.SelectorPopup',
    
    alias: 'widget.evalscorepopup',
    
    requires: ['Evaluator.view.evalscore.EvalScoreList',
                    'Evaluator.controller.activity.EvalScoreController'],
                
    controller: 'evalscore',
    
    config : {
   
        title: 'View All Evaluator Scores',
        listPanel: 'evalscorelist',
        addButton: '',
        selectButton: '',
        maximized: true
        
    }

    
});

