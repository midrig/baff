Ext.define('Evaluator.view.domain.MainScorecardView', {
    extend: 'Baff.app.view.DomainView',
    
    alias: 'widget.mainscorecardview',
    
    requires: ['Evaluator.controller.domain.MainScorecardController',
                    'Evaluator.view.scorecard.ScorecardView',
                    'Evaluator.view.option.OptionView',
                    'Evaluator.view.criteria.CriteriaView',
                    'Evaluator.view.score.ScoreView',
                    'Evaluator.view.analysis.AnalysisView',
                    'Evaluator.view.chart.ChartView',
                    'Evaluator.view.domain.ScorecardSummaryDash'
                ],
                
    config: {
    
        controller: 'mainscorecard',
        
        dashletSelector: 'scorecardsummarydash',
        
        items: [{
                title: 'Scorecard List',
                xtype: 'scorecardview',
                reference: 'scorecardview'
            },
            {
                title: 'Criteria',
                xtype: 'criteriaview'
            },
            {
                title: 'Options',
                xtype: 'optionview',
                reference: 'optionview'
            },
            {
                title: 'Scores',
                xtype: 'scoreview',
                reference: 'scoreview'
            },
            {
                title: 'Analysis',
                xtype: 'analysisview'
            }
        ]
    }
 
});