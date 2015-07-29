Ext.define('Baff.utility.widget.RatingPicker', {
    extend: 'Ext.ux.rating.Picker',
    xtype: 'ratingpicker',
    
    requires: ['Ext.ux.rating.Picker'],
    
    readOnly: false,
    
    config: {
        
        glyphs: [9675, 9679]  // circles
        //glyphs: [9786, 9787]  // faces
        //glyphs: [9734, 9733]  // stars
        
    },
    
    onClick: function() {
        if (this.readOnly)
            return;
        else
            this.callParent(arguments);
    },
    
    onMouseEnter: function() {
        if (this.readOnly)
            return;
        else
            this.callParent(arguments);
    },
    
    onMouseLeave: function() {
        if (this.readOnly)
            return;
        else
            this.callParent(arguments);
    },
    
    onMouseMove: function() {
        if (this.readOnly)
            return;
        else
            this.callParent(arguments);
    },
    
    setReadOnly: function(readOnly) {
        this.readOnly = readOnly;
    }
    
});

