package com.midrig.baff.utility.usersecurity;

import com.midrig.baff.app.controller.ServiceController;
import com.midrig.baff.app.service.ServiceResponse;
import com.midrig.baff.app.service.ServiceResponseException;
import com.midrig.baff.app.service.ServiceResponseFactory;
import java.util.ArrayList;
import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * The UserController obtains user credentials. 
 */
@Controller
@RequestMapping("/user")
public class UserController extends ServiceController {

    @Autowired
    @Qualifier("authenticationManager")
    protected AuthenticationManager authenticationManager;
    
    @Autowired
    @Qualifier("userManagerService")
    protected UserManagerService userManagerService;
    
    /**
    * Obtains user credentials from the authentication manager.
     * @param username
     * @param password
     * @param request
     * @return the response
     */
    @RequestMapping(value = "/permission/findAll", method = RequestMethod.POST, produces = {"application/json"})
    @ResponseBody
    public String findUserPermissions(
            @RequestParam(value = "username", required = true) String username,
            @RequestParam(value = "password", required = true) String password,
            HttpServletRequest request) {

        logger.trace("/permission/findAll");  
        
        ServiceResponse<UserPermission> response;
        
        
        try {

            Authentication authToken = new UsernamePasswordAuthenticationToken(username, password);
            Authentication authResult = authenticationManager.authenticate(authToken);
            
            SecurityContext securityContext =  SecurityContextHolder.getContext();
            
            securityContext.setAuthentication(authResult);
            
            ArrayList<UserPermission> permissions = new ArrayList<>();
            
            for (GrantedAuthority authority : authResult.getAuthorities()) {

                UserPermission perm = new UserPermission(authority.getAuthority());
                permissions.add(perm);
            }

            response = ServiceResponseFactory.getSuccessResponse(permissions);
            
            
        } catch (AuthenticationException ex) {
            ex.printStackTrace(); 
            response = ServiceResponseFactory.getSystemFailResponse("AUTHENTICATION_EXCEPTION", ex.getMessage());
        }
    
        
        return response.toString();
        
        
    }
    
    /**
    * Obtains user credentials from the authentication manager.
     * @param username
     * @param password
     * @param request
     * @return the response
     */
    @RequestMapping(value = "/find", method = RequestMethod.GET, produces = {"application/json"})
    @ResponseBody
    public String findUser(
            @RequestParam(value = "email", required = true) String email,
            HttpServletRequest request) {

        logger.trace("/find");  
        
        ServiceResponse<UserAttributes> response;
        
        
        try {

            response = userManagerService.findUserAttributes(email);

        } catch (AuthenticationException ex) {
            response = ServiceResponseFactory.getSystemFailResponse("AUTHENTICATION_EXCEPTION", ex.getMessage());
        }
    
        
        return response.toString();
        
        
    }
    
    /**
    * Creates a new user.
     * @return the response
     */
    @RequestMapping(value = "/register", method = RequestMethod.POST, produces = {"application/json"})
    @ResponseBody
    public String registerUser(
            @RequestParam(value = "email", required = true) String username,
            @RequestParam(value = "displayname", required = true) String displayname,
            @RequestParam(value = "permissions", required = true) String permissions,
            HttpServletRequest request) {

        logger.trace("/registerUser");  
        
        ServiceResponse<UserPermission> response;
        
        
        try {
     
            userManagerService.registerUser(username, displayname, permissions);

            response = ServiceResponseFactory.getSuccessResponse();
            
        } catch (ServiceResponseException valEx) {            
            response = valEx.getResponse();
        
        } catch (Exception ex) {
            ex.printStackTrace(); 
            response = ServiceResponseFactory.getSystemFailResponse("USER_EXCEPTION", ex.getMessage());
        }
    
        
        return response.toString();
        
        
    }
    
    /**
    * Update a user.
     * @return the response
     */
    @RequestMapping(value = "/update", method = RequestMethod.POST, produces = {"application/json"})
    @ResponseBody
    public String updateUser(
            @RequestParam(value = "email", required = true) String username,
            @RequestParam(value = "displayname", required = true) String displayName,
            @RequestParam(value = "oldPassword", required = true) String oldPassword,
            @RequestParam(value = "newPassword", required = true) String newPassword,
            @RequestParam(value = "permissions", required = true) String permissions,
            HttpServletRequest request) {

        logger.trace("/updateUser");  
        
        ServiceResponse<UserPermission> response;
        
        
        try {
           
            userManagerService.updateUser(username, displayName, oldPassword, newPassword, permissions);

            response = ServiceResponseFactory.getSuccessResponse();
            
        } catch (ServiceResponseException valEx) {            
            response = valEx.getResponse();
        
        } catch (Exception ex) {
            ex.printStackTrace(); 
            response = ServiceResponseFactory.getSystemFailResponse("USER_EXCEPTION", ex.getMessage());
        }
    
        
        return response.toString();
        
        
    }
    
    /**
    * Reset user.
     * @return the response
     */
    @RequestMapping(value = "/reset", method = RequestMethod.POST, produces = {"application/json"})
    @ResponseBody
    public String resetUser(
            @RequestParam(value = "email", required = true) String username,
            HttpServletRequest request) {

        logger.trace("/resetUser");  
        
        ServiceResponse<UserPermission> response;
        
        
        try {        
           
            userManagerService.resetUser(username);

            response = ServiceResponseFactory.getSuccessResponse();
            
        } catch (ServiceResponseException valEx) {            
            response = valEx.getResponse();
        
        } catch (Exception ex) {
            ex.printStackTrace(); 
            response = ServiceResponseFactory.getSystemFailResponse("USER_EXCEPTION", ex.getMessage());
        }
    
        
        return response.toString();
        
        
    }


    
}
