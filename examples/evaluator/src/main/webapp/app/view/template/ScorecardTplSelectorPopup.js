Ext.define('Evaluator.view.template.ScorecardTplSelectorPopup', {
    extend: 'Baff.app.view.SelectorPopup',
    
    alias: 'widget.scorecardtplselectorpopup',
    
    requires: ['Evaluator.view.template.ScorecardTplList',
                    'Evaluator.controller.activity.ScorecardTplSelectorController',
                    'Evaluator.view.template.CriteriaTplPopup'],
    
    controller: 'scorecardtplselector',
    
    config : {
    
        title: 'Select Scorecard Template',
        listPanel: 'scorecardtpllist',
        refreshButton: ''
        
    }
    
});

