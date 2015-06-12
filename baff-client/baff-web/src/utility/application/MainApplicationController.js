/**
 *  A MainApplicationController manages user logong (via {@link Baff.utility.application.LogonWindow},
 *  user logoff and exit due to system error.
 */
Ext.define('Baff.utility.application.MainApplicationController', {
    extend: 'Ext.app.Controller',
    alias: 'controller.mainapplication',
    
    requires:[
        'Ext.window.MessageBox',
        'Baff.utility.usersecurity.UserSecurityManager'
    ],
    
     views: [
        'Baff.utility.application.LogonWindow',
        'Baff.utility.application.RegisterUserWindow',
        'Baff.utility.application.UpdateUserWindow',
        'Baff.utility.application.LogonWindow',
        'Baff.utility.application.MainHeader'
    ],
    
    refs: [        
        {
            ref:'usernameField',
            selector:'logonwindow textfield[name=username]'
        }, {
            ref:'passwordField',
            selector:'logonwindow textfield[name=password]'
        }, {
            ref:'emailField',
            selector:'registeruserwindow textfield[name=email]'
        }, {
            ref:'displayNameField',
            selector:'registeruserwindow textfield[name=displayName]'
        },{
            ref:'updatePasswordField',
            selector:'updateuserwindow textfield[name=password]'
        }, {
            ref:'confirmPasswordField',
            selector:'updateuserwindow textfield[name=confirmPassword]'
        }
    ],
    
    // Literals for locale override
    dtInvalidLogonTitle: 'Invalid Logon',
    dtInvalidLogonMsg: 'Please enter a valid username and password',
    dtInvalidRegisterUserTitle: 'Invalid Registration',
    dtInvalidRegisterUserMsg: 'Please enter a valid email and display name',
    dtAckRegisterUserTitle: 'Registration Successful',
    dtAckRegisterUserMsg: 'Please check your email for your login details',
    dtAckResetTitle: 'Reset Successful',
    dtAckResetMsg: 'Please check your email for your login details',
    dtInvalidResetTitle: 'Invalid Reset',
    dtInvalidResetMsg: 'Please enter a valid username',
    dtConfirmResetTitle: 'Confirm Reset',
    dtConfirmResetMsg: 'Are you sure you want to reset your password?',
    dtInvalidUpdateUserTitle: 'Invalid Update',
    dtInvalidUpdateUserMsg: 'Please enter a valid display name and password',
    dtAckUpdateUserTitle: 'Update Successful',
    dtAckUpdateUserMsg: 'Please login with your new password',
    dtConfirmLogoutTitle: 'Confirm Logout',
    dtConfirmLogoutMsg: 'Are you sure you want to log out?',  
    dtLoading: 'Please wait....',
    dtFailTitle: 'Unrecoverable System Failure', 
    dtRestartMsg: 'The application will be now be restarted. Sorry for any inconvenience caused.',
    
    
    HTTP_REQUEST_OK: 200,
    
    splashcreen: null,
    
   /**
     * Initialise the controller.
     */
    init: function() {   
        Utils.logger.info("MainApplicationController::init");
        var me = this;

        me.control({
            'logonwindow #logonBtn': {
                click: me.onLogonButton
            },
             'logonwindow #optionBtn #register': {
                click: me.onShowRegisterUserButton
            },
             'logonwindow #optionBtn #reset': {
                click: me.onResetUserButton
            },
             'logonwindow #optionBtn #update': {
                click: me.onShowUpdateUserButton
            },
            'registeruserwindow #registerBtn': {
                click: me.onRegisterUserButton
            },
            'registeruserwindow #cancelBtn': {
                click: me.onCancelRegisterUserButton
            },
            'mainheader toolbar #logoffBtn': {
                click: me.onLogoffButton
            },
            'updateuserwindow #updateBtn': {
                click: me.onUpdateUserButton
            },
            'updateuserwindow #cancelBtn': {
                click: me.onCancelUpdateUserButton
            }
        });
        
        Utils.globals.application.on('systemfailure', me.onSystemFailure, me);
    },
    
    /**
     * Log the user off and restart the application when a system error ocurrs.
     */
    onSystemFailure: function () {
        
        Utils.logger.info("MainApplicationController::onSystemFailure");
        var me = this;
        
        Ext.Msg.alert(me.dtFailTitle, me.dtRestartMsg, function() {
            
            Utils.userSecurityManager.logoff();
            window.location.reload();
        
        });       
        
    },
    
    /**
     * Display the logon window on application launch.
     */
    onLaunch: function() {
        
        Utils.logger.info("MainApplicationController::onLaunch");
        var me = this;
        
        var task = new Ext.util.DelayedTask(function() {
            
            var ss = Ext.fly('splashcreen');
            if (ss != null)
                ss.destroy();   
        
            me.logonWindow = Ext.create('Baff.utility.application.LogonWindow');
            me.logonWindow.show();
        
        });
        
        task.delay(Utils.globals.splashScreenDelay);
        
    },

    /**
     * Authenticate the user when the logon button is clicked.
     */
    onLogonButton: function() {
        
        Utils.logger.info("MainApplicationController::onLogonButton");
        var me = this;
        
        if(me.getUsernameField().validate() && me.getPasswordField().validate() ){
            
            me.logonWindow.setLoading(me.dtLoading);
            
            Utils.userSecurityManager.logon(me.getUsernameField().getValue(),
                                me.getPasswordField().getValue(),
                                me.postLogon, me);
        } else {
            Ext.Msg.alert(me.dtInvalidLogonTitle, me.dtInvalidLogonMsg);
        }
    },
    
    onShowRegisterUserButton: function() {
        
        Utils.logger.info("MainApplicationController::onShowRegisterUserButton");
        var me = this;
        
         me.logonWindow.hide();
         me.registerUserWindow = Ext.create('Baff.utility.application.RegisterUserWindow');
         me.registerUserWindow.show();
 
    },
    
    onRegisterUserButton: function() {
        
        Utils.logger.info("MainApplicationController::onRegisterUserButton");
        var me = this;
        
        if(me.getEmailField().validate() && me.getDisplayNameField().validate() ){
            
            me.registerUserWindow.setLoading(me.dtLoading);
            
            Utils.userSecurityManager.registerUser(me.getEmailField().getValue(),
                                me.getDisplayNameField().getValue(),
                                null, // use default permissions
                                me.postRegistration, me);
        } else {
            Ext.Msg.alert(me.dtInvalidRegisterUserTitle, me.dtInvalidRegisterUserMsg);
        }
 
    },
   
    onCancelRegisterUserButton: function() {
        
        Utils.logger.info("MainApplicationController::onCancelRegisterUserButton");
        var me = this;
       
         me.registerUserWindow.close();
         me.registerUserWindow.destroy();
         me.logonWindow.show();
 
    },
    
    onResetUserButton: function() {  
        Utils.logger.info("MainApplicationController::onResetUserButton");
        var me = this;
        
        if(me.getUsernameField().validate()){
        
            Ext.Msg.confirm(me.dtConfirmResetTitle, me.dtConfirmResetMsg, function(btn) {
                        if (btn === 'yes') {
                            me.doResetUser();
                        }
                    });
        }else {
            Ext.Msg.alert(me.dtInvalidResetTitle, me.dtInvalidResetMsg);
        }
    },
            
   doResetUser: function() {  
        Utils.logger.info("MainApplicationController::doResetUser");
        var me = this;
     
        me.logonWindow.setLoading(me.dtLoading);

         Utils.userSecurityManager.resetUser(me.getUsernameField().getValue(),
                             me.postResetUser, me);
     
 
    },
    
    onShowUpdateUserButton: function() {
        
        Utils.logger.info("MainApplicationController::onShowUpdateUserButton");
        var me = this;
        
          if(me.getUsernameField().validate() && me.getPasswordField().validate() ){
            
            me.logonWindow.hide();
            me.updateUserWindow = Ext.create('Baff.utility.application.UpdateUserWindow');
            me.updateUserWindow.show();
            
        } else {
            Ext.Msg.alert(me.dtInvalidLogonTitle, me.dtInvalidLogonMsg);
        }
   
    },
    
    onUpdateUserButton: function() {     
        Utils.logger.info("MainApplicationController::onUpdateUserButton");
        var me = this;
        
        if(me.getUpdatePasswordField().validate() &&
               me.getUpdatePasswordField().getValue() ==  me.getConfirmPasswordField().getValue()) {
            
            me.updateUserWindow.setLoading(me.dtLoading);
            
            Utils.userSecurityManager.updateUser(me.getUsernameField().getValue(),
                                null,  // Don't update display name
                                me.getPasswordField().getValue(),
                                me.getUpdatePasswordField().getValue(),
                                null, // Don't update permissions
                                me.postUpdateUser, me);
        } else {
            Ext.Msg.alert(me.dtInvalidUpdateUserTitle, me.dtInvalidUpdateUserMsg);
        }
 
    },
   
    onCancelUpdateUserButton: function() {
        
        Utils.logger.info("MainApplicationController::onCancelUpdateUserButton");
        var me = this;
       
         me.updateUserWindow.close();
         me.updateUserWindow.destroy();
         me.logonWindow.show();
 
    },
    
    postLogon: function(operation, success, me) {  
        Utils.logger.info("MainApplicationController::postLogon");
        //var me = this;  // passed in as scope
        
        me.logonWindow.setLoading(false);
        
        if (success) {

            if (Utils.globals.manageUsers) {
                
                Utils.userSecurityManager.loadUserAttributes(me.getUsernameField().getValue(),
                                me.postGetUserAttributes, me);
                                
            }
   
            me.logonWindow.destroy();
            Utils.globals.viewport = Ext.create('Baff.utility.application.Viewport');
            Utils.globals.viewport.show();
            
        } else {
           
            if (operation.getResponse() != null && operation.getResponse().status == me.HTTP_REQUEST_OK) {
                Ext.Msg.alert(me.dtInvalidLogonTitle, me.dtInvalidLogonMsg);

            } else {
                me.onSystemFailure();
            }
        }
    },
    
    postGetUserAttributes: function(record, operation, success, me) {   
        Utils.logger.info("MainApplicationController::postGetUserAttributes");
        //var me = this;  // passed in as scope
     
        if (!operation.success && 
                (operation.getResponse() == null || operation.getResponse().status != me.HTTP_REQUEST_OK))
            me.onSystemFailure();
           
    },
     
    postRegistration: function(success, response, me) {   
        Utils.logger.info("MainApplicationController::postRegistration");
        //var me = this;  // passed in as scope
        
        me.registerUserWindow.setLoading(false);

        if (success) {
            var obj = Ext.decode(response.responseText);
            
            if (obj.success) {
            
                Ext.Msg.alert(me.dtAckRegisterUserTitle, me.dtAckRegisterUserMsg,  function () {
                   me.registerUserWindow.destroy();
                    me.logonWindow.show();
                });
                
            } else if (obj.message != null) {
                Ext.Msg.alert(me.dtInvalidRegisterUserTitle, obj.message);
            } else {
                me.onSystemFailure();
            }
                
            
        } else {
            
            if (response != null && response.status == me.HTTP_REQUEST_OK) {
                Ext.Msg.alert(me.dtInvalidRegisterUserTitle, me.dtInvalidRegisterUserMsg);

            } else {
                me.onSystemFailure();
            }
        }
    },
    
    postResetUser: function(success, response, me) {      
        Utils.logger.info("MainApplicationController::postReset");
        //var me = this;  // passed in as scope
        
        me.logonWindow.setLoading(false);
        
       if (success) {
            var obj = Ext.decode(response.responseText);
            
            if (obj.success) {
            
                Ext.Msg.alert(me.dtAckResetTitle, me.dtAckResetMsg);
                
            } else if (obj.message != null) {
                Ext.Msg.alert(me.dtInvalidResetTitle, obj.message);
            } else {
                me.onSystemFailure();
            }
                
            
        } else {
            
            if (response != null && response.status == me.HTTP_REQUEST_OK) {
                Ext.Msg.alert(me.dtInvalidResetTitle, me.dtInvalidResetMsg);

            } else {
                me.onSystemFailure();
            }
        }
    },
    
    postUpdateUser: function(success, response, me) {   
        Utils.logger.info("MainApplicationController::postUpdateUser");
        //var me = this;  // passed in as scope
        
        me.updateUserWindow.setLoading(false);

        if (success) {
            var obj = Ext.decode(response.responseText);
            
            if (obj.success) {
            
                Ext.Msg.alert(me.dtAckUpdateUserTitle, me.dtAckUpdateUserMsg, function () {
                    me.getPasswordField().setValue(me.getUpdatePasswordField().getValue()),
                    me.updateUserWindow.destroy();
                    me.logonWindow.show();
                });

                
            } else if (obj.message != null) {
                Ext.Msg.alert(me.dtInvalidUpdateUserTitle, obj.message);
            } else {
                me.onSystemFailure();
            }
                
            
        } else {
            
            if (response != null && response.status == me.HTTP_REQUEST_OK) {
                Ext.Msg.alert(me.dtInvalidUpdateUserTitle, me.dtInvalidUpdateUserMsg);

            } else {
                me.onSystemFailure();
            }
        }
    },
    
    /**
     * Log the user off and restart the application when the log off button is clicked.
     */
    onLogoffButton : function(){
        var me = this;
        
        Ext.Msg.confirm(me.dtConfirmLogoutTitle, me.dtConfirmLogoutMsg, function(button){
                
                if(button === 'yes'){
                    Utils.userSecurityManager.logoff();
                    window.location.reload();
                }
            }
        );        
    }
});
 
    