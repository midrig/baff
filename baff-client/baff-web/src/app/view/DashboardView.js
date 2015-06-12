/**
 *  A DashboardView provides the view for a set of 'dashlets' provided by child instances of 
 *  {@link  Baff.app.view.ActivityView}. It is controlled by a {@link Baff.app.controller.DashboardController}
 *  and should be setup as a tab in a parent {@link  Baff.app.view.DomainView} configuration.
 *  
 *  Underlying activity views may be configured using a combination of vbox and hbox layouts, e.g. 
 *   
 *    config: {
 *    
 *       controller: 'mydashboard',
 *       
 *       items: [{
 *          // Row 1
 *          flex:1,
 *          layout: {
 *               type: 'hbox',
 *               align: 'stretch',
 *               pack: 'start'
 *           },
 *           items: [{
 *               xtype: 'myfirstdashlet',
 *               dashlet: true,
 *               flex: 1
 *               },{
 *               xtype: 'myseconddashlet',
 *               dashlet: true,
 *               flex: 1
 *               }
 *           ]}, {
 *          // Row 2
 *          flex: 1,
 *          layout: {
 *               type: 'hbox',
 *               align: 'stretch',
 *               pack: 'start'
 *          },
 *          items: [{
 *               xtype: 'mythirddashlet',
 *               dashlet: true,
 *               flex: 1
 *               }]
 *       }]
 *  
 */
Ext.define('Baff.app.view.DashboardView', {
    extend: 'Ext.panel.Panel',
    xtype: 'dashboardview',   

    config: {
        
        /**
        * Specifies the {@link Baff.app.controller.DashboardController} that controls this view
        */
        controller: 'dashboard'

    },
    
     bodyStyle: {
            background: 'transparent'
        },

    // The following styles are required to ensure the background is painted correctly
    border: false,
    cls: 'x-tab x-tab-active x-tab-default',   
    bodyPadding: 5,
    
    layout: {
        type: 'vbox',
        align: 'stretch',
        pack: 'start'
    }
    
    

});