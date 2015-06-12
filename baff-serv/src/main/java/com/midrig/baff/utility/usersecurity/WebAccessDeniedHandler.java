

package com.midrig.baff.utility.usersecurity; 
    
import com.midrig.baff.app.json.JsonItem;
import com.midrig.baff.app.service.ServiceResponse;
import com.midrig.baff.app.service.ServiceResponseFactory;
import com.midrig.baff.utility.locale.MessageHelper;
import java.io.IOException;   
import javax.servlet.ServletException;   
import javax.servlet.http.HttpServletRequest;   
import javax.servlet.http.HttpServletResponse;   
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;   
import org.springframework.security.web.access.AccessDeniedHandler;   


/**
 * Handles an access denied scenario.
 */
public class WebAccessDeniedHandler implements AccessDeniedHandler {   
    
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());
    
    @Autowired 
    protected MessageHelper messageHelper;
    
 public WebAccessDeniedHandler() {   
     
 }   
    
    
 @Override  
 public void handle(HttpServletRequest request,   
  HttpServletResponse response,   
  AccessDeniedException accessDeniedException) throws IOException,   
  ServletException {   
     
    ServiceResponse<JsonItem> resp = ServiceResponseFactory.getSystemFailResponse("ACCESS_DENIED", messageHelper.getMessage("exception.accessdenied"));
    
    response.setContentType("application/json");
    
    response.setStatus(HttpServletResponse.SC_FORBIDDEN); 
    
    response.getWriter().write(resp.toString());
    response.getWriter().flush();
    response.getWriter().close();
    
 }   
    
} 
