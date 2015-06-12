/**
 *  A TreePanel provides a panel for presenting a tree of nodes that represent business entity data.  
 *  It is typically presented in a {@link Baff.app.view.SelectorView} or a {@link Baff.app.view.CardView}.
 *  
 *  An example implementation is as follows.  
 *  
 *      Ext.define('MyApp.view.MyTreePanel', {
 *         extend: 'Baff.app.view.TreePanel',
 *         alias: 'widget.mytreepanel'
 *         
 *         title: 'My Tree Panel',
 *         allowRefresh: true,
 *         allowExpand: true,
 *         
 *         columns: [{
 *             xtype: 'treecolumn',
 *             text: 'Foo',
 *             dataIndex: 'foo',  
 *             flex: 1
 *             },{
 *             text: 'Bar',
 *             dataIndex: 'bar',
 *             flex: 2
 *             },{
 *             ...
 *             }]
 *         });
 *         
 */         
Ext.define('Baff.app.view.TreePanel', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.bafftreepanel',
    
    config: {

        /**
        * Specifies if the list can be refreshed (will display a refresh widget)
        * Set to false by default as assume there will be a refresh button on the view
        */
        allowRefresh: false,
        
        /**
        * Specifies if the tree can be fully expanded.
        * Defaults to false given potential processing involved
        * to retrieve all nodes
        */
        allowExpand: false,
        
        /**
        * Specifies if the tree can be fully collapsed.
        * Default to true
        */
        allowCollapse: true
        
        
    },

    // Display text for locale override
    dtRefreshList: 'Refresh view',
    dtExpand: 'Expand all',
    dtCollapse: 'Collapse all',
    
    // Superclass configuration
    rootVisible: false,
    frame: true,
    reserveScrollbar: true,
    lines: true,
    
     /**
    * Sets up the user interface components
    * Calls the overridden superclass method.
    */     
    initComponent: function() {
        var me = this;
       
        var tools = [];
        
        if (me.allowExpand) {
            
            tools.push ({
                    type: 'expand',
                    tooltip: me.dtExpand,
                    itemId: 'expandAll',
                    callback: function(owner)  {owner.expandAll();}
                });
        }
            
         if (me.allowCollapse) {
        
            tools.push ({
                    type: 'collapse',
                    tooltip: me.dtCollapse,
                    itemId: 'collapseAll',
                    callback: function(owner) {owner.collapseAll();}
                });
                
        }    
                            
        if (me.allowRefresh) {
        
            tools.push ({
                    type: 'refresh',
                    itemId: 'refreshList',
                    callback: me.onRefreshList,
                    tooltip: me.dtRefreshList
                });
        }
        
         if (tools.length > 0) {
        
            Ext.apply(me, {
                    tools: tools
                });
        }
      
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
     * Sets the tree store
     * @param {Baff.app.model.TreeStore} store
     */
    setEntityStore: function(store) {
        this.setStore(store);
    },
    
    /**
     * Does nothing
     */
    updateSearchCount: function() {
        
    }
   
});