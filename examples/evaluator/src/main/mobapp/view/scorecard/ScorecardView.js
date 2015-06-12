Ext.define('Evaluator.view.scorecard.ScorecardView', {
    extend: 'Baff.app.view.ListFormView',
    
    alias: 'widget.scorecardview',
    
    requires: ['Evaluator.view.scorecard.ScorecardForm',
                    'Evaluator.view.scorecard.ScorecardList',
                    'Evaluator.controller.activity.ScorecardController'],
                
    config : {
        
        formPanel: 'scorecardform',
        listPanel: 'scorecardlist'
        
    }

    
});

