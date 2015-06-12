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
 *        config: {
 *        
 *           width: 500,
 *           height: 500,
 *        
 *            items: [{
 *                  label: 'Search Foo',
 *                  xtype: 'filterfield',
 *                  filterFieldName: 'foo'
 *                },{
 *                  label: 'Filter Bar',
 *                  xtype: 'refdatafilter',
 *                  refdataClass: 'REFDATACLASS.BAR',
 *                  filterFieldName: 'bar'
 *                }
 *            ]
 *        }   
 *    }); 
 *
 */        
Ext.define('Baff.app.view.FilterPanel', {
    extend: 'Ext.form.Panel',
    xtype: 'filterpanel',
    
    requires:['Baff.app.view.FilterField',
                'Baff.utility.refdata.RefDataFilterField'],
            
    listPanel: null, 
    
    config: {
        
        modal: true,
        hideOnMaskTap: true,  // Do not change
        centered: true,
        scrollable: 'vertical',
        width: 300,
        height: 150,
        
        layout: 'vbox',
        
        showAnimation: {
            type: 'popIn',
            duration: 250,
            easing: 'ease-out'
        },
        hideAnimation: {
            type: 'popOut',
            duration: 250,
            easing: 'ease-out'
        }
            
    }
});