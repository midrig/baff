/**
 *  A LogonWindow captures the user name and password.
 *  
 *  A detault user name and password can be set via Utils.globals.defaultUsername and
 *  Utils.globals.defaultPassword.
 *  
 */
Ext.define('Baff.utility.application.LogonWindow', {
    extend: 'Ext.Panel',
    
    alias: 'widget.logonwindow',
    
    requires: ['Baff.utility.Utilities'],
    
    closable: false,
    bodyPadding: '10 10 0 10',
    
    // Literals for locale override
    dtLogonTitle: 'Logon',
    dtLogonBtn: 'Logon',
    dtUserName: 'User Name',
    dtPassword: 'Password',
    dtVersion: 'Version',
    
    buttonAlign: 'center',
    
    config: {
        
            layout: {
                    type: 'vbox',
                    align: 'stretch'
                    },

            defaults: {
                    flex: 1
            },
            
            centered: true,
            width: 350,
            height: 200
    },
    
    initialize: function() {
        var me = this;
        
         me.add( [{
                        xtype: 'toolbar',   
                        docked: 'top',
                        itemId: 'titlebar',
                        title: Utils.globals.applicationName + ' ' + me.dtLogonTitle
                        },                     
                     {
                        xtype: 'textfield', 
                        label: me.dtUserName,
                        name: 'username',
                        value: Utils.globals.defaultUsername,
                        allowBlank: false,
                        itemId: 'username'
                  
                    }, {   
                        xtype: 'textfield',
                        name: 'password',
                        label: me.dtPassword,
                        inputType: 'password',
                        value: Utils.globals.defaultPassword,
                        allowBlank: false,
                        itemId: 'password'
                    },{
                        xtype: 'toolbar',         	
                        layout: { pack: 'center' },
                        docked: 'bottom',  
                        items: [{
                            text: me.dtLogonBtn,
                            itemId: 'logonBtn'	                             	
                         }]
                    }
                ]);
                 
        me.callParent(arguments);
    }
    
});