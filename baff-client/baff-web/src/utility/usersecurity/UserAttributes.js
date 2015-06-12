/**
 *  A RefDataModel holds a reference to a reference data record, where the key is in the format:
 *  "DOMAIN.CLASS.RECORD" - a class reference is defined as "DOMAIN.CLASS".
 *  
 */
Ext.define('Baff.utility.usersecurity.UserAttributes', {
    extend: 'Ext.data.Model',
    
    fields: [
        
        { name: 'username', type: 'string' },
        { name: 'displayname', type: 'string' },
        { name: 'email', type: 'string' }
        
    ],
    
    proxy: {
        type: 'serviceproxy'
    }   
    
});
