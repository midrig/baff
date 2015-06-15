/**
 *  A RefDataModel holds a reference to a reference data record, where the key is in the format:
 *  "DOMAIN.CLASS.RECORD" - a class reference is defined as "DOMAIN.CLASS".
 *  
 */
Ext.define('Baff.utility.refdata.RefDataModel', {
    extend: 'Ext.data.Model',
    
    fields: [
        
        { name: 'key', type: 'string' },
        { name: 'code', type: 'int' },
        { name: 'decode', type: 'string' }

    ]
    
});
