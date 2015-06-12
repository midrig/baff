Ext.define('Evaluator.controller.domain.MainTemplateController', {
    extend: 'Baff.app.controller.DomainController',
    
    alias: 'controller.maintemplate',
    
    config: {
        readRoles: ['evaluator.read', 'evaluator.update'],      
        titleSelector: 'name',
        titleEntity: 'Evaluator.model.ScorecardTpl',
        
        workflows: [
                {workflow: "View Template", resume: true, replay: true, previous: true, steps: [
                    {step: "View Scorecard Template", view: "scorecardtplview", instruction: "View scorecard templates"},
                    {step: "View Criteria (Template)", view: "criteriatplview", instruction: "View criteria for template"}],
                    roles: ['evaluator.update']
                }
        ]
        
        
    }
    
    
});
