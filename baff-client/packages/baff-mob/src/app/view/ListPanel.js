/**
 *  A ListPanel provides a panel for presenting a list of business entity data.  It is typically presented in 
 *  a {@link Baff.app.view.ListFormView} where it is specified via the 
 *  {@link Baff.app.view.FormView #formPanel} configuration property, or similarly for a
 *  {@link Baff.app.view.SelectorView}.
 *  
 *  An example implementation is as follows.  
 *  
 *      Ext.define('MyApp.view.MyListPanel', {
 *         extend: 'Baff.app.view.ListPanel',
 *         alias: 'widget.mylistpanel',
 *         requires: ['MyApp.view.MySearchPanel'],
 *         
 *         config: {
 *                 
 *             filterPanel: 'myfilterpanel',  // alias of MyApp.view.MySearchPanel (optional)
 *         
 *             itemTpl: new Ext.XTemplate (
 *                          '<div class="baff-list">',
 *                          '<div class="baff-list-main" style="width:30%">{[this.getValueFromFunction(values)]}</div>',   
 *                          '<div class="baff-list-main" style="width:70%">{foo}</div>',                         
 *                          '<div class="baff-list-detail" style="width: 100%">{bar}</div>',
 *                          '</div>',
 *                          {
 *                               getValueFromFunction: function(values) {
 *                                   ...
 *                                   return someValue;
 *                                  }
 *                          })
 *         };
 *
 */        
Ext.define('Baff.app.view.ListPanel', {
    extend: 'Ext.dataview.List', 
    xtype: 'listpanel',
    requires: ['Ext.plugin.ListPaging'],
    
    /**
     * A count of the filters applied as set by an associated {@link Baff.app.view.FilterField}.
     * Used to display the "filtered" text on count
     * @private
     */
    filterCount: 0,
    
    // Display text for override in locale file 
    dtRecordsFound: "Records found",
    dtFiltered: "(filtered)",
    
    filterPanel: null,
    
    config: {
        
        /**
        * Sets the loading text, set to '' as this is handled by the framework.
        * @private
        */
        loadingText: '',
        
        /**
        * Specifies a reference to a {@link Baff.app.view.FilterPanel} that provides filtering
        */
        filterPanel: '',
        
        /**
        * Specifies if the record count is to be displayed
        */
        listCount: true,
        
        /*
         * Specifies to shade every other row
         */
        striped: true,
        
        /*
         * Enables paging
         */
        plugins: [{ 
                type: 'listpaging',
                autoPaging: true,
                noMoreRecordsText: '',
                loadMoreText: 'More...'
         }]
    },
    
    /**
     * @event refreshList
     * Fires when the list has been refreshed.
     */

    /**
    * Sets up the user interface components
    * Calls the overridden superclass method.
    */     
    initialize: function() {
        var me = this;
        
        var items = [];
        
         // Setup the counter
        if (me.getListCount()) {
            
           items.push ({
                        docked: 'bottom',
                        height: 20,
                        xtype: 'toolbar',
                        itemId: 'listCount',
                        cls: 'baff-toolbar'
                });
        }
        
        me.add(items);
        
         if (me.getFilterPanel() != '') {   
            me.filterPanel = Ext.widget(me.getFilterPanel());
        }
        
        me.callParent(arguments);
        
        //me.getScrollable().getScroller().on('scrollend', me.onScrollEnd, me);
       
    },
    
    
    /**
    * Hides the associated {@link Baff.app.view.FilterPanel}.
    * Called when the hide widget is clicked.
    */   
    onHideSearch: function () {      
        var me = this;
             
    },
    
    /**
    * Shows the associated {@link Baff.app.view.FilterPanel}.
    * Called whe the show widget is clicked.
    */   
    onShowSearch: function () {       
        var me = this;
        
        if (me.filterPanel.listPanel == null) {
            me.filterPanel.listPanel = me;
            Ext.Viewport.add(me.filterPanel);
        }
        
        me.filterPanel.show();
          
    },
    
    /**
    * Removes any filters from the store (necessary if the store is shared).
    * Called before the pane is destroyed.
    */   
    beforeDestroy: function() {
        var me = this;
        
        if (me.filterPanel != null) {
            var filters = Ext.ComponentQuery.query('filterfield', me.filterPanel);
        
            for (i=0; i < filters.length; i++) {
               filters[i].onClearClick();
           }
    
            var refdataFilters = Ext.ComponentQuery.query('refdatafilter',  me.filterPanel);

            for (i=0; i < refdataFilters.length; i++) {
                refdataFilters[i].onClearClick();
            }
        }
        
        return true;
        
    },
    
    /**
    * Sets the store used by the list and applies any filters.
    * @param {Baff.app.model.EntityStore} store
    */   
    setEntityStore: function(store) {

        var me = this,
                i;
        
        if (me.filterPanel != null) {
            var filters = Ext.ComponentQuery.query('filterfield', me.filterPanel); 

             for (i=0; i < filters.length; i++) {
                filters[i].setEntityStore(store);
            }

            var refdataFilters = Ext.ComponentQuery.query('refdatafilter', me.filterPanel);

            for (i=0; i < refdataFilters.length; i++) {
                refdataFilters[i].setEntityStore(store);
            }
        }
 
        me.setStore(store);
    },
    
    /**
    * Updates the serach count display.  Should be called by a controller when the store has been updated.
    * Note that listening to the 'totalcountchange' event is not reliable.
    */   
    updateSearchCount: function() {       
        var me = this;
        
        var listCount = me.down('#listCount');
        
        var text = me.dtRecordsFound;
        
        if (me.filterCount > 0) {
            text += " " + me.dtFiltered;
        }
               
        if (listCount != null) {
            var count = me.getStore().getTotalCount();
            if (count == null)
                count = 0;
            text += ": " + count;
            listCount.setTitle(text); 
        }
        
    },
    
    /**
    * Increments the filter count applied by the filters in the associated {@link Baff.app.view.FilterPanel}
    * @param {integer} increment
    */   
    incrementFilterCount: function(increment) {
        
        var me = this;
        me.filterCount +=increment;
 
    }
    
    
});