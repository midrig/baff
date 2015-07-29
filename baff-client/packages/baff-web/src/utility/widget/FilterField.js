/**
 *  A FilterField provides a form text field to capture search criteria and filters a 
 *  {@link Baff.app.model.EntityStore}.  The field is typically defined on a parent 
 *  {@link Baff.app.view.FilterPanel} through it's 'xtype', which in turn is associated with a 
 *  parent {@link Baff.app.view.ListPanel}.
 */          
Ext.define('Baff.utility.widget.FilterField', {
    extend: 'Ext.form.field.Text',
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
        search: {
            weight: 1,
            cls: Ext.baseCSSPrefix + 'form-search-trigger',
            handler: 'onSearchClick',
            scope: 'this'
        }
    },

    /**
     * Specifies the field name to be filtered
     * @cfg (required)
     */
    filterFieldName : 'filterFieldName not defined',

    /**
    * Sets a handler so that the the search will be initiated if the the field is navigated away from via
    * one of the 'special' keys.
    * Calls the overridden superclass method.
    */      
    initComponent: function() {
        var me = this;;

        me.callParent(arguments);
        me.on('specialkey', function(f, e){
            if (e.getKey() == e.ENTER) {
                me.onSearchClick();
            }
        });
        
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
            value = me.getValue(),
            oldActiveFilter = me.activeFilter;

        if (value.length > 0) {
            me.activeFilter = new Ext.util.Filter({
                property: me.filterFieldName,
                value: "%" + value + "%"
            });
            
            if (me.entityStore)
                me.entityStore.addFieldFilter(me.activeFilter);
            
            me.getTrigger('clear').show();
            me.updateLayout();
        }
    }
});

