/**
 *  A FilterField provides a form text field to capture search criteria and filters a 
 *  {@link Baff.app.model.EntityStore}.  The field is typically defined on a parent 
 *  {@link Baff.app.view.FilterPanel} through it's 'xtype', which in turn is associated with a 
 *  parent {@link Baff.app.view.ListPanel}.
 */          
Ext.define('Baff.app.view.FilterField', {
    extend: 'Ext.field.Search',
    xtype: 'filterfield',
    
    /**
     * The {@link Baff.app.model.EntityStore} this field filters
     * @private
     */
    entityStore: null,
    
    /**
     * The currently active {Ext.util.Filter}
     * @private
     */
    activeFilter: null,  
   

    /**
     * Specifies the field name to be filtered
     * @cfg (required)
     */
    filterFieldName : 'filterFieldName not defined',
    
    // Display text for locale override
    dtLoading: "Please wait....",

    /**
    * Sets a handler so that the the search will be initiated if the the field is navigated away from via
    * one of the 'special' keys.
    * Calls the overridden superclass method.
    */      
    initialize: function() {
        var me = this;;

        me.callParent(arguments);
        me.on('action', me.onSearchClick, me);  
        me.on('clearicontap', me.onClearClick, me); 
    },
    
    /**
    * Sets {@link #entityStore}
    * @param {Baff.app.model.EntityStore} store
    */      
    setEntityStore: function(store) {
        var me = this;
  
        me.onClearClick();
        me.entityStore = store;
        
    },

    /**
    * Clears the {@link #activeFilter} if set.  Notifies any parent {@link Baff.app.view.ListPanel}.
    * Called when the clear widget is clicked.
    */  
    onClearClick : function(){
        var me = this,
            activeFilter = me.activeFilter;

        if (activeFilter) {
            me.setValue('');
            
            if (me.entityStore) {
                var listPanel = me.getParent().listPanel;
                if (listPanel != null) {
                    listPanel.incrementFilterCount(-1);
                }
            
                me.entityStore.removeFilter(me.activeFilter)
                
                me.showWaitMask(true);
                me.entityStore.load({
                    callback: function() {
                        me.showWaitMask(false);
                    }
                });                
            }
            
            me.activeFilter = null;
            
        }
    },

    /**
    * Sets the {@link #activeFilter}.  Notifies any parent {@link Baff.app.view.ListPanel}.
    * Called when the search widget is clicked.
    */  
    onSearchClick : function(){
        var me = this,
            value = me.getValue(),
            oldActiveFilter = me.activeFilter;
   
        if (value.length > 0) {
            me.activeFilter = new Ext.util.Filter({
                property: me.filterFieldName,
                value: "%" + value + "%"
            });
            
            if (me.entityStore) {
                if (oldActiveFilter != null) {
                    me.entityStore.removeFilter(oldActiveFilter);
                } else {
                    var listPanel = me.getParent().listPanel;
                    if (listPanel != null) {
                        listPanel.incrementFilterCount(1);
                    }
                }
                
                me.entityStore.addFilter(me.activeFilter)
                
                me.showWaitMask(true);
                me.entityStore.load({
                    callback: function() {
                        me.showWaitMask(false);
                    }
                });           
                
            }
            
        } else {
            me.onClearClick();
        }
        
        me.getParent().hide();
        
    },
    
    /**
    * Shows / hides the wait mask.
    * @param {boolean} [show="false"]
    * @protected
    */    
    showWaitMask: function (show) {
        var me = this;
        if (show) {
            me.getParent().setMasked({xtype: 'loadmask', message: me.dtLoading}); 
            me.getParent().setHideOnMaskTap(false);
        }else {
            me.getParent().setMasked(false);
            me.getParent().setHideOnMaskTap(true);
        }
    }
});

