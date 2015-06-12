/**
 *  A ServiceProxy provides an interface to underlying services and is specifed in {@link Baff.app.model.EntityModel}
 *  and {@link Baff.app.model.EntityStore} configuration to send and retrieve data.
 */ 
Ext.define('Baff.app.model.ServiceProxy', {
    extend: 'Ext.data.proxy.Ajax',
    alias: 'proxy.serviceproxy',
    
    /**
     * Sets the id paramater sent to the service as the 'entityId' field in {@link Baff.app.model.EntityModel}.
     * @private
     */  
    idParam: 'entityId',
    
    typeProperty: ' ',
    
    /**
     * The service response reader
     * @private
     */  
    reader: {
        
         type: 'json',            
         rootProperty: 'data',
         totalProperty: 'total',
         useSimpleAccessors: true, // Allows use "." in field names
         typeProperty: this.typeProperty
        
    },
    
    /**
     * The service request writer
     * @private
     */  
    writer: {
           type: 'json',
           allowSingle:true,
           encode:true,
           writeAllFields: true,
           writeRecordId: false,
           rootProperty:'data'       
        },
    
    
    /**
     * Returns the JSON data from the service response
     * @return {String}
     */  
    getResponse: function() {
        return this.getReader().rawData;
    }
    

});
    

