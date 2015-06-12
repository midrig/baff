Ext.define('Evaluator.controller.activity.ScorecardController', {
    extend: 'Baff.app.controller.ListFormController',
    
    alias: 'controller.scorecard',
    
    requires: ['Evaluator.store.ScorecardStore',
                    'Evaluator.model.Scorecard'],
    
    config: {
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        storeSelector: 'Evaluator.store.ScorecardStore',
        modelSelector: 'Evaluator.model.Scorecard',
        
        contextHandlerMap: [{fieldName: 'evalGroup.id', contextMap: 'evalGroupId'}],
        dependentOnContext: true,
        setupNewRecordFromContext: true,
        fireOnEntityChange: true
        
    },
    
    setupAccessControl: function() {
        Utils.logger.info("ScorecardController:setupAccessControl");
        var me = this;
        
        // Call superclass
        me.callParent(arguments);
        
        // Get user role context and set read only if not administrator
        var role = me.getExternalContext("userRole");
        
        // Do not allow updates if not an adminstrator
        if (role != Utils.refDataManager.getCode("ADMIN", "EVALGROUP.USERROLE"))
            me.makeReadOnly();
         
    },
    
    prepareActivity: function() {
       Utils.logger.info("ScorecardController::prepareActivity");
        var me = this;
      
        me.getReferences().actionCol.hide();
      
    },
    
    // Need to reset template selection on change 
    prepareView: function() {
        Utils.logger.info("ScorecardController:prepareView");
        var me = this;
        
        me.templateScorecard = null;
        
        // Hide the text
       var refs = me.getReferences();
       refs.templateText.setHtml('');
        
    },
    
    prepareRecord: function (operationType, record) {
        Utils.logger.info("ScorecardController::prepareRecord");
        var me = this;
        
        me.callParent(arguments);
        
        if (me.templateScorecard != null)
            record.setParam("scorecardTplId", me.templateScorecard.get('id'));
        else
            record.setParam("scorecardTplId", null);
     
     },
    
    onTemplateButton: function() {
        Utils.logger.info("ScorecardController:onTemplateButton");
        var me = this;
        
        me.doIfClean(me.showScorecardTplPopup);
        me
    },
    
    showScorecardTplPopup: function() {
        Utils.logger.info("ScorecardController:showScorecardTplPopup");
        var me = this;
        
        // Check if adding or not
        if (me.currentRecord == null) {
            
            // Adding - show template selector
            me.templateSelectorPopup = me.showPopup('scorecardtplselectorpopup', me.templateSelectorPopup);
            me.templateSelectorPopup.on('close', me.onCloseTemplateSelector, me);
            
        } else {
            
            // Modifying - display the create activity popup
            me.createTemplatePopup = me.showPopup('scorecardtplformpopup', me.createTemplatePopup, me.currentRecord);
            
        }
        
    },
    
    onCloseTemplateSelector: function() {
        Utils.logger.info("ScorecardController:onCloseTemplateSelector");
        var me = this;
        
        // Get the selected record from the template selector
        me.templateScorecard = me.templateSelectorPopup.getController().getCurrentRecord();
        
        // Show the text
        var refs = me.getReferences();
        
        if (me.templateScorecard != null) {
            refs.templateText.setHtml('NOTE: Using "' + me.templateScorecard.get('name') +'" template.');
            refs.name.setValue(me.templateScorecard.get('name'));
            refs.description.setValue(me.templateScorecard.get('description'));
        } else {
            refs.templateText.setHtml('');
        }
    }
    
    

}); 