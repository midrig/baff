Ext.define('Evaluator.controller.activity.OptionController', {
    extend: 'Baff.app.controller.ListFormController',
    
    alias: 'controller.option',
    
    requires: ['Evaluator.store.OptionStore',
                    'Evaluator.model.Option'],
                
    toggleRelative: false,
    toggleScore: 'Act',
    toggleAllScores: false,
    
    config: {
        
        refs: {       
           viewSelector: 'optionview',  
           toggleRelativeButton: 'optionview #toggleRelativeButton',
           toggleScoreButton: 'optionview #toggleScoreButton',
           toggleScopeButton: 'optionview #toggleScopeButton'
           
        },
        
        control: {
            toggleRelativeButton: {tap: 'onToggleRelativeButton'},
            toggleScoreButton: {tap: 'onToggleScoreButton'},
            toggleScopeButton: {tap: 'onToggleScopeButton'}
        },
        
        readRoles: ['evaluator.read'],
        updateRoles: ['evaluator.update'],
        
        storeSelector: 'Evaluator.store.OptionStore',
        modelSelector: 'Evaluator.model.Option',
        
        contextSetterMap: [{fieldName: 'id', contextMap: 'optionId'}],
        contextListener: true,
        fireOnEntityChange: true
               
    },
    
    
    prepareActivity: function() {
        Utils.logger.info("OptionController:prepareStore");
        var me = this;
        
        if (me.toggleAllScores) {
            me.evaluatorId = -1;
        }else {
            me.evaluatorId = me.getExternalContext("evaluatorId");
        }
        
        // Set to be sure in any case
        me.entityStore.setParam('evaluatorId', me.evaluatorId); 
       
    },
    
    setupAccessControl: function() {
        Utils.logger.info("OptionController:setupAccessControl");
        var me = this;
        
        // Call superclass
        me.callParent(arguments);       
        
        // Get user role context and set read only if not administrator
        var role = me.getExternalContext("userRole");
        
        // Do not allow updates if not an adminstrator
        if (role != Utils.refDataManager.getCode("ADMIN", "EVALGROUP.USERROLE"))
            me.setReadOnly();
          
        
    },

    onToggleRelativeButton: function() {
        Utils.logger.info("OptionController:onToggleRelativeButton");
        var me = this;
        
        me.toggleRelative = !me.toggleRelative;
        
        me.getToggleRelativeButton().setText(me.toggleRelative ? 'Rel' : 'Abs');
        me.listPanel.getItemTpl().toggleRelative = me.toggleRelative;
        me.listPanel.refresh();
        
    },
    
    onToggleScoreButton: function () {
        Utils.logger.info("OptionController::onToggleScoreButton");
        var me = this;
        
        me.toggleScore = (me.toggleScore == 'Act' ? 'Wgt' : (me.toggleScore == 'Wgt' ? 'Bal' : 'Act'));
        
        me.getToggleScoreButton().setText(me.toggleScore);
        me.listPanel.getItemTpl().toggleScore = me.toggleScore;
        me.listPanel.refresh();
        
        
    },
    
    onToggleScopeButton: function () {
        Utils.logger.info("OptionController::onToggleScopeButton");
        var me = this;
        
        me.toggleAllScores = !me.toggleAllScores;
        
        me.getToggleScopeButton().setText(me.toggleAllScores ? 'All' : 'Mine');
        me.getToggleScopeButton().setIconCls(me.toggleAllScores ? 'usergroup' : 'user');
       
        me.reset();

    },
    
    /**
    * Toggles the view between the listbox and the form.   
    */    
    toggleListFormPanels: function(showForm) {
        Utils.logger.info("OptionController[" + this.identifier + "]::toggleListFormPanels");
        var me = this;
        
        me.callParent(arguments);
        
        me.showWidget(me.getToggleRelativeButton(), !showForm); 
        me.showWidget(me.getToggleScoreButton(), !showForm); 
        me.showWidget(me.getToggleScopeButton(), !showForm); 
    }
        

    
    
}); 