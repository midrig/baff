Ext.define('Evaluator.controller.domain.MultiPopScorecardController', {
    extend: 'Baff.app.controller.DomainController',
    
    alias: 'controller.multipopscorecard',
    
    config: {
        
        accessRoles: ['evaluator.read', 'evaluator.update'],
        
        workflows: [
                {workflow: "Do Scorecard", visible: false, steps: [
                    {step: "Maintain Scorecards", view: "mainscorecardview", newView: true}]
                }]
      
    }
    
});
