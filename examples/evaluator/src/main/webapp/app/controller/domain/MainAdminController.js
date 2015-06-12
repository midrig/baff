Ext.define('Evaluator.controller.domain.MainAdminController', {
    extend: 'Baff.app.controller.DomainController',
    
    alias: 'controller.mainadmin',
    
    config: {
        readRoles: ['evaluator.read', 'evaluator.update'],      
        titleSelector: 'name',
        titleEntity: 'Evaluator.model.EvalGroup',
        
        workflows: [
                {workflow: "Maintain Evaluation Group", resume: true, replay: true, previous: true, steps: [
                    {step: "Maintain Group", view: "evalgroupview", instruction: "Select, create or modify a group"},
                    {step: "Maintain Evaluators", view: "evaluatorview", instruction: "Create or modify evaluators"}],
                    roles: ['evaluator.update']
                }
        ]
        
        
    }
    
    
});
