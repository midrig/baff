Ext.define('Evaluator.view.evalcard.MainCardView', {
    extend: 'Baff.app.view.CardView',
    
    alias: 'widget.maincardview',
    
    requires: ['Evaluator.controller.evalcard.MainCardController',
                    'Evaluator.view.evalcard.EvalGroupCard',
                    'Evaluator.view.evalcard.ScorecardCard',
                    'Evaluator.view.evalcard.OptionCard'],
                
    config: {
     
        controller: 'maincard',
        
        selectorView: 'evaltreeview',
        emptyCard: true,
        
        cards: [{
                        xtype: 'evalgroupcard',
                        reference: 'evalgroupcard'
                    },
                    {
                        xtype: 'scorecardcard',
                        reference: 'scorecardcard'
                    },
                    {
                        xtype: 'optioncard',
                        reference: 'optioncard'
                    },
                    {
                        xtype: 'scorevcard',
                        reference: 'scorevcard'
                    }]
        
    }
 
});