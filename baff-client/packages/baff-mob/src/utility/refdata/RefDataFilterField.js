/**
 *  A RefDataFilterField is a form combo box bound to a reference data class that is used to filter
 *  a store. It provides similar functionality to a {@link Baff.app.view.FilterField}.
 *  
 *  A typical configuration when defining fields for a {@link Baff.app.view.FilterPanel} is:
 *          
 *        items: [{
 *              label: 'Filter Bar',
 *              xtype: 'refdatafilter',
 *              refdataClass: 'REFDATACLASS.BAR',
 *              filterFieldName: 'bar'
 *            },
 *            ...
 *                  
 */
Ext.define('Baff.utility.refdata.RefDataFilterField', {
    extend: 'Baff.utility.refdata.RefDataComboBox',
    xtype: 'refdatafilter',
    
    /**
    * The entity store to be filtered
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
    
    config: {
        
        // Makes the field look like a search field instead of a combo box 
        ui: 'search',
        
        // Adds an icon to clear the field
        clearIcon: true
        
    },
            

    /**
    * Sets a handler so that the the search will be initiated if a field is selected
    * Calls the overridden superclass method.
    */     
    initialize: function() {
        var me = this;
        
        //me.element.addCls(Ext.baseCSSPrefix + 'field-clearable');
        me.callParent(arguments);
        me.on('select', me.onSearchClick, me);   
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
    
        me.setValue(null);
        
        var usePicker = me.getUsePicker();
        var picker = usePicker ? me.picker : me.listPanel;
        
        if (picker) {
            picker = picker.child(usePicker ? 'pickerslot' : 'dataview');
            picker.deselectAll();
        }

        if (activeFilter) {
            
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
    setValue : function(value){
        var me = this,
            oldValue = me.getValue(),
            oldActiveFilter = me.activeFilter;
    
        me.callParent(arguments);
        value = me.getValue();
        
        if (value != null && value != oldValue) {
            me.activeFilter = new Ext.util.Filter({
                property: me.filterFieldName,
                value: value
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
            
        }
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