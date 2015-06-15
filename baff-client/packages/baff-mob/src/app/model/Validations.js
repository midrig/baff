/**
 *  Overrides {@link Ext.data.Validations} to add 'present' and 'rdpresent' validators.
 */ 
Ext.define('Baff.app.model.Validations', {
    override: 'Ext.data.Validations',
    
    dtPresentMessage: 'Must be present',

    getPresentMessage: function() {
        return this.dtPresentMessage;
    },
    
    getRdpresentMessage: function() {
        return this.dtPresentMessage;
    },
    
    present: function(config, value) {
        if (arguments.length === 1) {
            value = config;
        }
        return !Ext.isEmpty(value);
    },
    
    rdpresent: function(config, value) {
        if (arguments.length === 1) {
            value = config;
        }
        return !Ext.isEmpty(value) && value !== 0;
    }
});