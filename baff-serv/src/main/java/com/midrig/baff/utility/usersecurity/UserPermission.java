

package com.midrig.baff.utility.usersecurity;

import com.midrig.baff.app.json.JsonItem;
import static com.midrig.baff.app.json.JsonItem.addJsonElement;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

/**
 * Represents a user permission.
 */
public class UserPermission extends JsonItem{
    
    private final String permission;
    
    public UserPermission (String authority) {
        this.permission = authority;
    }
    
    @Override
    public JsonObject toJson() {

        JsonObjectBuilder builder = Json.createObjectBuilder();
        
        addJsonElement(builder, "permission", permission);
       
        return builder.build();

    }
    
}
