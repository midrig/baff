/**
 *  A LogonWindow captures the user name and password.
 *  
 *  A detault user name and password can be set via Utils.globals.defaultUsername and
 *  Utils.globals.defaultPassword.
 *  
 */
Ext.define('Baff.utility.application.LogonWindow', {
    extend: 'Ext.window.Window',
    
    alias: 'widget.logonwindow',
    
    requires: ['Ext.form.field.Text',
                     'Baff.utility.Utilities'],
    
    closable: false,
    bodyPadding: '10 10 0 10',
    
    // Literals for locale override
    dtLogonTitle: 'Logon',
    dtLogonBtn: 'Logon',
    dtOptions: 'Setup',
    dtRegister: 'Register User',
    dtUpdate: 'Update Password',
    dtReset: 'Reset Password',
    dtUserName: 'User Name',
    dtPassword: 'Password',
    dtVersion: 'Version',
    
    buttonAlign: 'center',
    
    /**
     * Initialise the view
     */
    initComponent: function() {
        var me = this;
        
        var buttonConfig = [];
        
        if (Utils.globals.manageUsers) {
            buttonConfig.push({
                text:me.dtOptions,
                itemId: 'optionBtn',
                menu: [{
                    text: me.dtRegister,
                    itemId: 'register'
                    }, {
                    text: me.dtReset,
                    itemId: 'reset'
                    }, {
                   text: me.dtUpdate,
                   itemId: 'update'
                    }
            ]
            });
            
            
            buttonConfig.push(' ');
        }
        
        buttonConfig.push({
                  text: me.dtLogonBtn,
                  itemId: 'logonBtn'
            });
        
        
       
        Ext.apply(me, {
            
            title: Utils.globals.applicationName + ' ' + me.dtLogonTitle, 
           
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
                        fieldLabel: me.dtUserName,
                        name: 'username',
                        value: Utils.globals.defaultUsername,
                        allowBlank: false,
                         validateOnBlur: true
                  
                    }, {   
                        xtype: 'textfield',
                        name: 'password',
                        fieldLabel: me.dtPassword,
                        inputType: 'password',
                        value: Utils.globals.defaultPassword,
                        allowBlank: false,
                        validateOnBlur: true
                    }
                ]},
                {
                xtype: 'fieldset',
                border: false,
                autoEl: {tag: 'center'}, 
                items: [{
                        xtype:'displayfield',  
                        value: me.dtVersion + ': ' + Utils.globals.version
                     }]
                }],
            
            buttons: buttonConfig
        });
       
        me.callParent(arguments);
    }
});