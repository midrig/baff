Ext.define('Evaluator.view.score.ScoreList', {
    extend: 'Baff.app.view.ListPanel',
    
    alias: 'widget.scorelist',
    config: {
      
        hideSearchPanel: true,
        
         itemTpl:  new Ext.XTemplate (
                            '<div class="baff-list">',
                            '<div class="evaluator-bar" style="background-image: url(./resources/images/bar.jpg); width:{[this.getBarWidth(values)]}px"></div>',	
                            '<div class="evaluator-score">{[this.getScoreText(values)]}%</div>',
                            '<div class="evaluator-name">{[this.getPrimaryText(values)]}</div>',                         
                            '<div class="evaluator-secondary">{[this.getSecondaryText(values)]}</div>',
                            '</div>',
                            {
                                    toggleRelative: false,
                                    toggleScore: 'Act',
                                    showCriteria: true,

                                    getScoreText: function (values) {

                                        if (this.toggleScore == 'Act')
                                            return this.toggleRelative ? values.relativeScore: values.score;
                                        else if (this.toggleScore == 'Wgt')
                                            return this.toggleRelative ? values.relativeWeightedScore : values.weightedScore;
                                        else
                                            return this.toggleRelative ? values.relativeBalancedScore : values.balancedScore;
                                        
                                    },
                                    
                                    getBarWidth: function(values) {
                                                                    
                                        var scrwidth = window.innerWidth;
                                        var width;
                                        
                                        if (this.toggleScore == 'Act')
                                            width =  this.toggleRelative ? values.relativeScorePC : values.scorePC;
                                        else if (this.toggleScore == 'Wgt')
                                            width = this.toggleRelative ?  values.relativeWeightedScorePC : values.weightedScorePC;
                                        else
                                            width = this.toggleRelative ? values.relativeBalancedScorePC : values.balancedScorePC;
                                        
                                        return Math.round(width*(scrwidth-16));
                                       
                                    },
                                    
                                    getPrimaryText: function (values) {
                                        
                                        if (this.showCriteria)
                                            return values["option.name"];
                                        else
                                            return values["criteria.name"];
                                       
                                    },
                                    
                                    getSecondaryText: function (values) {
                                        
                                        if (this.showCriteria)
                                            return "(criteria: " + values["criteria.name"] + ")";
                                        else
                                            return "(option: " + values["option.name"] + ")";
                                       
                                    }
                            })
                                    
    }
});