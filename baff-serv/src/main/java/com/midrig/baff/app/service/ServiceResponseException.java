
package com.midrig.baff.app.service;

/**
 * A ServiceResponseException passes an exception from a service operation.
 * It is a value object used to return various immutable parameters from the service.  It should not be
 * instantiated directly, but rather via the {@link ServiceResponseFactory}.
 * 
 */  
public class ServiceResponseException extends RuntimeException{
    
    private final ServiceResponse response;

    /**
    * Creates an exception for a given service operation response.
    * 
    * @param response the service response.
    */  
    public ServiceResponseException(ServiceResponse response) {
        this.response = response;
    }
    
    /**
    * Gets the service response associated with this exception.
    * 
    * @returns {@link #response}.
    */  
    public ServiceResponse getResponse() {
        return response;
    }

    
}
