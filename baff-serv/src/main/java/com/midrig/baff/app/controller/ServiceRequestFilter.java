
package com.midrig.baff.app.controller;

import java.io.IOException;
import java.util.Date;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * The ServiceRequestFilter can be used to log transaction information.
 */
public class ServiceRequestFilter extends OncePerRequestFilter{
    
    final protected Logger logger = LoggerFactory.getLogger("transaction." + this.getClass().getName());
    
    private boolean logTransactions;
    
    /**
     * Filters service request.  Audit logic may be applied here.
     * @param request
     * @param response
     * @param filterChain
     * @throws javax.servlet.ServletException
     * @throws java.io.IOException
     */
    @Override
    protected void doFilterInternal( 
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) 
            throws ServletException, IOException{
        
        SecurityContext securityContext =  SecurityContextHolder.getContext();
        
        long startTime = 0;
        
        if (logTransactions && securityContext.getAuthentication() != null) {
        
            Object principal = securityContext.getAuthentication().getPrincipal();
            String username = "";

            if (principal instanceof String)
                username = (String) principal;
            else if (principal instanceof UserDetails)
                username = ((UserDetails) principal).getUsername();

            MDC.put("username", username);
            MDC.put("clientIPaddr", request.getRemoteAddr());
            MDC.put("clientRequest", request.getRequestURI());

            startTime = System.nanoTime();
        
        }
        
        filterChain.doFilter(request, response);

        if (startTime > 0) {
        
            long elapsedTime = (System.nanoTime() - startTime)/1000000;
            logger.info("{}", elapsedTime);
            
        }
        
    }

    public void setLogTransactions(boolean logTransactions) {
        this.logTransactions = logTransactions;
    }

    
}
