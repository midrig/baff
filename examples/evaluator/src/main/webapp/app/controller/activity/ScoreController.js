Ext.define('Evaluator.controller.activity.ScoreController', {
    extend: 'Baff.app.controller.ListFormController',
    
    alias: 'controller.score',
    
    requires: ['Evaluator.store.ScoreStore',
                    'Evaluator.model.Score'],
                
    toggleScore: 'absolute',
    
    config: {
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        storeSelector: 'Evaluator.store.ScoreStore',
        modelSelector: 'Evaluator.model.Score',
        
        createEnabled: false,
        deleteEnabled: false,
        
        contextHandlerMap: [{fieldName: 'criteria.id', contextMap: 'criteriaId'}, 
                                          {fieldName: 'option.id', contextMap: 'optionId'},
                                          {fieldName: 'evaluator.id', contextMap: 'evaluatorId'}],

        dependentOnContext: true,
        listenForEntityChange: true,
        fireOnMasterChange: false
           
    },
    
    onEntityChange: function(controller, entity, type) {
        Utils.logger.info("ScoreController::onEntityChange");
        var me = this;
        
        // Ensure a refresh if the context entity has changed
        if ((type == "Evaluator.model.Criteria" || type == "Evaluator.model.Option") && me.context != entity) {
             
            me.context = entity;
            me.dataRefresh = true;

        } else if (type == 'Evaluator.model.Scorecard') {
            
            me.scorecard = entity;
        
        }
        
        
    }, 
   
    changeContext: function(fieldName, value) {
        Utils.logger.info("ScoreController::changeContext");
        var me = this;
        
        var hasChanged = me.callParent(arguments);
        
        if (value != "" && value != null) {
            
            if (fieldName == "criteria.id") {
                me.filterContext.removeAtKey("option.id");
                me.showingCriteria = true;
            } else if (fieldName == "option.id") {
                me.filterContext.removeAtKey("criteria.id");
                me.showingCriteria = false;
            } else if (fieldName == "evaluator.id") {
                me.evaluatorId = value;               
            }
        } 
        
        if (fieldName == "evaluator.id")
           me.evalContext = value;
       
       return hasChanged;
        
    },
    
    isContextSet: function() {
        var me = this;
        
        return (me.scorecard != null && 
                 (me.filterContext.get("criteria.id") != null) || (me.filterContext.get("option.id") != null));
    },
    
     prepareActivity: function() {
        Utils.logger.info("ScoreController:prepareActivity");
        var me = this;
        
         if (me.evalContext == null) 
             me.entityStore.setParam('evaluatorId', -1);
        else
             me.entityStore.setParam('evaluatorId', me.evaluatorId);

    },
    
    prepareView: function (isAfterRefresh, allowModify, record, action) {
        Utils.logger.info("ScoreController::prepareView");
        var me = this, context;
        
        if (isAfterRefresh) {

            var refs = me.getReferences();

            if (me.showingCriteria) {
                refs.criteriaCol.hide();
                refs.optionCol.show();
                context = 'Criteria - ' + record.get('criteria.name');
            } else {
                refs.criteriaCol.show();
                refs.optionCol.hide();
                context = 'Option - ' + record.get('option.name');
            }

            me.listPanel.setTitle('Score List: ' + context);
        }
                
    },
    
    onToggleScore: function (owner, tool) {
        Utils.logger.info("ScoreController::onToggleScore");
        var me = this;
        
        var refs = me.getReferences();
         
        if (me.toggleScore == 'absolute') {
             me.toggleScore = 'weighted';
             refs.absoluteCol.hide();
             refs.relAbsoluteCol.hide();
             refs.weightedCol.show();
             refs.relWeightedCol.show();
         
        } else {
             me.toggleScore = 'absolute';
             refs.relWeightedCol.hide();
             refs.weightedCol.hide();
             refs.relAbsoluteCol.show();
             refs.absoluteCol.show();
             
         }
    },
    
    onAllScores: function (owner, tool) {
        Utils.logger.info("ScoreController::onAllScores");
        var me = this;
        
        me.doIfClean(me.toggleScoreScope, [null]);
    },
    
    onMyScores: function (owner, tool) {
        Utils.logger.info("ScoreController::onMyScores");
        var me = this;
        
        me.doIfClean(me.toggleScoreScope, [me.evaluatorId]);
    },
    
    toggleScoreScope: function (evaluatorId) {
        Utils.logger.info("ScoreController::toggleScoreScope");
        var me = this;
        
        var refs = me.getReferences();
        
        if (evaluatorId == null) {        
            refs.allScoresButton.hide();
            refs.myScoresButton.show();
            me.setReadOnly(true);
        }else{
            refs.allScoresButton.show();
            refs.myScoresButton.hide();
            me.setReadOnly(false);
        }
        
        me.changeContext('evaluator.id', evaluatorId);
        me.setup();

    },
    
    onEvalScoreButton: function (grid, rowIndex) {
        Utils.logger.info("ScoreController::onEvalScoreButton");
        var me = this;
        
        var rec = grid.getStore().getAt(rowIndex);
        me.evalScorePopup = me.showPopup('evalscorepopup', me.evalScorePopup, rec);
       
    },
    
    refreshCache: function(record) {       
        Utils.logger.info("ScoreController::refreshCache");
        var me = this;
        
        me.callParent(arguments);
        
        // Ensure the associated scorecard data also refreshed
        Utils.versionManager.refreshData('Evaluator.model.Scorecard', me.scorecard.getEntityId());
        
    }
    
    
    
    
        
        
    
}); 