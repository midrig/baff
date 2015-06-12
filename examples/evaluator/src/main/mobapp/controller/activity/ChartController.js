Ext.define('Evaluator.controller.activity.ChartController', {
    extend: 'Baff.app.controller.ActivityController',
    
    alias: 'controller.chart',
    
    requires: ['Evaluator.store.ChartStore',
                    'Evaluator.model.Chart',
                    'Ext.chart.PolarChart',
                    'Ext.chart.axis.Numeric',
                    'Ext.chart.axis.Category',
                    'Ext.chart.interactions.Rotate',
                    'Ext.chart.series.Radar' ],

    toggleScore: 'Abs',
    toggleAllScores: false,
    
    colors: [
			'rgba(153,255,102,',
			'rgba(102,230,255,',
			'rgba(255,102,153,',
			'rgba(255,204,102,',
			'rgba(184,41,255,',
			'rgba(102,255,127,',
			'rgba(102,153,255,',
			'rgba(255,127,102,',
			'rgba(112,255,41,',
			'rgba(127,102,255,',
			'rgba(255,102,230,',
			'rgba(156,0,235,',
			'rgba(78,235,0,',
			'rgba(204,102,255,' ],
                    
                    
        
   config: {
        
        refs: {       
           viewSelector: 'chartview',  
           toggleScoreButton: 'chartview #toggleScoreButton',
           toggleScopeButton: 'chartview #toggleScopeButton'
           
        },
        
        control: {
            toggleScoreButton: {tap: 'onToggleScore'},
            toggleScopeButton: {tap: 'onToggleScoreScope'}
        },
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        storeSelector: 'Evaluator.store.ChartStore',
        modelSelector: 'Evaluator.model.Chart',
        
        readOnly: true,
        
        contextListener: true
        
    },
    
    prepareActivity: function () {
        Utils.logger.info("ChartController::prepareActivity");
        var me = this, context;
        
        if (me.toggleAllScores) {
            me.evaluatorId = -1;
        }else {
            me.evaluatorId = me.getExternalContext("evaluatorId");
        }  
        
        // Set to be sure in any case
        me.entityStore.setParam('evaluatorId', me.evaluatorId); 
        me.entityStore.setParam('scorecardId', me.masterEntityId); 
        
    },
    
    prepareView: function (isAfterRefresh, allowModify, record) {
        Utils.logger.info("ChartController::prepareView");
        var me = this, context;
        
        if (isAfterRefresh) {
            me.setupSeries();
            me.showChart();
        }
        
    },
    
    setupSeries: function () {
        Utils.logger.info("ChartController::setupSeries");
        var me = this;
        
        me.AbsSeries = [];
        me.WgtSeries = [];
        me.BalSeries = [];
        
        if (me.currentSeries == null)
            me.currentSeries = me.AbsSeries;
                
          // Loop through the data fields and create the series
        var dataObject = me.entityStore.getAt(0).getData();
        
        for (var property in dataObject) {
            if (dataObject.hasOwnProperty(property)) {
                if (property.length > 4) {
                    
                    var type = property.substr(property.length-3, property.length-1);
                    var option = property.substr(0, property.length-4);
                    
                    var series = {
                        type: 'radar',
                        title: option,
                        xField: 'criteria',
                        yField: property
                      
                    };
                    
                    var pos;
                    
                    if (type == "Abs") {
                        me.AbsSeries.push(series);
                        pos = me.AbsSeries.length -1;
                    } else if (type == "Wgt") {
                        me.WgtSeries.push(series);
                        pos = me.AbsSeries.length -1;
                    } else if (type == "Bal") {
                        pos = me.AbsSeries.length -1;
                    }
                    
                    series.style = { fillStyle: me.colors[pos] + '0.4)',
                                      strokeStyle: me.colors[pos] + '1.0)',
                                      lineWidth: 2
                                      };
                                      
                                       
                    series.marker = {  fillStyle: me.colors[pos] + '1.0)',
                                          type : 'circle',
                                          radius: 4, 
                                          lineWidth: 2 }
                    
                }
            }         
        }
    },
    
    showChart: function() {
        Utils.logger.info("ChartController::showChart");
        var me = this;
        
        if (me.chart)
            me.activityView.remove(me.chart); 
        
        me.chart = Ext.create('Ext.chart.PolarChart', {

            animate: true,
            shadow: true,
            insetPadding: 10,
            interactions: 'rotate',
            legend: { 
                position: 'top'
            },           
            
            store: me.entityStore,
            series: me.currentSeries,
            
            axes: [{
                    type: 'numeric',
                    position: 'radial',
                    grid: true,
                    majorTickSteps: 4,
                    minimum: 0,
                    maximum: 100,
                    renderer: function (v) {return v+'%';}
                }, {
                    type: 'category',
                    position: 'angular',
                    grid: true,
                    label: {
                        fontWeight: 'bold'
                    }
                }]
            });	
            
        var legendStore = me.chart.getLegendStore();
        legendStore.each(function(legend, index) {
                legend.data.mark = this.colors[index] + '1.0)';
            }, me);
        
        me.chart.getLegend().refresh();      

        me.activityView.add(me.chart);
    },

    
    onToggleScore: function () {
        Utils.logger.info("ChartController::onToggleScore");
        var me = this;
         
        if (me.toggleScore == 'Abs') {
             me.toggleScore = 'Wgt';
             me.currentSeries = me.WgtSeries;
             
        } else if (me.toggleScore == 'Wgt') {
             me.toggleScore = 'Abs';
             me.currentSeries = me.AbsSeries;
            
         }
         
        me.getToggleScoreButton().setText(me.toggleScore);
        me.activityView.remove(me.chart); 
        me.showChart();
    },
    
    
    onToggleScoreScope: function () {
        Utils.logger.info("ChartController::toggleScoreScope");
        var me = this;
        
        me.toggleAllScores = !me.toggleAllScores;
        
        me.getToggleScopeButton().setText(me.toggleAllScores ? 'All' : 'Mine');
        me.getToggleScopeButton().setIconCls(me.toggleAllScores ? 'usergroup' : 'user');
        
        me.reset();

    }
        
    
}); 