Ext.define('Evaluator.view.dashboard.ScorecardDash', {
    extend: 'Baff.app.view.SelectorView',
    
    alias: 'widget.scorecarddash',
    
    requires: ['Evaluator.view.scorecard.ScorecardList',
                    'Evaluator.controller.dashboard.ScorecardDashController'],
    
    controller: 'scorecarddash',
    
    config : {

        listPanel: 'scorecardlist'
        
    }
    
});

