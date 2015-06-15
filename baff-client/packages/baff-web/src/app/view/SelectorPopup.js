/**
 *  A SelectorPopup extends {@link Baff.app.view.SelectorView} to provide a popup windowed version 
 *  (as opposed the superclass tab based version).  Please refer to the superclass description for more
 *  details.
 */  

Ext.define('Baff.app.view.SelectorPopup', {
    extend: 'Baff.app.view.SelectorView',
    xtype: 'selectorpopup',

    config: {
        
        /**
        * Specifies the width of the popup window
        */
        width: 800,
        
        /**
        * Specifies the height of the popup window
        */
        height: 600,
        
         /**
         * Sepecifies if the popup is modal.
         * Defaults to true - set to false for a floating cross-domain window, e.g. to present summary view
         */        
        modal :true,
        
        /**
        * Specifies a reference to the select button for this view. If set to '' the select button will not be
        * created, however generally this is not necessary as the controller will manage button state.
        */
        selectButton: 'selectBtn',
        
        // The following specify the required user interface configuration for a popup window
        draggable: true,
        resizable: true,
        closable: true,
        border: true,
        frame: false,
        floating: true,

        // Don't destroy the view when it's closed
        closeAction: 'hide'
        
    }
    
    

});