package com.midrig.baff.app.service;

import java.io.Serializable;
import java.util.LinkedHashMap;
import javax.json.JsonObject;

/**
 * A ServiceRequestFactory produces a ServiceRequest to support various service operation
 * requests.
 * All {@link ServiceRequest} objects should be instantiated via this factory.
 *
 */  
public class ServiceRequestFactory {
    
    /**
    * Produces a request to find an entity by its identifier.
    *
    * @param <ID> the associated entity's identifier type.
    * @param entityId the associated entity's identifier.
    * @return the service request.
    */  
    public static <ID extends Serializable> ServiceRequest<ID> getFindRequest(ID entityId) {
   
        return new ServiceRequest(ServiceRequest.REQUEST_FIND, entityId, null, null, null, null);
    } 
    
    /**
    * Produces a request to find all entities for a given type.
    *
    * @param <ID> the associated entity's identifier type.
    * @return the service request.
    */  
    public static <ID extends Serializable> ServiceRequest<ID> getFindRequest() {
        
        return new ServiceRequest(ServiceRequest.REQUEST_FIND, null, null, null, null, null);
    }
    
    /**
    * Produces a request to find all entities that meeting the paging criteria.
    *
    * @param <ID> the associated entity's identifier type.
    * @param pageInfo the paging information.
    * @return the service request.
    */  
    public static <ID extends Serializable> ServiceRequest<ID> getFindRequest(ServiceRequest.PageInfo pageInfo) {
        
        return new ServiceRequest(ServiceRequest.REQUEST_FIND, null, null, null, null, pageInfo);
    }
    
    /**
    * Produces a request to find all entities that meeting the paging criteria, with extra data
    * parameters to support post processing
    *
    * @param <ID> the associated entity's identifier type.
    * @param pageInfo the paging information.
    * @param data additional parameters.
    * @return the service request.
    */  
    public static <ID extends Serializable> ServiceRequest<ID> getFindRequest(ServiceRequest.PageInfo pageInfo, JsonObject data) {
        
        return new ServiceRequest(ServiceRequest.REQUEST_FIND, null, data, null, null, pageInfo);
    }
    
    /**
    * Produces a request to save an entity.
    *
    * @param <ID> the associated entity's identifier type.
    * @param entityId the associated entity's identifier.
    * @param data the associated entity's data.
    * @return the service request.
    */  
    public static <ID extends Serializable> ServiceRequest<ID> getSaveRequest(ID entityId, JsonObject data) {
    
        return new ServiceRequest(ServiceRequest.REQUEST_SAVE, entityId, data, null, null, null);
    
    } 
    
    /**
    * Produces a request to save an entity with an action code.
    *
    * @param <ID> the associated entity's identifier type.
    * @param entityId the associated entity's identifier.
    * @param data the associated entity's data.
    * @param actionCode the action code.
    * @return the service request.
    */  
    public static <ID extends Serializable> ServiceRequest<ID> getSaveRequest(ID entityId, JsonObject data, String actionCode) {
    
        return new ServiceRequest(ServiceRequest.REQUEST_SAVE, entityId, data, actionCode, null, null);
    
    } 
    
    /**
    * Produces a request to save an entity with blobs.
    *
    * @param <ID> the associated entity's identifier type.
    * @param entityId the associated entity's identifier.
    * @param data the associated entity's data.
    * @param blobs the blobs.
    * @return the service request.
    */  
    public static <ID extends Serializable> ServiceRequest<ID> getSaveRequest(ID entityId, JsonObject data, LinkedHashMap<String, byte[]> blobs) {
    
        return new ServiceRequest(ServiceRequest.REQUEST_SAVE, entityId, data, null, blobs, null);
    
    } 
    
    /**
    * Produces a request to save an entity with an action code and blobs.
    *
    * @param <ID> the associated entity's identifier type.
    * @param entityId the associated entity's identifier.
    * @param data the associated entity's data.
    * @param actionCode the action code.
    * @param blobs the blobs.
    * @return the service request.
    */  
    public static <ID extends Serializable> ServiceRequest<ID> getSaveRequest(ID entityId, JsonObject data, String actionCode, LinkedHashMap<String, byte[]> blobs) {
    
        return new ServiceRequest(ServiceRequest.REQUEST_SAVE, entityId, data, actionCode, blobs, null);
    
    } 
    
    /**
    * Produces a request complete a general operation.
    *
    * @param <ID> the associated entity's identifier type.
    * @param requestType the type of operation.
    * @param data the associated entity's data.
    * @return the service request.
    */  
    public static <ID extends Serializable> ServiceRequest<ID> getOperationRequest(String requestType, JsonObject data) {
    
        return new ServiceRequest(requestType, null, data, null, null, null);
    
    } 
    
    /**
    * Produces a request complete a general operation with an action code.
    *
    * @param <ID> the associated entity's identifier type.
    * @param requestType the type of operation.
    * @param data the associated entity's data.
    * @param actionCode the action code.
    * @return the service request.
    */  
    public static <ID extends Serializable> ServiceRequest<ID> getOperationRequest(String requestType, JsonObject data, String actionCode) {
    
        return new ServiceRequest(requestType, null, data, actionCode, null, null);
    
    } 
    
    /**
    * Produces a request to remove an entity.
    *
    * @param <ID> the associated entity's identifier type.
    * @param entityId the associated entity's identifier.
    * @param data the associated entity's data.
    * @return the service request.
    */  
    public static <ID extends Serializable> ServiceRequest<ID> getRemoveRequest(ID entityId, JsonObject data) {
    
        return new ServiceRequest(ServiceRequest.REQUEST_REMOVE, entityId, data, null, null, null);
    
    } 
    
    /**
    * Produces to remove an entity with an action code.
    *
    * @param <ID> the associated entity's identifier type.
    * @param entityId the associated entity's identifier.
    * @param data the associated entity's data.
    * @param actionCode the action code.
    * @return the service request.
    */  
    public static <ID extends Serializable> ServiceRequest<ID> getRemoveRequest(ID entityId, JsonObject data, String actionCode) {
    
        return new ServiceRequest(ServiceRequest.REQUEST_REMOVE, entityId, data, actionCode, null, null);
    
    } 

}
