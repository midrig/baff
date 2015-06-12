/**
 *  The LocalRefDataProvider loads locally defined reference data into a reference data store.  This
 *  class may be updated to define local reference data. In production the {@link Baff.utility.refdata.RefDataManager}
 *  should retrieve reference data from a service.
 *  
 */
Ext.define('Baff.utility.refdata.LocalRefDataProvider', {	
    extend: 'Ext.Base',
    
    /**
     * Load locally defined reference data into the given store.
     * @param {Ext.data.Store} The store to be loaded.
     */  
    loadRefDataStore: function (store) {
        
        if (store.getStoreId() === 'REF.DATA.NOCLASS') {
 
            store.add([
                {"key": "REF.DATA.NULL", "code":0, "decode":"Not Applicable"}
            ]);
        
        }
    }
});




