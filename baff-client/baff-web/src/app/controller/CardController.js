/**
 *  A Card Domain Controller controls a {@link Baff.app.view.CardView}, which manages a set of activity views
 *  in card layout, typically {@link Baff.app.view.FormView}s with a {@link Baff.app.view.TrreView} to select the
 *  entity to be managed in the form. 
 *  
 * A typical implementation is simply as follows, assuming that any user can access the dashboard and that its 
 * title is not selected from any particular entity record.  
 * 
 *     Ext.define('MyApp.controller.MyMainCardController', {
 *         extend: 'Baff.app.controller.CardController',           
 *         alias: 'controller.maincardcontroller',
 *          
 *     });
 *  
 */
Ext.define('Baff.app.controller.CardController', { 
    extend: 'Baff.app.controller.BaseDomainController',   
    requires: ['Baff.utility.Utilities'],
    alias: 'controller.card',
   
   /**
    * The selector view, typically a {@link Baff.app.view.TreeView}
    * @private
    */
    selectorView: null,
    
    /**
     * The {Baff.app.view.CardView}
     * @private
     */
    cardView: null,
    
    /**
     * The currently selected card
     * @private
     */
    currentCard: 0,
    
   
    /**
    * Initialises the controller.    
    */        
    init: function() {        
        var me = this;
        
        me.callParent(arguments);
         
        me.selectorView = me.lookupReference(me.domainView.selectorViewRef);
        me.cardView = me.lookupReference(me.domainView.cardViewRef);
        
        // Set the card activities to listen to an fire entity change events and not reset on context change since
        // this controller will manage their state directly
         Ext.Array.each(me.cardView.getLayout().getLayoutItems(), function(card) {
             if (card.isXType('activityview'))  {
                card.on('entitychange', me.onEntityChange, me);
                card.getController().setFireOnEntityChange(true);
                card.getController().setResetOnContextChange(false);
                }
        });
  
    },     
   
    /**
    * Called by the framework to activate the activity.
    * Activates underlying activities.
    * @protected
    */   
    onActivateView: function() {
        Utils.logger.info("CardController[" + this.identifier + "]::onActivateView");
        var me=this;
        
        // Activate sub views
        var currentCard = me.cardView.getLayout().getActiveItem();
         
        if (currentCard.isXType('activityview'))
            currentCard.getController().onActivateView();
        
        if (me.selectorView != null)
            me.selectorView.getController().onActivateView();
        
    },
    
    /**
    * Called by the framework to deactivate the activity.
    * Deactivates underlying activities. 
    * @protected
    */   
    onDeactivateView: function() {
        Utils.logger.info("CardController[" + this.identifier + "]::onDeactivateView");
        var me=this;
        
        // Dectivate sub views
        if (me.selectorView != null)
            me.selectorView.getController().onDeactivateView();
        
        var currentCard = me.cardView.getLayout().getActiveItem();
         
        if (currentCard.isXType('activityview'))
            currentCard.getController().onDeactivateView();
        
    },
    
    /**
     * Override super class so as not to relay master entity change events to child activities.
     * @protected
     */
    onMasterEntityChange: function() {
       // Do Nothing 
    },
    
    /**
    * Handles a change to a data entity as a result of the {@link #entitychange} event. 
    * Activates the relevant card view.
    * @param {Baff.app.controller.ActivityController} controller The activity controller that fired the event
    * @param {Baff.app.model.EntityModel} record The entity record or{@link Baff.app.model.TreeModel} 
    * that has been selected
    * @param {String} type The entity type
    * @protected
    */    
    onEntityChange: function(controller, record, type) {       
        Utils.logger.info("CardController[" + this.identifier + "]:onEntityChange");
        var me = this;
       
        var currentCard = me.cardView.getLayout().getActiveItem();
        
        if (currentCard.isXType('activityview') && currentCard.getController() == controller) {
            
            // Need to sync as may have added a record
            // But don't sync if null - even if deleted a record then the selector should reset
            if (record != null) {

                me.setCurrentRecord(record, type);

                if (me.selectorView != null)
                    me.selectorView.getController().syncWithExternal(record);
            }
            
        } else if (me.selectorView != null && me.selectorView.getController() == controller) {
            
            var node = null;
           
            if (record != null)
                node = record.isNodeEntity ? record : record.node;    
                    
            if (!me.matchCurrentRecord(record, type) && me.isDeactivationPromptRequired()) {

                Ext.Msg.confirm(me.dtConfirmTitle, me.dtContinueWithoutSavingMsg, 
                function(btn) {

                    if (btn == 'yes') {
                        me.setCurrentRecord(record, type);
                        //me.selectCard(record, type);
                        me.currentNode = node;
                        me.selectCard(type, record);

                    } else if (me.selectorView != null) {
                            me.selectorView.getController().syncWithExternal(me.currentNode);
                    }

                });

            } else {
                
                // Only update if the node is different, which may also be due to refresh
                if (me.currentNode != node) {

                    me.currentNode = node;
                    me.setCurrentRecord(record, type);
                    me.selectCard(type, record);                            
                
                }
            }
        } 
        
    },
    
    /**
    * Set the current record
    * @param {Baff.app.model.EntityModel} record The entity record or{@link Baff.app.model.TreeModel} 
    * that has been selected
    * @param {String} type The entity type
    * @protected
    */
    setCurrentRecord: function(record, type) {
        var me = this;

        me.currentEntityId = (record == null ? null : record.getEntityId());
        
        // Make sure we are not holding an ailias
        var name = Ext.ClassManager.getNameByAlias(type);
        me.currentEntityType = (name != "" ? name : type);
   },
    
    /**
    * Checks if the provided record matches the current record
    * @param {Baff.app.model.EntityModel} record The entity record or{@link Baff.app.model.TreeModel} 
    * that has been selected
    * @param {String} type The entity type
    * @returns {Boolean}
    * @protected
    */
    matchCurrentRecord: function(record, type) {
        var me = this;

        var entityId = (record == null ? null : record.getEntityId());
        return (entityId == me.currentEntityId && type == me.currentEntityType);

    },

    /**
    * Selects and activates a card based on the record provided
    * @param {Baff.app.model.EntityModel} record The entity record or{@link Baff.app.model.TreeModel} 
    * that has been selected
    * @param {String} type The entity type
    * @protected
    */
    selectCard: function(type, record) {
        Utils.logger.info("CardController[" + this.identifier + "]:selectCard");
        var me = this;
        
        var currentCard = me.cardView.getLayout().getActiveItem();
        
        var cardViews = me.cardView.getLayout().getLayoutItems();
        var card = me.getCardForEntity(cardViews, type);
        
        if (currentCard.isXType('activityview'))
            currentCard.getController().onDeactivateView();

        if (card == null)
            card = cardViews[0];
        
        if (card.isXType('activityview')) {
            // If the record is an node then update the filters before calling onActivateView with no record
            // Otherwise we can pass the record directly
            if (record.isNodeEntity) {
                card.getController().updateEntityFilter(record, true);
                card.getController().onActivateView();
            
            } else {
                card.getController().onActivateView(record);
            
            }
        }
                     
        me.cardView.getLayout().setActiveItem(card);
        
    },
    
    /**
     * Determines the card associated with an entity type
     * @param {Array} cardViews The array of {Baff.app.view.CardView}
     * @param {String} type The entity type
     * @returns {Baff.app.view.CardView}
     * @protected
     */
    getCardForEntity: function(cardViews, type) {
        Utils.logger.info("CardController[" + this.identifier + "]:getCardForEntity");
        var me = this;
        
        if (type == null || type == '')
            return null;
        
        var card = null;
        
        Ext.Array.each(cardViews, function(view) {
            if (view.isXType('activityview') && view.getController().getModelSelector() == type) {
                card = view;
                return false;
            }
        });
        
        return card;
    
    },
    
    /**
    * Determines if the user should be prompted when the activity's view is de-activated / hidden.
    * @return {boolean}
    */  
    isDeactivationPromptRequired: function() {
        var me = this;
        
        var currentCard = me.cardView.getLayout().getActiveItem();
        
        if (currentCard.isXType('activityview'))
            return currentCard.getController().isDeactivationPromptRequired();
        else
            return false;
    }


});