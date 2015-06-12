Ext.define('Evaluator.view.criteria.CriteriaList', {
    extend: 'Baff.app.view.ListPanel',
    //requires: 'Ext.sparkline.Bullet',
    
    alias: 'widget.criterialist',
    
    config: {

        hideSearchPanel: true,
        
         itemTpl:  new Ext.XTemplate (
                            '<div class="baff-list">',
                            '<div class="evaluator-bar" style="background-image: url(./resources/images/bar.jpg); width:{[this.getBarWidth(values)]}px"></div>',	
                            '<div class="evaluator-score">{[this.getWeightText(values)]}%</div>',
                            '<div class="evaluator-name">{name}</div>',                         
                            '<div class="evaluator-description">{description}&nbsp</div>',
                            '</div>',
                            {
                                    toggleRelative: false,

                                    getWeightText: function (values) {

                                        if (this.toggleRelative)
                                            return values.relativeWeight;
                                        else
                                            return values.weight;

                                    },
                                    
                                    getBarWidth: function(values) {
                                                                    
                                        var scrwidth = window.innerWidth;
                                        var width;
                                        
                                        if (this.toggleRelative)
                                            width = values.relativeWeightPC*(scrwidth-16);
                                        else
                                            width = values.weightPC*(scrwidth-16);
                                        
                                        return Math.round(width);
                                                  
                                    
                                    }
                                })
                                    
    }
});