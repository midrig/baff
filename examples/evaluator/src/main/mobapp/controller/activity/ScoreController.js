Ext.define('Evaluator.controller.activity.ScoreController', {
    extend: 'Baff.app.controller.ListFormController',
    
    alias: 'controller.score',
    
    requires: ['Evaluator.store.ScoreStore',
                    'Evaluator.model.Score'],
                
    toggleRelative: false,
    toggleScore: 'Act',
    toggleAllScores: false,
    
   config: {
        
        refs: {       
           viewSelector: 'scoreview',  
           toggleRelativeButton: 'scoreview #toggleRelativeButton',
           toggleScoreButton: 'scoreview #toggleScoreButton',
           toggleScopeButton: 'scoreview #toggleScopeButton'
           
        },
        
        control: {
            toggleRelativeButton: {tap: 'onToggleRelativeButton'},
            toggleScoreButton: {tap: 'onToggleScoreButton'},
            toggleScopeButton: {tap: 'onToggleScopeButton'}
        },
        
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
                me.filterContext.removeByKey("option.id");
                me.showingCriteria = true;
            } else if (fieldName == "option.id") {
                me.filterContext.removeByKey("criteria.id");
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
        Utils.logger.info("ScoreController:prepareStore");
        var me = this;
        
        if (me.toggleAllScores) {
            me.entityStore.setParam('evaluatorId', -1);
        }else {
           me.entityStore.setParam('evaluatorId', me.evaluatorId);
       }
       
    },
    
    prepareView: function (isAfterRefresh, allowModify, record) {
        Utils.logger.info("ScoreController::onStoreFirstLoaded");
        var me = this, context;
        
        if (isAfterRefresh) {
            
            if (me.showingCriteria != me.listPanel.getItemTpl().showCriteria) {
                me.listPanel.getItemTpl().showCriteria = me.showingCriteria;
                me.listPanel.refresh();
            }
   
        }
        
    },
    
    onToggleRelativeButton: function() {
        Utils.logger.info("ScoreController:onToggleRelativeButton");
        var me = this;
        
        me.toggleRelative = !me.toggleRelative;
        
        me.getToggleRelativeButton().setText(me.toggleRelative ? 'Rel' : 'Abs');
        me.listPanel.getItemTpl().toggleRelative = me.toggleRelative;
        me.listPanel.refresh();
        
    },
    
    onToggleScoreButton: function () {
        Utils.logger.info("ScoreController::onToggleScoreButton");
        var me = this;
        
        me.toggleScore = (me.toggleScore == 'Act' ? 'Wgt' : 'Act');
        
        me.getToggleScoreButton().setText(me.toggleScore);
        me.listPanel.getItemTpl().toggleScore = me.toggleScore;
        me.listPanel.refresh();
        
        
    },
    
    onToggleScopeButton: function () {
        Utils.logger.info("ScoreController::onToggleScopeButton");
        var me = this;
        
        me.doIfClean(me.toggleScoreScope);
        
    },
    
    toggleScoreScope: function() {
        Utils.logger.info("ScoreController::toggleScoreScope");
        var me = this;
    
        me.toggleAllScores = !me.toggleAllScores;
        
        me.getToggleScopeButton().setText(me.toggleAllScores ? 'All' : 'Mine');
        me.getToggleScopeButton().setIconCls(me.toggleAllScores ? 'usergroup' : 'user');
        
        if (me.toggleAllScores)
            me.changeContext('evaluator.id', null);
        else
            me.changeContext('evaluator.id', me.evaluatorId);
    
        me.setReadOnly(me.toggleAllScores);
       
        me.setup();
    },
    
    /**
    * Toggles the view between the listbox and the form.   
    */    
    toggleListFormPanels: function(showForm) {
        Utils.logger.info("ScoreController[" + this.identifier + "]::toggleListFormPanels");
        var me = this;
        
        me.callParent(arguments);
        
        me.showWidget(me.getToggleRelativeButton(), !showForm); 
        me.showWidget(me.getToggleScoreButton(), !showForm); 
        me.showWidget(me.getToggleScopeButton(), !showForm); 
    },
    
    refreshCache: function(record) {       
        Utils.logger.info("ScoreController::refreshCache");
        var me = this;
        
        me.callParent(arguments);
        
        // Ensure the associated scorecard data also refreshed
        Utils.versionManager.refreshData('Evaluator.model.Scorecard', me.scorecard.getEntityId());
        
    },
        
        
    
}); 