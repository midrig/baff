Ext.define('Evaluator.controller.activity.ChartController', {
    extend: 'Baff.app.controller.ActivityController',
    
    alias: 'controller.chart',
    
    requires: ['Evaluator.store.ChartStore',
                    'Evaluator.model.Chart',
                    'Ext.chart.PolarChart',
                    'Ext.chart.axis.Numeric',
                    'Ext.chart.axis.Category',
                    'Ext.chart.series.Radar',
                    'Ext.chart.interactions.Rotate'],
                
    toggleScore: 'absolute',
    showAllScores: false,
    
    config: {
        
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
        
        if (me.showAllScores) {
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
                
        var position = 0;
        
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
                        yField: property,
                        style: { opacity: 0.40, lineWidth: 2 },
                        marker: { radius: 4 }
                    };
                    
                    if (type == "Abs") {
                        me.AbsSeries.push(series);
                    } else if (type == "Wgt") {
                        me.WgtSeries.push(series);
                    } else if (type == "Bal") {
                        me.BalSeries.push(series);
                    }
                }
            }         
        }
    },
    
    showChart: function() {
        Utils.logger.info("ChartController::showChart");
        var me = this;
       
        me.activityView.remove(me.chart);
        
        me.chart = Ext.create('Ext.chart.PolarChart', {

            height: 500,
            width: '100%',
            legend: { 
                docked: 'right'
            },            
            insetPadding: 10,
            interactions: ['rotate'],
            
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

        me.activityView.add(me.chart);
    },

    
    onToggleScore: function () {
        Utils.logger.info("ChartController::onToggleScore");
        var me = this;
        
        var refs = me.getReferences();
         
        if (me.toggleScore == 'absolute') {
             me.toggleScore = 'weighted';
             me.currentSeries = me.WgtSeries;
             refs.toggleScoreButton.setText("Weighted Scores");
             refs.toggleScoreButton.setTooltip("Click to view actual scores")
         
        } else if (me.toggleScore == 'weighted') {
             me.toggleScore = 'absolute';
             me.currentSeries = me.AbsSeries;
             refs.toggleScoreButton.setText("Actual Scores");
             refs.toggleScoreButton.setTooltip("Click to view weighted scores")
         }
         
        me.showChart();
    },
    
    
    onToggleScoreScope: function () {
        Utils.logger.info("ChartController::toggleScoreScope");
        var me = this;
        
        var refs = me.getReferences();
        
        if (!me.showAllScores) {   
            refs.toggleSoreScopeButton.setText("All Scores");
            refs.toggleSoreScopeButton.setTooltip("Click to view my scores")
            me.showAllScores = true;
        }else{
            refs.toggleSoreScopeButton.setText("My Scores");
            refs.toggleSoreScopeButton.setTooltip("Click to view all scores");
            me.showAllScores = false;
        }
        
        me.reset();

    }
        
    
}); 