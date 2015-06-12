package com.midrig.baff.utility.usersecurity;

import com.midrig.baff.app.service.ServiceResponse;
import com.midrig.baff.app.service.ServiceResponseException;
import com.midrig.baff.app.service.ServiceResponseFactory;
import com.midrig.baff.utility.locale.MessageHelper;
import java.security.SecureRandom;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.PreparedStatementSetter;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.support.JdbcDaoSupport;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.authentication.encoding.Md5PasswordEncoder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.provisioning.UserDetailsManager;


/**
 * The UserManagerService wraps a UserDetailsManager to manage application specific
 * user details and user management processing.  It can also provide the associated user details to an
 * authentication provider.
 */

public class UserManagerService extends JdbcDaoSupport implements UserDetailsService {
    
    final protected Logger logger = LoggerFactory.getLogger(this.getClass());
    
    @Autowired
    @Qualifier("userDetailsManager")
    protected UserDetailsManager userDetailsManager;      
    
    public static final String DEF_FIND_USER_ATTR_SQL = "select username, displayname, email from user_attributes where username = ?";
    public static final String DEF_FIND_USER_ATTR_BY_EMAIL_SQL = "select username, displayname, email from user_attributes where email = ?";
    public static final String DEF_CREATE_USER_ATTR_SQL = "insert into user_attributes (username, displayname, email) values (?,?,?)";
    public static final String DEF_DELETE_USER_ATTR_SQL = "delete from user_attributes where username = ?";
    public static final String DEF_UPDATE_USER_ATTR_SQL = "update user_attributes set displayname = ?, email = ? where username = ?";
    
    private static final Random RANDOM = new SecureRandom();
    private static final String passwordChars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  
    public static final int PASSWORD_LENGTH = 8;
    
    private MailSender mailSender;
    private String emailFromAddress;
    private Md5PasswordEncoder passwordEncoder = new Md5PasswordEncoder();
    
    @Autowired
    protected MessageHelper messageHelper;
    
    public void setMailSender(MailSender mailSender) {
        this.mailSender = mailSender;
    }
   
     public void setEmailFromAddress(String emailFromAddress) {
        this.emailFromAddress = emailFromAddress;
    }
    
    public static String generateRandomPassword()
    {

        String pw = "";
        for (int i=0; i<PASSWORD_LENGTH; i++)
        {
            int index = (int)(RANDOM.nextDouble()*passwordChars.length());
            pw += passwordChars.substring(index, index+1);
        }
 
        return pw;
    }
    
    public ServiceResponse<UserAttributes> findUserAttributes(String email) {        
      
        // The email should have been passed in so get the username
        UserAttributes attr = loadUserAttributesByEmail(email);
        
        if (attr == null)
            throw new UsernameNotFoundException(messageHelper.getMessage("user.update.notexists"));
        else
            return ServiceResponseFactory.getSuccessResponse(attr);
        
    }
    
    public UserDetails loadUserByUsername(String username) {
      
        // The email should have been passed in so get the username
        UserAttributes attr = loadUserAttributesByEmail(username);
        
        if (attr == null)
            throw new UsernameNotFoundException(messageHelper.getMessage("user.update.notexists"));
        else
            return userDetailsManager.loadUserByUsername(attr.getUsername());
        
    }
    
    public UserAttributes loadUserAttributes(String usernamel) {
        
        List<UserAttributes> userAttrs = getJdbcTemplate().query(DEF_FIND_USER_ATTR_SQL, new String[] { usernamel },
 				new RowMapper<UserAttributes>() {
					public UserAttributes mapRow(ResultSet rs, int rowNum)
							throws SQLException {
						String username = rs.getString(1);
						String displayname = rs.getString(2);
                                                                                                          String email = rs.getString(3);
						return new UserAttributes(username, displayname, email);
					}

				});
        
         if (userAttrs.size() == 0)
            return null;
        else
            return userAttrs.get(0);
        
    }
    
    public UserAttributes loadUserAttributesByEmail(String email) {
         
        List<UserAttributes> userAttrs = getJdbcTemplate().query(DEF_FIND_USER_ATTR_BY_EMAIL_SQL, new String[] { email },
 				new RowMapper<UserAttributes>() {
					public UserAttributes mapRow(ResultSet rs, int rowNum)
							throws SQLException {
						String username = rs.getString(1);
						String displayname = rs.getString(2);
                                                                                                          String email = rs.getString(3);
						return new UserAttributes(username, displayname, email);
					}

				});
        
        if (userAttrs.size() == 0)
            return null;
        else
            return userAttrs.get(0);
            
       
        
    }
    
    public void registerUser(final String email, final String displayname, final String permissions) {
        
        if (userExists(email))
            throw new ServiceResponseException(ServiceResponseFactory.getSystemFailResponse("USER_EXISTS", messageHelper.getMessage("user.register.exists")));

        // Validate email....

        // Extract authorities from permissions
        List<GrantedAuthority> auths = AuthorityUtils.commaSeparatedStringToAuthorityList(permissions);

        // Generate a username (this will also be used to salt the password)
        final String username =  UUID.randomUUID().toString(); 
        String password = generateRandomPassword();
               
        String encodedPassword = passwordEncoder.encodePassword(password, username);
       
        User user = new User(username, encodedPassword, auths);
        
         // Send the email
        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(this.emailFromAddress);
        message.setTo(email);
        message.setSubject(messageHelper.getMessage("user.registration.subject"));
        message.setText(messageHelper.getMessage("user.registration.message", password));
        mailSender.send(message);	
        
        userDetailsManager.createUser(user);
        
        getJdbcTemplate().update(DEF_CREATE_USER_ATTR_SQL, new PreparedStatementSetter() {
			public void setValues(PreparedStatement ps) throws SQLException {
				ps.setString(1, username);
				ps.setString(2, displayname);
				ps.setString(3, email);
			}

		});
        
    }
    
    public void updateUser(final String email, String displayname, final String oldPassword, final String newPassword, final String permissions) {
        
        // Get the username
        final UserAttributes userAttr = loadUserAttributesByEmail(email);
        
        if (userAttr == null)
            throw new ServiceResponseException(ServiceResponseFactory.getSystemFailResponse("USER_DOES_NOT_EXIST", messageHelper.getMessage("user.update.notexists")));
        
        UserDetails userDetails  = userDetailsManager.loadUserByUsername(userAttr.getUsername());
        
        if (!passwordEncoder.isPasswordValid(userDetails.getPassword(), oldPassword, userAttr.getUsername()))
             throw new ServiceResponseException(ServiceResponseFactory.getSystemFailResponse("USER_NOT_AUTHENTIC", messageHelper.getMessage("user.update.notauth")));
        
        String encodedPassword = passwordEncoder.encodePassword(newPassword, userAttr.getUsername());
      
        User user;
        
        if (permissions != null && !permissions.isEmpty()) {
            List<GrantedAuthority> auths = AuthorityUtils.commaSeparatedStringToAuthorityList(permissions);
            user = new User(userAttr.getUsername(), encodedPassword, auths);
        } else {
            user = new User(userAttr.getUsername(), encodedPassword, userDetails.getAuthorities());
        }
       
        userDetailsManager.updateUser(user);
        
        if (displayname == null || displayname.isEmpty())
            displayname = userAttr.getDisplayname();
        
        final String newDisplayname = displayname;
        
        getJdbcTemplate().update(DEF_UPDATE_USER_ATTR_SQL, new PreparedStatementSetter() {
			public void setValues(PreparedStatement ps) throws SQLException {
				ps.setString(3, userAttr.getUsername());
				ps.setString(1, newDisplayname);
				ps.setString(2, email);
			}

		});
        
    }
    
    public void resetUser(final String email) {
        
        // Get the username
        final UserAttributes userAttr = loadUserAttributesByEmail(email);
        
        if (userAttr == null)
            throw new ServiceResponseException(ServiceResponseFactory.getSystemFailResponse("USER_DOES_NOT_EXIST", messageHelper.getMessage("user.update.notexists")));

        UserDetails userDetails  = userDetailsManager.loadUserByUsername(userAttr.getUsername());
        
        String password = generateRandomPassword();
        String encodedPassword = passwordEncoder.encodePassword(password, userAttr.getUsername());
        
         // Send the email
        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(this.emailFromAddress);
        message.setTo(email);
        message.setSubject(messageHelper.getMessage("user.reset.subject"));
        message.setText(messageHelper.getMessage("user.reset.message", password));
        mailSender.send(message);	
        
        
        User user = new User(userDetails.getUsername(), encodedPassword, userDetails.getAuthorities());
        
        userDetailsManager.updateUser(user);        
        
       
    }
    
    public boolean userExists(String email) {
        
        return this.loadUserAttributesByEmail(email) != null;
        
    }
    
    
    
}