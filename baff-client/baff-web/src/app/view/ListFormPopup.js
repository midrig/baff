/**
 *  An ActivityPopup extends {@link Baff.app.view.ActivityView} to provide a popup windowed version 
 *  (as opposed the superclass tab based version).  Please refer to the superclass description for more
 *  details.
 */  

Ext.define('Baff.app.view.ListFormPopup', {
    extend: 'Baff.app.view.ListFormView',
    xtype: 'listformpopup',

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