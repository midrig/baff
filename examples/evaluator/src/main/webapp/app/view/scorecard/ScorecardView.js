Ext.define('Evaluator.view.scorecard.ScorecardView', {
    extend: 'Baff.app.view.ListFormView',
    
    alias: 'widget.scorecardview',
    
    requires: ['Evaluator.view.scorecard.ScorecardForm',
                    'Evaluator.view.scorecard.ScorecardList',
                    'Evaluator.controller.activity.ScorecardController',
                    'Evaluator.view.template.ScorecardTplSelectorPopup',
                    'Evaluator.view.template.ScorecardTplFormPopup'
            ],
    
    controller: 'scorecard',
    
    config : {
    
        formPanel: 'scorecardform',
        listPanel: 'scorecardlist'
        
    },
  
    setupDockedItems: function() {
        var me = this;
               
        var dockedItems = me.callParent(arguments);
        
        var templateBtn = {  
                        xtype: 'button',
                        reference: 'templateButton',
                        text: "Template",
                        handler: 'onTemplateButton',
                        tooltip: 'Click to create (from) template',
                        iconCls: 'template'
                        };
          
        dockedItems.push(templateBtn ,' ');
        
        return dockedItems;
    }
    


    
});

