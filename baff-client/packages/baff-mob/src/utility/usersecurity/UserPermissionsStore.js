/**
 *  A User Permissions Store holds permissions for a specific user, loaded via a service proxy.
 *  
 */
Ext.define('Baff.utility.usersecurity.UserPermissionsStore', {
    extend: 'Ext.data.Store',
    requires: 'Baff.app.model.ServiceProxy',
    
    
    config: { 

        // The permission model - simply a string
        fields: [
            {name: 'permission', type: 'string'}
        ],

        /**
         * The proxy for the service to retrieve the user permissions
         * @private
         */  
        proxy: {
            type: 'serviceproxy',
            actionMethods: {
                read: 'POST'
            }
        }
    
    },
    
    /**
     * Finds a user role (permission) in the store
     * @param {String} role
     * @return {Number} The index of the record, or -1 if doesn't exist
     */  
    findUserRole: function(role) {
        
        return this.find('permission', role);
        
    }
    
    
});

