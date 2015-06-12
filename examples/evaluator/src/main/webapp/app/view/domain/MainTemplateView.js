Ext.define('Evaluator.view.domain.MainTemplateView', {
    extend: 'Baff.app.view.DomainView',
    
    alias: 'widget.maintemplateview',
    
    requires: ['Evaluator.controller.domain.MainTemplateController',
                    'Evaluator.view.template.ScorecardTplView',
                    'Evaluator.view.template.CriteriaTplView'],
                
    config: {
    
        controller: 'maintemplate',
        
        items: [{
                title: 'Scorecard Templates',
                xtype: 'scorecardtplview'
            },
            {
                title: 'Criteria (Template)',
                xtype: 'criteriatplview'
            }
        ]
    }
 
});