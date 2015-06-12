/**
 *  A Logger provides console logging methods for INFO, DEBUG and ERROR levels.  If there is no
 *  console logger available then logging will not occur.  Logging levels can be toggled at runtime.
 *  
 */
Ext.define('Baff.utility.logger.Logger', {     
    extend: 'Ext.Base',
    
    config: {
    
        // Flags to indicate if logging is enabled
        enableInfo: true,
        enableDebug: true,
        enableError: true
    
    },
    
    // Logging function references
    info: null,
    debug: null,
    error: null,
    
    /**
    *  Sets the logging for all levels; could be modified for production release.
    *  TODO: look for global settings.
    */
    constructor: function(config) {
        
        this.initConfig(config);
        
        this.setInfoLogger (this.getEnableInfo());
        this.setDebugLogger (this.getEnableDebug());
        this.setErrorLogger (this.getEnableError());
 
    },
    
    /**
    *  Enables the INFO logger
    *  @param {boolean}
    */
    setInfoLogger: function (enabled) {
        
        if (typeof console != 'undefined' && enabled) 
            this.info = Function.prototype.bind.call(console.log, console);
        else     
            this.info = function() {return;};
        
    },
    
    /**
    *  Enables the DEBUG logger
    *  @param {boolean}
    */
    setDebugLogger: function (enabled) {
        
        if (typeof console != 'undefined' && enabled) 
            this.debug = Function.prototype.bind.call(console.debug, console);
        else     
            this.debug = function() {return;};
        
    },
    
    /**
    *  Enables the ERROR logger
    *  @param {boolean}
    */
    setErrorLogger: function (enabled) {
        
        if (typeof console != 'undefined' && enabled) 
            this.error = Function.prototype.bind.call(console.error, console);
        else     
            this.error = function() {return;};
        
    }
    
    
});

    

    


