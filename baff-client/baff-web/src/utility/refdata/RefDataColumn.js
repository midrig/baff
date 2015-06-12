/**
 *  A RefDataColumn is a grid column bound to a reference data class, and which can be filtered
 *  on the values of the reference data.
 *  
 *  Note: If the view that this belongs to is displayed early it may be necessary to pre-load the
 *  reference data store.
 *  
 *  A typical configuration when defining columns for a {@link Baff.app.view.ListPanel} is:
 *  
 *      columns: [{
 *             text: 'Foo',
 *             dataIndex: 'foo',
 *             xtype: 'refdatacolumn',  
 *             refdataClass: "REFDATA.FOO",
 *             filter: true,        // Sets a filter widget on the column header           
 *             hideable: false,                
 *             flex: 1
 *             },{
 *             ....
 *  
 */
Ext.define('Baff.utility.refdata.RefDataColumn', {
    extend: 'Ext.grid.column.Column',
    xtype: 'refdatacolumn',
    requires: ['Baff.utility.Utilities'],
    
    config: {
        
        /**
        * Specifes the reference data class to be used
        * @cfg refdataClass (required)
        */
        refdataClass: null,
        
        /**
        * Specifes if this column is sortable
        */
        sortable: false,
        
        /**
        * Specifes if this column can be filtered (using the reference data values)
        */
        filter: true
        
    },
    
    /**
    * Setup the component by defining a renderer and applying the filter.
    * Calls the overridden superclass method.
    * Called on initialisation.
    */
    initComponent: function() {
        var me = this;        
        me.callParent(arguments);
        
        // Render the field by decoding the reference data
        Ext.apply(me, {
            
                renderer: function(value) {
                        return Utils.refDataManager.getDecode(value, me.refdataClass);
                }
        });
        
        if (!me.filter)
            return;
        
        // Setup the filter
        var filterVals = Utils.refDataManager.getCodeDecodeArray(me.refdataClass);
        
        Ext.apply(me, {
        
                filter: {
                    type: 'list',
                    options: filterVals,
                    single: true,
                    idField: 'code',
                    labelField: 'decode'
                }
        });
    },
    
    /**
    * Enable the menu if the filter is available.
    * Calls the overridden superclass method.
    * Called before rendering the component.
    */
    beforeRender: function () {       
        var me = this;
        me.callParent(arguments);
        
        if (me.filter != null && me.filter != false) {
            me.menuDisabled = false;
        }  
    }
    
});