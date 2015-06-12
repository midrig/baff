package com.midrig.baff.utility.locale;

import java.util.Locale;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

/**
 * A MessageHelper produces messages from a {@link messageSource} who's messages
 * should be defined in the relevant local specific message properties.
 */  

@Component
public class MessageHelper { 
    
    /** 
     * The injected MessageSource
     */
    @Autowired
    public MessageSource messageSource;
    
    /**
     * Gets a message for the current locale from the {@link #messageSource}.
     * @param message The message property
     * @return the message
     */
    public String getMessage(String message) {   
        
        Object [] obj = null; 
        return getMessage(message, obj);
    }
    
    /**
     * Gets a message for the current locale from the {@link #messageSource}.
     * @param message The message property
     * @param context A single context string for the message
     * @return the message
     */
    public String getMessage(String message, String context) {   
        
        return getMessage(message, new Object [] {context});
    }
    
    /**
     * Gets a message for the current locale from the {@link #messageSource}.
     * @param message The message property
     * @param args Arguments to pass to the message property
     * @return the message
     */
    public String getMessage(String message, Object[] args) {   
        
        Locale locale = LocaleContextHolder.getLocale();
        
        return messageSource.getMessage(message, args, message, locale);
    }
   
}
