package com.midrig.baff.app.service;

import com.midrig.baff.app.json.JsonItem;
import java.util.ArrayList;
import java.util.List;
import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonValue;

/**
 * A ServiceResponse represents a response from a service operation.
 * It is a value object used to return various immutable parameters from the service.  It should not be
 * instantiated directly, but rather via the {@link ServiceResponseFactory}.
 *
 * @param <T> The entity or item type who's data will be included in the response. 
 */  
//@Configurable(autowire=BY_TYPE)
public class ServiceResponse<T extends JsonItem> extends JsonItem {
      
    final private boolean success;
    final private String resultType;
    final private String resultCode;
    final private JsonObject master;
    final private List<JsonObject> data;
    final private String message;
    final private List<ValidationError> errors;
    final private Long total;
    
    final private boolean singleRecord;
    final private boolean isOnlyData;
    
    static public String RESULT_OK = "RESULT_OK";
    static public String RESULT_FAIL_SYSTEM_ERROR = "RESULT_FAIL_SYSTEM_ERROR";
    static public String RESULT_FAIL_VALIDATION_ERROR = "RESULT_FAIL_VALIDATION_ERROR";
    static public String RESULT_FAIL_WARNING = "RESULT_FAIL_WARNING";
    static public String RESULT_FAIL_STALE_DATA = "RESULT_FAIL_STALE_DATA";
    
    /**
     * ServiceResponse should be instantiated via {@link ServiceResponseFactory}.
     */
    ServiceResponse(boolean success, String resultType, String resultCode, T data, JsonItem master, String message, List<ValidationError> errors) {
       
        // Indicates that only a single entity record is being passed
        this.singleRecord = true;
        this.isOnlyData = false;
        
        List<JsonObject> jsonEntities = new ArrayList<>();
        
        if (data != null)
            jsonEntities.add(data.toJson());        
                
        this.success = success;
        this.resultType = resultType;
        this.resultCode = resultCode;
        this.data = jsonEntities;
        this.message = message;
        this.errors = errors;
        this.total = null;
         
        if (master != null) {
            this.master = master.toJson();
        } else {
             this.master = null;
        }
        
    }
    
    /**
     * ServiceResponse should be instantiated via {@link ServiceResponseFactory}.
     */
    ServiceResponse(boolean success, String resultType, String resultCode, List<T> data, JsonItem master, Long total, String message, List<ValidationError> errors) {
    
        // Indicates multiple entity records are being passed.
        this.singleRecord = false;
        this.isOnlyData = false;
        
        List<JsonObject> jsonEntities = new ArrayList<>();
        
        for (JsonItem json : data) {
            jsonEntities.add(json.toJson());
        }
        
        this.success = success;
        this.resultType = resultType;
        this.resultCode = resultCode;
        this.data = jsonEntities;
        this.message = message;
        this.errors = errors;
        this.total = total;
        
        if (master != null) {
            this.master = master.toJson();
        } else {
             this.master = null;
        }
    }
    
    /**
     * ServiceResponse should be instantiated via {@link ServiceResponseFactory}.
     */
    ServiceResponse(boolean success, String resultType, String resultCode, String message, List<ValidationError> errors) {
        
        // Indicates a single entity record is being passed.
        this.singleRecord = true;
        this.isOnlyData = false;
        
        this.success = success; 
        this.resultType = resultType;
        this.resultCode = resultCode;
        this.master = null;
        this.data = null;
        this.message = message;
        this.errors = errors;
        this.total = null;
    }
    
    /**
     * ServiceResponse should be instantiated via {@link ServiceResponseFactory}.
     */
    ServiceResponse(T data) {
        
        // Indicates a single entity record is being passed.
        this.singleRecord = true;
        this.isOnlyData = true;
        
        List<JsonObject> jsonEntities = new ArrayList<>();
        
        if (data != null)
            jsonEntities.add(data.toJson());        
        
        this.success = true; 
        this.resultType = null;
        this.resultCode = null;
        this.master = null;
        this.data = jsonEntities;
        this.message = null;
        this.errors = null;
        this.total = null;
    }
    
    /**
     * Gets the indicator for the success of the operation.
     * 
     * @return true if successful.
     */
    public boolean isSuccess() {
        return success;
    }
    
    /**
     * Gets the result type.
     * 
     * @return {@link #resultType}.
     */
    public String getResultType() {
        return resultType;
    }
    
     /**
     * Gets the result code for the operation.
     * This may be returned as the action code in a subsequent retry.
     * 
     * @return {@link #resultCode}.
     */
    public String getResultCode() {
        return resultCode;
    }

    /**
     * Gets the master entity record associated the entity/entities being operated on.
     * This is typically only provided in a save operation response.
     * 
     * @return {@link #master}.
     */
    public JsonObject getMaster() {
        return master;
    }
    
    /**
     * Gets the data associated the entity/entities being operated on.
     * 
     * @return {@link #data}.
     */
    public List<JsonObject> getData() {
        return data;
    }
    
    /**
     * Gets the data associated a single entity being operated on.
     * 
     * @return {@link #data}.
     */
    public JsonObject getSingleItem() {
        
        if (!data.isEmpty())
            return data.get(0);
        else
            return null;
    }

    /**
     * Gets the message associated with the operation.
     * 
     * @return {@link #message}.
     */
    public String getMessage() {
        return message;
    }
    
    /**
     * Gets the validation errors associated with the operation.
     * 
     * @return {@link #errors}.
     */
    public List<ValidationError> getErrors() {
        return errors;
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
        
        if (isOnlyData) {
                    
            if (!data.isEmpty())
                return data.get(0);
            else
                return null;
            
        }
        
        JsonObjectBuilder builder = Json.createObjectBuilder();
        
        builder.add("success", success);
        builder.add("resultType", resultType);
        
        if (resultCode == null) {
            builder.add("resultCode", JsonValue.NULL);
        } else {
            builder.add("resultCode", resultCode);
        }
       
        if (message == null) {
            builder.add("message", JsonValue.NULL);
        } else {
            builder.add("message", message);
        }
        
        if (total == null) {
            builder.add("total", JsonValue.NULL);
        } else {
            builder.add("total", total);
        }
        
        if (errors == null) {
            builder.add("errors", JsonValue.NULL);
        } else {
                           
                final JsonArrayBuilder arrayBuilder = Json.createArrayBuilder();

                for (ValidationError error : errors) {
 
                    arrayBuilder.add(
                            Json.createObjectBuilder().add("id", error.getField())
                                    .add("msg", error.getMessage()));
                }
        
                builder.add("errors", arrayBuilder);
        }
        
        if (data == null) {
            builder.add("data", JsonValue.NULL);
        } else {
            
                if (singleRecord) {
                    
                    if (data.isEmpty())
                        builder.add("data", JsonValue.NULL);
                    else
                        builder.add("data", data.get(0));
                    
                } else {
            
                    final JsonArrayBuilder arrayBuilder = Json.createArrayBuilder();

                    for (JsonObject json : data) {

                        arrayBuilder.add(json);
                    }

                    builder.add("data", arrayBuilder);
                }
        
        }      
        
        if (master == null) {
            builder.add("master", JsonValue.NULL);
        } else {
            builder.add("master", master);      
        }      
     
        return builder.build();
    }
    
}
