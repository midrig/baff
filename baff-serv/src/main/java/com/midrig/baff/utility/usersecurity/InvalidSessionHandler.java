

package com.midrig.baff.utility.usersecurity; 
    
import com.midrig.baff.app.json.JsonItem;
import com.midrig.baff.app.service.ServiceResponse;
import com.midrig.baff.app.service.ServiceResponseFactory;
import com.midrig.baff.utility.locale.MessageHelper;
import java.io.IOException;   
import javax.servlet.ServletException;   
import javax.servlet.http.HttpServletRequest;   
import javax.servlet.http.HttpServletResponse;   
import org.apache.commons.io.FilenameUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.session.InvalidSessionStrategy;


/**
 * Handles an access denied scenario.
 */
public class InvalidSessionHandler implements InvalidSessionStrategy {   
    
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());
    private String invalidSessionUrl;
    
    @Autowired 
    protected MessageHelper messageHelper;
    
    
    @Override  
    public void onInvalidSessionDetected(HttpServletRequest request,   
     HttpServletResponse response) throws IOException,   
           ServletException {   

       logger.trace("onInvalidSessionDetected");  
       
        SecurityContext securityContext =  SecurityContextHolder.getContext();
        
        if (securityContext.getAuthentication() == null) {
            logger.trace("user not authenticated - ignoring....");
            return;
        }
       
       
       String type = null;
       String uri = request.getRequestURI();
       
       String ext = FilenameUtils.getExtension(uri);
       
       
       logger.debug(uri);
       logger.debug(ext);
       
       if (ext != null && ext.equalsIgnoreCase("json")) {
       
            ServiceResponse<JsonItem> resp = ServiceResponseFactory.getSystemFailResponse("INVALID_SESSION", messageHelper.getMessage("exception.invalidsession"));

            response.setContentType("application/json");

            response.setStatus(HttpServletResponse.SC_OK); 

            response.getWriter().write(resp.toString());
            response.getWriter().flush();
            response.getWriter().close();
    
        }
    }

} 
