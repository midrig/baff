Ext.define('Evaluator.view.evalcard.ScorecardCard', {
    extend: 'Baff.app.view.FormView',
    
    alias: 'widget.scorecardcard',
    
    requires: ['Evaluator.view.scorecard.ScorecardForm',
                    'Evaluator.controller.evalcard.ScorecardCardController'],
    
    controller: 'scorecardcard',
    
    config : {
    
        formPanel: 'scorecardform'
        
    }
    
});

