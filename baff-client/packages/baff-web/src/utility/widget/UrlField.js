Ext.define('Baff.utility.widget.UrlField', {
    extend: 'Ext.form.field.Text',
    xtype: 'urlfield',
 
    config: {
        
        vtype: 'url',
        
        clearButton: true,
        searchButton: true
    
    },
    
    triggers: {
        clear: {
            weight: 0,
            cls: Ext.baseCSSPrefix + 'form-clear-trigger',
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
    
    setReadOnly: function(readOnly) {
        var me=this;
        
        me.callParent(arguments);
        
        if (!readOnly) {
            me.manageTriggerState();
        }
    },
    
    initComponent: function() {
        var me = this;
        
        me.callParent(arguments);
        me.manageTriggerState();
    },
    
    manageTriggerState: function() {
        var me = this;
        
        if (!me.getClearButton())
            me.getTrigger('clear').hide();
        
        if (!me.getSearchButton())
            me.getTrigger('search').hide();
        
    },
    
    onClearClick : function(){
        var me = this,
            activeFilter = me.activeFilter;

        me.setValue('');
        me.updateLayout();
        
    },

    onSearchClick : function(){
        var me = this,
            
        url = me.getValue();
        if (url.length > 0 && me.isValid()) {
                window.open(url);
            }

    me.updateLayout();
        
    }
});

