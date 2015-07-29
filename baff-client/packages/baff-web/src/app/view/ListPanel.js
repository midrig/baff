/**
 *  A ListPanel provides a panel for presenting a list of business entity data.  It is typically presented in 
 *  a {@link Baff.app.view.ListFormView} or {@link Baff.app.view.SelectorView}.
 *  
 *  An example implementation is as follows.  
 *  
 *      Ext.define('MyApp.view.MyListPanel', {
 *         extend: 'Baff.app.view.ListPanel',
 *         alias: 'widget.mylistpanel',
 *         requires: ['MyApp.view.MySearchPanel'],
 *                 
 *         title: 'My List',
 *         filterPanel: 'myfilterpanel',  // alias of MyApp.view.MySearchPanel (optional)
 *         hideSearchPanel: true,
 *         
 *         columns: [{
 *             xtype: 'refdatacolumn',  
 *             text: 'Foo',
 *             dataIndex: 'foo',
 *             refdataClass: "REFDATA.FOO",
 *             filter: true,        // Sets a filter widget on the column header           
 *             hideable: false,                
 *             flex: 1
 *             },{
 *             xtype: 'gridcolumn',  // default, so does not need to be specified
 *             text: 'Bar',
 *             dataIndex: 'bar',
 *             sortable: true, // default
 *             filter: false,                
 *             hideable: false,               
 *             flex: 3
 *             },{
 *             ...
 *             }]
 *         });
 *
 */        
Ext.define('Baff.app.view.ListPanel', {
    extend: 'Ext.grid.Panel',
    xtype: 'listpanel',
    
    requires: ['Ext.grid.filters.Filters',
                     'Baff.app.view.FilterPanel',
                     'Baff.utility.refdata.RefDataColumn'
                 ],
                 
    // Display text for override in locale file 
    dtRecordsFound: "Records found",
    dtFiltered: "(filtered)",
    dtShowSearch: 'Show search panel',
    dtHideSearch: 'Hide search panel',
    dtRefreshList: 'Refresh view',
    
    frame: true,
    
    config: {
        
        /**
        * Specifies a reference to a {@link Baff.app.view.FilterPanel} that provides filtering
        */
        filterPanel: '',
        
        /**
        * Specifies if the record count is to be displayed
        */
        listCount: true,
        
        /**
        * Specifies if the list can be refreshed (will display a refresh widget)
        * Set to false by default as assume there will be a refresh button on the view
        */
        allowRefresh: false,
        
        /**
        * Specifies if the associated {@link Baff.app.view.FilterPanel} specified by {@link #filterPanel}
        * can be shown and hidden
        */
        hideSearchPanel: false
        
        
    },
    
    // Config for correct user interface
    
    height: 1000, // won't display records from a buffered store if not set
        
    selModel: {
        pruneRemoved: false
    },

    viewConfig: {
        markDirty: false,
        stripeRows: true,
        trackOver: false
    },
    
    //reserveScrollbar: true,
    
    /**
     * @event refreshList
     * Fires when the list has been refreshed.
     */

    /**
    * Sets up the user interface components
    * Calls the overridden superclass method.
    */     
    initComponent: function() {
        var me = this;
       
       Ext.apply(me, {            
                plugins: ['gridfilters']            
        });
        
        var tools = [];
        var dockedItems= [];
        
        // Setup the filter panel
        if (me.filterPanel != "") {
            
            dockedItems.push ({ xtype: 'toolbar',
                                              dock: 'top',
                                              itemId: 'filterPanel',
                                              layout: 'anchor',
                                              padding: 5,
                                              hidden: me.hideSearchPanel,    
                                              items: [{
                                                       xtype: me.filterPanel
                                              }]
                                          });
                                              
            // Set up the toolbar widgets                             
            tools.push ({
                    type: 'up',
                    tooltip: me.dtHideSearch,
                    itemId: 'hideSearch',
                    callback: me.onHideSearch,
                    hidden: me.hideSearchPanel
                });
                
                 tools.push ({
                    type: 'search',
                    tooltip: me.dtShowSearch,
                    itemId: 'showSearch',
                    callback: me.onShowSearch,
                    hidden: !me.hideSearchPanel
                });
                                         
        }
        
        // Setup the refresh widget
        if (me.allowRefresh) {
        
            tools.push ({
                    type: 'refresh',
                    itemId: 'refreshList',
                    callback: me.onRefreshList,
                    tooltip: me.dtRefreshList
                });
        }

        // Setup the counter
        if (me.listCount) {
            
           dockedItems.push ({
                        dock: 'bottom',
                        minHeight: 20,
                        xtype: 'toolbar',
                        cls: 'x-tab x-tab-active x-tab-default',
                        items: ['->',{
                            xtype: 'component',
                            itemId: 'listCount',
                            style: 'margin-right:5px'        
                        }]
                });
        }
        
         if (tools.length > 0) {
        
            Ext.apply(me, {
                    tools: tools
                });
        }

        if (dockedItems.length > 0) {

            Ext.apply(me, {
                dockedItems: dockedItems
            });   
        }  
        
        me.on('beforedestroy', me.beforeDestroy, me);
 
        me.callParent(arguments);
        
       
    },
    
    /**
    * Notifies that the refresh widget has been selected
    * @fires refreshList
    */   
    onRefreshList: function (owner, tool) {
        owner.fireEvent('refreshList', owner);
    },
    
    /**
    * Hides the associated {@link Baff.app.view.FilterPanel}.
    * Called when the hide widget is clicked.
    */   
    onHideSearch: function (owner, tool) {      
        var me = owner;
        
        tool.hide();
        me.down('#filterPanel').hide();
        me.down('#showSearch').show();       
    },
    
    /**
    * Shows the associated {@link Baff.app.view.FilterPanel}.
    * Called whe the show widget is clicked.
    */   
    onShowSearch: function (owner, tool) {       
        var me = owner;
        
        tool.hide();
        me.down('#filterPanel').show();
        me.down('#hideSearch').show();       
    },
    
    /**
    * Sets the store used by the list and applies any filters.
    * @param {Baff.app.model.EntityStore} store
    */   
    setEntityStore: function(store) {
        
        var me = this,
                i;
        
         var filters = Ext.ComponentQuery.query('filterfield', me);
        
         for (i=0; i < filters.length; i++) {
            filters[i].setEntityStore(store);
        }
        
        var refdataFilters = Ext.ComponentQuery.query('refdatafilter', me);
        
        for (i=0; i < refdataFilters.length; i++) {
            refdataFilters[i].setEntityStore(store);
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
        
        if (me.getStore().getFieldFilterCount() > 0) {
            text += " " + me.dtFiltered;
        }
               
        if (listCount != null) {
            text += ": " + me.store.getTotalCount();
            listCount.update(text);
        }
        
    },
    
    /**
     * Override to fix binding order (this, then view, then renderer)
     */
    bindStore: function (store, initial) {
       
        var me = this,
            view = me.getView(),
            bufferedRenderer = me.bufferedRenderer;
        
        if (store) {
            me.store = store;

            // This needs to happen before binding th renderer otherwise it can result in the view
            // attempting to work on a null store
            if (view.store !== store) {
                view.bindStore(store, false);
            }
   
            if (bufferedRenderer && bufferedRenderer.isBufferedRenderer && bufferedRenderer.store) {
                bufferedRenderer.bindStore(store);
            }
      
            me.mon(store, {
                load: me.onStoreLoad,
                scope: me
            });
            me.storeRelayers = me.relayEvents(store, [
                'filterchange',
                'groupchange'
            ]);
        } else {
            me.unbindStore();
        }
    
    }
    
    
});