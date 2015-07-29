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
 *          items: [{              
 *              // Fieldset: FooBar               
 *              xtype: 'fieldset',
 *              title: 'Fieldset Foo',
 *              collapsible: true,
 *              items: [{                  
 *                  // Row: Foo and Bar                  
 *                  xtype: 'container',
 *                  layout: 'hbox',
 *                  items: [{
 *                      xtype: 'textfield',
 *                      name: 'foo',
 *                      fieldLabel: 'Foo',
 *                      flex: 2
 *                  },{
 *                      xtype: 'refdatacombobox',
 *                      name: 'bar',
 *                      fieldLabel: 'Bar',
 *                      refdataClass: 'REFDATA.BAR',
 *                      flex: 1
 *                  }]
 *              },{
 *                  // Row: Another Row
 *                  ...
 *              }],
 *          },{
 *              // Fieldset: Another Fieldset
 *              ...
 *          }]
 *      });
 *
 */        
Ext.define('Baff.app.view.FormPanel', {
    extend: 'Ext.form.Panel',
    xtype: 'formpanel',
    requires: [
        'Ext.form.FieldSet', 
        'Ext.form.field.Radio', 
        'Ext.form.RadioGroup', 
        'Ext.toolbar.Toolbar', 
        'Ext.form.ComboBox',
        'Baff.utility.refdata.RefDataManager', 
        'Baff.utility.refdata.RefDataComboBox'
    ],
    
    // The following config sets up the user interface
    bodyPadding: 10,
    frame: true,
    scrollable: 'vertical',
    
    fieldDefaults: {
            labelAlign: 'right'
        },
    
    /**
     * Resets all the fields in the form to their original values
     */
    setCleanRecord: function () {

        this.getForm().getFields().each(function(field) {
            field.resetOriginalValue();
            field.reset();
        });
    
    },
    
    /**
     * Sets all the fields in the form read only (or editable if false)
     * @param {boolean}
     */
    makeReadOnlyForAll: function(readOnly) {
        
        Ext.suspendLayouts();
        
        this.getForm().getFields().each(function(field) {
          if (readOnly || field.config.readOnly !== true)
              field.setReadOnly(readOnly);
        });
        
        Ext.resumeLayouts();
    }
    
});