package com.midrig.baff.app.json;


import java.io.StringWriter;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonValue;
import javax.json.JsonWriter;
import static javax.management.Query.value;
import javax.xml.bind.DatatypeConverter;

/**
 * A JsonItem can be converted to a Json object. 
 * A JsonItem provides an abstract {@link @toJson} method that subclasses must implement to 
 * convert themselves to a Json object, along with addJsonElement methods to support conversion of
 * different types of properties.
 * 
 */  
public abstract class JsonItem{

    /**
     * Converts this object to a a Json object.
     * Must be overridden by subclasses.
     * 
     * @return the Json object.
     */   
    public abstract JsonObject toJson();
    
    /**
     * Adds a null value to the Json object builder for the given property name.
     * 
     * @param builder the Json object builder to add the value to.
     * @param name the property name.
     */   
    public static void addJsonNull(JsonObjectBuilder builder, String name) {
        builder.add(name, JsonValue.NULL);
    }
    
    /**
     * Adds a String value to the Json object builder for the given property name.
     * 
     * @param builder the Json object builder to add the value to.
     * @param name the property name.
     * @param value the property value.
     */   
    public static void addJsonElement(JsonObjectBuilder builder, String name, String value) {
        if (value == null) {
            builder.add(name, JsonValue.NULL);
        } else {
            builder.add(name, value);
        }
    }
    
    /**
     * Adds an Integer value to the Json object builder for the given property name.
     * 
     * @param builder the Json object builder to add the value to.
     * @param name the property name.
     * @param value the property value.
     */   
    public static void addJsonElement(JsonObjectBuilder builder, String name, Integer value) {
        if (value == null) {
            builder.add(name, JsonValue.NULL);
        } else {
            builder.add(name, value);
        }
    }
    
    /**
     * Adds a Long value to the Json object builder for the given property name.
     * 
     * @param builder the Json object builder to add the value to.
     * @param name the property name.
     * @param value the property value.
     */   
    public static void addJsonElement(JsonObjectBuilder builder, String name, Long value) {
        if (value == null) {
            builder.add(name, JsonValue.NULL);
        } else {
            builder.add(name, value);
        }
    }
    
    /**
     * Adds a Short value to the Json object builder for the given property name.
     * 
     * @param builder the Json object builder to add the value to.
     * @param name the property name.
     * @param value the property value.
     */   
    public static void addJsonElement(JsonObjectBuilder builder, String name, Short value) {
        if (value == null) {
            builder.add(name, JsonValue.NULL);
        } else {
            builder.add(name, value);
        }
    }
    
    /**
     * Adds a Boolean value to the Json object builder for the given property name.
     * 
     * @param builder the Json object builder to add the value to.
     * @param name the property name.
     * @param value the property value.
     */   
    public static void addJsonElement(JsonObjectBuilder builder, String name, Boolean value) {
        if (value == null) {
            builder.add(name, JsonValue.NULL);
        } else {
            builder.add(name, value);
        }
    }
    
    /**
     * Adds a Timestamp value to the Json object builder for the given property name.
     * 
     * @param builder the Json object builder to add the value to.
     * @param name the property name.
     * @param value the property value.
     */   
    public static void addJsonElement(JsonObjectBuilder builder, String name, Timestamp value) {
        if (value == null) {
            builder.add(name, JsonValue.NULL);
        } else {
            builder.add(name, value.toString());
        }
    }
    
    /**
     * Adds a Date value to the Json object builder for the given property name.
     * 
     * @param builder the Json object builder to add the value to.
     * @param name the property name.
     * @param value the property value.
     */   
    public static void addJsonElement(JsonObjectBuilder builder, String name, Date value) {
        if (value == null) {
            builder.add(name, JsonValue.NULL);
        } else {
            builder.add(name, value.toString());
        }
    }
    
     /**
     * Adds a binary value to the Json object builder for the given property name.
     * 
     * @param builder the Json object builder to add the value to.
     * @param name the property name.
     * @param value the property value.
     */   
    public static void addJsonElement(JsonObjectBuilder builder, String name, byte[] value) {
        if (value == null || value.length == 0) {
            builder.add(name, JsonValue.NULL);
        } else {
            String valueBase64 = DatatypeConverter.printBase64Binary(value);
            builder.add(name, valueBase64);
        }
    }
    
    /**
     * Adds a Json item to the Json object builder for the given property name.
     * 
     * @param builder the Json object builder to add the value to.
     * @param name the property name.
     * @param item the JsonItem.
     */   
    public static void addJsonItem(JsonObjectBuilder builder, String name, JsonItem item) {
        if (item == null) {
            builder.add(name, JsonValue.NULL);
        } else {
            builder.add(name, item.toJson());
        }
    }
    
    /**
     * Adds an array of Json items to the Json object builder for the given property name.
     * 
     * @param builder the Json object builder to add the value to.
     * @param name the property name.
     * @param list the list of JsonItems
     */   
    public static void addJsonItems(JsonObjectBuilder builder, String name, List<JsonItem> list) {
        if (list == null) {
            builder.add(name, JsonValue.NULL);
        } else {
            final JsonArrayBuilder arrayBuilder = Json.createArrayBuilder();
            for (JsonItem item : list) {
                arrayBuilder.add(item.toJson());
            }
            builder.add(name, arrayBuilder);
        }
    }
    
    /**
     * Converts a Json object to a Json encoded string.
     * 
     * @param object the Json object to be converted
     * @return a Json encoded string.
     */   
    public static String toJsonString(JsonObject object) {

        final StringWriter stWriter = new StringWriter();

        try (JsonWriter jsonWriter = Json.createWriter(stWriter)) {
            jsonWriter.writeObject(object);
        }

        return stWriter.toString();
    }
    
    /**
     * Converts this item to a String.
     * 
     * @return the String representing this entity.
     */  
    @Override
    public String toString() {
    
        return toJsonString(toJson());
    }
    
    
    
}
