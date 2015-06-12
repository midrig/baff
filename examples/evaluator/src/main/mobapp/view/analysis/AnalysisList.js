Ext.define('Evaluator.view.analysis.AnalysisList', {
    extend: 'Baff.app.view.ListPanel',
    
    alias: 'widget.analysislist',
    
    config: {   
        
         itemTpl:  new Ext.XTemplate (
                            '<div class="baff-list">',
                            '<div class="evaluator-bar" style="background-image: url(./resources/images/bar.jpg); width:{[this.getBarWidth(values)]}px"></div>',	
                            '<div class="evaluator-score">{[this.getScoreText(values)]}</div>',
                            '<div class="evaluator-name">{category}</div>',
                            '<div class="evaluator-description">{winner}</div>',
                            '<div class="evaluator-secondary">{[this.getInfoPenum(values)]}</div>',
                            '</div>',
                            {
                                    getBarWidth: function (values) {

                                            if (values.margin > 0) {
                                                    var scrwidth = window.innerWidth;
                                                    var width = (values.score/100)*(scrwidth-16);
                                                    return width;
                                            } else {
                                                    return 0
                                            }
                                    },

                                    getScoreText: function (values) {

                                            if (values.margin > 0) {
                                                    return values.score + '%';
                                            } else {
                                                    return '';
                                            }
                                    },

                                    getInfoWin: function (values) {

                                            if (!values.isNoOutrightWinner) {
                                                    return values.winner;
                                            } else {
                                                    return 'No Outright Winner'; 
                                            }
                                    },

                                    getInfoPenum: function (values) {

                                            if (values.margin > 0) {
                                                    var html = '+' + values.margin + '% vs. ' + values.runnerup
                                                    return html;
                                            } else {
                                                    return ''; 
                                            }
                                    }		

         })
     }
  
});