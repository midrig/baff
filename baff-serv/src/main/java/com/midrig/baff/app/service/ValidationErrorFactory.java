package com.midrig.baff.app.service;

/**
 * A ValidationErrorFactory produces a validation error for different scenarios.
 * 
 * All {@link ValidationError} objects should be instantiated via this factory.
 *
 */  
public class ValidationErrorFactory {

    /**
     * Produces a response for a successful operation.
     *
     * @param message
     * @return the service response.
     */  
    public static ValidationError getGeneralError(String message) {
    
        return new ValidationError(message, null, null);
    }
    
    /**
     * Produces a response for a successful operation.
     *
     * @param message
     * @param argument
     * @return the service response.
     */  
    public static ValidationError getGeneralError(String message, String argument) {
        
        return new ValidationError(message, null, new Object[] {argument});
    } 
    
    /**
     * Produces a response for a successful operation.
     *
     * @param message
     * @param arguments
     * @return the service response.
     */  
    public static ValidationError getGeneralError(String message, Object[] arguments) {
        
        return new ValidationError(message, null, arguments);
    } 
    
    /**
     * Produces a response for a successful operation.
     *
     * @param message
     * @param field
     * @return the service response.
     */  
    public static ValidationError getFieldError(String message, String field) {
    
        return new ValidationError(message, field, null);
    }
    
    /**
     * Produces a response for a successful operation.
     *
     * @param message
     * @param field
     * @param argument
     * @return the service response.
     */  
    public static ValidationError getFieldError(String message, String field, String argument) {
        
        return new ValidationError(message, field, new Object[] {argument});
    } 
    
    /**
     * Produces a response for a successful operation.
     *
     * @param message
     * @param field
     * @param arguments
     * @return the service response.
     */  
    public static ValidationError getFieldError(String message, String field, Object[] arguments) {
        
        return new ValidationError(message, field, arguments);
    } 
    
}
