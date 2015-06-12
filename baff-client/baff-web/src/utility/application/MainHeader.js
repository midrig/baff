/**
 *  A MainHeader presents the {@link Baff.utility.workflow.WorkflowToolbar} and log off button.
 */
Ext.define('Baff.utility.application.MainHeader', {
    extend: 'Ext.panel.Panel',
    
    alias: 'widget.mainheader',
    
    requires: ['Ext.toolbar.Toolbar',
                    'Baff.utility.workflow.WorkflowToolbar'],

        
    layout: {
        align: 'stretch',
        type: 'hbox'
    },
    
    // Display text for locale override
    dtLoggedInAs: 'Logged in as',
    dtLogOffBtn: 'Logoff',
   
    
    /**
     * Initialise the view
     */
    initComponent: function() {
        var me = this;
        
        var username = Utils.userSecurityManager.getUserName();
        var logText = me.dtLoggedInAs + " <b>" + username + "<b>";
        
        Ext.apply(me, {
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',

               cls: 'x-tab x-tab-active x-tab-default',
                
                items: [
                    {
                    xtype: 'workflowtoolbar'
                },
                  '->',
                  {
                      xtype: 'container',
                      layout: {
                          type: 'vbox',
                          align: 'center'
                      },
                      
                      items: [
                        {
                            xtype: 'container',
                            cls: 'x-tab x-tab-active x-tab-default',
                            html: logText,
                            padding: 10
                        }, 
                        {
                            xtype: 'toolbar',
                            cls: 'x-tab x-tab-active x-tab-default',
                            border: false,
                            items: [
                                {
                                    xtype: 'button',
                                    itemId: 'logoffBtn',
                                    iconCls: 'logoff',
                                    text: me.dtLogOffBtn

                                }]
                        }]
                    }]
              }]
        });
        
        me.callParent(arguments);
    }
});