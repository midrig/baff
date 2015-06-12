Ext.define('Evaluator.view.template.ScorecardTplView', {
    extend: 'Baff.app.view.ListFormView',
    
    alias: 'widget.scorecardtplview',
    
    requires: ['Evaluator.view.template.ScorecardTplList',
                    'Evaluator.controller.activity.ScorecardTplController'],
    
    controller: 'scorecardtpl',
    
    config : {
    
        listPanel: 'scorecardtpllist',
        refreshButton: ''
        
    }
    
});

