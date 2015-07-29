/**
 *  A DomainController controls a set of related activities, typically related to maintaining a master business 
 *  data entity, where each activity is controlled by a {@link Baff.app.controller.ActivityController}.  The
 *  DomainController controls a {@link Baff.app.view.DomainView}, which tabulates the various
 *  {@link Baff.app.view.ActivityView}s assocated with the activities.  The DomainController manages
 *  navigation and communication between activities.
 *   
 *  A DomainController can also control a set of other DomainControllers in order to define a hierarchical
 *  navigation structure for the application, for example:
 *  
 *  EntityNavigationController --> MultiDomainController --> MainDomainController
 *  
 *  where:
 *    
 *    - EntityNavigationController manages views for each entity type, e.g. Customer, Product, etc.    
 *    - MultipleDomainController manages views for different instances of the same entity type  
 *    - MainDomainController manages views for the activities relating to a specific entity instance    
 *                       
 * A typical implementation is as follows.  Only {@link #readRoles} need be specified, and {@link #titleSelector}
 * if the tab title should be based on a field of an entity record, along with a unique alias for the 
 * {@link Baff.app.view.DomainView} to reference.
 * 
 *     Ext.define('MyApp.controller.MyMainDomainController', {
 *         extend: 'Baff.app.controller.DomainController',           
 *         alias: 'controller.maindomaincontroller',
 *            
 *         config: {                      
 *             readRoles: ['myentity.read', 'myentity.update'],
 *             titleEntity: 'myentityname',
 *             titleSelector: 'myentityfield'
 *         }
 *         
 *    });
 * 
 * If a popup window is to be initially presented in order to select the master entity to be operated on 
 * then {@link #popupSelector} should specify the type.
 *                         
 * Higher level "Multi" and "Navigation" controllers do not require any specific configuration.  Also refer 
 * to the documentation for the associated {@link Ext.foundation.domainView}, which specifies 
 * configuration for user interface components this controller manages, including some specific 
 * configuration options for "Mutli" types. 
 * 
 * The domain controller defines workflows via {@link #workflows} and executes the associated steps
 * that are initiated by a {@link Baff.utility.workflow.WorkflowManager}.
 *  
 *  This class extends {Ext.app.ViewController}, however subclasses should generally not require to 
 *  configure the superclass properties.
 *  
 */
 Ext.define('Baff.app.controller.DomainController', {
    extend: 'Baff.app.controller.BaseDomainController',
    requires: 'Baff.utility.Utilities',
    alias: 'controller.domain',
   
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
    dtWorkflowStoppedMsg: "Current workflow will be stopped",
    dtWorkflowStoppedContinueMsg: "Current workflow will be stopped, continue?",
    dtHideDashlet: 'Hide summary view',
    dtShowDashlet: 'Show summary view',
    
    
    config: {
        
        /**
        * The title text to display for a new record or if no record selected
        */
       newTitle: '',
        
        /**
        * Specifies the popup window widget type, e.g. a {@link Baff.app.view.SelectorPopup} that 
        * should be initially displayed in order to select the master entity.
        * If not set then any selector specified by the view will be used instead.
        */
        popupSelector: '',
        
        /**
         * Specifies workflows that this controller manages.  In the below example the first workflow
         * comprises two activities, and the second workflow two child workflows.
         *    
         *     workflows: [
         *          {workflow: "Workflow A", resume: true, replay: true, previous: true, steps: [
         *              {step: "Activity Foo", view: "fooactivityview", instruction: "Update foo"},
         *              {step: "Activity Bar", view: "baractivityview", instruction: "Update bar"},
         *              roles: [userRole]
         *          },
         *          {workflow: "Workflow B", visible: false, steps: [
         *              {step: "Workflow Foo", view: "foodomainview", newView: true},
         *              {step: "Worfklow Bar, view: "bardomainview}
         *          }
         *      ]
         * 
         * Workflow properties are:
         *  - resume: Allows the user to subsequently resume a worklfow after navigating away
         *  - replay: Will prompt the user to replay the workflow; this allows looping in child workflows
         *  - previous: Allows the user to go back, but only to the start of the current workflow
         *  - roles: A list of roles that can access this workflow; should be consistent with related activity access rights
         *  - visible: Set to false if not selectable, e.g. a child workflow only available via a parent; also can by set 
         *  dynamically by overrideing {@link #isWorkflowVisible}
         *  - steps: A sequence of steps, properties as follows:
         *  - step: the step name; if calling a child workfow then the step name should reference this
         *  - view: the related domain (for child workflow) or activity view
         *  - instruction: for an activity, the user instruction to be displayed
         *  - newView: only relevant for child workflows where the domain view has dynamic tab, so a new view will
         *  be used if possible 
         */
        workflows: null
        
    },
    
    /**
     * @event newtab
     * Fires when a new tab is to be created (refer to {@link Baff.app.view.DomainView} for
     * more details on how a new tab is configured)
     * @param {Ext.tab.Panel} view The "new tab" tab 
     */ 
    

    /**
    * Initialises the controller.    
    */        
    init: function(application) {        
        var me = this;
        
        me.callParent(arguments);
        
        me.domainView.on('beforetabchange', me.beforeTabChange, me);
        me.domainView.on('newtab', me.onNewTab, me);
        me.domainView.on('beforeclose', me.beforeClose, me);
        
        var selector = me.getPopupSelector();
        
        if (selector === '')
            me.setPopupSelector(me.domainView.getPopupSelector());  
        
        selector = me.domainView.getDashletSelector();
        
        if (selector != '') {
            
            if (me.domainView.getDashletDock() == 'popup') {
                me.dashlet = me.showPopup(selector, me.dashlet, null, false);
                
                if (me.domainView.getHideDashlet())
                    me.dashlet.hide();
            
            } else {                
                me.dashlet = me.lookupReference(selector);        
            
            }
            
            if (me.domainView.getToggleDashlet()) {

                var iconCls = 'dash-open';
                var tooltip = me.dtShowDashlet;
            
                if (me.dashlet.isVisible()) {
                    iconCls = 'dash-close';
                    tooltip = me.dtHideDashlet;
                }

                me.domainView.tabBar.add({xtype: 'tbfill' });
                me.toggleDashButton = me.domainView.tabBar.add({
                                    iconCls: iconCls,
                                    closable: false,
                                    tooltip: tooltip,
                                    handler: function() {me.showDashlet();},
                                    scope: me
                                });  
            }
        }
        
        me.manageViewState();
        
        var parentView = me.findParentView();        
             
        if (parentView == null && !me.domainView.getFromNew())
            me.activateView(me.domainView);
        
    },
    
    /**
     * Eanbles or disables the view based on underlying activity view state
     * @protected
     */
    manageViewState: function() {
        Utils.logger.info("DomainController[" + this.identifier + "]::manageViewState");
        var me = this;
        
        if ((me.getPopupSelector() != '' && me.popupView == null) ||
            !me.domainView.items.getAt(0).isDisabled() || 
            !me.domainView.getActiveTab().isDisabled()) {

            if (me.domainView.isDisabled()) {
            
                me.domainView.enable();
                me.domainView.tabBar.setActiveTab(me.domainView.getActiveTab().tab);
            
            }
            
        } else {
            me.domainView.disable();
        }
    
    },
    
    /**
    * Sets up access to view components based on {@link #allowAccess}.
    * Called during initialisation.
    * @protected
    */      
    setupAccessControl: function() {
        Utils.logger.info("DomainController[" + this.identifier + "]:setupAccessControl");
        var me = this;
        
        me.callParent(arguments);
        
        // Initialise workflows
        var workflows = me.getWorkflows();
        
        if (workflows != null) {

            for (i=0; i<workflows.length; i++) {
                if (workflows[i].roles != null && !Utils.userSecurityManager.isUserInRole(workflows[i].roles))
                    workflows[i].isAllowed = false;
                else
                    workflows[i].isAllowed = true;
            }
        }
       
    },
    
    /**
    * Gets workflows based on user role
    * @protected
    */      
    getAvailableWorkflows: function() {
        Utils.logger.info("DomainController[" + this.identifier + "]:setupWorkflow");
        var me = this;
 
        var workflows = me.getWorkflows();
        
        if (workflows != null) {

            for (i=0; i<workflows.length; i++) {
                if (!workflows[i].isAllowed)
                    workflows[i].visible = false
                else
                    workflows[i].visible = me.isWorkflowVisible(workflows[i]);
            }
        }
        
        return workflows;
        
    },
    
    /**
    * Override to setup custom workflow access control
    * Called during initialisation.
    * @protected
    */
    isWorkflowVisible: function(workflow) {
        return workflow.visible != false;
    },
    
    /**
    * Handle a data integrity issue, default behaviour is to select the first tab, so override if required
    * @protected
    */      
    onDataIntegrityIssue: function() {
        Utils.logger.info("DomainController[" + this.identifier + "]:onDataIntegrityIssue");
        var me=this;
        
        // Reset and select the first tab; this should typically manage the master entity, otherwise 
        // this should be overridden as required
        
        Ext.Msg.alert(me.dtAckTitle, me.dtDataIntegrityIssue, function() {
            
            var firstTab = me.domainView.items.getAt(0);       
        
            if (firstTab.isXType('activityview'))  {      
                firstTab.getController().reset();
            }       

            me.changeTab(firstTab);
             
        });
        
    },
    
    /**
    * Called by the framework to activate the activity.
    * Activates underlying activities. Launches the pop-up window if {@link #popupSelector} is specified.
    * @protected
    */   
    onActivateView: function() {
        Utils.logger.info("DomainController[" + this.identifier + "]:onActivateView");
        var me = this;
       
        // Set the title if lowest level
        if (me.domainView.getActiveTab() != null && me.isLowLevelView(me.domainView.getActiveTab())) 
            me.setTitleFromRecord(me.currentMasterEntity);      
       
        // Get the popup and display it
        if (me.getPopupSelector() != '' && me.popupView == null) {            
            me.popupView = me.showPopup(me.getPopupSelector(), me.popupView);
            
       } else {

            me.activateView(me.domainView.getActiveTab()); 
           
       }
       
    },
    
    
    /**
     * Shows or hides the dashlet
     * @param {boolean} Indicates to show or hide the dashlet, if null it will be toggled
     */
    showDashlet: function(show) {
        Utils.logger.info("DomainController[" + this.identifier + "]:showDashlet");
        var me = this;
        
        if (me.dashlet == null)
            return;
        
        show = (show == null ? !me.dashlet.isVisible() : show); 
        
        if (!show) {
            me.dashlet.hide();
            me.dashlet.getController().onDeactivateView();
            me.toggleDashButton.setIconCls('dash-open');
            me.toggleDashButton.setTooltip(me.dtShowDashlet);
        } else if (show){
            me.dashlet.getController().onActivateView();
            me.dashlet.show();
            me.toggleDashButton.setIconCls('dash-close');
            me.toggleDashButton.setTooltip(me.dtHideDashlet);
        }
        
    },
    
    /**
    * Displayes a pop-up window and sets it's context etc.
    * @param {String} popupselector  The widget type of the popup
    * @param {Baff.app.view.ActivityView} popup A reference to the popup if previously obtained
    * @param {Baff.app.model.EntityModel} record A record to passed to {@link Baff.app.controller.ActivityController #onEntityChange}
    * @param {boolean} activateOnClose Whether to re-activate the underlying view on close (default to true)
    * @return {Baff.app.view.ActivityView} The popup
    * @protected
    */   
    showPopup: function(popupselector, popup, record, activateOnClose) {   
        Utils.logger.info("DomainController[" + this.identifier + "]:showPopup");
        var me = this;
        
        if (popup == null) {
        
            if (popupselector == me.domainView.getDashletSelector())
                popup = Ext.widget(popupselector, {modal: false});
            else
                popup = Ext.widget(popupselector);

            if (popup == null) {
                Utils.logger.error("Failed to instansiate popup");
                return null;
            }

            // Listen to the popup events
            popup.on('masterentitychange', me.onMasterEntityChange, me);
            popup.on('contextchange', me.onContextChange, me);            
            popup.on('beforeclose', me.closePopup, me);
            
            popup.on('close', function () {                 
                
                if (popup != me.dashlet)
                    popup.getController().onDeactivateView();
                
                if (activateOnClose !== false)
                    me.onPopupClose();
            
            }, me);
            
        }
        
        // Set popup
        popup.getController().onMasterEntityChange(me, me.currentMasterEntity, me.currentMasterEntityType);
        popup.getController().onContextChange(me, me.currentContext);
        popup.getController().onEntityChange(me, record, record != null ? record.self.getName() : null);

        // Display the popup
        popup.display(me); 
        popup.getController().addApplicationListeners();

        return popup;
        
    },
    
    closePopup: function(popup) {
        Utils.logger.info("DomainController[" + this.identifier + "]:closePopup");
        var me = this; 
        
        if (popup == me.dashlet) {
            me.showDashlet(false);
            return;
        }
        
        if (popup.getController().isDeactivationPromptRequired()) {

            Ext.Msg.confirm(me.dtConfirmTitle, me.dtContinueWithoutSavingMsg, 
                function(btn) {
                    if (btn == 'yes') {
                        popup.un('beforeclose', me.closePopup, me);
                        popup.close();
                        popup.on('beforeclose', me.closePopup, me);                            
                    }                        
            });
            
            return false;
        }
        
        return true;

    },
    
    /**
    * Closes the entity view if the popup is closed and no activity views have been enabled.
    * @protected
    */   
    onPopupClose: function() {
        Utils.logger.info("DomainController[" + this.identifier + "]:onPopupClose");
        var me = this; 
        
        if (me.domainView.getActiveTab().isDisabled()) {
            me.domainView.close();
        } else {
            me.domainView.tabBar.setActiveTab(me.domainView.getActiveTab().tab);
            me.activateView(me.domainView.getActiveTab()); 
        }
        
    },
    
    /**
    * Called by the framework to deactivate the activity.
    * Deactivates underlying activities. 
    * @protected
    */   
    onDeactivateView: function() {
        Utils.logger.info("DomainController[" + this.identifier + "]:onDeactivateView");
        var me = this;
        
        me.deactivateView(me.domainView.getActiveTab()); 
        
        if (me.dashlet != null)
               me.dashlet.getController().onDeactivateView();
           
    },
    
    /**
    * Queries underlying activities to determine if the user should be prompted before closing.
    * Selects the tab to the left of this one on close.   
    * Called whe entity view is requested to be closed.  
    * @protected
    */   
    beforeClose: function() {
        Utils.logger.info("DomainController[" + this.identifier + "]:beforeClose");
        var me=this;
        
        var parentView = me.findParentView();
        
        // Prompt the user if required
        var prompt = me.getDeactivationPrompt();
        
        if (prompt != "") {  
            
            Ext.Msg.confirm(me.dtConfirmTitle, prompt, 
                function(btn) {

                    if (btn == 'yes') {
 
                        // Close the view - don't respond to close events whilst were doing it
                        me.domainView.un('beforeclose', me.beforeClose, me);
                        // Activate tab to the left of this one
                        parentView.getController().activateRelativeView(me.domainView, -1);
                        me.domainView.close();
                        me.domainView.on('beforeclose', me.beforeClose, me);
                    }
            });
           
            return false;
        }
        
        // Activate tab to the left of this one
        parentView.getController().activateRelativeView(me.domainView, -1);
       
        return true;
    },
    
    /**
    * Activates a view relative to the position of the one input
    * @param {Baff.app.view.DomainView} view The reference view
    * @param {Number} relativePosition The relative position of the view to be activated
    * @protected
    */   
    activateRelativeView: function(view, relativePosition) {
        Utils.logger.info("DomainController[" + this.identifier + "]:activateRelativeView");
        var me=this;
        
        var activeTabIndex = me.domainView.items.findIndex('id', view.id);
        var newIndex = activeTabIndex + relativePosition; 
        
        if (newIndex >= 0) {
            me.changeTab(me.domainView.items.getAt(newIndex));
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
    * @protected
    */   
    beforeTabChange: function(tabPanel, newView, oldView) {
        Utils.logger.info("DomainController[" + this.identifier + "]:beforeTabChange");
        var me=this;
        
        // Prompt the user if required
        var prompt = me.getDeactivationPrompt();
        
        if (prompt != "") {  
           
            me.domainView.un('beforetabchange', me.beforeTabChange, me);
            
            Ext.Msg.confirm(me.dtConfirmTitle, prompt, 
                function(btn) {

                    if (btn == 'yes') {
                                              
                        // If an "add new" tab was not requested then make the change
                        if (!me.isNewTab(newView, oldView)) {
                            me.changeTab(newView, oldView); 
                        }
                        
                    } else {
                        // Reset to the old (current) view
                        me.domainView.setActiveTab(oldView);
                        me.domainView.on('beforetabchange', me.beforeTabChange, me);
                    }

                }
            );
           
            return false;
        }
        
        // Don't handle an "add new" request
        if (me.isNewTab(newView, oldView))
            return false;
        
        // Manage the underlying activity states
        me.deactivateView(oldView);
        me.activateView(newView);
        
        return true;
    },
    
    /**
    * Check if the request is to add a new view instance and if so fire the associated event.
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} newView The view being requested
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} oldView The current view
    * @return {boolean}
    * @fires newtab
    * @protected
    */   
    isNewTab: function(newView, oldView) {      
        Utils.logger.info("DomainController[" + this.identifier + "]:isNewTab");
        var me = this;
        
        if (newView.newType != null) {        
           me.fireViewEvent('newtab', newView, oldView);
           return true;
            
        } else {
            return false;       
        }
    },
    
    /**
    * Creates a new tab.  Invoked by the the internal 'newtab' event.
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} newView The view being requested
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} oldView The current view
    * @return {Baff.app.view.DomainView or Baff.app.view.ActivityView} The new view
    * @protected
    */   
    onNewTab: function (newView, oldView) {
        Utils.logger.info("DomainController[" + this.identifier + "]::onNewTab");
        var me = this;
        
        var popup = (newView.popupSelector != null ? newView.popupSelector : '');        
        var addtab = newView.cloneConfig();        
        me.domainView.remove(newView);
        var newtab = me.domainView.add({xtype: newView.newType, title: newView.newTitle, fromNew: true, popupSelector: popup});
        me.domainView.add(addtab);
        
        // Setup context
        if (me.currentMasterEntity != null)
            newtab.getController().onMasterEntityChange(me, me.currentMasterEntity, me.currentMasterEntityType);
            
        if (me.currentContext.getCount() > 0)
            newtab.getController().onContextChange(me, me.currentContext);
        
        me.changeTab(newtab, oldView);       
        
        return newtab;
    },
    
    /**
    * Changes the currently selected tab without triggering a tab change event.
    * This should only be called for this controllers' view's tabs.
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} newView The view being requested
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} oldView The current view
    * @protected
    */   
    changeTab: function (newView, oldView) {
        Utils.logger.info("DomainController[" + this.identifier + "]::changeTab");
        var me = this;
        
        if (oldView == null)
            oldView = me.domainView.getActiveTab();
        
        me.domainView.un('beforetabchange', me.beforeTabChange, me);
        
        if (oldView != newView) {    
            me.domainView.setActiveTab(newView);  
            me.deactivateView(oldView);
        }
         
        me.activateView(newView);
        
        me.domainView.on('beforetabchange', me.beforeTabChange, me);
    },
    
    /**
    * Deactivates the view and all underlying entity and activity views via their controllers
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} view The view to be deactivated.
    * @protected
    */   
    deactivateView: function(view) {
        Utils.logger.info("DomainController[" + this.identifier + "]::deactivateView");
        var me = this;
        
        if (view == null)
            return;
        
        var targetView = view; 
        
        // Cycle through lower level entity views
        while (targetView != null && targetView.isXType('domainview') ) {

           targetView.getController().onDeactivateView();
           targetView = targetView.getActiveTab();
        }
        
        // Deactivate the currently selected activity view
        if (targetView != null && me.isLowLevelView(targetView)) {
             targetView.getController().onDeactivateView();
        };        

    },
    
    /**
    * Activates the view and all underlying entity and activity views via their controllers
    * @param {Baff.app.view.DomainView or Baff.app.view.ActivityView} view The view to be activate.
    * @protected
    */   
    activateView: function(view) {
        Utils.logger.info("DomainController[" + this.identifier + "]::activateView");
        var me = this;
        
        var targetView = view; 
         
        // Cycle through lower level domain views
        if (targetView != null && targetView.isXType('domainview') ) {

                // If the tab is disabled try to select one that isn't
                if (targetView.isDisabled()) {
                    var parent = targetView.findParentByType('domainview');      
                    parent.items.each(function (item) {
                        if (item.isXType('domainview') && !item.isDisabled()) {
                            parent.getController().changeTab(item, targetView);
                            return false;
                        }
                    });
                    // The above should trigger this function again so don't continue
                    return;
                }    
            
                targetView.getController().onActivateView();
                
                // Don't display any summary dashlet for domain views
                me.showDashlet(false);
                
        } else
        
        // Activate the currently selected view
        if (targetView != null && me.isLowLevelView(targetView)) {
            
            // If the tab is disabled try to select one that isn't
            if (targetView.isDisabled()) {
                    var parent = targetView.findParentByType('domainview');                         
                    parent.items.each(function (item) {                       
                        if (me.isLowLevelView(item) && !item.isDisabled()) {                            
                            parent.getController().changeTab(item, targetView);
                            return false;                       
                        }
                    });
                    // The above should trigger this function again so don't continue
                    return;
                }        
            
            targetView.getController().onActivateView();
            Utils.globals.activeView = targetView;
            
            if (me.dashlet != null) {
                var views = me.domainView.getAutoHideDashletOnView();
                var activeTabIndex = me.domainView.items.findIndex('id', targetView.id);
                var activeTabName = targetView.self.getName();

                    if (views != null && (Ext.Array.contains(views, activeTabName) || Ext.Array.contains(views, activeTabIndex)))
                        me.showDashlet(false);
                    else if (me.domainView.getAutoShowDashlet())
                        me.showDashlet(true);
                            
            } 
              
            // Notify the workflow manager of the change
            // Hard wired for efficiency
            if (Utils.workflowManager != null)
                    Utils.workflowManager.onActiveViewChange(targetView);    
                
        }
        
    },
    
    /**
    * Queries the active actvity to see if changes have been made - any other activities with amended 
    * details should have been prompted for previously.
    * @param {Baff.app.model.EntityModel} record The entity record to query
    * @param {boolean} ignoreWorklfow Indicates if workflow state should be ignored
    * @return {String} The message to be displayed.
    */    
    getDeactivationPrompt: function(ignoreWorkflow) {
        Utils.logger.info("DomainController[" + this.identifier + "]:getDeactivationPrompt");
        var me = this;
        
        var message = "";
        
        // Check underlying activities
        var targetView = me.domainView.getActiveTab();
              
        while (targetView != null && targetView.isXType('domainview')) {  
            targetView = targetView.getActiveTab();
        }
        
        if (targetView != null && me.isLowLevelView(targetView) &&
            targetView.getController().isDeactivationPromptRequired())
                message = me.dtContinueWithoutSavingMsg;
        
        if (!ignoreWorkflow && Utils.workflowManager != null &&
            Utils.workflowManager.isDeactivationPromptRequired()) {
        
            if (message != "")
                message += "</br></br>" + me. dtWorkflowStoppedMsg;
            else
                message = me.dtWorkflowStoppedContinueMsg; 
        }
        
       return message;
    },
    
    /**
     * Navigates to and displays the associated {@link #domainView}.
     * @protected
     */
    showView: function() {
        Utils.logger.info("DomainController[" + this.identifier + "]:showView");
        var me = this;
        
        var view = me.domainView;
        var parent = me.domainView.findParentByType('domainview');
        
        while (parent !=null) {
             if (view != parent.getActiveTab()) 
                parent.getController().changeTab(view, parent.getActiveTab()); 
            
            view = parent;
            parent = parent.findParentByType('domainview');            
        }      
    },
    
   /**
    * Executes a workflow step initiated by {@link Baff.utility.workflow.WorkflowManager}.
    * @param wfContext The workflow context object.
    * @return wfContext
    */
    onNextStep: function(wfContext) {
        Utils.logger.info("DomainController[" + this.identifier + "]:onNextStep");
        var me = this;

        // If the view has been removed or disabled stop the workflow
        if (me.domainView == null) {
            wfContext.workflow = null;
            return wfContext;
        }
        
        // Check if the context has changed
        if (wfContext.stateResuming && 
            wfContext.context != me.getWorkflowContext()) {
            wfContext.workflow = null;
            return wfContext;
        }
        
        // Workflow manager is responsible for prompting user beforehand
        me.showView();
        me.showWaitMask(true);
        
        // Clone the current context
        var oldWfContext = Ext.clone(wfContext);
        
        var nextStep = me.selectNextStep(wfContext);
        
        if (nextStep == null) {
            // Must have finished
            wfContext.step = null;
            me.showWaitMask(false);
            return wfContext;
        }

        var view = null;
        
        // Old view is the active tab this controller
        var oldView = me.domainView.getActiveTab();
        
        // Get the view and display it
        if (nextStep.newView) {
           
            // Check if a popup is being displayed, if so assume we just use the related view
            // otherwise create a new one
            var popup = Ext.ComponentQuery.query('selectorpopup');
           
            if (popup != null && popup.length > 0)
                view = oldView;
            else if (me.getReferences().newtab != null)
                view = me.onNewTab(me.getReferences().newtab, oldView);
           
        }
        else {
            
            // Find the first existing view
            var children = Ext.ComponentQuery.query(nextStep.view, me.domainView);
            if (children.length > 0) {
                view = children[0];
            } 
            
        }
        
        if (view == null) {
                // Couldn't find the view
                Utils.logger.error(nextStep.view, " .... not found");
                wfContext.workflow = null;
                me.showWaitMask(false);
                return wfContext;
        }
        
        // If view is disabled then return
        if (view.isDisabled()) {
            Ext.copyTo(wfContext, oldWfContext, 'step, instruction, resume, replay, previous, allowPrev');
            me.showWaitMask(false);      
            return wfContext;
        }
        
        
        if (!nextStep.newView && view != oldView)
            me.changeTab(view, oldView);
        
        // Check if it's a AV or DV
        if (view.isXType('activityview')) {
            // Activity
            wfContext.step = nextStep.step;
            wfContext.instruction = nextStep.instruction;
        } else {
            // Sub workflow
            wfContext.workflow = nextStep.step; 
            wfContext.controller = view.getController();
            wfContext.step = null;
        }
        
        wfContext.activeView = view;
        
        me.showWaitMask(false);
        return wfContext;
        
    },
    
    /**
     * Select the next step. Default is to select next one in sequence - otherwise subclass should
     * override to provide necessary control logic (in which case steps do not have to be specified
     * in configuration).  The step should include:
     * step: the name of the step,
     * view: the activity or domain view name to be displayed
     * instruction: any instruction to be displayed (for an activity)
     * The following can be updated in wfContext:
     * resume: if its possible to resume from this activity
     * replay: if the workflow can be replayed (for the last activity)
     * previous: if it's possible to go back to the previous activity
     * allowPrev: if it's allowed to go back to the previous activity (i.e. not at the first activity)
     * @param wfContext The workflow context
     * @return The next step
     * @protected
     */
    selectNextStep: function (wfContext) {
        Utils.logger.info("DomainController[" + this.identifier + "]:selectNextStep");
        var me = this;
        
        var workflow = me.getWorkflow(wfContext);
       
        if (workflow == null)
            return null;
        
        wfContext.resume =  workflow.resume;
        wfContext.replay =  workflow.replay;
        wfContext.previous =  workflow.previous;
        wfContext.allowPrev = false;
        
        var steps = workflow.steps;
       
        if (wfContext.step == null) {
            return steps[0];
        }
        
        for (i=0;i<steps.length;i++) {
            if (steps[i].step == wfContext.step) {
                
                var stepSel;
                
                if (wfContext.stateResuming)
                    stepSel = i;
                else if (wfContext.statePrev)
                    stepSel = i-1;
                else if (i == steps.length-1)
                    stepSel = -1;
                else 
                    stepSel = i+1;
                
                if (stepSel >= 0) {
                    if (stepSel > 0)
                        wfContext.allowPrev = true;
                    
                    return steps[stepSel];
                } else {
                    return null;
                }
            }
        }
        
        return null;
      
    },
    
    /**
     * Gets the workflows for the given context. 
     * @param wfContext
     * @return {Array}
     * @protected
     */
    getWorkflow: function(wfContext) {
        var me = this;
        var workflows = me.getWorkflows();
        
        for (var i=0;i<workflows.length;i++) {
            if (workflows[i].workflow == wfContext.workflow) {
                return workflows[i];
            }
        }
        
        return null;
    },
    
    /**
     * Gets a unique context to ensure the workflow is still valid on resumption. Override if required.
     * @return {String}
     * @protected
     */
    getWorkflowContext: function() {
        var me = this;
        if (me.currentMasterEntity != null)
            return me.currentMasterEntity.getEntityId();
        else 
            return null;
    },
    
    /**
     * Tests if the view is at the lowest level
     * @param {Container} The container to be tested
     * @return {boolean}
     */
    isLowLevelView: function(view) {
        return (view.isXType('activityview') || 
                    view.isXType('dashboardview') || 
                    view.isXType('cardview'));
    }
         
});

// Bug in Ext.tab.Tab, fails to set focusable to false, results in multipe tab related events being fired
// making them impossible to handle cleanly
Ext.override('Ext.tab.Tab', {
    focusable: false
});
