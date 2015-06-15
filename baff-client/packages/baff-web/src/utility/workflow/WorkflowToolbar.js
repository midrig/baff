/**
 *  A WorkflowToolbar provides the user interface to support workflow selection, initiation and execution.
 *  It is controlled by a {@link Baff.utility.workflow.WorkflowManager}.
 */
Ext.define('Baff.utility.workflow.WorkflowToolbar', {
    extend: 'Ext.container.Container',
    alias: 'widget.workflowtoolbar',
    controller: 'workflow',
    
    border: false,  
    
    requires: ['Ext.toolbar.Breadcrumb',
                    'Baff.utility.Utilities'],
                
    /**
     * Sets up the toolbar ui components.
     */
    initComponent: function() {
        var me = this;
        
        Ext.apply(me, {
                items: [
               
                {
                    xtype: 'breadcrumb',
                    reference: 'wfSelector'
                },
                { xtype: 'toolbar',
                    cls: 'x-tab x-tab-active x-tab-default',
                    border: false,
                    items: [
                        {
                            xtype: 'container',
                            minWidth: 300,
                            reference: 'wfName',
                            html: ''
                        },
                        '-', 
                        {
                            xtype: 'button',
                            reference: 'wfPrevButton',
                            iconCls: 'wfprev',
                            disabled: true

                        },    
                        {
                            xtype: 'button',
                            reference: 'wfNextButton',
                            iconCls: 'wfnext',
                            disabled: true

                        },
                        '-',
                        {
                            xtype: 'container',
                            reference: 'wfInstruction'
                        }
                    ]}
            ]
        });
        
        me.callParent(arguments);
    }
});


