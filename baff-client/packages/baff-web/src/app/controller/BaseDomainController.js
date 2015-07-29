/**
 *  A Base Domain Controller provides the foundation for the general {@link Baff.app.controller.DomainController} 
 *  as well as for the more specific {@link Baff.app.controller.DashboardController}.
 *  It provides common processing for managing the domain view and relaying context, however does not provide
 *  underlying domain / activity view management.  Refer to the relevant sub-class documentation for more details.
 */
Ext.define('Baff.app.controller.BaseDomainController', {
    extend: 'Ext.app.ViewController',   
    requires: ['Baff.utility.Utilities'],
    alias: 'controller.basedomain',

    /**
     * Defines if access is allowed, will be set based on user permissions.
     * @readonly 
     */
    allowAccess: true,
    
    /**
     * A unqiue ID for the controller instance.  It will be set automatically. 
     * @readonly
     */       
    ID: null,
    
    /**
     *  A combination of name and ID used for logging purposes.
     * @readonly 
     */
    identifier: null,
    
    /**
     * The entity view manged by this controller.
     * @readonly  
     */
    domainView: null,
    
    /**
     * The parent of the entity view manged by this controller.
     * @readonly  
     */
    parentView: null,   
    
    /**
     * The title originally specified on the entity view
     * @readonly 
     */
    originalTitle: null,
    
    /**
     * The current master entity
     * @readonly
     */
    currentMasterEntity: null,
    
    /**
     * The current master entity type
     * @readonly
     */
    currentMasterEntityType: null,
    
    /**
     * The current context
     * @readonly
     */
    currentContext: null,
    
    // Display text for override in locale file 
    dtLoading: "Please wait....",
    dtAckTitle: 'Acknowledge',
    dtDataIntegrityIssue: 'Data integrity issue detected...',
    dtContinueWithoutSavingMsg: "Continue without saving changes ?",
    dtConfirmTitle: 'Confirm',
    
    
    config: {
        
        /**
        * Specifies the application roles that are permitted to access.  These will be matched against 
        * user permissions managed by a {@link Baff.utility.Utilities#userSecurityManager}. 
        */    
        accessRoles: null,
        
        /**
        * Specifies the name of the field from the entity {@link #titleEntityl} that should be displayed in the tab title,
        * whenever the entity changes via {@link #masterentitychange} or {@link #entitychange} event.
        * The length can be controlled via {@link #titleLength} and whether the original title should be included 
        * via {@link #includeOriginalTitle}. 
        */    
        titleSelector: null,
        
         /**
        * Specifies the type of master entity {@link Baff.app.model.EntityModel} that is used to set the title.
        */    
        titleEntity: null,
        
        /**
        * Specifies a maximum length for the title. not including the original title if this is included.
        */
        titleLength: 20,
        
        /**
        * Specifies if the original title specified in the view configuration should be included in the
        * re-formatted title
        */
        includeOriginalTitle: true,
        
        /**
        * The title ext to display for a new record or if no record selected
        */
       newTitle: '',
            
        /**
        * Specifies if client side version management is enabled
        */
        useVersionManager: true,
        
        /**
         * Specifies if master entity events should be cascaded to this domain from parent domain controller
         * Defaults to false as typically a master entity should be managed by a bottom level domain controller.
         */
        cascadeMasterEntity: false,
        
        /**
         * Specifies if context change events should be cascaded to this domain from parent domain controller
         * Defaults to false; even through context may be set more broadly careful setup is required to avoid 
         * execssive context handling; if set to true then consider specifiing context fields in {@link cascadeContextFields}
         */
        cascadeContext: false,
        
        /**
         * Specifies an array of context fields to relay if cascaded, e.g. ['contextA', 'contextB', ... ]
         * Defaults to null in which case all context will be relayed
         */
        cascadeContextFields: null,
        
        /**
         * Specifies if entity change events should be cascaded to this domain from parent domain controller
         * Defaults to false.
         */
        cascadeEntity: false
   
    },
    
    /**
     * @event masterentitychange
     * Relays this event from the activity controller that initiated it to other activity controllers.
     * @param {Baff.app.controller.ActivityController} controller The activity controller firing the event
     * @param {Baff.app.model.EntityModel} model The master entity record
     * @param {String} type The master entity type
     */
    
    /**
     * @event entitychange
     * Relays this event from the activity controller that initiated it to other activity controllers.
     * @param {Baff.app.controller.ActivityController} controller The activity controller firing the event
     * @param {Baff.app.model.EntityModel} model The entity record
     * @param {String} type The entity type 
     */
    
    /**
     * @event contextchange
     * Fires when this controller changes the context.
     * @param {Baff.app.controller.ActivityController} controller The activity controller firing the event
     * @param {Ext.util.HashMap} context The list of context
     */
 
    /**
    * Initialises the controller.
    */        
    init: function(application) {        
        var me = this;
        
        // Set the unique id for this instance and the identifier
        me.ID = Ext.id(this, "DC");
        me.identifier = me.self.getName() + "-" + me.ID;
        
        Utils.logger.info("BaseDomainController[" + this.identifier + "]:init");
        
        // Get the view and setup listeners
        me.domainView = me.getView();
        me.originalTitle = me.domainView.getTitle();
        
        // Setup context
        me.currentContext = new Ext.util.HashMap();
        
        me.domainView.on('dataintegrityissue', me.onDataIntegrityIssue, me);     
        
        // Setup access rights
        me.setupAccessRights();
        me.setupAccessControl();  
         
        // Get parent view
        var parentView = me.findParentView();
             
        if (parentView != null) {
           
            // Listen to change events from the parent
            if (me.getCascadeMasterEntity())
                parentView.on('masterentitychange', me.onMasterEntityChange, me);
           
            if (me.getCascadeContext())
                parentView.on('contextchange', me.onContextChange, me);
            
            if (me.getCascadeEntity())
                parentView.on('entitychange', me.onEntityChange, me);
            
        } 
        
        
    },
    
    /**
     * Enables or disables the view based on underlying activity view state
     * @protected
     */
    manageViewState: function() {
        
    },
    
    
    /**
    * Sets up access rights based on user permissions.  User permissions obtained from 
    * {@link Baff.utility.Utilities #userSecurityManager} are tested against the {@link accessRoles} specified..  
    * Sets {@link allowAccess} accordingly.  
    * Called during initialisation.
    * @protected
    */   
    setupAccessRights: function() {
        Utils.logger.info("BaseDomainController[" + this.identifier + "]::setupAccessControl");
        var me = this;
        
        var accessRoles = me.getAccessRoles();
        
        if (accessRoles != null) {
            me.allowAccess = Utils.userSecurityManager.isUserInRole(accessRoles);
        }
          
    },
    
    /**
    * Sets up access to view components based on {@link #allowAccess}.
    * Called during initialisation.
    * @protected
    */      
    setupAccessControl: function() {
        Utils.logger.info("BaseDomainController[" + this.identifier + "]:setupAccessControl");
        var me = this;
 
        if (!me.allowAccess) {
            me.domainView.disable();
            me.domainView.hide();
            
            Utils.logger.info("BaseDomainController[" + this.identifier + "]:setupAccessControl - access not allowed");
            
        }
        
        // Remove children where access is disallowed
        me.removeDisallowedChildren('activityview');
        me.removeDisallowedChildren('domainview');
        
    },
    
    /**
    * Removes underlying activities to which access has not been granted
    * Called during initialisation.
    * @protected
    */      
    removeDisallowedChildren: function (selector) {
        Utils.logger.info("BaseDomainController[" + this.identifier + "]:removeChildren");
        var me=this;
        
        var children = Ext.ComponentQuery.query(selector, me.domainView);
        
        Ext.Array.each(children, function(child, index) {
            if (!child.getController().isAccessAllowed() || !me.allowAccess) {
                child.hide();
            }
        });        
    },
    
    /**
    * Handle a data integrity issue, default behaviour is to select the first tab, so override if required
    * @protected
    */      
    onDataIntegrityIssue: function(controller) {
        Utils.logger.info("BaseDomainController[" + this.identifier + "]:onDataIntegrityIssue");
        var me=this;

        Ext.Msg.alert(me.dtAckTitle, me.dtDataIntegrityIssue, function() {
           
            if (Utils.globals.application != null)
                Utils.globals.application.fireEvent('systemfailure');
            
        });
        
    },
   
    
    /**
    * Handles a change to the master data entity as a result of the {@link #masterentitychange} 
    * event. Sets the tab title, stores the master if {@link #useVersionManager} is true, and relays 
    * the event to underlying activity controllers.
    * @param {Baff.app.controller.ActivityController} controller The activity controller that fired the event
    * @param {Baff.app.model.EntityModel} master The master entity record that has been selected
    * @param {Baff.app.controller.DomainController} controller The domain controller that relayed the event
    * @param {String} type The master entity type
    * @protected
    */    
    onMasterEntityChange: function(controller, record, type, relayController) {       
        Utils.logger.info("BaseDomainController[" + this.identifier + "]:onMasterEntityChange");
        var me = this;
        
        me.currentMasterEntity = record;
        me.currentMasterEntityType = type;
        
        // Set the tab title
        me.setTitleFromRecord(record, type);
        
        // Relay the event
        me.fireViewEvent('masterentitychange', controller, record, type, me);      

        me.manageViewState();

    },
    
    /**
    * Handles a change to a data entity as a result of the {@link #entitychange} 
    * event. 
    * @param {Baff.app.controller.ActivityController} controller The activity controller that fired the event
    * @param {Baff.app.model.EntityModel} entity The entity record that has been selected
    * @param {String} type The entity type
    * @param {Baff.app.controller.DomainController} controller The domain controller that relayed the event
    * @protected
    */    
    onEntityChange: function(controller, record, type, relayController) {       
        Utils.logger.info("BaseDomainController[" + this.identifier + "]:onEntityChange");
        var me = this;
        
        // Set the tab title
        me.setTitleFromRecord(record, type);
        
        // Relay the event
        me.fireViewEvent('entitychange', controller, record, type, me);      

        me.manageViewState();
    },
    
    /**
    * Handles a change to a context as a result of the {@link #contextchange} 
    * event. 
    * @param {Baff.app.controller.ActivityController} controller The activity controller that fired the event
    * @param {Baff.app.model.EntityModel} context The context that has been changed
    * @param {Baff.app.controller.DomainController} controller The domain controller that relayed the event
    * @protected
    */    
    onContextChange: function(controller, context, relayController) {       
        Utils.logger.info("BaseDomainController[" + this.identifier + "]:onContextChange");
        var me = this;
        
        var relayContextMap = null;
        var relayContext = context;
        
        if (relayController != null && me.getCascadeContextFields() != null) {
            relayContextMap = me.getCascadeContextFields();
            relayContext = new Ext.util.HashMap();        
        }
            
        // Set the context property
        context.each( function (key, value) {
        
            var relay = true;
        
            if (relayContextMap != null) {
                if (Ext.Array.contains(relayContextMap, key))
                    relayContext.add(key,value);
                else
                    relay = false;
            }
            
            if (relay) {
                
                if (value !== null && value != '')
                    me.currentContext.add(key, value);
                else
                    me.currentContext.removeAtKey(key);
            }

        });
        
        // Relay the event
        if (relayContext.getCount() > 0)
            me.fireViewEvent('contextchange', controller, relayContext, me); 
        
        me.manageViewState();
        
    },
    
    /**
    * Gets extenernally set context from {@link #currentContext}
    * @param {String}  The context key
    * @return The context
    * @protected
    */    
    getCurrentContext: function(fieldName) {
        Utils.logger.info("BaseDomainController[" + this.identifier + "]::getCurrentContext");
        var me = this;
        
        return me.currentContext.get(fieldName);
        
    },
    
    /**
    * Sets the tab title based on the record passed in and {@link #titleSelector}, {@link #includeOriginalTitle}
    * and {@link #titleLength} configuration.  Sets {@link #originalTitle}.
    * @param {Baff.app.model.EntityModel} record The entity record to query
    * @protected
    */    
    setTitleFromRecord: function(record, type) {
        Utils.logger.info("BaseDomainController[" + this.identifier + "]:setTitleFromRecord");
        var me = this;
        
        var selector = me.getTitleSelector();
        var entity = me.getTitleEntity();
        
        if (selector == null || entity == null || entity != type)
            return;
        
        var title = '';
        var tooltip = '';            
        
        if (me.getIncludeOriginalTitle()) 
                title = me.originalTitle;
        
         if (record == null) {
             var newTitle = me.getNewTitle();
             if (newTitle != '')
                title += ": " + newTitle;
        
         } else {
             
            var recordText = record.get(selector);
            var maxLength = me.getTitleLength();
            
            if (recordText.length > maxLength) {
                tooltip = recordText;
                recordText =  recordText.substring(0, maxLength -3 ) + "...";
            }else {
                recordText = recordText.substring(0, maxLength);
            }
            
            title += ":" + recordText;
        }
        
        me.domainView.setTitle(title);
        
        if (me.domainView.tab != null)
            me.domainView.tab.setTooltip(tooltip);
    },
        
    /**
    * Determines if this view is permitted to be accessed based on either of {@link #allowRead} or
    * {@link #allowUpdate} having been set to true during initialisation.
    * @return {boolean}
    */    
    isAccessAllowed: function() {
        return this.allowAccess;
    },
    
    /**
    * Shows / hides the wait mask.
    * @param {boolean} [show="false"]
    * @protected
    */    
    showWaitMask: function (show) {
        var me = this;
        
        if (Utils.globals.viewport != null) {
            Utils.globals.viewport.showWaitMask(show, me.ID);
        
        } else {
        
            if (show)
                me.getView().setLoading(me.dtLoading);
            else
                me.getView().setLoading(false);
        }
    },
    
    /**
     * Returns the parent of this controllers view - this should be a type of {@link Baff.app.view.DomainView} 
     * or else null if this controller manages the top level view.
     * @returns {Baff.app.view.DomainView}
     * @protected
     */
    findParentView: function() {
        var me = this;
        return me.domainView.findParentByType('domainview');
        
    },
      
    /**
     * Determine if de-activation prompt is required (overried for low-level domain views only
     * @returns {boolean}
     */
    isDeactivationPromptRequired: function() {
        return false;
    }
    
        
});
