/**
 * A Viewport presents the {@link Baff.utility.application.MainHeader} and the main view specified by
 * Utils.globals.mainView .
 */
Ext.define('Baff.utility.application.Viewport', {
    extend: 'Ext.container.Viewport',
    //cls: 'app-background',
    requires: ['Baff.utility.application.MainHeader'],
    //padding: 5,
    
    cls: 'x-tab-bar-default',
    
    dtLoading: "Please wait....",
    loaders: null,
    
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    
    /**
     * Initialise the view.
     */
    initComponent: function() {
        var me = this;
        
        me.loaders = new Ext.util.HashMap();
        
        Ext.apply(me, {
             items: [
                {
                     xtype: 'mainheader',
                     frame: true
                 }, 
                 {
                     xtype: Utils.globals.mainView,
                     frame: true,
                     flex: 1
                 }]
         });
         
    me.callParent(arguments);
         
    },
    
    /**
    * Shows / hides the wait mask.
    * @param {boolean} [show="false"]
    * @param {String} The component requesting the load
    * @protected
    */    
    showWaitMask: function (show, id) {
        var me = this;
        
        if (show) {        
            
            me.loaders.add(id, "loading");
            me.setLoading(me.dtLoading);
            
        } else {
                       
            me.loaders.removeAtKey(id);
            
            if (me.loaders.getCount() <= 0) {
                me.setLoading(false);
            }
            
        }
    },
    
    showAlertMessage: function (title, message, callback) {
        var me = this;
       
        Ext.Msg.alert(title, message, function(buttonId, text) {
           
            // Check if the load mask should be applied 
            if (me.loaders.getCount() > 0)
                 me.setLoading(me.dtLoading);  

            if (callback != null)
                callback(buttonId, text); 

         });
        
    }
   
    
});