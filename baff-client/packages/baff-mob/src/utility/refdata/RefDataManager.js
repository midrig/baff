/**
 *  The RefDataManager manages access to reference data classes and their storage. Reference
 *  data records are defined by {@link Baff.utility.refdata.RefDataModel}, where the key is in the format:
 *  "DOMAIN.CLASS.RECORD" - a class reference is defined as "DOMAIN.CLASS".
 *  
 *  Note that a "null" or "not known" reference data code defaults to 0.
 *  
 *  The url to an associated service to retrieve reference data  should be set by the application
 *  via the {@link #setServiceUrl} method.
 */
Ext.define('Baff.utility.refdata.RefDataManager', {	
    extend: 'Ext.Base',
    requires: ['Baff.utility.refdata.RefDataModel'],
    
    config: {
    
    /**
     * The url of the service to retrieve reference data from.
     */  
        serviceRootUrl: null
    
    },

    constructor: function(config) {
         
        this.initConfig(config);
        
    },

    /**
     * Returns the store that holds the reference data records for a given class
     * @param {String} refdataclass The reference data class ("DOMAIN.CLASS" part of the complete key)
     * @returns {Ext.data.Store}
     */  
    getRefDataStore: function (refdataclass) {
        var me = this;
        var store = Ext.getStore(refdataclass);
        
        if (store == null) {
             store = me.createRefDataStore (refdataclass);
        }

        return store;
    },

    /**
     * Creates a new store to hold reference data.
     * TO DO: Load the data from the server
     * @param {String} refdataclass The reference data class ("DOMAIN.CLASS" part of the complete key)
     * @returns {Ext.data.Store} The store holding the reference data records
     * @private
     */  
    createRefDataStore: function (refdataclass) {
        var me = this;
        var store = Ext.create('Ext.data.Store', {

            storeId: refdataclass,
            model: Baff.utility.refdata.RefDataModel
            
        });
        
        
        // If server side reference data enabled
        if (me.getServiceRootUrl() != null) {
            var url = me.getServiceRootUrl() + '/find.json';
            var proxy = Ext.create('Baff.app.model.ServiceProxy', {
                url: url
            });
            
            proxy.setExtraParam("refdataclass", refdataclass);      
            store.setProxy(proxy);
            
            store.load();
            
         
        } else {
             
            Utils.localRefDataProvider.loadRefDataStore(store);
        
        }
        return store;

    },
    
    
    /**
     * Get the code for a given reference data class and record key.
     * Ensure the reference data has been loaded before calling this method.
     * @param {String} key The key (exluding the class and domain)
     * @param {String} [refdataclass="null"] The reference data class ("DOMAIN.CLASS" part of the record key)
     * @returns {String}
     */  
    getCode: function (key, refdataclass) {
        var me = this;       
        
        if (refdataclass == null) {
            var sep = key.split('.');    
            if (sep.length == 3) {
                refdataclass = sep[0] + "." + sep[1];
            }
            else {
                Utils.logger.error("Invalid reference data class specified");
                return null;
            }
        } else {
            key = refdataclass + "." + key;
        }
        
        var store = me.getRefDataStore(refdataclass);
        
        var record = store.findRecord('key', key);
        if (record) {
            return record.get('code');
        } else {
            Utils.logger.error("Reference data not found - ensure reference data has been loaded, class= " + refdataclass + ", key= " + key);
            return null;
        }
        
    },
    
    /**
     * Get the list of decodes for a given reference data key.
     * Ensure the reference data has been loaded before calling this method.
     * @param {String} The reference data class ("DOMAIN.CLASS" part of the complete key)
     * @returns {Array}
     */  
    getCodeDecodeArray: function (refdataclass) {
        var me = this;
        var decodes = [],
              record;   
 
        var store = me.getRefDataStore(refdataclass);
        var count = store.count();
        
        if (count < 1) {
            Utils.logger.error("Reference data not found - ensure reference data has been loaded");
            return null;
        }
        
        for (var i=0; i<count; i++) {            
            
            record = store.getAt(i);
            decodes[i] = record.data; 
        }
        
        return decodes;
                
    },
    
    /**
     * Get the decode for a given reference data class and code.
     * Ensure the reference data has been loaded before calling this method.
     * @param {String} The reference data class ("DOMAIN.CLASS" part of the complete key)
     * @param {String} The reference data code
     * @returns {String}
     */  
    getDecode: function (code, refdataclass) {
        var me = this;
        var store = me.getRefDataStore(refdataclass);
        var record = store.findRecord('code', code);
        if (record) {
            return record.get('decode');
        } else {
            Utils.logger.error("Reference data not found - ensure reference data has been loaded");
            return null;
        }
        
    }
    
    
});