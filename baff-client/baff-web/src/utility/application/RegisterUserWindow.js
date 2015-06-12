/**
 *  A LogonWindow captures the user name and password.
 *  
 *  A detault user name and password can be set via Utils.globals.defaultUsername and
 *  Utils.globals.defaultPassword.
 *  
 */
Ext.define('Baff.utility.application.RegisterUserWindow', {
    extend: 'Ext.window.Window',
    
    alias: 'widget.registeruserwindow',
    
    requires: ['Ext.form.field.Text',
                     'Baff.utility.Utilities'],
    
    closable: false,
    bodyPadding: '10 10 0 10',
    
    // Literals for locale override
    dtRegisterTitle: 'Register User',
    dtRegisterBtn: 'Register',
    dtEmail: 'Email',
    dtDisplayName: 'Display Name',
    dtCancelBtn: 'Cancel',
    
    buttonAlign: 'center',
    
    /**
     * Initialise the view
     */
    initComponent: function() {
        var me = this;
        
        Ext.apply(me, {
            
            title: Utils.globals.applicationName + ' ' + me.dtRegisterTitle, 
           
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
                        fieldLabel: me.dtEmail,
                        name: 'email',
                        vtype: 'email',
                        allowBlank: false,
                        validateOnBlur: true
                  
                    },{
                        xtype: 'textfield',
                        name: 'displayName',
                        fieldLabel: me.dtDisplayName,
                        vtype: 'alpha',
                        allowBlank: false,
                        validateOnBlur: true
                    }
                ]}],
            
            buttons: [{
                text: me.dtCancelBtn,
                itemId: 'cancelBtn'
            },' ',{
                text: me.dtRegisterBtn,
                itemId: 'registerBtn'
            }]
        });
       
        me.callParent(arguments);
    }
});