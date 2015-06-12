/**
 *  An ImageField displays an image and, optionally, provides a button to select an image to be uploaded. 
 * 
 */          
Ext.define('Baff.app.view.ImageField', {
    extend: 'Ext.form.FieldContainer',
    xtype: 'imagefield',
    
    requires: ['Ext.Img',
            'Ext.form.field.File'],
    
    mixins: [
        'Ext.form.field.Field'],
    
    imageContainer: null,
    imageSelector: null,
    imageValue: null,
    
    config: {
    
        /**
         * Specifies the default encoding of the image
         */
        encoding: 'data:image/jpeg;base64',
    
        /**
         * Specifies the http request parameter for the image file.  If specified will present a file 
         * selector button, if not then no button will be presented.
         */
        uploadParameter: "imagefile",
        
        /**
         * Specifies the image height, or will by dynamically sized if null
         */
        imageHeight: 100,
        
        /**
         * Specifies the image width, or will by dynamically sized if null
         */
        imageWidth: 100,
        
        /**
         * Specifies the image field background color
         */
        backgroundColor: 'white'
        
    },

    /**
     * Initialises the component
     */
    initComponent: function() {
        var me = this;
       
        var items = [];
       
        items.push({
                    xtype: 'image',
                    itemId: 'imagecontainer',
                    height: me.getImageHeight(),
                    width: me.getImageWidth(),
                    cls: 'x-form-text-wrap-default',
                    style: 'background-color: ' + me.getBackgroundColor()
                });
                
        if (me.getUploadParameter() != null) {
            items.push({
                    xtype: 'filefield',
                    name: me.getUploadParameter(),
                    buttonText: 'Select Image...',
                    hideLabel: true,
                    buttonOnly: true,
                    itemId: 'imageselector', 
                    padding: 5,
                    listeners: {
                        change: me.onSelectFile,
                        scope: me
                    }
            });
        }
        
        Ext.apply(me, {
                 items: items
            });   
            
            
        me.callParent(arguments);    
        me.initField();
        
        me.imageContainer = me.getComponent('imagecontainer');
        me.imageSelector = me.getComponent('imageselector');
        
    },
    
    /**
     * Handles image file selection.
     */
    onSelectFile: function() {
        var me = this;
      
        var file = me.imageSelector.getValue();
        
        if (file != null && file != '') {
            var filename = file.replace(/^.*[\\\/]/, '');

            var el = me.imageContainer.imgEl;
            el.dom.src = '';
            el.dom.alt = filename;
        }
        
    },
    
    /**
     * Sets the value of the image field
     */
    setValue: function(value) {
        var me = this;
        
        var ic = me.imageContainer;
        
        if (ic != null && value != null) {
            if (value == "") {
                ic.setSrc(null);
            } else {
                ic.setSrc(me.encoding + ',' + value);
            }
        }
    },
    
    
    // Needs to be specified for field handling
    setReadOnly: Ext.emptyFn,
    
    /*
     * Resets the file selector
     */
    reset: function() {
        
        var me = this;
        var is = me.imageSelector;
        
        if (is != null)
            is.reset();
        
    },
    
    /*
     * Resets the file selector
     */
    resetOriginalValue: function() {
     
        var me = this;
        var is = me.imageSelector;
        
        if (is != null)
            is.resetOriginalValue();
        
    }
    
    
    /*
    getBase64: function(str) {
        var me = this;
        
        return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1").replace(/ +$/, "").split(" ")));    
    
    }*/
    
    
    
});

