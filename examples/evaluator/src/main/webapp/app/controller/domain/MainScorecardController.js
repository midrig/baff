Ext.define('Evaluator.controller.domain.MainScorecardController', {
    extend: 'Baff.app.controller.DomainController',
    
    alias: 'controller.mainscorecard',
    
    config: {
        readRoles: ['evaluator.read', 'evaluator.update'],      
        titleSelector: 'name',
        titleEntity: 'Evaluator.model.Scorecard',
        cascadeContext: true,
        
        workflows: [
                {workflow: "Maintain Scorecards", resume: true, replay: true, previous: true, steps: [
                    {step: "Maintain Scorecard", view: "scorecardview", instruction: "Create or modify a scorecard"},
                    {step: "Maintain Criteria", view: "criteriaview", instruction: "Create or modify criteria"},
                    {step: "Maintain Options", view: "optionview", instruction: "Create or modify options"}],
                    roles: ['evaluator.update']
                },
                {workflow: "Maintain Scores by Option", resume: true, replay: true, previous: true, steps: [
                    {step: "Select Scorecard", view: "scorecardview", instruction: "Select a scorecard"},
                    {step: "Select Option", view: "optionview", instruction: "Select an option"},
                    {step: "Maintain Scores", view: "scoreview", instruction: "Modify scores"}],
                    roles: ['evaluator.update']
                },
                {workflow: "Maintain Scores by Criteria", resume: true, replay: true, previous: true, steps: [
                    //{step: "Select Scorecard", view: "scorecardview", instruction: "Select a scorecard"},
                    {step: "Select Criteria", view: "criteriaview", instruction: "Select a criteria"},
                    {step: "Maintain Scores", view: "scoreview", instruction: "Modify scores"}],
                    roles: ['evaluator.update']
                },
                {workflow: "View Scorecard Evaluation", resume: true, replay: true, previous: true, steps: [
                    {step: "Select Scorecard", view: "scorecardview", instruction: "Select a scorecard"},
                    {step: "Select Analysis", view: "analysisview", instruction: "Review analysis"}]
                }
            ]
        
    },
    
    isWorkflowVisible: function(workflow) {
        var me = this;
        
        if (workflow.workflow == "Maintain Scorecard") {
            
            var role = me.getCurrentContext("userRole");
        
            // Do not allow updates if not an adminstrator
            if (role != Utils.refDataManager.getCode("ADMIN", "EVALGROUP.USERROLE")) 
                return false;
        }
        
        return true;
        
    },
    
    onSelectScorecard: function(scorecard) {
        Utils.logger.info("MainScorecardController:onSelectScorecard");
        var me = this;
        
        var scorecardView = me.getReferences().scorecardview;
        scorecardView.getController().setup(null, scorecard);            
        me.changeTab(scorecardView);  
    
    },
    
    onSelectOption: function(scorecard, option) {
        Utils.logger.info("MainScorecardController:onSelectOption");
        var me = this;
        
        var refs = me.getReferences();
        
        me.onSelectScorecard(scorecard);
        
        refs.optionview.getController().setup(null, option);
        refs.scoreview.getController().setup(); 
        me.changeTab(refs.scoreview);  
    
    }        
    
});
