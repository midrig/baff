/**
 *  A FormPanel provides a panel for presenting and capturing business entity data.  It is typically 
 *  presented in a {@link Baff.app.view.FormView} where it is specified via the 
 *  {@link Baff.app.view.FormView #formPanel} configuration property.
 *  
 *  
 *  An example implementation is as follows:
 *  
 *      Ext.define('MyApp.view.MyForm', {
 *          extend: 'Baff.app.view.FormPanel',
 *          alias: 'widget.productform',
 *          
 *          config: {
 *          
 *              items: [{                  
 *                      xtype: 'textfield',
 *                      name: 'foo',
 *                      label: 'Foo',
 *                  },{
 *                      xtype: 'refdatacombobox',
 *                      name: 'bar',
 *                      label: 'Bar',
 *                      refdataClass: 'REFDATA.BAR',
 *                  }]
 *             
 *          }
 *      });
 *
 */        
Ext.define('Baff.app.view.FormPanel', {
    extend: 'Ext.form.Panel',
    xtype: 'formpanel',
    
    requires: ['Ext.field.Checkbox',
                     'Ext.form.FieldSet'],
    
    dirty: false, 
    
    // Display text for locale override
    dtValidationError: 'Validation Error',
    
    config : {
        
        /*
         * Specifies the style to be appled for an invalid field
         */
        invalidFieldCls: 'invalid-field'
    },
    
    /**
     * Resets all the fields in the form to their original values
     */
    setCleanRecord: function (listen) {
        var me = this;
               
        me.getFieldsArray().forEach(function(field) { 
            field.resetOriginalValue();
            field.reset();
            field.removeCls(me.getInvalidFieldCls());
            
            if (listen) {
                field.on('change', me.onFieldChange, me);
                field.on('keyup', me.onFieldChange, me);
            }
        });
        
        if (me.dirty) {
            me.dirty = false;
            this.fireEvent('dirtychange', me, false);
        }
    
    },
    
    /*
     * Sets the form to dirty on a field change
     */
    onFieldChange: function() {
        var me = this;
        
        if (!me.dirty) {
            me.dirty = true;
            this.fireEvent('dirtychange', me, true);
        }
    },
    
     /**
     * Determines if any of the fields are dirty
     * @return {boolean}
     */
    isDirty: function () {     
        return this.dirty;
        
    },
    
    /**
     * Sets all the fields in the form read only (or editable if false)
     * @param {boolean}
     */
    makeReadOnlyForAll: function(readOnly) {
        
        this.getFieldsArray().forEach(function(field) { 
          field.setReadOnly(readOnly);
        });
        
    },
    
    /*
     * Marks fields as invalid and prompts the user with the error messages
     * @param {Array} errors The list of validation errors
     */
    markInvalid: function(errors) {
        var me = this;
        
        me.getFieldsArray().forEach(function(field) {
            field.removeCls('invalidField');
        });
        
        var errorString = '';
        
        errors.forEach(function(error) {
            var sel = Ext.String.format('field[name={0}]', error.id);
            var field = me.down(sel);
            errorString += field.getLabel() + ": " + error.msg + '<br>';
            field.addCls(me.getInvalidFieldCls());
        });
        
        Ext.Msg.alert(me.dtValidationError, errorString);
        
    }
    
});

/*
 * Override for checkbox to provide setReadOnly function.
 */
Ext.define('Baff.app.field.Checkbox', {
    override: 'Ext.field.Checkbox',
    
    setReadOnly: function(readOnly) {
        if (readOnly)
            this.disable();
        else
            this.enable();
    }
});

/*
 * Override for slider to reset to original value.
 */
Ext.define('Baff.app.field.Slider', {
    override: 'Ext.field.Slider',
    
    reset: function() {
        if (this.originalValue != null) {
            this.setValue(this.originalValue)
            this.onSliderChange();
        }
        else
            this.callParent(arguments);
    }
});
    
    
    