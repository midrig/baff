/**
 *  Utilities provides access to the various utility services:
 *  
 *    - Store Manager, the default is a {@link Baff.utility.storemanager.EntityStoreManager}
 *    - Version Manager, the default is a {@link Baff.utility.versionmanager.VersionManager}
 *    - Security Manager, the default is a {@link Baff.utility.usersecurity.UserSecurityManager}
 *    - Reference Data Manager, the default is a {@link Baff.utility.refdata.RefDataManager}
 *    - Local Reference Data Provider, the default is a {@link Baff.utility.refdata.LocalRefDataProvider}
 *    - Logger, the default is a {@link Baff.utility.logger.Logger}
 *  
 *  These should be setup by the Application during initialisation if different services are required.
 *  
 *  The services can be accessed using the shorthand name 'Utils', e.g. Utils.logger
 */
Ext.define('Baff.utility.Utilities', {
    extend: 'Ext.Base',
    alternateClassName: 'Utils',  
    singleton: true,
    
    requires: ['Baff.utility.logger.Logger',
                    'Baff.utility.storemanager.EntityStoreManager',
                    'Baff.utility.versionmanager.VersionManager',
                    'Baff.utility.usersecurity.UserSecurityManager',
                    'Baff.utility.refdata.LocalRefDataProvider',
                    'Baff.utility.refdata.RefDataManager',
                    //'Baff.utility.workflow.WorkflowManager',
                    'Baff.utility.Globals'
                     ],
    
    /**
     * The entity store manager
     */
    entityStoreManager: null,
    
    /**
     * The version manager
     */
    versionManager: null,
    
    /**
     * The user security manager
     */
    userSecurityManager: null,
    
    /**
     * The reference data manager
     */
    refDataManager: null,
    
    /**
     * The local reference data provider
     */
    localRefDataProvider: null,
    
     /**
     * The workflow manager
     */
    workflowManager: null,
    
    /**
     * The logger
     */
    logger: null,
    
    /**
     * Global variables
     */
    globals: null,
   
    
    /**
     * Initialises the utility services
     */
    constructor: function() {
        var me = this;
        
        me.globals = Ext.create('Baff.utility.Globals', me);

        me.entityStoreManager = Ext.create('Baff.utility.storemanager.EntityStoreManager');
        me.versionManager = Ext.create('Baff.utility.versionmanager.VersionManager');
    
        me.userSecurityManager = Ext.create('Baff.utility.usersecurity.UserSecurityManager', {
            serviceRootUrl: me.globals.securityServiceRootUrl,
            defaultPermissions: me.globals.defaultPermissions
        });       
        
        me.refDataManager = Ext.create('Baff.utility.refdata.RefDataManager', {
            serviceRootUrl: me.globals.refdataServiceRootUrl
        });
        
        me.localRefDataProvider = Ext.create('Baff.utility.refdata.LocalRefDataProvider');
        
        me.logger = Ext.create('Baff.utility.logger.Logger' , {  
            enableInfo: me.getBuildProperty('$LOGGER_INFO$', me.globals.logInfo),
            enableDebug: me.getBuildProperty('$LOGGER_DEBUG$', me.globals.logDebug),
            enableError:  me.getBuildProperty('$LOGGER_ERROR$', me.globals.logError)     
        });
        
    },
    
    /**
     * Gets a build property
     * @param {String} property The property to get
     * @param {String} defaultValue The default value if it was not set
     */
    getBuildProperty: function (property, defaultValue) {
            
            if (property[0] == '$') {
                return defaultValue;
            } else {
                if (property == "true")
                    return true;
                else if (property == "false")
                    return false
                else
                    return property;
            }
    }
    
});

    

    


