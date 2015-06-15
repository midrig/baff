/**
 *  A MasterStores holds the references to cached master entity records defined by
 *  {@link Baff.utility.versionmanager.MasterModel}.
 *  
 */
Ext.define('Baff.utility.versionmanager.MasterStore', {
    extend: 'Ext.data.Store',
    requires: ['Baff.utility.versionmanager.MasterModel'],
    
    config: { 
    
        model: 'Baff.utility.versionmanager.MasterModel'
        
    },
    
    /**
    * Returns the master reference record for the given type and identifier
    * @param {String} type The entity type
    * @param {String} id The entity identifier
    * @returns {Baff.utility.versionmanager.MasterModel} or null if does not exist.
    */
    getMaster: function(type, id) {      
        var me = this;
     
        var index = me.findBy(function(rec, recId) {
            if (rec.get('entityId') == id &&
                rec.get('entityType') == type) {
                return true;
            } else {
                return false;
            }
        });
    
        if (index > -1) {
            var master = Ext.create(type);
            master.set(Ext.decode(me.getAt(index).getData()));
            return master;
        }
        else
            return null;  
    },
    
    /**
    * Removes the master reference record for the given type and identifier, if it exists
    * @param {String} type The entity type
    * @param {String} id The entity identifier
    */
    removeMaster: function(type, id) {
        
        var me = this;
     
        var index = me.findBy(function(rec, recId) {
            if (rec.get('entityId') == id &&
                rec.get('entityType') == type) {
                return true;
            }else {
                return false;
            }
        });
        
        if (index > -1) {
            Utils.logger.info("MasterStore::removeMaster, removing type: " + type + " ,id: " + id);
            me.removeAt(index);
        }
 
    },
    
    /**
    * Stores a master reference record for the given master entity.
    * @param {Baff.app.model.EntityModel} master The master entity
    * @return {Baff.utility.versionmanager.MasterModel} The master record stored
    */
    storeMaster: function (master) {
        var me = this;
       
        var type = master.getMasterEntityType();
        var id = master.getEntityId();
        
        // Remove any existing master record
        me.removeMaster(type, id);
        
        // Create a new one and add it to the store
        var newRecord = Ext.create('Baff.utility.versionmanager.MasterModel'); 
                
        newRecord.set('entityId', id);
        newRecord.set('entityType', type);
        newRecord.set('versionControl', master.getVersion());
        
        var data = master.getData({serialize: true});
        var encoded = Ext.encode(data);
        
        newRecord.set('data',encoded)     

        me.add(newRecord);
        
        return newRecord;
    },
    
     /**
    * Flushes the master store
    * @param {String} type The master entity type to be flushed
    */
    flushMaster: function (type) {
        var me = this;

        Utils.logger.info("MasterStore::flushMaster, removing type: " + type);
        
        var records = [];
        var i=0;
        
        me.each(function(rec) {
           if (rec.get('entityType') == type) {
                records[i] = rec;
                i++;
            }
        });
        
        me.remove(records);
        
    }
 
});