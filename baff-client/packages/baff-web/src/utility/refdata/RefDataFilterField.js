/**
 *  A RefDataFilterField is a form combo box bound to a reference data class that is used to filter
 *  a store. It provides similar functionality to a {@link Baff.app.view.FilterField}.
 *  
 *  A typical configuration when defining fields for a {@link Baff.app.view.FilterPanel} is:
 *          
 *        items: [{
 *              fieldLabel: 'Filter Bar',
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
     * Handlers for the 'clear' and 'search' widgets
     * @private
     */
    triggers: {
        clear: {
            weight: 0,
            cls: Ext.baseCSSPrefix + 'form-clear-trigger',
            hidden: true,
            handler: 'onClearClick',
            scope: 'this'
        },
        picker: {
            weight: 1,
            handler: 'onTriggerClick',
            scope: 'this'            
        }
    },
    
    /**
     * Specifies the field name to be filtered
     * @cfg (required)
     */
    filterFieldName : 'filterFieldName not defined',

    /**
    * Sets a handler so that the the search will be initiated if a field is selected
    * Calls the overridden superclass method.
    */     
    initComponent: function() {
        var me = this;
        
        me.callParent(arguments);
        me.on('select', me.onSearchClick, me);      
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
            me.setValue(0);
            
            if (me.entityStore)
                me.entityStore.removeFieldFilter(activeFilter);
            
            me.activeFilter = null;
            me.getTrigger('clear').hide();
            me.updateLayout();
        }
    },

    /**
    * Sets the {@link #activeFilter}.  Notifies any parent {@link Baff.app.view.ListPanel}.
    * Called when the search widget is clicked.
    */  
    onSearchClick : function(){
        var me = this,
            value = me.getCode(),
            oldActiveFilter = me.activeFilter;
    
        if (value > 0) {
            me.activeFilter = new Ext.util.Filter({
                property: me.filterFieldName,
                value: value
            });
            
            if (me.entityStore) 
                me.entityStore.addFieldFilter(me.activeFilter);
                
            me.getTrigger('clear').show();           
            me.updateLayout();
        }
    }
});