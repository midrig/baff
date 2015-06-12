Ext.define('Evaluator.controller.domain.MainNavigationController', {
    extend: 'Baff.app.controller.DomainController',
    
    alias: 'controller.mainnavigation',
    
    config: {
        
        refs: {       
           viewSelector: 'mainnavigation',   
           restartButton: 'mainnavigation #restartButton'
        },
        
        control: {
            restartButton: {
                    tap: function () { Utils.globals.application.fireEvent('systemrestart'); }
                }
        },
        
        titleSelector: 'name',
        titleEntity: 'Evaluator.model.Scorecard'
        
    }
    
});
