Ext.define('Evaluator.view.domain.MainNavigationView', {
    extend: 'Baff.app.view.DomainView',    
    alias: 'widget.mainnavigationview',
    
    requires: ['Evaluator.controller.domain.MainNavigationController',
                    'Evaluator.view.domain.MultiPopScorecardView',
                    'Evaluator.view.domain.MainAdminView',
                    'Evaluator.view.domain.MainTemplateView',
                    'Evaluator.view.dashboard.MainDashboard',
                    'Evaluator.view.evalcard.MainCardView',
                    'Evaluator.view.evalcard.EvalTreeView'],                
    
    config: {
        
        controller: 'mainnavigation',
        title: 'Navigation',
        header: false,
    
        items: [{
                title: 'Dashboard',
                xtype: 'maindashboard',
                reference: 'maindashboard'
               }, {
                   title: 'Tree View',
                   xtype: 'evaltreeview',
                   reference: 'evaltreeview'
               },{
                title: 'Evaluation Groups',
                xtype: 'mainadminview',
                reference: 'mainadminview'
               },{
                title: 'Scorecards',
                xtype: 'mainscorecardview',
               reference: 'mainscorecardview'
               },{
                title: 'Templates',
                xtype: 'maintemplateview'
               },{
                   title: 'Card View',
                   xtype: 'maincardview',
                   reference: 'maincardview'
               },{
                title: 'Multi View',
                xtype: 'multipopscorecardview',
               reference: 'multipopscorecardview'
               }
     ]
    }

});

