Ext.define('Evaluator.view.evalcard.EvalTreePanel', {
    extend: 'Baff.app.view.TreePanel',
    alias: 'widget.evaltreepanel',
    
    title: 'Evaluation Group > Scorecard > Option',
    
    allowRefresh: true,
    allowExpand: true,
    
    columns: [{
            xtype: 'treecolumn',
            text: 'Name',
            dataIndex: 'name',
            flex: 1
        }, {
            text: 'Description',
            dataIndex: 'description',
            flex: 1
        },{
                xtype: 'actioncolumn',
                icon: 'resources/baff/go.png',
                reference: 'actioncol',
                width: 30,
                filterable: false,
                hideable: false,
                handler: 'onListButton',
                isDisabled: function(view, rowIndex, colIndex, item, record) {                    
                    var name = record.get('entityType');
                    if (name == 'Option' && !record.isLeaf())
                        return false;
                    else if (name == 'Scorecard')
                        return false;
                    else
                        return true;                   
                },
                getTip: function(value, meta, record) {
                    if (record.get('entityType') == 'Option')
                        return 'View ' + record.get('name') + ' scores';
                    else
                        return 'View ' + record.get('name') + ' details';
                }
                
            }
    ]
   
});