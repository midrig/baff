package com.midrig.baff.app.service;

import com.midrig.baff.app.json.JsonItem;
import com.midrig.baff.app.json.JsonObjectProcessor;
import java.io.Serializable;
import java.io.StringReader;
import java.util.HashMap;
import java.util.LinkedHashMap;
import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonReader;
import javax.json.JsonValue;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A ServiceRequest represents a requests to a service operation.
 * It is a value object used to pass various immutable parameters to the service.  It should not be
 * instantiated directly, but rather via the {@link ServiceRequestFactory}.
 *
 * @param <ID> the associated entity's identifier type.
 */  
public class ServiceRequest <ID extends Serializable> extends JsonItem{
    
    /**
     * A PageInfo holds paging information, including sort and filter criteria.
     */
    static public class PageInfo {
        
        public Integer limit;
        public Integer page;
        public Integer start;
        public LinkedHashMap<String, String> sorters;
        public LinkedHashMap<String, String> filters;
        
        
        public PageInfo(Integer limit, Integer page, Integer start, String sorters, String filters) {
             
            this.limit = limit;
            this.page = page;
            this.start = start;
            this.sorters = stringToHashMap(sorters, "property", "direction");  
            this.filters = stringToHashMap(filters, "property", "value");
        
        }       
                
        public PageInfo(Integer limit, Integer page, Integer start, LinkedHashMap<String, String> sorters, LinkedHashMap<String, String> filters) {
        
            this.limit = limit;
            this.page = page;
            this.start = start;
            this.sorters = sorters;  
            this.filters = filters;
        
        }  
        
        // Used to put the sorters and filters into a hashmap
        private LinkedHashMap<String, String> stringToHashMap(String input, String nameId, String valueId) {           
            
            if (input == null)
                return null;
           
            LinkedHashMap<String, String> hashMap = null;
            
            JsonReader reader = Json.createReader(new StringReader(input));
            JsonArray array = reader.readArray();

            if (array != null && array.isEmpty() == false) {
                
                    hashMap = new LinkedHashMap<>();
                    
                    for (JsonValue jv: array) {
                    
                        JsonObjectProcessor jp = new JsonObjectProcessor((JsonObject)jv);                    

                        String name = jp.getString(nameId, null);
                        String value = jp.getString(valueId, null);
                       
                        String cv = hashMap.get(name);
                        
                        if (cv != null)
                            value = cv + "|" + value;
                        
                        hashMap.put (name, value);
                        
                    }
            }
            
            return hashMap;
        }
            
        
    };
    
    final private PageInfo pageInfo;  
    final private ID entityId;
    final private String type;
    final private JsonObject data;
    final private String actionCode;
    final private LinkedHashMap<String, byte[]> blobs;
    
    /**
     * A HashMap for storing any context such as additional parameters 
     */
    public HashMap<String, Object> context;
    
    static public String REQUEST_FIND = "REQUEST_FIND";
    static public String REQUEST_SAVE = "REQUEST_SAVE";
    static public String REQUEST_REMOVE = "REQUEST_REMOVE";
    
    /**
     * ServiceRequest should be instantiated via {@link ServiceRequestFactory}.
     * @param requestType The request type
     * @param entityId The business entity identifier
     * @param data The Json encoded data
     * @param actionCode The service action code
     * @param blobs Blobs to be persisted
     * @param pageInfo The paging information
     */
    public ServiceRequest(String requestType, ID entityId, JsonObject data, String actionCode, LinkedHashMap<String, byte[]> blobs, PageInfo pageInfo) {
                
        this.type = requestType;
        this.entityId = entityId; 
        this.data = data;
        this.actionCode = actionCode;
        this.pageInfo = pageInfo;
        this.blobs = blobs;
        
        this.context = new HashMap<>();
    }
    
    /**
     * Gets the entity identifier.
     * 
     * @return {@link #entityId}.
     */
    public ID getEntityId() {
 
        if (entityId !=null) {
     
            if (entityId instanceof Integer) {
                if ((Integer)entityId < 1) {
                    return null;
                }
            } else if (entityId instanceof String) {
                if ("".equals((String)entityId)) {
                    return null;
                }
            } else if ("".equals(entityId.toString())) {
                return null;
            }
        
        }
            
        return entityId;
    }

    /**
     * Gets the data.
     * 
     * @return {@link #data}.
     */
    public JsonObject getData() {
        return data;
    }
    
    /**
     * Gets the blobs.
     * 
     * @return {@link #blobs}.
     */
    public LinkedHashMap<String, byte[]>  getBlobs() {
        return blobs;
    }
    
    /**
     * Gets the action code.
     * 
     * @return {@link #actionCode}.
     */
    public String getActionCode() {
        return actionCode;
    }
    
    /**
     * Gets the paging info.
     * 
     * @return {@link #pageInfo}.
     */
    public PageInfo getPageInfo() {
        return pageInfo;
    }

    /**
     * Gets a string representation of this object.
     * 
     * @return a json encoded string.
     */
    @Override
    public String toString() {

        return toJsonString(toJson());

    }
    
    /**
     * Converts this to a  Json object.
     * 
     * @return a Json object.
     */
    @Override
    public JsonObject toJson() {

        JsonObjectBuilder builder = Json.createObjectBuilder();
        
        if (entityId == null) {
            builder.add("entityId", JsonValue.NULL);
        } else {
            builder.add("entityId", entityId.toString());
        }
                
        if (data == null) {
            builder.add("data", JsonValue.NULL);
        } else {
            builder.add("data", toJsonString(data));
        }
              
        if (actionCode == null) {
            builder.add("actionCode", JsonValue.NULL);
        } else {
            builder.add("actionCode", actionCode);
        }
        
        return builder.build();
            
    }
    
    
}
