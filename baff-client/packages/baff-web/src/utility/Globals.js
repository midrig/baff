/**
 *  Holder for global variables and applicatin configuration.
 *  Should be updated for specific application deployments.
 */
Ext.define('Baff.utility.Globals', {
    extend: 'Ext.Base',
   
    /**
     * The application.
     * **IMPORTANT** This should be set in Ext.app.Application.init
     */   
    application: null,
    
     /**
     * The application viewport of type 'Baff.utility.application.Viewport'
     * This should be set when the viewport is created to manage view masking on load.
     * Set by Baff.utility.application.MainApplicationController if using this.
     */    
    viewport: null,
    
    /**
     * The application name used for display purposes.
     * **IMPORTANT** This should be set in Ext.app.Application.init
     */   
    applicationName: "MyApp",
    
    /**
     * The number of stores to cache before destroying unused stores
     */
    storeCacheSize: 25,
    
    /**
     * Root url for user security security service
     * **IMPORTANT**: This must be set here or else call UserSecurityManager.setServiceRoorUrl in Ext.app.Application.init
     */
    securityServiceRootUrl: 'myapp/user',
    
    /**
     * Root url for user reference data security service.
     * **IMPORTANT**: This must be set here or else call RefDataManager.setServiceRoorUrl in Ext.app.Application.init
     */
    refdataServiceRootUrl: 'myapp/refdata',
    
    /**
     * Indicates whether to generally use client side version control
     * Defaults to true; if not required should be set to false in Ext.app.Application.init
     */
    useVersionManager: true,
    
    /**
     * Indicates whether to generally pro-actively check entity versions on load (if using client side version control)
     * Defaults to true; if not required should be set to false in Ext.app.Application.init
     */
    checkVersionOnView: true,
    
    /**
     * Indicates whether to generally set entity versions from the master (if using client side version control)
     * Defaults to true; if not required should be set to false in Ext.app.Application.init
     */ 
    setVersionFromMaster: true,
    
    /**
     * Indicates whether to generally set entity versions from the master (if using client side version control)
     * Defaults to true; if not required should be set to false in Ext.app.Application.init
     */ 
    autoRefreshOnLock: true,   
    
    /**
     * Splash screen delay
     * Defaults to 2 seconds; alternative value should be set in Ext.app.Application.init
     */
    splashScreenDelay: 2000, 
    
    /**
     * The name of the main navigation view to be created by Baff.utility.application.MainApplicationController
     * Defaults to 'mainnavigationview'; alternative value should be set in Ext.app.Application.init
     */    
    mainView: 'mainnavigationview',        
    
     /**
     * Specifies if the application manages users
     * This should be set to true in Ext.app.Application.init if required 
     */
    manageUsers: false,
    
     /**
     * Default user permissions when creating a new user
     * This must be set here or else call UserSecurityManager.setDefaultPermissions in Ext.app.Application.init
     */
    defaultPermissions: 'myapp.read, myapp.update',
    
    /**
     * Default user name for login
     * This should be set in Ext.app.Application.init if required, typically on for  non production builds
     */
    defaultUsername: "",
    
    /**
     * Default password for login
     * This should be set in Ext.app.Application.init if required, typically on for  non production builds
     */
    defaultPassword: "",
    
     /**
     * Default setting for logging 'info' messages.
     * May be overwritten by a build property that replaces "$LOGGER_INFO$"
     */
    logInfo: true,
    
    /**
     * Default setting for logging 'debug' message. 
     * May be overwritten by a build property that replaces "$LOGGER_DEBUG$"
     */
    logDebug: true,
    
    /**
     * Default setting for logging 'error' messages.
     * May be overwritten by a build property that replaces "$LOGGER_ERROR$"
     */
    logError: true,
    
    /**
     * Default version.
     * May be overwritten by a build property that replaces "$$BUILD_VERSION$$"
     */
    version: "[Development]",
        
    
    /**
     * Constructor - set any globals based on build properties here
     */ 
    constructor: function (utils) {
        var me = this;
         
        me.version = utils.getBuildProperty('$BUILD_VERSION$', me.version);
        
    }
    
});

    

    


