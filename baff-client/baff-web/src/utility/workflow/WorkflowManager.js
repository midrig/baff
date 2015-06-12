/**
 *  A WorkflowManager manages execution of a sequence of workflow steps that are defined within
 *  {@link Baff.app.controller.DomainController}s.
 *  
 *  Workflows can be selected via a {@link Baff.utility.workflow.WorkflowToolbar} that presents the
 *  currently available workflows for the active views.  Only workflows for the active views are shown
 *  for usability; it is a design decision whether to create workflow wrappers that are visible at higher
 *  levels within the application. 
 */  
Ext.define('Baff.utility.workflow.WorkflowManager', {	
    extend: 'Ext.app.ViewController',
    alias: 'controller.workflow',
    singleton: true,
     
    /**
     * The workflow store
     * @private
     */  
    wfStore: null,
      
    /**
     * The workflow selector
     * @private
     */   
    wfSelector: null,
    
     /**
     * The next button on the toolbar
     * @private
     */  
    wfNextButton: null,    
    
     /**
     * The previous button on the toolbar
     * @private
     */  
    wfPrevButton: null,
   
     /**
     * The context object for the current workflow step, passed between this and the domain
     * controllers to manage workflow state, includes:
     * workflow: the workflow name
     * step: the step name
     * controller: the domain controller for the step
     * resume: if the workflow can be resumed if the user navigates away
     * replay: if the worklfow can be replayed once completed
     * previous: if the previous step can be returned to
     * statePaused: if the workflow is paused and waiting to be resumed
     * stateResuming: if the workflow is being resumed
     * statePrev: if the previous step has been selected (otherwise the next step has been selected
     */  
    wfContext: null,
    
     /**
     * The current workflow sequence; the last workflow in the list is the current one
     * @private
     */  
    wfChain: null,
    
    /**
     * The currently active domain controller
     * @private
     */  
    activeController: null,
    
    // Various display text for override in locale file
    dtConfirmTitle: 'Confirm',
    dtConfirmStopWorkflow: 'Stop the current workflow?',
    dtNextStep: 'Next Step',
    dtPreviousStep: 'Prev Step',
    dtInfoTitle: 'Info',
    dtFailedMsg: 'The current workflow state cannot be resumed.',
    dtRepeatMsg: 'Repeat',    
    dtOrFinish: 'or finish ?',
    dtOrContinue: 'or continue workflow ?',   
    dtBtnRepeat: 'Repeat',
    dtBtnFinish: 'Finish',
    dtBtnContinue: 'Continue',
    dtFinishedMsg: 'Workflow has been completed.',
    dtRootName: 'Workflows',
    dtStartInstruction: 'Select a workflow to begin.',
    dtNoWorkflow: 'No workflow selected',
    dtPauseInstruction: 'Workflow is paused.',
    dtResume: 'Resume', 
    dtActivityNotAvailableMsg: 'The next activity is not yet available.',
    dtCompleteCurrentMsg: 'Please complete the current activity.',
    
    /**
     * Initialises the workflow manager.
     */ 
    init: function() {
        Utils.logger.info("WorkflowManager::init");
        var me = this;
        
        me.wfStore = Ext.create('Ext.data.TreeStore');
        me.wfSelector = me.lookupReference('wfSelector');
        me.wfNextButton = me.lookupReference('wfNextButton');
        me.wfPrevButton = me.lookupReference('wfPrevButton');
        me.wfInstruction = me.lookupReference('wfInstruction');
        me.wfName = me.lookupReference('wfName');
        
        me.wfSelector.on('selectionchange', me.onWorkflowSelection, me);
        me.wfNextButton.on('click', me.onClickNextButton, me);
        me.wfPrevButton.on('click', me.onClickPrevButton, me);
        
        me.setStartState();

    },
    
    /**
     * Sets a listener on any a new toolbar button.
     * Called when the workflow toolbar selection changes.  
     */ 
    onWorkflowSelection: function (selector, selection) {
        var me = this;
        
        // If there are no children then must be a leaf node so set a listner on its button
        if (selection != null && selection.getData().children == null) {
        
            // Find the button
            me.wfSelector.items.each(function (item) {
                if (item.getText() == selection.getData().text) {
                    item.on('click', me.onClickWorkflowSelector, me);
                }
            
            });
        }        
    },
    
    /**
     * Initiates a workflow.  Called by clicking on a workflow button.
     */
    onClickWorkflowSelector: function(button) {
        var me = this;
        
        if (me.wfContext != null) {
            Ext.Msg.confirm(me.dtConfirmTitle, me.dtConfirmStopWorkflow, 
                function(btn) {
                    if (btn == 'yes')
                        me.startWorkflow();
             });
        }else {
            me.startWorkflow();
        }
                        
    },
   
    /**
     * Selects the next step in the workflow.
     * Called by clicking on the next button.
     */
    onClickNextButton: function () {
        var me = this;
        
        me.wfContext.statePrev = false;
        me.onClickButton(); 
    
    },
    
    /**
     * Selects the previous step in the workflow.
     * Called by clicking on the previous button.
     */
    onClickPrevButton: function () {
        var me = this;
        
        me.wfContext.statePrev = true;
        me.onClickButton(); 
        
    },
    
    /**
     * Prompts the user if required before initiating the next step.
     * Called when either the next or previous buttons are clicked.
     */
    onClickButton: function () {
        var me = this;
        
        var prompt = me.activeController.getDeactivationPrompt(true); 
        if (prompt != "") {

            Ext.Msg.confirm(me.dtConfirmTItle, prompt, 
                function(btn) {
                    if (btn == 'yes')
                        me.nextStep();
                }
            );

        } else {
            me.nextStep();
        }
    
    },
    
    /**
     * Sets the workflow selector state when a new view is selected by the user.
     */
    onActiveViewChange: function(view) {
        Utils.logger.info("WorkflowManager::onActiveViewChange");
        var me = this;
        
        // Get the domain controller
        var controller;
        
        if (view.isXType('domainview'))
            controller = view.getController();
        else
            controller = view.findParentByType('domainview').getController();
        
        // Set the state if not triggered by workflow step execution or it's the active workflow
        if (me.wfContext != null && !me.processingNextStep && view != me.wfContext.activeView) {
                
                if (me.wfContext.resume != true) {
                    me.setStartState();
                } else {
                    me.wfContext.context = me.wfContext.controller.getWorkflowContext();
                    me.setPausedState();
                }        
        }
        
        // If a new domain controller
        if (controller != me.activeController) {
            
            me.activeController = controller;
            me.setAvailableWorkflows(controller);
             
            // If currently processing a workflow 
            if (me.wfContext != null && !me.wfContext.statePaused) {
              
                // Try to select the workflow in the toolbar
                var root = me.wfStore.getRoot();
                var node = root.findChild("text", me.wfContext.owningView, true);
                
                 if (node != null)
                     node = node.findChild("text", me.wfContext.owningWorkflow);
                 
                 if (node != null)
                     me.wfSelector.setSelection(node);               
              }
        }
        
    },
    
    /**
     * Starts a new workflow.
     */
    startWorkflow: function () {
        Utils.logger.info("WorkflowManager::startWorkflow");
        var me = this;
                         
        me.wfContext = {};

        var item = me.wfSelector.getSelection().getData();
        
        me.wfChain = new Array();
        var link = me.addWfLink(item.text, item.controller);
        
        var parentNode = me.wfStore.getNodeById(item.parentId);

        me.wfContext.owningView = parentNode.getData().text;
        me.wfContext.owningWorkflow = item.text;
        me.wfContext.workflow = item.text;
        me.wfContext.controller = item.controller;
        me.wfContext.step = null;

        me.nextStep();                       
         
    },
    
    /**
     * Completes the next step in a workflow.
     */ 
    nextStep: function() {
        Utils.logger.info("WorkflowManager::nextStep");
        var me = this;
        
        me.processingNextStep = true;
          
        // Avoid button presses whilst determining workflow step
        me.wfNextButton.disable();
        me.wfPrevButton.disable();
        
        var currentWorkflow = me.wfContext.workflow;
        var currentStep = me.wfContext.step;
        
        me.wfNextButton.setText(me.dtNextStep);
        
        if (me.wfContext.statePaused) {
            me.wfContext.statePaused = false;
            me.wfContext.stateResuming = true; 
        }
        
        me.wfContext.controller.onNextStep(me.wfContext); 
        var wasResuming = me.wfContext.stateResuming;
        me.wfContext.stateResuming = false;
               
        if (me.wfContext.workflow == null) {
            
            Utils.logger.debug("Workflow undefined, stopping");
           
            // Finished unexpectedly
            Ext.Msg.alert(me.dtInfoTitle, me.dtFailedMsg);
            me.setStartState();
            
        } else if (currentWorkflow != me.wfContext.workflow) {
            
            Utils.logger.debug("Switching to child workflow....");
            
            // Switched workflow - add node and call controller
            me.addWfLink(me.wfContext.workflow, me.wfContext.controller);
           
            me.wfContext.step = null;
            
            me.nextStep();
            me.wfNextButton.enable();
           
        } else if (me.wfContext.step == null) {
            
            Utils.logger.debug("Finished current workflow....");
            
            // Check to see if current workflow can be replayed
            if (me.wfContext.replay) {
                
                var prompt = me.dtRepeatMsg + " " + me.wfContext.workflow + "</br>";
                var buttons;
                
                // Check if only this workflow in the chain)
                if (me.wfChain.length == 1) {
                    prompt += me.dtOrFinish;
                    buttons = {yes: me.dtBtnRepeat, no: me.dtBtnFinish};
                } else {
                    prompt += me.dtOrContinue;
                    buttons = {yes: me.dtBtnRepeat, no: me.dtBtnContinue};
                }
                
                Ext.Msg.show({
                    title: me.dtConfitmTitle,
                    message: prompt,
                    buttonText: buttons,
                    fn: function(btn) {
                        if (btn == 'yes') {
                            me.wfContext.step = null;
                            me.nextStep();
                        }
                        else {
                            me.nextContinue(false);
                        }
                    }
                });
                
                return;         
            }
            
            me.nextContinue(true);
            return;
        
        } else {
            
            Utils.logger.debug("Continuing with current workflow....");
            
            if (me.wfContext.step == currentStep && !wasResuming) { 
                Utils.logger.debug("Next step not available....");
                Ext.Msg.alert(me.dtInfoTitle, me.dtActivityNotAvailableMsg + "</br></br>" + me.dtCompleteCurrentMsg);
            }
                
            // Stick with current workflow
            me.wfInstruction.update(me.wfContext.instruction);
            me.wfName.update(me.wfContext.workflow);
            me.wfNextButton.enable();
            
            if (me.wfContext.previous && me.wfContext.allowPrev)
                me.wfPrevButton.enable();
            else
                me.wfPrevButton.disable();
            
        }
        
        me.processingNextStep = false;
         
    },
    
    /**
     * Continue processing the current workflow.
     * @param {boolean} if the finished prompt should be shown
     */
    nextContinue: function(prompt) {
        Utils.logger.info("WorkflowManager::nextContinue");
        var me = this;
          
        // Process next level up if it exists
        if (me.wfChain.length > 1) {
           
            var prevLink = me.wfChain.pop();
            var link = me.wfChain[me.wfChain.length-1];
            
            Utils.logger.debug("Finished child workflow " + prevLink.workflow + "  ,returning to parent workflow...." + link.workflow);

            me.wfContext.workflow = link.workflow;
            me.wfContext.controller = link.controller;
            me.wfContext.step = prevLink.workflow;

            me.nextStep();

        } else {

            Utils.logger.debug("Finished worklfow, stopping");

            // Finished
            if (prompt)
                Ext.Msg.alert(me.dtInfoTitle, me.dtFinishedMsg);
            
            me.setStartState();

        }
        
        me.processingNextStep = false;
    },
    
    /**
     * Adds a link to the current workflow chain.
     */
    addWfLink: function (workflow, controller) {
        var me = this;
        
        var link = {};
        link.workflow = workflow;
        link.controller = controller;
       
        me.wfChain.push(link);

        return link;
            
    },
    
     /**
     * Determines the available workflows for the current activity and it's parents
     * and builds the store for the workflow selector toolbar.
     * @param {@link Baff.app.controller.DomainController}
     */
    setAvailableWorkflows: function(activeDC) {
        Utils.logger.info("WorkflowManager::setAvailableWorkflows");
        var me = this;
       
        var controller, 
              workflows,
              i,j,
              len = 0,
              node = null;
        
        var view = activeDC.getView();
        var topView = null;
        
        // Loop up through this activity and its parents
        while (view != null && view.isXType('domainview')) {
            
            // Get the workflow config for the domain controller
            controller = view.getController();          
            workflows = controller.getAvailableWorkflows();
            
            if (workflows != null) {
            
                var found = false;
                 
                // Loop through the workflows for this domain
                for (i=0;i<workflows.length;i++) {
                    if (workflows[i].visible != false) {
                   
                        if (!found) {

                            // The first child for the node should be a link to the previous activity's workflows
                             if (node != null) {
                                 var newNode = {};
                                 newNode.children = [];
                                 newNode.children[0] = node;
                                 node = newNode;
                                 j = 1;
                             } else {
                                 node = {};
                                 node.children = [];
                                 j = 0
                             }  
                             
                            node.text = controller.originalTitle;
                            node.iconCls = 'workflow';
                            node.controller = controller;
                            found = true;
                        }
                        
                        node.children[j] = {};
                        node.children[j].leaf = true;
                        node.children[j].text = workflows[i].workflow;
                        node.children[j].iconCls = 'activity';
                        node.children[j].controller = controller;
                        j++
                    }
                }
            
             len++;
            
            }
           
            topView = view;
            view = view.findParentByType('domainview');  
             
        }
        
        var rootNode;
        
        if (node != null) {
            if (node.text == topView.getController().originalTitle) {
                rootNode = node;            
            } else {
                rootNode = {};
                rootNode.children = [];
                rootNode.children[0] = node;
                len++;
            }
        } else {
            rootNode = {};
            rootNode.children = [];
            len++;
        }
        
        if (Utils.globals.dtRootName != null)
            rootNode.text = Utils.globals.dtRootName;
        else if (Utils.globals.applicationName != null)
            rootNode.text = Utils.globals.applicationName;
        else
            rootNode.text = me.dtRootName;
 
        rootNode.iconCls = 'root';
            
        me.wfStore.setRoot(rootNode);
        me.wfSelector.setStore(me.wfStore);

        // Select the lowest level activity in the toolbar
        var selection = me.wfStore.getRoot();

        for (i=0;i<len-1;i++)
            selection = selection.childNodes[0];

        me.wfSelector.setSelection(selection);
                 
    },
    
    /**
     * Set the state if no workflow selected.
     */
    setStartState: function() {
        var me = this;

        me.wfContext = null;
        me.wfInstruction.update(me.dtStartInstruction);
        me.wfName.update(me.dtNoWorkflow);
        me.wfNextButton.setText(me.dtNextStep);
        me.wfPrevButton.setText(me.dtPreviousStep);
        me.wfNextButton.disable();
        me.wfPrevButton.disable();
    },
    
    setPausedState: function() {
        var me = this;

        me.wfNextButton.setText(me.dtResume);
        me.wfInstruction.update(me.dtPauseInstruction);
        me.wfPrevButton.disable();
        me.wfContext.statePaused = true;
    },
    
    isDeactivationPromptRequired: function() {
        var me = this;
        
        if (me.wfContext != null && me.wfContext.resume != true)
            return true;
        else
            return false;
        
    }
  

});
