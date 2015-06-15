/**
 *  An sliderfield that displays the value of the slider in the label 
 * 
 */          
Ext.define('Baff.app.view.LabelSliderField', {
    extend: 'Ext.field.Slider',
    xtype: 'labelsliderfield',
    
    initialize: function() {
        var me = this;
        
        me.callParent(arguments);
        me.on('painted', me.setLabelOnChange, me);
        me.on('change', me.setLabelOnChange, me);
        me.on('drag', me.setLabelOnChange, me);
  
    },
    
    setLabelOnChange: function() {
        this.setLabel(this.config.label+ ': (' + this.getValue() + '%)'); 
    },
    
    reset: function() {
        var me = this;
        
        if (this.originalValue != null) {
            me.setValue(this.originalValue)  
        }
        
        me.setLabelOnChange();
        
    }
       
    
});

