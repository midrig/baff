Ext.define('Evaluator.view.evalcard.ScoreVCard', {
    extend: 'Baff.app.view.FormView',
    
    alias: 'widget.scorevcard',
    
    requires: ['Evaluator.view.score.ScoreForm',
                    'Evaluator.controller.evalcard.ScoreVCardController'],
                
    controller: 'scorevcard',
    
    config : {
        
        formPanel: 'scoreform'
        
    }

    
});

