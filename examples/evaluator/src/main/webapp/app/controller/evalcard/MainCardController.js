Ext.define('Evaluator.controller.evalcard.MainCardController', {
    extend:  'Baff.app.controller.CardController',
    
    alias: 'controller.maincard',
    
    init: function(application) {        
        var me = this;
        
        me.callParent(arguments);
        me.selectorView.getReferences().actioncol.hide();    
    
    }
    
});
