/**
 *  A DomainController controls a set of related activities, typically related to maintaining a master business 
 *  data entity, where each activity is controlled by a {@link Baff.app.controller.ActivityController}.  The
 *  DomainController controls a {@link Baff.app.view.DomainView}, which tabulates the various
 *  {@link Baff.app.view.ActivityView}s assocated with the activities.  The DomainController manages
 *  navigation and communication between activities.
 *   
 *  For a mobile application there may typically be a single domain controller, for which a  typical implementation 
 *  is as follows.  Only {@link #readRoles} need be specified, and {@link #titleSelector}
 *  if the tab title should be based on a field of the master entity record, along with a unique alias for the 
 * {@link Baff.app.view.DomainView} to reference.
 * 
 *     Ext.define('MyApp.controller.MyMainDomainController', {
 *         extend: 'Baff.app.controller.DomainController',           
 *         alias: 'controller.mainproduct',
 *            
 *         config: {                      
 *             accessRoles: ['myentity.read', 'myentity.update'],
 *             titleSelector: 'myentityname'
 *         }
 *                         
 * Also refer to the documentation for the associated {@link Ext.foundation.domainView}, which specifies 
 * configuration for user interface components this controller manages. 
 * 
 *  This class extends {Ext.app.Controller}, however subclasses should generally not require to 
 *  configure the superclass properties.
 *  
 */
 Ext.define('Baff.app.controller.DomainController', {
    extend: 'Ext.app.Controller', 
    requires: 'Baff.utility.Utilities',
    alias: 'controller.entity',
 
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
     * The popup Activity View being displayed.
     * @private 
     */
    popupView: null,
    
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
    dtNewTitle: "New",
    dtContinueWithoutSavingMsg: "Continue without saving changes?",
    dtWorkflowStoppedMsg: "Current workflow will be stopped",
    dtWorkflowStoppedContinueMsg: "Current workflow will be stopped, continue?",
    dtLoading: "Please wait....",
    dtDataIntegrityIssue: 'Data integrity issue detected, recovering...',
    
    
    config: {
        
        /**
         * Specifies the view events to be handled
         */
        control: {
            viewSelector: {
                initialize: 'onViewInit'
            }
        },
        
        /**
        * A reference to the view that this controller controls 
        * **IMPORTANT**: This must be set by the subclass.
        * @cfg viewSelector (required) 
        */        
        refs: {
            viewSelector: ''
        },
        
        /**
        * Specifies the position of the tab bar.
        * @private
        */  
        tabBarPosition: 'bottom',
        
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
        titleLength: 25,
        
        /**
        * Specifies if the original title specified in the view configuration should be included in the
        * re-formatted title
        */
        includeOriginalTitle: true,
        
        /**
        * Specifies the popup window widget type, e.g. a {@link Baff.app.view.SelectorPopup} that 
        * should be initially displayed in order to select the master entity
        */
        popupSelector: '',
        
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
         * Defaults to true as context may be set more broadly.
         */
        cascadeContext: true,
        
         /**
         * Specifies if entity change events should be cascaded to this domain from parent domain controller
         * Defaults to false.
         */
        cascadeEntity: false
        
    },
    
    /**
     * @event newtab
     * Fires when a new tab is to be created (refer to {@link Baff.app.view.DomainView} for
     * more details on how a new tab is configured)
     * @param {Ext.tab.Panel} view The "new tab" tab 
     */ 
    
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
    * Sets {@link #ID}, {@link #identifier}, {@link #activityView} and {@link #entityModel}.
    */ 
    init: function() {  
        var me = this;
        
        // Set the unique id for this instance and the identifier
        me.ID = Ext.id(this, "DC");
        me.identifier = me.self.getName() + "-" + me.ID;
        
        // Setup context
        me.currentContext = new Ext.util.HashMap();
        
        Utils.logger.info("DomainController" + this.identifier + "]:init");
        
    },
   
    /**
    * Initialisation once the associated view has been initialised    
    * Sets {@link #activityView}.
    */   
    onViewInit: function() {     
        var me = this;
        
        Utils.logger.info("DomainController[" + this.identifier + "]::onViewInit");
        
        // Get the view and setup listeners
        me.domainView = me.getViewSelector();    
        me.domainView.setController(me);
        
        // Setup access rights and control
        me.setupAccessRights();
        me.setupAccessControl();    
        
        me.getApplication().on('afterinit', me.afterInit, me); 
        
        me.domainView.on('painted', function() {
            
            if (!me.isInitialized) {
                var parentView = me.domainView.getParent();
                
                if (parentView == null || !parentView.isXType('domainview')) 
                    me.getApplication().fireEvent('afterinit');
            }

        }, me);
       
    },
    
    /**
    * Launches the controller once all application view initialiasion is completed   
    */   
    afterInit: function() {
        var me = this;
        Utils.logger.info("DomainController[" + this.identifier + "]::afterInit");
        
         if (me.isInitialized) {
            return;
         }
         
         me.isInitialized = true;
        
        // Get parent view
        var parentView = me.domainView.getParent();    

        if (parentView != null && parentView.isXType('domainview')) {
           
            // Listen to change events from the parent
            if (me.getCascadeMasterEntity())
                parentView.on('masterentitychange', me.onMasterEntityChange, me);

            if (me.getCascadeContext())
                parentView.on('contextchange', me.onContextChange, me);
            
            if (me.getCascadeEntity())
                parentView.on('entitychange', me.onEntityChange, me);

        } else {
            // Activate if no parent 
            me.activateView(me.domainView);
        }
        
        // Listen for children activation
        var children = Ext.ComponentQuery.query('activityview', me.domainView);
        
        Ext.Array.each(children, function(child) {
            child.on('deactivate', function(newTab, tabPanel, oldTab) {
                return false;
                });
        });     
        
        Ext.Array.each(children, function(view) {
            view.on('activate', me.onTabChange, me);
        }); 
        
        

    },
 
    /**
    * Sets up access rights based on user permissions.  User permissions obtained from 
    * {@link Baff.utility.Utilities #userSecurityManager} are tested against the {@link accessRoles} specified..  
    * Sets {@link allowAccess} accordingly.  
    * Called during initialisation.
    * @protected
    */   
    setupAccessRights: function() {
        Utils.logger.info("ActivityController[" + this.identifier + "]::setupAccessControl");
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
        Utils.logger.info("DomainController" + this.identifier + "]:setupAccessControl");
        var me = this;
 
        if (!me.allowAccess) {
            me.domainView.disable();
            me.domainView.hide();
            
            Utils.logger.info("DomainController" + this.identifier + "]:setupAccessControl - access not allowed");
            
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
        Utils.logger.info("DomainController" + this.identifier + "]:removeChildren");
        var me=this;
        
        var children = Ext.ComponentQuery.query(selector, me.domainView);
        
        Ext.Array.each(children, function(child, index) {
            if (!child.getController().isAccessAllowed() || !me.allowAccess) {
                me.domainView.getTabBar().getComponent(index).hide();
            }
        });        
    },
    
     /**
    * Handle a data integrity issue, default behaviour is to select the first tab, so override if required
    * @protected
    */      
    onDataIntegrityIssue: function(controller) {
        Utils.logger.info("DomainController" + this.identifier + "]:onDataIntegrityIssue");
        var me=this;
        
        Ext.Msg.alert(me.dtAckTitle, me.dtDataIntegrityIssue, function() {
            
            // Reset and select the first tab; this should typically manage the master entity, otherwise 
            // this should be overridden as required
            var firstTab = me.domainView.items.getAt(0);
            firstTab.getController().reset();
            me.changeTab(firstTab);
            
        });
        
    },
    
    /**
    * Called when view is activated (viewed).  Note that this is managed by self (if top level) or 
    * higher level {@link Baff.app.controller.DomainController} and not through the 'activate' event.  
    */   
    onActivateView: function() {
        Utils.logger.info("DomainController" + this.identifier + "]:onActivateView");
        var me = this;
        
         // Set the title if lowest level
        if (me.domainView.getActiveItem() != null && me.domainView.getActiveItem().isXType('activityview')) 
            me.setTitleFromRecord(me.currentMasterEntity);      
       
        // Get the popup and display it
        if (me.getPopupSelector() != '' && me.popupView == null)  {         
            me.popupView = me.showPopup(me.getPopupSelector(), me.popupView);
            
        } else {
             me.activateView(me.domainView.getActiveItem());        
        }
    },
    
    /**
    * Displayes a pop-up window and sets it's context etc.
    * @param {String} popupselector  The widget type of the popup
    * @param {Baff.app.view.ActivityView} popup A reference to the popup if previously obtained
    * @return {Baff.app.view.ActivityView} The popup
    */   
    showPopup: function(popupselector, popup, record ,activateOnClose) {   
        Utils.logger.info("DomainController" + this.identifier + "]:showPopup");
        var me = this;
        
        if (popup == null) {
        
            // Get the selector popup
            popup = Ext.widget(popupselector, {popup: true});
            
            if (popup == null) {
                Utils.logger.error("Failed to instansiate popup");
                return;
            }
            
            if (activateOnClose !== false)
                popup.on('closepopup', me.onPopupClose, me);
            
            // Detach any existing store
            popup.getController().detachStore();
            
            // Listen to the popup events
            popup.on('masterentitychange', me.onMasterEntityChange, me);
            popup.on('contextchange', me.onContextChange, me);
            
        }
        
         // Set popup
        popup.getController().onMasterEntityChange(me, me.currentMasterEntity, me.currentMasterEntityType);
        popup.getController().onContextChange(me, me.currentContext);
        popup.getController().onEntityChange(me, record, record != null ? record.self.getName() : null);

        popup.display(me);

        return popup;
        
    },
    
    /**
    * Closes the entity view if the popup is closed and no activity views have been enabled.
    */   
    onPopupClose: function() {
       Utils.logger.info("DomainController" + this.identifier + "]:onPopupClose");
        var me = this; 
        
        if (me.domainView.getActiveItem().isDisabled()) {
            me.domainView.close();
        } else {
            me.domainView.getActiveItem().tab.activate(true); // Ensure the tab is activated in case it was previously disabled
            me.activateView(me.domainView.getActiveItem()); 
        }
        
    },
    
    
    /**
    * Does nothing, for subclasses to override.    
    * Called whe view is deactivated.  Note that this is managed by the higher level 
    * {@link Baff.app.controller.DomainController and not through the 'deactivate' event.     
    */   
    onDeactivateView: function() {
        Utils.logger.info("DomainController" + this.identifier + "]:onDeactivateView");
        var me = this;
    },
    
    /**
    * Activates a view relative to the position of the one input
    * @param {Baff.app.view.DomainView} view The reference view
    * @param {Number} relativePosition The relative position of the view to be activated
    */   
    activateRelativeView: function(view, relativePosition) {
        Utils.logger.info("DomainController" + this.identifier + "]:activateTabToLeft");
        var me=this;
        
        var activeTabIndex = me.domainView.items.findIndex('id', view.id);
        var newIndex = activeTabIndex + relativePosition; 
        
        if (newIndex >= 0) {
            me.domainView.setActiveItem(newIndex); 
            me.activateView(me.domainView.getActiveItem()); 
        }
        
    },
    
    /**
    * Queries underlying activities to determine if the user should be prompted before changing
    * the view.  Invokes onActivation and onDeactivation 'events' on impacted controllers.
    * Called whe active tab is requested to be changed.
    * Note: always invoked for the top level tab that controls both the old and new views to be changed;
    * old view will be at the same level of the new view (i.e. not any underlying active tab).
    * @param {Baff.app.view.DomainView} tabPanel The entity view that owns the tabs
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} newView The view being requested
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} oldView The current view
    */   
    onTabChange: function(newTab, tabPanel, oldTab) {
        Utils.logger.info("DomainController" + this.identifier + "]:onTabChange");
        var me=this;
        
        // Manage the underlying activity state       
        me.deactivateView(oldTab);
        me.activateView(newTab);
        
        return true;
    },
    
    
    /**
    * Changes the currently selected tab without triggering a tab change event.
    * This should only be called for this controllers' view's tabs.
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} newView The view being requested
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} oldView The current view
    * @protected
    */   
    changeTab: function (newView, oldView) {
        Utils.logger.info("DomainController" + this.identifier + "]::changeTab");
        var me = this;
        
        if (oldView == null)
            oldView = me.domainView.getActiveItem();
        
        newView.un('activate', me.onTabChange, me); 
        
        if (oldView != newView) {        
            me.domainView.setActiveItem(newView); 
            me.deactivateView(oldView);
        }
            
        me.activateView(newView);
        newView.on('activate', me.onTabChange, me); 
    },
    
    /**
    * Deactivates the view and all underlying entity and activity views via their controllers
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} view The view to be deactivated.
    * @protected
    */   
    deactivateView: function(view) {
        Utils.logger.info("DomainController" + this.identifier + "]::deactivateView");
        var me = this;
        
        var targetView = view; 
        
        // Cycle through lower level entity views
        while (targetView != null && targetView.isXType('domainview') ) {

           targetView.getController().onDeactivateView();
           targetView = targetView.getActiveItem(); 
        }
        
        // Deactivate the currently selected activity view
        if (targetView != null && targetView.isXType('activityview')) {
             targetView.getController().onDeactivateView();
        };        

    },
    
    /**
    * Activates the view and all underlying entity and activity views via their controllers
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} view The view to be activate.
    * @protected
    */   
    activateView: function(view) {
        Utils.logger.info("DomainController" + this.identifier + "]::activateView");
        var me = this;
        
        var targetView = view;
         
        // Cycle through lower level entity views
        if (targetView != null && targetView.isXType('domainview') ) {

                // If the tab is disabled try to select one that isn't
                if (targetView.isDisabled()) {
                    var parent = targetView.getParent();     
                    parent.items.forEach(function (item) {
                        if (item.isXType('domainview') && !item.isDisabled()) {
                            parent.getController().changeTab(item, targetView);
                            return false;
                        }
                    });
                    // The above should trigger this function again so don't continue
                    return;
                }    
            
                targetView.getController().onActivateView();          
        } else
        
        // Activate the currently selected activity view
        if (targetView != null && targetView.isXType('activityview')) {
            
            // If the tab is disabled try to select one that isn't
            if (targetView.isDisabled()) {
                    var parent = targetView.getParent();                      
                    parent.items.forEach(function (item) {                   
                        if (item.isXType('activityview') && !item.isDisabled()) {                            
                            parent.getController().changeTab(item, targetView);
                            return false;                       
                        }
                    });
                    // The above should trigger this function again so don't continue
                    return;
                }        
            
            targetView.getController().onActivateView();  
            Utils.globals.activeView = targetView;
              
        }
        
    },
    
    /**
    * Handles a change to the master data entity as a result of the {@link #masterentitychange} 
    * event. Sets the tab title, stores the master if {@link #useVersionManager} is true, and relays 
    * the event to underlying activity controllers.
    * @param {Baff.app.controller.ActivityController} controller The activity controller that fired the event
    * @param {Baff.app.model.EntityModel} master The master entity record that has been selected
    * @param {String} type The master entity type
    */    
    onMasterEntityChange: function(controller, record, type) {       
        Utils.logger.info("DomainController" + this.identifier + "]:onMasterEntityChange");
        var me = this;
        
        me.currentMasterEntity = record;
        me.currentMasterEntityType = type;
        
        // Set the tab title
        me.setTitleFromRecord(record, type);
     
        // Relay the event
        me.domainView.fireEvent('masterentitychange', controller, record, type);     

    },
    
    /**
    * Handles a change to a data entity as a result of the {@link #entitychange} 
    * event. 
    * @param {Baff.app.controller.ActivityController} controller The activity controller that fired the event
    * @param {Baff.app.model.EntityModel} master The entity record that has been selected
    * @param {String} type The entity type
    */    
    onEntityChange: function(controller, record, type) {       
        Utils.logger.info("DomainController" + this.identifier + "]:onEntityChange");
        var me = this;
        
        // Set the tab title
        me.setTitleFromRecord(record, type);
        
        // Relay the event
        me.domainView.fireEvent('entitychange', controller, record, type);    

    },
    
    /**
    * Handles a change to a context as a result of the {@link #contextchange} 
    * event. 
    * @param {Baff.app.controller.ActivityController} controller The activity controller that fired the event
    * @param {Baff.app.model.EntityModel} context The context that has been changed
    */    
    onContextChange: function(controller, context) {       
        Utils.logger.info("DomainController" + this.identifier + "]:onContextChange");
        var me = this;
        
        // Set the context property
        context.each( function (key, value) {
        
            if (value !== null && value != '')
                me.currentContext.replace(key, value);
            else
                me.currentContext.removeByKey(key);

        });
        
        // Relay the event
        me.domainView.fireEvent('contextchange', controller, context);    

    },
    
    /**
    * Gets extenernally set context from {@link #currentContext}
    * @param {String}  The context key
    * @return The context
    */    
    getCurrentContext: function(fieldName) {
        Utils.logger.info("DomainController[" + this.identifier + "]::getCurrentContext");
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
        Utils.logger.info("DomainController" + this.identifier + "]:setTitleFromRecord");
        var me = this;
        
        var selector = me.getTitleSelector();
        var entity = me.getTitleEntity();
        var titlebar =  me.domainView.down('#titlebar');
        
        if (selector == null || entity == null || entity != type || titlebar == null)
            return;
        
        var title = '';      
        
        if (me.getIncludeOriginalTitle()) {
            title = me.domainView.getTopTitle() + ": ";
        }
        
         if (record == null) {
            title += me.dtNewTitle;
        
         } else {
             
            var recordText = record.get(selector);
            var maxLength = me.getTitleLength();
        
            if (recordText.length > maxLength) {
                recordText =  recordText.substring(0, maxLength -3 ) + "...";
            }else {
                recordText = recordText.substring(0, maxLength);
            }
            
            title += recordText;
        }
        
        titlebar.setTitle(title);
        
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
    * Queries the active actvity to see if changes have been made - any other activities with amended 
    * details should have been prompted for previously.
    * @param {Baff.app.model.EntityModel} record The entity record to query
    * @param {boolean} ignoreWorklfow Indicates if workflow state should be ignored
    * @return {String} The message to be displayed.
    */    
    getDeactivationPrompt: function(activeView) {
        Utils.logger.info("DomainController" + this.identifier + "]:getDeactivationPrompt");
        var me = this;
        
        var message = "";
        
        // Check underlying activities
        var targetView = activeView;  
       
        if (targetView == null)
            targetView = me.domainView.getActiveItem();  
       
              
        while (targetView != null && !targetView.isXType('activityview')) {
            targetView = targetView.getActiveItem();  
        }
        
        if (targetView != null && targetView.isXType('activityview') &&
            targetView.getController().isDeactivationPromptRequired())
                message = me.dtContinueWithoutSavingMsg;
        
        
       return message;
    },
    
    /**
     * Navigates to and displays the associated {@link #domainView}.
     * @protected
     */
    showView: function() {
        Utils.logger.info("DomainController" + this.identifier + "]:showView");
        var me = this;
        
        var view = me.domainView;
        var parent = me.domainView.getParent('domainview');  
        
        while (parent !=null && parent,isXType('domainview')) {
             if (view != parent.getActiveItem()) 
                parent.getController().changeTab(view, parent.getActiveItem()); 
            
            view = parent;
            parent = parent.getParent();            
        }      
    },
    
   
    /**
    * Shows / hides the wait mask.
    * @param {boolean} [show="false"]
    * @protected
    */    
    showWaitMask: function (show) {
        var me = this;
        if (show)
            me.getView().setLoading(me.dtLoading);
        else
            me.getView().setLoading(false);
    }
    
        
});

// Bug in Ext.tab.Tab, fails to set focusable to false, results in multipe tab related events being fired
// making them impossible to handle cleanly
Ext.override('Ext.tab.Tab', {
    focusable: false
});
