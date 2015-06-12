
package com.midrig.baff.app.service;

/**
 * A ValidationError represents a validation error associated with a particular data field.
 *
 */  
public class ValidationError {
    
    private String field ;
    private String message;
    private Object[] contextArgs;
    
    /**
     * Creates a validation error for a given field with context
     *
     * @param field the data field that is in error.
     * @param message the error message.
     * @param contextArgs the context arguments
     */  
    public ValidationError(String message, String field, Object[] contextArgs) {
        this.setField(field);
        this.setMessage(message);
        this.setContextArgs(contextArgs);
    }

    /**
     * Gets the data field in error.
     *
     * @return {@link #field}.
     */  
    public String getField() {
        return field;
    }

    /**
     * Sets the data field in error.
     *
     * @param field a data field.
     */  
    public void setField(String field) {
        
        if (field == null) {
            this.field = null;
        } else {
            // Strip of the _ returned from any entity assertions
            int index = field.indexOf('_');
            if (index > 0) {
                this.field = field.substring(0,index);
            } else {
                this.field = field;
            }
        }
    }

    /**
     * Gets the error message.
     *
     * @return {@link #message}.
     */  
    public String getMessage() {
        return message;
    }

    /**
     * Sets the error message.
     *
     * @param message an error message.
     */  
    public void setMessage(String message) {
        this.message = message;
    }
    
    /**
     * Gets the context arguments.
     *
     * @return {@link #contextArgs}.
     */  
    public Object[] getContextArgs() {
        return this.contextArgs;
    }

    /**
     * Sets the context arguments.
     *
     * @param contextArgs an array of arguments
     */  
    public void setContextArgs(Object[] contextArgs) {
        this.contextArgs = contextArgs;
    }
    
}
