/**
 *  A LogonWindow captures the user name and password.
 *  
 *  A detault user name and password can be set via Utils.globals.defaultUsername and
 *  Utils.globals.defaultPassword.
 *  
 */
Ext.define('Baff.utility.application.UpdateUserWindow', {
    extend: 'Ext.window.Window',
    
    alias: 'widget.updateuserwindow',
    
    requires: ['Ext.form.field.Text',
                     'Baff.utility.Utilities'],
    
    closable: false,
    bodyPadding: '10 10 0 10',
    
    // Literals for locale override
    dtUpdateTitle: 'Update User',
    dtUpdateBtn: 'Update',
    tPassword: 'Current Password',
    dtPassword: 'New Password',
    dtConfirmPassword: 'Confirm Password',
    dtDisplayName: 'Display Name',
    dtCancelBtn: 'Cancel',
    
    buttonAlign: 'center',
    
    
    
    /**
     * Initialise the view
     */
    initComponent: function() {
        var me = this;
        
        Ext.apply(me, {
            
            title: Utils.globals.applicationName + ' ' + me.dtUpdateTitle,
           
             items: [{
                xtype: 'fieldset',
                border: false,
                fieldDefaults: {
                    anchor: '100%',
                    labelAlign: 'right'
                },
                layout: 'anchor', 
                items: [
                      {
                        xtype: 'textfield',
                        name: 'password',
                        fieldLabel: me.dtPassword,
                        inputType: 'password',
                        allowBlank: false,
                        validateOnBlur: true,
                        labelWidth: 125
                    }, {
                        xtype: 'textfield',
                        name: 'confirmPassword',
                        fieldLabel: me.dtConfirmPassword,
                        inputType: 'password',
                        allowBlank: false,
                        validateOnBlur: true,
                        labelWidth: 125
                    }
                    
                ]}],
            
            buttons: [{
                text: me.dtCancelBtn,
                itemId: 'cancelBtn'
            },' ',{
                text: me.dtUpdateBtn,
                itemId: 'updateBtn'
            }]
        });
       
        me.callParent(arguments);
    }
});