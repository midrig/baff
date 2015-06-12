package com.midrig.baff.app.service;

import com.midrig.baff.app.json.JsonItem;
import java.util.List;

/**
 * A ServiceResponseFactory produces a ServiceResponse to support various service operation
 * results.
 * All {@link ServiceResponse} objects should be instantiated via this factory.
 *
 */  
public class ServiceResponseFactory {

    /**
    * Produces a response for a successful operation.
    *
    * @param <T> the type of entity associated with the operation.
    * @return the service response.
    */  
    public static <T extends JsonItem> ServiceResponse<T> getSuccessResponse() {
    
        return new ServiceResponse(true, ServiceResponse.RESULT_OK, null, null, null);
    } 
    
    /**
    * Produces a response for a successful operation that returns a single entity.
    *
    * @param <T> the type of entity associated with the operation.
    * @param data the data associated with a single entity.
    * @return the service response.
    */  
    public static <T extends JsonItem> ServiceResponse<T>  getSuccessResponse(T data) {

        return new ServiceResponse(true, ServiceResponse.RESULT_OK, null,  data, null, null, null);
    }
    
    /**
    * Produces a response for a successful operation that returns a tree node.
    *
    * @param <T> the type of entity associated with the operation.
    * @param data the data associated with a single entity.
    * @return the service response.
    */  
    public static <T extends JsonItem> ServiceResponse<T>  getTreeNodeResponse(T data) {

        return new ServiceResponse(data);
    }
    
    /**
    * Produces a response for a successful operation that returns a single entity and its 
    * associated master.
    *
    * @param <T> the type of entity or item associated with the operation.
    * @param data the data associated with the entity.
    * @param master the master entity associated with the entity.
    * @return the service response.
    */  
    public static <T extends JsonItem> ServiceResponse<T>  getSuccessResponse(T data, JsonItem master,String message) {

        return new ServiceResponse(true, ServiceResponse.RESULT_OK, null,  data, master, message, null);
    } 
    
   /**
    * Produces a response for a successful operation that returns a list of entities.
    *
    * @param <T> the type of entity associated with the operation.
    * @param data the data associated with a list of entities.
    * @return the service response.
    */  
    public static <T extends JsonItem> ServiceResponse<T> getSuccessResponse(List<T> data) {

        return new ServiceResponse(true, ServiceResponse.RESULT_OK, null, data, null, null, null, null);
    } 
    
   /**
    * Produces a response for a successful operation that returns a list of entities and the 
    * total count.
    * The total is the count of database entities; the list may be a subset of these.
    *
    * @param <T> the type of entity associated with the operation.
    * @param data the data associated with a list of entities.
    * @param total the total count of entities available on the database.
    * @return the service response.
    */  
    public static <T extends JsonItem> ServiceResponse<T> getSuccessResponse(List<T> data, Long total) {

        return new ServiceResponse(true, ServiceResponse.RESULT_OK, null, data, null, total, null, null);
    }
    
   /**
    * Produces a response for a successful operation that returns a message.
    *
    * @param <T> the type of entity associated with the operation.
    * @param message the message associated with the operation.
    * @return the service response.
    */  
    public static <T extends JsonItem> ServiceResponse<T> getSuccessResponse(String message) {
     
        return new ServiceResponse(true, ServiceResponse.RESULT_OK, null, message, null);
    }
    
   /**
    * Produces a response for a successful operation that returns a result code and a message.
    *
    * @param <T> the type of entity associated with the operation.
    * @param resultCode the result code associated with the operation.
    * @param message the message associated with the operation.
    * @return the service response.
    */  
    public static <T extends JsonItem> ServiceResponse<T> getSuccessResponse(String resultCode, String message) {
     
        return new ServiceResponse(true, ServiceResponse.RESULT_OK, resultCode, message, null);
    }

   /**
    * Produces a response for a failed operation that returns a result code and an error message.
    *
    * @param <T> the type of entity associated with the operation.
    * @param resultCode the result code associated with the operation.
    * @param message the error message associated with the operation.
    * @return the service response.
    */  
    public static <T extends JsonItem> ServiceResponse<T> getSystemFailResponse(String resultCode, String message) {

        return new ServiceResponse(false, ServiceResponse.RESULT_FAIL_SYSTEM_ERROR, resultCode, message, null);
    }
    
   /**
    * Produces a response for an invalid operation that returns an error message.
    *
    * @param <T> the type of entity associated with the operation.
    * @param message the error message associated with the operation.
    * @return the service response.
    */  
    public static <T extends JsonItem> ServiceResponse<T> getValidationFailResponse(String message) {

        return new ServiceResponse(false, ServiceResponse.RESULT_FAIL_VALIDATION_ERROR, null, message, null);
    }
    
   /**
    * Produces a response for an invalid operation that returns validation errors.
    *
    * @param <T> the type of entity associated with the operation.
    * @param errors the list of validation errors.
    * @return the service response.
    */   
    public static <T extends JsonItem> ServiceResponse<T> getValidationFailResponse(List<ValidationError> errors) {

        return new ServiceResponse(false, ServiceResponse.RESULT_FAIL_VALIDATION_ERROR, null, null, errors);
    }
   
   /**
    * Produces a response for a failed operation that returns a warning.
    * The result code may be passed as an action code in a related re-try attempt.
    *
    * @param <T> the type of entity associated with the operation.
    * @param resultCode the result code associated with the operation.
    * @param message the warning message associated with the operation.
    * @return the service response.
    */    
    public static <T extends JsonItem> ServiceResponse<T> getWarningFailResponse(String resultCode, String message) {

        return new ServiceResponse(false, ServiceResponse.RESULT_FAIL_WARNING, resultCode, message, null);
    }
    
   /**
    * Produces a response for a failed operation due to version control.
    *
    * @param <T> the type of entity associated with the operation.
    * @return the service response.
    */     
    public static <T extends JsonItem> ServiceResponse<T> getOpLockFailResponse() {

        return new ServiceResponse(false, ServiceResponse.RESULT_FAIL_STALE_DATA, null, null, null);
    }
    

}
