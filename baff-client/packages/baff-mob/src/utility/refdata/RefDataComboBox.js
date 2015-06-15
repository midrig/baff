/**
 *  A RefDataComboBox is a form combo box bound to a reference data class.
 *  
 *  A typical configuration when defining fields for a {@link Baff.app.view.FormPanel} is:
 *          
 *      items: [{                  
 *           xtype: 'refdatacombobox',
 *           name: 'bar',
 *           label: 'Bar',
 *           refdataClass: 'REFDATA.BAR'
 *       }
 *       ...
 *                  
 */
Ext.define('Baff.utility.refdata.RefDataComboBox', {
    extend: 'Ext.field.Select', 
    requires: ['Baff.utility.refdata.RefDataManager'],   
    xtype: 'refdatacombobox',    
       
    initialKey: null,
    
    // Literals for the default values
    REF_DATA_NULL: 'REF.DATA.NULL',
    REF_DATA_NOCLASS: 'REF.DATA.NOCLASS',
  
    config: {
        
        /**
        * Specifes the reference data class to be used
        * @cfg refdataClass (required)
        */
        refdataClass:  'REF.DATA.NOCLASS',
        
        /**
        * Specifes the key for record to be displayed by default
        */    
        defaultKey: 'REF.DATA.NULL',
        
        /**
        * Specifies the value field for the underlying combo box
        * @private
        */
        valueField: 'code',

        /**
        * Specifies the display field for the underlying combo box
        * @private
        */
        displayField: 'decode'
        
        
    },
    
    /**
    * Setup the component by setting up the reference data class
    * Calls the overridden superclass method.
    * Called on initialisation.
    */
    initialize: function() {         
        var me = this;

        me.callParent(arguments);
        me.setRefDataClass(me.getRefdataClass(), me.getDefaultKey());  
    },
    
    /**
    * Gets the key for the currently selected record
    * @returns {String} key
    * @private
    */
    getKey: function() {      
        var me = this;
        
        var key = me.REF_DATA_NULL;
        
        if (me.getStore()) {
            var code = me.getSubmitValue();
            var record = me.getStore().findRecord('code', code);
        
            if (record) {
                key = record.get('key');
            }
        }
        
        return key;

    },
    
    /**
    * Gets the code for the currently selected record
    * @returns {String} code
    */
    getCode: function() {        
        var me = this;
        
        var code = null;
        
        if (me.getStore() != null)
            code = me.getSubmitValue();
        
        return code;

    },
    
    getSubmitValue: function() {  
        var me = this;
        return this.getValue();
    },
    
    /**
    * Loads the records for the given reference data class and selects the record for the given key.
    * @param {String} refdataclass The reference data class to be loaded.
    * @param {String} key The key for the record to be selected by default.
    * @returns {String} code
    */    
    setRefDataClass: function(refdataclass, key) {
       var me = this;
       
        me.initialKey = key;  
        me.refdataClass = refdataclass;
        
        me.setStore(Utils.refDataManager.getRefDataStore(me.refdataClass));
        
        if (me.getStore().isLoaded()) {
            me.setValueOnData();
        }
        

    },
    
    /**
    * Sets the default value when data is available in the store
    * @private
    */    
    setValueOnData: function () {
        var me = this;   
        
        var key = me.initialKey;
        
        if (me.refdataClass === me.REF_DATA_NOCLASS) {
           key = me.REF_DATA_NULL;
        } else if (!key) {
           key = me.getKey();
        }
        
        var dirty = me.isDirty();

        me.setValue(key);
        
        if (!dirty) {
            me.resetOriginalValue();
            me.reset();
        }

    },
    
    /**
    * Sets the value of a record for a given reference data key or code
    * @param {String} value The reference data key or code
    */
    setValue: function(value, doSelect) {
        var me = this;
        
        if (Ext.isString(value)) {
            
            if (value == me.REF_DATA_NULL) {
                value = null;
                
            } else if (value.split('.').length == 3) {
                
                    var record = me.getStore().findRecord('key', value);
                    if (record)
                        value = record.get('code');
                    else
                        value = null;

            }
            
        }
        
        me.callParent(arguments);     
      
    },
    
    /**
    * Overrides the superclass to correctly reset the value to the original value.
    */
    reset: function() {
        var me = this;
        me.setValue(me.originalValue);
    },
    
    /**
    * Overrides the superclass to correctly set the value
    */
    applyValue: function(value) {
        var me = this,
                findval = value;
        
        me.getOptions();
        
        if (findval == null)
            findval = 0;
        else if (findval.isModel)
            return findval;
                
        var record = me.getStore().findRecord('code', findval); 
        
        return record;
    }
 

});