package com.midrig.baff.utility.usersecurity;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * A UserSecurityHelper is a utility to enquire on user details.
 */  

@Component
public class UserSecurityHelper { 
    
    /**
     * Determines if the current user has role permissions
     * @param message The message property
     * @return the message
     */
    public boolean isUserInRole(String role) {   
        
         SecurityContext securityContext =  SecurityContextHolder.getContext();
        
        for (GrantedAuthority authority : securityContext.getAuthentication().getAuthorities()) {
                if (role.equals(authority.getAuthority()))
                        return true;                
        }

        return false;
            
    }

   
}
