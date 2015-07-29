/**
 *  An ImageField displays an image and, optionally, provides a button to select an image to be uploaded. 
 * 
 */          
Ext.define('Baff.utility.widget.RatingField', {
    extend: 'Ext.form.FieldContainer',
    xtype: 'ratingfield',
    
    requires: ['Ext.form.TextField',
                    'Ext.ux.rating.Picker'],
      
    mixins: [
        'Ext.form.field.Field'],
        
    config: {
        
        name: '',
        readOnly: false,
        color: null,
        minWidth: 300,
        scale: '300%',       
        labelStyle: 'padding-top: 18px',    
        
        ratingPickerConfig: {
            
            minimum: 0,
            limit: 5,
            width: 150,
            glyphs: [9675, 9679]  // circles
            //glyphs: [9786, 9787]  // faces
            //glyphs: [9734, 9733]  // stars
            
        }
    },

    /**
     * Initialises the component
     */
    initComponent: function() {
        var me = this;
       
        me.readOnly = me.getReadOnly();
        
        var items = [];
        
        var ratingPickerConfig = me.getRatingPickerConfig();
        ratingPickerConfig.xtype = 'ratingpicker';
        ratingPickerConfig.scale = me.getScale();
        ratingPickerConfig.itemId = 'rp_' + me.getName();
               
        var col = me.getColor();
        
        if (col != null) {
            ratingPickerConfig.overStyle = 'color: ' + col;
            ratingPickerConfig.selectedStyle = 'color: ' + col;
          }
            
        items.push(ratingPickerConfig);
        
        if (!me.readOnly && me.ratingPickerConfig.minimum == 0) {

            var clearPickerConfig = {
                xtype: 'ratingpicker',
                itemId: 'rp_clear',
                minimum: 0,
                limit: 1,
                scale: me.getScale(),
                glyphs: [9676, 9676], // circles
                //glyphs: [9785, 9785], // faces
                //glyphs: [10024, 10024], // stars            
                overStyle: 'color: red',
                tooltip: 'clear rating'
            };

            items.push(clearPickerConfig);
        
        }
          
        Ext.apply(me, {
                 items: items
            });             
            
        me.callParent(arguments);   
        me.initField();
        
        me.ratingPicker = me.getComponent('rp_' + me.getName());
        me.clearPicker = me.getComponent('rp_clear');
        
        if (me.isDisabled() || me.readOnly) {
            me.ratingPicker.setReadOnly(true);
            
            if (me.clearPicker != null)
                me.clearPicker.setReadOnly(true);
        }
        
        me.on('change', me.onFieldChange, me);
        me.ratingPicker.on('change', me.onRatingChange, me);
        
        if (me.clearPicker != null)
            me.clearPicker.on('change', me.onClearChange, me);
        
    },
    
    onRatingChange: function (picker, value) {
        var me = this;
        me.un('change', me.onFieldChange, me);
        me.setValue(value);
        me.on('change', me.onFieldChange, me);
        
    },
    
    onClearChange: function (picker, value) {
        var me = this;
        me.ratingPicker.setValue(0);
        me.clearPicker.setValue(0);
    },
    
    onFieldChange: function (field, value) {
        var me = this;
        me.ratingPicker.un('change', me.onRatingChange, me);
        me.ratingPicker.setValue(value);
        me.ratingPicker.on('change', me.onRatingChange, me);
    },
    
    setReadOnly: function(readOnly) {
        if (this.ratingPicker != null)
            this.ratingPicker.setReadOnly(readOnly || this.isDisabled());
        
        if (this.clearPicker != null)
            this.clearPicker.setReadOnly(readOnly || this.isDisabled());
        
        this.readOnly = readOnly;
    },
    
    enable: function() {
        if (this.ratingPicker != null && !this.readOnly)
            this.ratingPicker.setReadOnly(false);
        
        if (this.clearPicker != null && !this.readOnly)
            this.clearPicker.setReadOnly(false);        
        
        this.callParent(arguments);
    },
    
    disable: function() {
        if (this.ratingPicker != null)
            this.ratingPicker.setReadOnly(true);
        
        if (this.clearPicker != null)
            this.clearPicker.setReadOnly(true);
          
        this.callParent(arguments);
    }
});

