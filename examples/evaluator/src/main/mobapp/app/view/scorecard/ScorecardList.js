Ext.define('Evaluator.view.scorecard.ScorecardList', {
    extend: 'Baff.app.view.ListPanel',
    
    requires: ['Evaluator.view.scorecard.ScorecardSearch'],
    
    alias: 'widget.scorecardlist',
    
    config: {
        
        filterPanel: 'scorecardsearch',
        hideSearchPanel: true,
        
        itemTpl:  new Ext.XTemplate (
                            '<div class="baff-list">',
                            '<div class="baff-list-main">{name}</div>',                         
                            '<div class="baff-list-detail">{description}&nbsp</div>',
                            '</div>'
                            )
    }
    
});