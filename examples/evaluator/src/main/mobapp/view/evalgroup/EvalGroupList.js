Ext.define('Evaluator.view.evalgroup.EvalGroupList', {
    extend: 'Baff.app.view.ListPanel',
    
    requires: ['Evaluator.view.evalgroup.EvalGroupSearch'],
    
    alias: 'widget.evalgrouplist',
    
    config: {
        
        filterPanel: 'evalgroupsearch',
        hideSearchPanel: true,
        
        itemTpl:  new Ext.XTemplate (
                            '<div class="baff-list">',
                            '<div class="baff-list-main">{name}</div>',                         
                            '<div class="baff-list-detail>{description}</div>',
                            '</div>'
                            )
    }
  
});