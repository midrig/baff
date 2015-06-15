/**
 * A TreeController extends {@link Baff.app.controller.SelectorController} to support an activity that 
 *  involves selecting a data entity presented in a {@link Baff.app.view.TreeView}.
 *  
 * Records managed in a tree are based on {@link Baff.app.model.TreeModel} and held in a
 * {Baff.app.model.TreeStore}.  Each record is a node in the tree and represents a specific type of
 * {Baff.app.model.EntityModel}.
 * 
 *  A minimal setup only requires the {@link #entityModelSelector} and {@link #entityStoreSelector}
 *  to be specified, as follows:
 *  
 *      Ext.define('MyApp.controller.MyTreeController', {
 *          extend: 'Baff.app.controller.TreeController',
 *          alias: 'controller.mytreecontroller',
 *   
 *          requires: ['MyApp.store.MyTreeStore',
 *                          'MyApp.model.MyTreeModel'],
 *   
 *          config: {
 *              storeSelector: 'MyApp.store.MyTreeStore',
 *              modelSelector: 'MyApp.model.MyTreeModel'
 *          }
 *
 *      });  
 *    
 */
Ext.define('Baff.app.controller.TreeController', {
    extend: 'Baff.app.controller.SelectorController',    
    alias: 'controller.tree',
    
    requires: ['Baff.app.model.TreeStore',
                    'Baff.app.model.TreeModel'],
    
    /*
     * The path to the current node
     * @private
     */
    nodePath: null,
    
    /*
     * The {Baff.app.model.EntityModel} instance represented by the current node
     * @private
     */
    currentEntity: null,
    
    /**
     * A record provided externally to synchronize with
     * @private 
     */
    syncEntity: null,
    
    config: {
        
         /**
        * The type of {@link Baff.app.model.TreeModel} managed by the activity.  
        * **IMPORTANT**: This must be set by the subclass.
        * @cfg modelSelector (required) 
        */
        modelSelector: 'Baff.app.model.TreeModel',
        
        /**
        * Specifies that this activity is dependent on a master having been determined.
        * This is set to false for a TreeController as it processes different types of entity.
        */     
        dependentOnMaster: false,
        
        /**
        * Specifies if the first entity should be selected in the list.  
        */
        selectFirstRecord: false,
        
        /**
        * Specifies that this controller should fire an {@link #entitychange} event if it changes
        * its data entity being operated on.
        */    
        fireOnEntityChange: true
               
    },
    
    /**
    * Refreshes the activity and associated data.   
    * Called when the refresh button is clicked.    
    * @protected
    */    
    onRefreshButton: function() {
        Utils.logger.info("TreeController[" + this.identifier + "]::onRefreshButton");
        var me = this;
        
        // Refresh the node path
        me.nodePath = null;
        me.syncEntity = null;
        me.callParent(arguments);
        
    },

    /**
    * Sets the selected record following the store load and updates the search count.
    * Called after the store is first loaded.  
    * @protected
    */    
    onStoreFirstLoaded: function(store){
        Utils.logger.info("TreeController[" + this.identifier + "]::onStoreFirstLoaded");
        var me = this;
        
        if (me.checkDataIntegrity() == true) {

            // Try to select the current record
            if (me.currentRecord != null || me.syncEntity != null) {
                me.selectCurrentRecord(); 
            } else if (me.getSelectFirstRecord()) {
                me.selectFirstRecord(); 
            } else {
                me.selectRecord(null);
            }

            var allowModify = (me.allowUpdate && !me.isReadOnly);
            me.prepareView(true, allowModify, null, null);

            if (me.listPanel != null) 
                me.listPanel.updateSearchCount();      

        }
        
        this.showWaitMask(false);
       
    },
    
     /**
    * Sets the current record to the one selected in the list.
    * Called when an item in the list is selected.
    * @param {Ext.Selection.RowModel} selModel The selection model
    * @param {Baff.app.model.EntityModel} record The selected record
    */    
    onSelectList: function(selModel, record) {  
        Utils.logger.info("TreeController[" + this.identifier + "]::onSelectList");
        var me = this;
        var rec = record;
        
        me.nodePath = record.getPath();
        me.setCurrentRecord(record);
        me.enableWidget(me.selectButton, true);
               
    },
    
     /**
    * Selects {@link #currentRecord} in the list if not already selected.
    * @protected
    */         
    selectCurrentRecord: function() {
        Utils.logger.info("TreeController[" + this.identifier + "]::selectCurrentRecord");
        var me = this;
        
        var node = me.currentRecord;
        
        if (me.extEntityType != null) {
        
            // Try to find a matching record
            var newNode = me.getEntityNode(me.extEntityType, me.extEntityId);
        
            if (newNode != null)
                node = newNode;
        }
       
        me.selectRecord(node);
        
        
    },
    
    /**
    * Selects a node record in the list.
    * @param {Ext.foundation.EntityModel} record The entity record to be selected
    * @protected
    */        
    selectRecord: function (record) {
        Utils.logger.info("TreeController[" + this.identifier + "]::selectRecord");
        var me = this,
                found = false;
        
        if (record != null) {
            me.nodePath = record.getPath();                    
        } 
        
        // Always try to select a record based on the previously set node path
        if (me.nodePath != null) {
            
            Ext.Array.each(me.nodePath.split('/'), function(nodeId, index, nodePath) {
            
                var storeRecord = me.entityStore.getNodeById(nodeId);

                if (storeRecord != null) {
                    
                    if (index != (nodePath.length - 1) && !storeRecord.isExpanded() && storeRecord.isExpandable()) {
                        me.listPanel.expandNode(storeRecord);                    
                    
                    } else {
                    
                        me.listPanel.getSelectionModel().select(storeRecord, false, true);
                        me.nodePath = storeRecord.getPath();
                        me.enableWidget(me.selectButton, true);
                        me.setCurrentRecord(storeRecord);
                        
                    }
                
                    found = true;
                    return false;               
                }
                    
            }, me, true);
  
        } 
        
        // If no record provided or the provided one was not found
        // then select nothing
        if (!found) {

            me.listPanel.getSelectionModel().deselectAll(true);
            me.enableWidget(me.selectButton, false);
            me.setCurrentRecord(null);
            me.nodePath = null;
            
        }
    },
    
   /**
    * Synchronisises with an associated form, typically via a {Baff.app.controller.CardController}
    * @param {Baff.app.model.EntityModel} entity The entity record that has been selected or changed.
    */    
    syncWithExternal: function (record) {
        Utils.logger.info("ActivityController[" + this.identifier + "]::syncWithExternal");
        var me = this;
        
        var node = null;
            
        if (record != null) {
            
            if (record.isNodeEntity) {
               node = record;  // This should be an existing node
           
            } else if (me.currentRecord.getEntityId() != record.getEntityId() || 
                          me.currentRecord.getEntityType() != record.getEntityType()) {
                
                // Try to find a matching record
                node = me.getEntityNode(record.getEntityType(), record.getEntityId());
 
                // If we didn't find it, it could be because we need to refresh
                if (node == null) {                
                    me.extEntityId = record.getEntityId();
                    me.extEntityType = record.getEntityType();
                }
            }
            
            if (node != null)
                me.selectRecord(node);
            
        } else {
           me.selectRecord(null); 
        }
        
    }, 
    
    /**
    * Sets {@link #currentRecord} and fires {@link #masterentitychange} if processing a master 
    * entity record and {@link #fireOnMasterChange} is true.
    * @param {Baff.app.model.EntityModel} record The entity record being 
    * @param {boolean} fireContext Indicates to fire context even if there is no change (defaults to true)
    * @fires masterentitychange
    * @fires entitychange
    * @protected
    */    
    setCurrentRecord: function(record) {
        Utils.logger.info("TreeController[" + this.identifier + "]::setCurrentRecord");
        var me = this;
        
        var fireContext = (me.isActive && !me.dataRefresh);
        var fireEntityChange = false;
        
        if (record == false)
            record = null;
        
        if (me.currentRecord != record || record == null) {
            me.currentRecord = record;
            
            me.extEntityType = null;
            me.extEntityId = null;            
            me.currentEntity = me.getEntity(me.currentRecord);
            
            fireEntityChange = true;
            fireContext = true;
            
        }
        
        if (fireContext)
            me.fireContextEvent(record);
        
        if (fireEntityChange) {
            
            // If we have a valid entity then send that otherwise send node
            // In the event nothing is selected then null / null will be sent out
            // NB entity could reflect a "new" record                
            if (me.currentEntity != null)
                me.fireViewEvent('entitychange', me, me.currentEntity, me.currentEntity.getEntityType());
            else
                me.fireViewEvent('entitychange', me, me.currentRecord, me.currentRecord == null ? null : me.currentRecord.getEntityType());
        
        }
        
    },
    
     /**
    * Fires a {@link #contextchange} event if required.
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @fires contextchange
    * @protected
    */    
    fireContextEvent: function(record, contextSetterMap) {
        Utils.logger.info("TreeController[" + this.identifier + "]::fireContextEvent");
        var me = this;
        
        if (contextSetterMap != null) {
            // Not called by the framework, so perform standard processing
            me.callParent(arguments);
            return;
        }
        
        if (me.nodePath != null) {
            
            // Iterate back along the node path to find the first matching node
            // Nodes matched based on nodeType and/or entityType property (if neither specified then will match)
            Ext.Array.each(me.nodePath.split('/'), function(nodeId, index, nodePath) {

               var storeRecord = me.entityStore.getNodeById(nodeId);

                if (storeRecord != null) {
                    
                    var entity = me.getEntity(storeRecord);

                    // Fire context based on entity data - this requires the entity data to be present
                    if (me.getContextSetterMap() != null && entity != null) {

                        Ext.Array.each(me.getContextSetterMap(), function(contextSetting) {

                            if ((contextSetting.nodeType == null || storeRecord.get('nodeType') == contextSetting.nodeType) &&
                                (contextSetting.entityType == null || storeRecord.get('entityType') == contextSetting.entityType)) {

                                 me.fireContextEvent(entity, contextSetting.contextMapping)
                                 return false;

                            }

                         });

                     } 

                }

            }), me, true;
        }        
    },
    
     /**
    * Checks the version of the entity record loaded is consistent with the client data cache via 
    * {@link Utils #versionManager} if {@link useVersionManager} and {@link checkVersionOnView} 
    * are both true.  Note that this should only be the case when any mastered entity has it's version
    * correctly set by the service on retrieval, otherwise it will generally fail.
    * @param {Baff.app.model.EntityModel} record The entity record being processed
    * @protected
    */    
    checkVersionOnView: function(record) {
        Utils.logger.info("TreeController[" + this.identifier + "]::checkVersionOnView");
        var me = this;
        
        me.callParent(me.getEntity(record));
        
    },
     
    /**
     * Gets the entity for the given node
     * @param {Baff.app.model.TreeNode} node
     * @returns {Baff.app.model.EntityModel}
     */
    getEntity: function(node) {
            Utils.logger.info("TreeController[" + this.identifier + "]::getEntity");
            var me = this;
            
            if (node == null)
                return null;
            else
                return node.getEntity();
    },
    
    /**
     * Gets the node for the given entity - override if entity type is not the entity alias
     * @param {String} entityType
     * @param {String} entityId
     * @retruns {Baff.app.model.TreeNode} 
     */
    getEntityNode: function(entityType, entityId) {
            Utils.logger.info("TreeController[" + this.identifier + "]::getEntityNode");
            var me = this;
            
            if (entityType == null)
                return null;
  
            return me.entityStore.findNodeForEntity(entityType, entityId);
        
    }
   
    
}); 