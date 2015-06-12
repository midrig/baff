
package com.midrig.baff.app.entity;

import com.midrig.baff.app.json.JsonItem;
import java.io.Serializable;


/**
 * A placeholder to support complex entity id types.
 * 
 */  
public abstract class EntityId extends JsonItem implements Serializable {
    
    // Ensure toString() will delimit composite fields so string is unique - assume will use pipe delimeter
    // e.g. field 1 "abc" , field 2 "de" and field1 "ab" and field 2 "cde" don't return same result
}
