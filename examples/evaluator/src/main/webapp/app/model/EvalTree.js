Ext.define('Evaluator.model.EvalTree', {
    extend: 'Baff.app.model.TreeModel',
 
    statics: {                
        masterEntityType: 'Evaluator.model.EvalGroup#Evaluator.model.Scorecard#Evaluator.model.Score'
    },
    
    setIconCls: function () {
        
        if (this.get('newEntity') == true)
            return 'evalnewnode';
        
        var nodeType = this.get('nodeType');
        
        if (nodeType == "EG")
            return "evalgroup";
        else if (nodeType == "SC")
            return "scorecard";
        else if (nodeType == "OP")
            return "option";
    } 
});
