/**
 *  The UserSecurityManager manages user acess logon, logoff and access control based on user
 *  permission held in a {@link Baff.utility.usersecurity.UserPermissionsStore}.
 *  
 *  The url to an associated service to retrieve the user permissions should be set by the application
 *  via the {@link #setUrl} method.
 *  
 */
Ext.define('Baff.utility.usersecurity.UserSecurityManager', {
    extend: 'Ext.Base',
    requires: ['Baff.utility.usersecurity.UserPermissionsStore'],
    
    /**
     * The permissions store
     * @private
     */  
    permissionStore: null,
    
    /**
     * The user name for the logged on user
     * @private
     */  
    username: null,
    
    
    config: {
    
        /**
         * The service root url
        */  
        serviceRootUrl:  '/user',
        
        /**
         * Default permissions
         */
        defaultPermissions: null
    
    },
    
    /**
     * Creates the user permissions store
     */  
    constructor: function(config) {
         
        this.initConfig(config);        
        this.permissionStore = Ext.create('Baff.utility.usersecurity.UserPermissionsStore');
        
    },
    
    /**
     * Gets the logged on user name.
     * @param {String}
     */  
    getUserName: function() {
        return this.username;
    },

    /**
     * Loads the user permissions into the {@link Baff.utility.usersecurity.UserPermissionsStore}.
     * @param {String} username The user name
     * @param {String} password The user password
     * @param cbFun The function to be called back
     * @param cbScope The scope for the call back function
     */  
    logon: function(username, password, cbFun, cbScope) {       
        Utils.logger.info("UserSecurityManager::logon");
        var me = this;
    
        me.username = username;
        me.permissionStore.getProxy().setUrl(this.getServiceRootUrl() + '/permission/findAll.json');
       
        me.permissionStore.load({
           
           params: {
                username: username,
                password: password
           },
           callback: function(records, operation, success) {
                cbFun(operation, success, cbScope);
           }
           
        });

    },
    
    /**
     * Determines if the user has the given role(s)
     * @param {String or Array} roles A single role or list of roles
     * @returns {boolean}
     */  
    isUserInRole: function(roles) {    
        Utils.logger.info("UserSecurityManager::isUserInRole");
        var me = this;
        var found = false;
        
        Ext.Array.each(roles, function(role, index) {
                if (me.permissionStore.findUserRole(role) !== -1) {
                    found = true;
                    return false;;
                }
        });
        
        return found;
        
    },
    
    /**
     * Removes all the data from the permissions store.
     */  
    logoff: function() {
        
        Utils.logger.info("UserSecurityManager::isUserInRole");
        var me = this;
        
        Ext.Ajax.request({url: me.getServiceRootUrl() + '/logout.json'});
        
        me.permissionStore.removeAll();
        me.username = null;
    }
    
});

    

    


