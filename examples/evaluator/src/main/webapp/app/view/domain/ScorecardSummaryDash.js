Ext.define('Evaluator.view.domain.ScorecardSummaryDash', {
    extend: 'Baff.app.view.FormView',
    
    alias: 'widget.scorecardsummarydash',
    
    requires: ['Evaluator.view.scorecard.ScorecardForm',
                    'Evaluator.controller.domain.ScorecardSummaryDashController'],
    
    controller: 'scorecardsummarydash',
    
    config : {

        formPanel: 'scorecardform'
        
    }
    
});

