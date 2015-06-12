

package com.midrig.baff.utility.usersecurity;

import com.midrig.baff.app.json.JsonItem;
import static com.midrig.baff.app.json.JsonItem.addJsonElement;
import com.midrig.baff.app.json.JsonObjectProcessor;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

/**
 * Represents a user permission.
 */
public class UserAttributes extends JsonItem{
    
    private final String username;
    private final String displayname;
    private final String email;
    
     public UserAttributes (String username, String displayname, String email) {
         
        this.username = username;
        this.displayname = displayname;
        this.email = email;
        
    }
    
    public UserAttributes (String jsonData) {
        
        JsonObjectProcessor jp = new JsonObjectProcessor(jsonData);
        
        username = jp.getString("username", null);
        displayname = jp.getString("displayname", null);
        email = jp.getString("email", null);
    }
    
    @Override
    public JsonObject toJson() {

        JsonObjectBuilder builder = Json.createObjectBuilder();
        
        addJsonElement(builder, "username", getUsername());
        addJsonElement(builder, "displayname", getDisplayname());
        addJsonElement(builder, "email", getEmail());
        
       
        return builder.build();

    }

    public String getUsername() {
        return username;
    }

    public String getDisplayname() {
        return displayname;
    }

    public String getEmail() {
        return email;
    }
  
    
}
