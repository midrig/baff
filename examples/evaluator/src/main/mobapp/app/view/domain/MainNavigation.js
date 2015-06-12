Ext.define('Evaluator.view.domain.MainNavigation', {
    extend: 'Baff.app.view.DomainView',
    
    alias: 'widget.mainnavigation',
    requires: [    ],
    
    config: {
        
        topTitle: 'Scorecard',

        items: [ {
                xtype: 'evalgroupselectorview',
                iconCls: 'evalgrps',
                title: 'Eval Groups'
            },{
                xtype: 'scorecardview',
                iconCls: 'bookmarks',
                title: 'Scorecards'
            },{
                xtype: 'criteriaview',
                iconCls: 'settings',
                title: 'Criteria'
            },{
                xtype: 'optionview',
                iconCls: 'compose',
                title: 'Options'
            },{
                xtype: 'scoreview',
                iconCls: 'star',
                title: 'Scores'
            },{
                xtype: 'analysisview',
                iconCls: 'info',
                title: 'Analysis'
            }
            
           
        ]
    },
    
    /**
    * Sets up the docked items.
    * @return {Array} The list of items
    * @protected    
    */         
   setupDockedItems: function() {
       var me = this;
       
       var items = [];
         
        // Restart Button
        items.push({           
                    xtype: 'button',
                    itemId: 'restartButton',
                    iconCls: 'restart',
                    iconAlign: 'top',
                    text: 'Restart',
                    cls: 'baff-button',
                    docked: 'right'
                    });
                    
        return items;
        
    }
    
});