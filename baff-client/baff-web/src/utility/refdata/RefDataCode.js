/**
 *  A RefDataCode data holds a code determined from a reference data class.  It is specified in an
 *  {@link Ext.foundation.EntityModel} as follws:
 *  
 *      fields: [
 *           { name: 'foo', type: 'refdatacode', defaultValue: 'DOMAIN.FOO.BAR' },
 *           ...
 *      ]
 */          
Ext.define('Baff.utility.refdata.RefDataCode', {
    extend: 'Ext.data.field.Field',
    alias: 'data.field.refdatacode',
    
    
    /**
    * Sets the default value from reference data.
    * Calls the overridden superclass method.
    * @ignore
    */      
    constructor: function() {
        var me = this;
        
        me.callParent(arguments);
       
    }
 
});

