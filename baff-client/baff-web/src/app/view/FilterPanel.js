/**
 *  A FilterPanel provides a panel for presenting {@link Baff.app.view.FilterField}s and
 *  {@link Baff.utility.refdata.RefDataFilterField}s to support a {@link Baff.app.view.ListPanel} where it
 *  is specfied via the {@link Baff.app.view.ListPanel #filterPanel} configuration property.
 *  
 *   An example implementation is as follows:
 *   
 *    Ext.define('Myapp.view.MyFilterPanel', {
 *        extend: 'Baff.app.view.FilterPanel',
 *        
 *        alias: 'widget.myfilterpanel',
 *        
 *        items: [{
 *              fieldLabel: 'Search Foo',
 *              xtype: 'filterfield',
 *              filterFieldName: 'foo'
 *            },{
 *              fieldLabel: 'Filter Bar',
 *              xtype: 'refdatafilter',
 *              refdataClass: 'REFDATACLASS.BAR',
 *              filterFieldName: 'bar'
 *            }
 *        ]   
 *    }); 
 *
 */        
Ext.define('Baff.app.view.FilterPanel', {
    extend: 'Ext.form.Panel',
    xtype: 'filterpanel',   
   
    //frame: true,
    padding: '5 5 0 5',
    border: false,
    
    bodyStyle: {
                background: 'transparent'
            },
    
    fieldDefaults: {
            labelAlign: 'left',
            labelWidth: 150
        }

});