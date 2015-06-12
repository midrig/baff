

package com.midrig.baff.app.entity;

import com.midrig.baff.app.json.JsonItem;
import java.util.List;
import java.util.UUID;
import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonValue;

/**
 * A TreeNode defines nodes in a tree that represent business data entitys. 
 * The tree node is typically used to define the child nodes of a parent node based on a list of {@link BusinessEntity}
 * passed into its constructor, along with other properties that define the node.
 * 
 */
public class TreeNode<T extends BusinessEntity> extends JsonItem {
    
    /**
     * Set in constructor to define the list of entities that are to be represented as nodes.
     */
    protected final List<T> entityList;
    
    /**
     * Set in the constructor to define an arbitrary node type that is used to form the node identifier.
     */
    protected final String nodeType;    
    
    /**
     * Set in the constructor to define the entity type that is used to form the node identifier.
     * This will also be used on the client to determine the type of model to use.  Defaults to the short name
     * of the {@link BusinessEntity} provided in the list.
     */
    protected final String entityType;
    
    /**
     * Set in the constructor to specify that the entity data should be included in the node composition.
     */
    protected final boolean addEntityData;
    
    /**
     * Set in the constructor to specify a phantom entity that can be used to represent a new
     * child data entity that may be added..
     */
    protected final T newEntity;
    
    /**
     * Set in the constructor to specify if it is possible to add children to the entities for which 
     * these nodes are being created.  This is necessary in order to determine if the node is leaf or not.
     */
    protected final boolean canAddChild;
    
    /**
     * A NodeId class defines the node identifier comprising node type, entity type and entity id.
     */
    static public class NodeId {
        
        public final String nodeType;
        public final String entityType;
        public final String entityId;
        
        public NodeId(String nodeType, String entityType, String entityId) {
            
            this.nodeType = nodeType;
            this.entityType = entityType;
            this.entityId = entityId;
        }
        
    }     

    /**
     * TreeNode constructor
     * @param entityList The list of data entities to create nodes for
     * @param nodeType The node type descriptor
     */
    public TreeNode(List<T> entityList, String nodeType) {
        
        this.nodeType = nodeType;
        this.entityType = null;
        this.entityList = entityList;
        this.addEntityData = false;
        this.newEntity = null;
        this.canAddChild = false;
       
    }
    
    /**
     * TreeNode constructor
     * @param entityList The list of data entities to create nodes for
     * @param nodeType The node type descriptor
     * @param addEntityData Specifies if entity data should be added to the node
     * @param newEntity  Specifies a phantom representing an entity that can be added
     */
    public TreeNode(List<T> entityList, String nodeType, boolean addEntityData, T newEntity) {
        
        this.nodeType = nodeType;
        this.entityType = null;
        this.entityList = entityList;
        this.addEntityData = addEntityData;
        this.newEntity = newEntity;
        this.canAddChild = false;
        
    }
    
    /**
     * TreeNode constructor
     * @param entityList The list of data entities to create nodes for
     * @param nodeType The node type descriptor
     * @param addEntityData Specifies if entity data should be added to the node
     * @param newEntity  Specifies a phantom representing an entity that can be added
     * @param canAddChild Specifies that children can be added to the entities represented by these nodes 
     */
    public TreeNode(List<T> entityList, String nodeType, boolean addEntityData, T newEntity, boolean canAddChild) {
        
        this.nodeType = nodeType;
        this.entityType = null;
        this.entityList = entityList;
        this.addEntityData = addEntityData;
        this.newEntity = newEntity;
        this.canAddChild = canAddChild;
        
    }

    /**
     * 
     * TreeNode constructor
     * @param entityList The list of data entities to create nodes for
     * @param nodeType The node type descriptor
     * @param addEntityData Specifies if entity data should be added to the node
     * @param newEntity  Specifies a phantom representing an entity that can be added
     * @param canAddChild Specifies that children can be added to the entities represented by these nodes 
     * @param entityType Specifies the entity type 
     */
    public TreeNode(List<T> entityList, String nodeType, boolean addEntityData, T newEntity, boolean canAddChild, String entityType) {
        
        this.nodeType = nodeType;
        this.entityType = entityType;
        this.entityList = entityList;
        this.addEntityData = addEntityData;
        this.newEntity = newEntity;
        this.canAddChild = canAddChild;
       
    }
    
    /**
     * Constructs a {@link NodeId} instance for the given string 
     * @param nodeId The node id string in the format "nodeType|entityType|entityId"
     * @return the node identifier
     */
    public static NodeId getNodeId(String nodeId) {
        
        NodeId nId = null;
        
        if (nodeId != null) {
        
            String[] parts = nodeId.split("\\|", -1);
            
            if (parts.length == 1)
                nId = new NodeId(nodeId, null, null);
            else if (parts.length == 3)
                nId = new NodeId(parts[0], parts[1], parts[2]);
            
        }
                        
        return nId;
        
    }
    
    /**
     * Converts this object to a JsonObject
     * @return the JsonObject
     */
    @Override
    public JsonObject toJson() {

        JsonObjectBuilder nodeBuilder = Json.createObjectBuilder();
        
        nodeBuilder.add("success", true);
        nodeBuilder.add("expanded", true);
        
        final JsonArrayBuilder arrayBuilder = Json.createArrayBuilder();

        for (T entity : entityList) {            
            arrayBuilder.add(createJsonNode(entity));
        }

        if (newEntity != null)
            arrayBuilder.add(createJsonNode(newEntity));

        nodeBuilder.add("data", arrayBuilder);
        
        return nodeBuilder.build();

    }
    
    /**
     * Creates the node in Json format for a given entity
     * @param entity
     * @return a JsonObjectBuilder
     */
    protected JsonObjectBuilder createJsonNode(T entity) {
        
            String entityType = this.entityType;
            if (entityType == null)
                entityType = entity.getClass().getSimpleName();
            
            JsonObjectBuilder childBuilder = Json.createObjectBuilder();
            
            String nodeEntityId = null;
            String entityId = null;
            String masterEntityId = null;
            
            if (entity.getEntityId() != null) {
                entityId = entity.getEntityId().toString();
                nodeEntityId = entityId;    
                addJsonElement(childBuilder, "newEntity", false);
            } else {
                nodeEntityId = "null[" + UUID.randomUUID().toString() + "]"; 
                addJsonElement(childBuilder, "newEntity", true);
            }
            
            // The following ensures master details are available to the node as well as any
            // entity data added
            if (entity.isMastered && entity.getMasterEntityId() != null)
                masterEntityId = entity.getMasterEntityId().toString();
            
            addJsonElement(childBuilder, "nodeId", nodeType + "|" + entityType + "|" +  nodeEntityId);
            addJsonElement(childBuilder, "nodeType", nodeType);
            addJsonElement(childBuilder, "entityId", entityId);
            addJsonElement(childBuilder, "entityType", entityType);   
            addJsonElement(childBuilder, "masterEntityId", entityId);
            
            boolean leaf = getLeafAndCustomFields(entity, childBuilder);

            addJsonElement(childBuilder, "leaf", leaf); 
            
            if (this.addEntityData) {
                JsonObjectBuilder entityBuilder = Json.createObjectBuilder();
                entity.getJson(entityBuilder);
                childBuilder.add("entityData", entityBuilder);
            } else {
                childBuilder.add("entityData", JsonValue.NULL);
                
            }
            
            return childBuilder;
    }
    
    /**
     * Determines if the node is a leaf and sets an custom fields.
     * This should be overridden by the sub class as required.
     * @param entity
     * @param childBuilder
     * @return true if the node is leaf
     */
    protected boolean getLeafAndCustomFields(T entity, JsonObjectBuilder childBuilder) {
        
        // May add a specific model name or alias here
        //childBuilder.add("entityName", entity.getClass().getSimpleName());
        
        return canAddChild;
    }

}
