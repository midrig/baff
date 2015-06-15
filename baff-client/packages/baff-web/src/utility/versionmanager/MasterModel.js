/**
 *  A MasterModel holds a reference to a master entity, to be held in the {@link Baff.utility.versionmanager.MasterStore}.
 *  
 */
Ext.define('Baff.utility.versionmanager.MasterModel', {
     extend: 'Ext.data.Model', 
     
     fields: [
        { name: 'entityType', type: 'string' },
        { name: 'entityId', type: 'string' },
        { name: 'versionControl', type: 'string' },
        { name: 'data', type: 'string' }
     ],
     
     idParam: 'entityId',
     
    /**
    *  Returns the version of the master entity
    *  @returns {String}
    */
     getVersion: function() {
        return this.get('versionControl');
     },
     
    /**
    *  Returns the JSON encoded data for the master entity record
    *  @return {String}
    */
     getData: function() {
        return this.get('data');
     }
    
});
