package com.midrig.baff.app.controller;

import com.midrig.baff.utility.locale.MessageHelper;
import java.util.Map;
import java.util.Map.Entry;
import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * A ServiceController controls business service operations. 
 * It receives Json encoded information from a client, forms this into a service request and
 * handles the corresponding service response, including any exception handling.
 * <p>
 * A typical implementation is described 
 * <a href="../../../../../../examples/MyServiceController.html" target="_blank">here</a>
 */
public abstract class ServiceController {

    /**
     * The logger.
     */
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());
    
    /**
     * The message helper
     */
    @Autowired
    protected MessageHelper messageHelper;
    
    protected void logRequestParameters(HttpServletRequest request) {
        
         Map<String, String[]> params = request.getParameterMap();
        for (Entry<String,String[]> entry : params.entrySet() ) {
            logger.debug(entry.getKey().toString());
        }
        
    }
  
    
}

  
