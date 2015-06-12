Ext.define('Evaluator.view.template.ScorecardTplFormPopup', {
    extend: 'Baff.app.view.FormPopup',
    
    alias: 'widget.scorecardtplformpopup',
    
    requires: ['Evaluator.view.template.ScorecardTplForm',
                    'Evaluator.controller.activity.ScorecardTplFormController'],
    
    controller: 'scorecardtplform',
    
    config : {
    
        title: 'Create Scorecard Template',
        formPanel: 'scorecardtplform'
        
    }
    
});

