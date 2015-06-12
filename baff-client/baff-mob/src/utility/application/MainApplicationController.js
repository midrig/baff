/**
 *  A MainApplicationController manages user logong (via {@link Baff.utility.application.LogonWindow},
 *  user logoff and exit due to system error.
 */
Ext.define('Baff.utility.application.MainApplicationController', {
    extend: 'Ext.app.Controller',
    alias: 'controller.mainapplication',
    
    requires:[
        'Ext.MessageBox',
        'Baff.utility.usersecurity.UserSecurityManager'
    ],
    
    config: {
    
        views: [
           'Baff.utility.application.LogonWindow'
       ],

       refs: {
               usernameField: 'logonwindow #username',
               passwordField: 'logonwindow #password'
           },
       
       control: {
               'logonwindow #logonBtn': {
                   tap: 'onLogonButton'
               }
           }
    },
        
    // Literals for locale override
    dtInvalidLogonTitle: 'Invalid Logon',
    dtInvalidLogonMsg: 'Please enter a valid username and password',
    
    dtConfirmRestartTitle: 'Confirm',
    dtConfirmRestartMsg: 'Are you sure you want to restart?',  
    dtFailTitle: 'Unrecoverable System Failure', 
    dtRestartMsg: 'The application will be now be restarted.<br>Sorry for any inconvenience caused.',
    
    dtLoading: 'Please wait....',
    
    
    HTTP_REQUEST_OK: 200,
    
    splashcreen: null,
    
   /**
     * Initialise the controller.
     */
    init: function() {   
        Utils.logger.info("MainApplicationController::init");
        var me = this;
  
    },
    
    
     /**
     * Log the user off and restart the application when a system error ocurrs.
     */
    onSystemFailure: function () {
        var me = this;
        
        Ext.Msg.alert(me.dtFailTitle, me.dtRestartMsg, function() {
            
            Utils.userSecurityManager.logoff();
            window.location.reload();
        
        });       
        
    },
    
    
     /**
     * Log the user off and restart the application when the log off button is clicked.
     */
    onSystemRestart : function(){
        var me = this;
        
        Ext.Msg.confirm(me.dtConfirmRestartTitle, me.dtConfirmRestartMsg, function(button){
                
                if(button === 'yes'){
                    Utils.userSecurityManager.logoff();
                    window.location.reload();
                }
            }
        );        
    },
    
    
    /**
     * Display the logon window on application launch.
     */
    onLaunch: function() {       
        Utils.logger.info("MainApplicationController::onLaunch");
        var me = this;
         
        Utils.globals.application.on('systemfailure', me.onSystemFailure, me);
        Utils.globals.application.on('systemrestart', me.onSystemRestart, me);
        
        me.logonWindow = Ext.widget('logonwindow');
        me.logonWindow.enable();
        Ext.Viewport.add(me.logonWindow);
        me.logonWindow.show();
        
    },

    /**
     * Authenticate the user when the logon button is clicked.
     */
    onLogonButton: function() {       
        Utils.logger.info("MainApplicationController::onLogonButton");
        var me = this;
        
        me.logonWindow.setMasked({xtype: 'loadmask', message: me.dtLoading});       
        
        var username = me.getUsernameField().getValue();
        var password = me.getPasswordField().getValue();
               
        Utils.userSecurityManager.logon(
                                username,
                                password,
                                me.postLogon, me);
    
    },
    
    postLogon: function(operation, success, me) {  
        Utils.logger.info("MainApplicationController::postLogon");
        //var me = this;  // passed in as scope
        
        me.logonWindow.setMasked(false);
        
        if (success) {

            if (Utils.globals.manageUsers) {
                
                Utils.userSecurityManager.loadUserAttributes(me.getUsernameField().getValue(),
                                me.postGetUserAttributes, me);
                                
            }
   
            me.logonWindow.destroy();
            
            Ext.Viewport.add({xtype: Utils.globals.mainView});
            
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
           
    }
});
 
    