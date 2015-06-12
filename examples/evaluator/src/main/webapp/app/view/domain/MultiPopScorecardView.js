Ext.define('Evaluator.view.domain.MultiPopScorecardView', {
    extend: 'Baff.app.view.DomainView',
    
    alias: 'widget.multipopscorecardview',
    
    requires: ['Evaluator.controller.domain.MultiPopScorecardController',
                    'Evaluator.view.evalgroup.EvalGroupSelectorPopup',
                    'Evaluator.view.domain.MainScorecardView'],
                
    config: {
    
        controller: 'multipopscorecard',
    
        defaults: {
                closable: true
            },
           
        items: [{
                title: 'Scorecard',
                xtype: 'mainscorecardview',
                popupSelector: 'evalgroupselectorpopup'
            },{
            
                title: '<i>New Tab...<i>',
                closable: false,
                reference: 'newtab',
                newType: 'mainscorecardview',
                newTitle: 'Scorecard',
                popupSelector: 'evalgroupselectorpopup'                
            }]
    }      
    
});