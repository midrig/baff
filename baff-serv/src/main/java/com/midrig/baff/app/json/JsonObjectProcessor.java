
package com.midrig.baff.app.json;

import java.io.StringReader;
import java.io.StringWriter;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.ParseException;
import java.util.Date;
import javax.json.Json;
import javax.json.JsonNumber;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.json.JsonString;
import javax.json.JsonValue;
import javax.json.JsonWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A JsonObjectProcessor is used to process a Json Object.
 * It provides various type specific helpers to retrieve data from a Json object, for example to get an
 * the property "myProperty" as an Integer call {@code getInteger("myProperty", myDefaultValue)}, 
 * passing in a default Integer value.
 * 
 */  
public class JsonObjectProcessor {
    
    /**
     * The logger.
     */
    final protected Logger logger = LoggerFactory.getLogger(this.getClass());
    
    // The object being processed
    private JsonObject jsonObject;
    
    // Holds the property name
    private String nameVal; 
    
    // Flag to indicate if element was found
    private boolean found;
    
    // Property holders for different property types
    private String stringVal;
    private Integer integerVal;
    private Short shortVal;
    private Long longVal;
    private Boolean booleanVal;
    private Date dateVal;
    private Timestamp timestampVal;    
    private int intVal;
    private short shortintVal;
    private boolean boolVal;

    /**
    * Constructs the processor with the Json object to be processed created from the Json 
    * encoded string provided.
    * 
    * @param jsonString a json encoded string that represents the Json object to be processed.
    */  
    public JsonObjectProcessor(String jsonString) {
        setFromJson(jsonString);
    }
    
    /**
    * Constructs the processor with the Json object to be processed.
    * 
    * @param jsonObject the Json object to be processed
    */  
    public JsonObjectProcessor (JsonObject jsonObject) {
        this.jsonObject = jsonObject;
    }
    
    /**
    * Sets the Json object from a Json encoded string.
    * 
    * @param jsonString a Json encoded string that represents the Json object to be processed.
    * @return the Json object created from the string.
    */  
    public JsonObject setFromJson(String jsonString) {

        JsonReader reader = Json.createReader(new StringReader(jsonString));
        this.jsonObject = reader.readObject();
        return this.jsonObject;

    }
    
    /**
    * Gets the internal Json object being processd.
    * 
    * @return the Json object being processed.
    */  
     public JsonObject getJsonObject() {
        return this.jsonObject;
    }
    
    /**
    * Gets the property value as a String.
    * 
    * @param name the name of the property.
    * @param defaultValue the default value of the property if it is not found.
    * @return the value of the property.
    */  
    public String getString(String name, String defaultValue) {
        if (setString(name))
            return getString();
        else
            return defaultValue;
    }
    
    /**
    * Gets the property value as an Integer.
    * 
    * @param name the name of the property.
    * @param defaultValue the default value of the property if it is not found.
    * @return the value of the property.
    */  
    public Integer getInteger(String name, Integer defaultValue) {
        if (setInteger(name))
            return getInteger();
        else
            return defaultValue;
    }
    
    /**
    * Gets the property value as a Long.
    * 
    * @param name the name of the property.
    * @param defaultValue the default value of the property if it is not found.
    * @return the value of the property.
    */  
    public Long getLong(String name, Long defaultValue) {
        if (setLong(name))
            return getLong();
        else
            return defaultValue;
    }
    
    /**
    * Gets the property value as a Short.
    * 
    * @param name the name of the property.
    * @param defaultValue the default value of the property if it is not found.
    * @return the value of the property.
    */  
    public Short getShort(String name, Short defaultValue) {
        if (setShort(name))
            return getShort();
        else
            return defaultValue;
    }
    
    /**
    * Gets the property value as a Boolean.
    * 
    * @param name the name of the property.
    * @param defaultValue the default value of the property if it is not found.
    * @return the value of the property.
    */  
    public Boolean getBoolean(String name, Boolean defaultValue) {
        if (setBoolean(name))
            return getBoolean();
        else
            return defaultValue;
    }
    
    /**
    * Gets the property value as a primitive int.
    * 
    * @param name the name of the property.
    * @param defaultValue the default value of the property if it is not found.
    * @return the value of the property.
    */  
    public int getInt(String name, int defaultValue) {
        if (setInt(name))
            return getInt();
        else
            return defaultValue;
    }
    
    /**
    * Gets the property value as a primitive short.
    * 
    * @param name the name of the property.
    * @param defaultValue the default value of the property if it is not found.
    * @return the value of the property.
    */  
    public short getShortint(String name, short defaultValue) {
        if (setShortint(name))
            return getShortint();
        else
            return defaultValue;
    }
    
    /**
    * Gets the property value as a primitive boolean.
    * 
    * @param name the name of the property.
    * @param defaultValue the default value of the property if it is not found.
    * @return the value of the property.
    */  
    public boolean getBool(String name, boolean defaultValue) {
        if (setBool(name))
            return getBool();
        else
            return defaultValue;
    }
    
    /**
    * Gets the property value as a Date.
    * 
    * @param name the name of the property.
    * @param defaultValue the default value of the property if it is not found.
    * @return the value of the property.
    */  
    public Date getDate(String name, Date defaultValue) {
        if (setDate(name))
            return getDate();
        else
            return defaultValue;
    }
    
    /**
    * Gets the property value as a Timestamp.
    * 
    * @param name the name of the property.
    * @param defaultValue the default value of the property if it is not found.
    * @return the value of the property.
    */  
    public Timestamp getTimestamp(String name, Timestamp defaultValue) {
        if (setTimestamp(name))
            return getTimestamp();
        else
            return defaultValue;
    }
    
    /**
    * Serialises this object.
    * 
    * @return the string representation of this object.
    */  
    @Override
    public String toString() {
        final StringWriter stWriter = new StringWriter();

        try (JsonWriter jsonWriter = Json.createWriter(stWriter)) {
            jsonWriter.writeObject(this.jsonObject);
        }

        return stWriter.toString();
        
    }
    
    
    // Internal setter methods
    
    private boolean setInt(String name) {
        initVals();
        this.nameVal = name;
        try {
            this.intVal = this.getJsonObject().getInt(name);
            this.found = true;
        }
        catch (RuntimeException e) {
            logger.debug("setInt: failed to set {}", name);
        }
        return this.found;
    }
    
    private boolean setBool(String name) {
        initVals();
        this.nameVal = name;
        try {
            this.boolVal = this.getJsonObject().getBoolean(name);
            this.found = true;
        }
        catch (RuntimeException e) {
            logger.debug("setBool: failed to set {}", name);
        }
        return this.found;
    }
    
    private boolean setString(String name) {
        initVals();
        this.nameVal = name;
        try {
            JsonValue jsonValue = this.getJsonObject().get(name);
            
             logger.debug("JOP setString for type [" + jsonValue.getValueType() + "], [" + name + "] = [" + jsonValue + "]");
            
            switch (jsonValue.getValueType()) {

                case NULL:
                    this.stringVal = null;
                    this.found = true;
                    break;
                case STRING:
                    this.stringVal = ((JsonString) jsonValue).getString();
                    this.found = true; 
                    break;
                default:
                    this.stringVal = jsonValue.toString();
                    this.found = true; 
                    break;
            }
        }
        catch (RuntimeException e) {
            logger.debug("setString: failed to set {}", name);
        }
        return this.found;
    }
    
    private boolean setShortint(String name) {
        initVals();
        this.nameVal = name;
        try {
            this.shortintVal =  (short) this.getJsonObject().getInt(name);
            this.found = true;
        }
        catch (RuntimeException e) {
            logger.debug("setShort: failed to set {}", name);
        }
        return this.found;
    }
   
    
    private boolean setShort (String name) {
        initVals();
        this.nameVal = name;
        try {
            JsonValue jsonValue = this.getJsonObject().get(name);
  
            switch (jsonValue.getValueType()) {

                case NUMBER:
                    JsonNumber num = (JsonNumber) jsonValue;
                    this.shortVal = (short) num.intValue();
                    this.found = true;
                    break;
                case NULL:
                    this.shortVal = null;
                    this.found = true;
                    break;
            }
       }
        catch (RuntimeException e) {
            logger.debug("setShortint: failed to set {}", name);
        }
        return this.found;
    }
    
    private boolean setInteger(String name) {
        initVals();
        this.nameVal = name;
        try {
            JsonValue jsonValue = this.getJsonObject().get(name);

            switch (jsonValue.getValueType()) {

                case NUMBER:
                    JsonNumber num = (JsonNumber) jsonValue;
                    this.integerVal = num.intValue();
                    this.found = true;
                    break;
                case NULL:
                    this.integerVal = null;
                    this.found = true;
                    break;
            }
            
        }
        catch (RuntimeException e) {
            logger.debug("setInteger: failed to set {}", name);
        }
        return this.found;
    }
    
    private boolean setLong(String name) {
        initVals();
        this.nameVal = name;
        try {
            JsonValue jsonValue = this.getJsonObject().get(name);

            switch (jsonValue.getValueType()) {

                case NUMBER:
                    JsonNumber num = (JsonNumber) jsonValue;
                    this.longVal = num.longValue();
                    this.found = true;
                    break;
                case NULL:
                    this.integerVal = null;
                    this.found = true;
                    break;
            }
            
        }
        catch (RuntimeException e) {
            logger.debug("setInteger: failed to set {}", name);
        }
        return this.found;
    }
    
    private boolean setBoolean(String name) {
        initVals();
        this.nameVal = name;
        try {
            JsonValue jsonValue = this.getJsonObject().get(name);

            switch (jsonValue.getValueType()) {

                case FALSE:
                    this.booleanVal = false;
                    this.found = true;
                    break;
                case TRUE:
                    this.booleanVal = true;
                    this.found = true;
                    break;
                case NULL:
                    this.booleanVal = null;
                    this.found = true;
                    break;            
            }
        }
        catch (RuntimeException e) {
            logger.debug("setBoolean: failed to set {}", name);
        }
        return this.found;
        
    }
    
    private boolean setDate(String name) {
        initVals();
        this.nameVal = name;
        try {
            JsonValue jsonValue = this.getJsonObject().get(name);
            
            switch (jsonValue.getValueType()) {

                case NULL:
                    this.dateVal = null;
                    this.found = true;
                    break;
                default:
                    try {
                        this.dateVal = DateFormat.getDateInstance().parse(((JsonString)jsonValue).getString());
                        this.found = true; 
                    } catch (ParseException ex) {
                        logger.debug("setDate: failed to set {}", name);
                    }
                    break;
            }
        }
        catch (RuntimeException e) {
            logger.debug("setDate: failed to set {}", name);
        }
        return this.found;
    }
    
    private boolean setTimestamp(String name) {
        initVals();
        this.nameVal = name;
        try {
            JsonValue jsonValue = this.getJsonObject().get(name);
            
            switch (jsonValue.getValueType()) {

                case NULL:
                    this.timestampVal = null;
                    this.found = true;
                    break;
                default:
                    this.timestampVal = Timestamp.valueOf(((JsonString)jsonValue).getString());
                    this.found = true; 
                    break;
            }
        }
        catch (RuntimeException e) {
            logger.debug("setTimestamp: failed to set {}", name);
        }
        return this.found;
    }
    
    // Initialise the holding variables
    private void initVals() {
        nameVal = null;
        stringVal = null;
        integerVal = null;
        shortVal = null;
        booleanVal = null;
        found = false;
        dateVal = null;
        timestampVal = null;
    }
    
    // Internal getter methods
    
    private String getName() {
        return nameVal;
    }
    
    private String getString() {
        return stringVal;
    }

    private Integer getInteger() {
        return integerVal;
    }
    
    private Long getLong() {
        return longVal;
    }

    private Short getShort() {
        return shortVal;
    }

    private Boolean getBoolean() {
        return booleanVal;
    }

    private int getInt() {
        return intVal;
    }

    private short getShortint() {
        return shortintVal;
    }

    private boolean getBool() {
        return boolVal;
    }
    
    private Timestamp getTimestamp() {
        return timestampVal;
    }
    
    private Date getDate() {
        return dateVal;
    }

    private boolean isFound() {
        return found;
    }
    
   
}

 
