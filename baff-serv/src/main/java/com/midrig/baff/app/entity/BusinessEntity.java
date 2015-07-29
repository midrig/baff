package com.midrig.baff.app.entity;

import com.midrig.baff.app.json.JsonItem;
import com.midrig.baff.app.json.JsonObjectProcessor;
import com.midrig.baff.app.service.ValidationError;
import com.midrig.baff.utility.locale.MessageHelper;
import java.io.Serializable;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.sql.Timestamp;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.persistence.Id;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

 /**
 * A BusinessEntity represents a persistent business data object. 
 * All business entities should inherit from this class via {@link MappedBusinessEntity}.
 * <p>
 * A typical implementation is described 
 * <a href="../../../../../../examples/MyBusinessEntity.html" target="_blank">here</a>
 * <p>
 * The BusinessEntity superclass supports the following key features:
 * <ul>
 * <li>Version control to support an optimistic locking strategy  
 * <li>Linkage to a master entity used for version control  
 * <li>Integrity validation, including the ability to compare original and revised versions  
 * <li>Serialisation and deserialisation to and from JSON  
 * <li>SQL query string generation for filtered searches
 * </ul>
 * <br>
 * <pre>{@literal
 * Any validation assertions should declared as follows, where an underscore delimits the field name:
 *    @AssertTrue(message="must.beok") 
 *    public boolean isFieldName_TestDescription() ... }
 * </pre>
 *  
 * @param <ID> the type of the entity identifier
 */ 
public abstract class BusinessEntity<ID extends Serializable> extends JsonItem implements Serializable{
   
    /**
     * The logger.
     * Subclasses should use this to log information.
     */
    final protected Logger logger = LoggerFactory.getLogger(this.getClass());
    
     /**
     * The default entity configuration read from 'baff.properties' 
     */
    final protected static EntityConfig entityConfig;
    
    static {
        entityConfig = new EntityConfig();
    }
    
    /**
     * A message helper for use in setting validation error messages.
     * This is set by the business service prior to invoking validation routines, and is otherwise generally unavailable.
     */
    protected MessageHelper messageHelper;
    
    /**
     * Set in constructor to apply version control based on version property.
     * The default value is defined by the 'versioncontrol' property in 'baff.properties'.
     * If mastered then the version will be based on the master version, otherwise a version field should
     * be defined and returned by {@link #getOwnVersion}.
     */
    protected boolean isVersionControlled;
    
    /**
     * Set in constructor to to apply version control based on time data obtained.
     * The default value is defined by the 'currencycontrol' property in 'baff.properties'.
     * This is only relevant for mastered entities, as master entities should define a version field and
     * set {@link #isVersionControlled} to true.  The benefit of this approach is that it avoids having to
     * set the version on load.  Note that there is a risk of an update occurring between the time 
     * the entity is retrieved and the time the currency is set, which means this approach is not 100%
     * robust.
     */
    protected boolean isCurrencyControlled;
    
    /**
     * Set in constructor to to indicate if this has a master entity.
     * Note that any entity that is not mastered is considered a master entity, even if it is only the 
     * master of itself.
     */
    protected boolean isMastered;
    
    /**
     * Set in constructor to populate master entity on load.
     * The default value is defined by the 'setmasteronload' property in 'baff.properties'.
     * This will make the master entity id available as well as the master version if
     * {@link #isVersionControlled} is set to true.  This is necessary for version control unless this
     * is being managed on the client.  Currency control, set by {@link #isCurrencyControlled}, avoids 
     * the need for this but is not as robust an approach.
     */
    protected boolean isMasterSetOnLoad;
    
    /**
     * Specifies if the {@link BusinessService} should automatically refresh this entity when it is saved.
     * This may not be desirable if ORM cascade the refresh.
     */
    protected boolean isAutoRefreshed;
   
    /**
     * Set in constructor to map to the master entity identifier key field(s).
     * This is used to filter any queries based on the overall master entity id; this may not be required if filtering on
     * a unique context identifier (e.g. direct master identifier), in which case there is no need to set this. 
     * An example if using a single key is "master.masterId".  Multiple keys should be pipe delimited 
     * string onto this entity's for example. "fieldA||fieldB" (ignoring the middle field)
     */
    protected String masterEntityIdMap;
 
    // Semi-private fields, generally not to be accessed by sub classes
    
    /**
     * The currency timestamp.
     */
    protected Timestamp currencyControl;
    
    /**
     * The version timestamp.
     */
    protected Timestamp versionControl;  
    
    /**
     * The master entity identifier for this entity.
     */
    protected String masterEntityId;
        
    /**
     * The baseline version of this entity.
     * The baseline is used to refer to a snapshot of this entity that can be taken at any time.
     */
    private JsonObject baselineJsonObject;
    
    /**
     * The reference version of this entity.
     * This is generally used to refer to the currently persisted, unmodified version of this entity. 
     */
    protected BusinessEntity referenceEntity;
    
    /**
     * Literal to define a save (add or update) operation. 
     */
    static final public String REC_SAVE = "REC_SAVE";
    
    /**
     * Literal to define a remove (delete) operation. 
     */
    static final public String REC_REMOVE = "REC_REMOVE";
       
    /**
     * Returns the identifier of this entity.
     * Must be overridden by the subclass.
     * 
     * @return the type of the entity identifier 
     */  
    public abstract ID getEntityId();
    
    /**
     * Sets the identifier of this entity.
     * Must be overridden by the subclass.
     * 
     * @param id the identifier
     */  
    public abstract void setEntityId(ID id);
    
    /**
     * Converts this entity into Json.
     * Must be overridden by the subclass.
     * 
     * @param builder the JsonObjectBuilder to add the Json to.
     */  
    public abstract void addJson(JsonObjectBuilder builder);
    
    /**
     * Sets this entity from Json.
     * Must be overridden by the subclass.
     * IMPORTANT: Never set version or currency control here
     * 
     * @param jp the JsonObjectProcessor to retrieve the data from.
     */  
    public abstract void fromJson(JsonObjectProcessor jp);
    
    /**
     * Constructs the entity.
     * The following properties may be set here:
     * <ul>
     * <li>{@link #isVersionControlled}  
     * <li>{@link #isCurrencyControlled}  
     * <li>{@link #isMastered}  
     * <li>{@link #isMasterSetOnLoad} 
     * <li>{@link #masterEntityIdMap}
     */     
    public BusinessEntity() {
        
        this.isVersionControlled = entityConfig.isVersionControl();
        this.isCurrencyControlled = entityConfig.isCurrencyControl();
        this.isMasterSetOnLoad = entityConfig.isSetMasterOnLoad();
        this.isAutoRefreshed = entityConfig.isAutoRefreshed();
        this.isMastered = false;
        
    }
    
   /**
     * Returns the direct master (parent) of this entity.
     * Note that this is not necessarily the overall master; this is obtained via {@link #getMasterEntity}. 
     * Must be overridden if mastered.  Otherwise returns a reference to self.
     * 
     * @return the master entity.
     */  
   public BusinessEntity getMaster() {
       
        if (isMastered) { 
            logger.error("Override BaseEntity::getMaster when mastered");
            return null;        
        }
        
        return this;
   };
   
   /**
     * Sets the master of this entity.
     * Must be overridden if mastered.
     * 
     * @param entity the master entity.
     */  
   public void setMaster(BusinessEntity entity) {
        if (isMastered)
            logger.error("Override BaseEntity::setMaster when mastered");
 
   };
   
   /**
     * Gets the value of this entity's own defined version field.
     * Must be overridden for master versions or if a version field is specified.
     * 
     * @return the version.
     */  
   public Timestamp getOwnVersion() {
        logger.error("Override BusinessEntityEntity::getOwnVersion");
        return null;
   };
   
    /**
     * Resets the currency of this entity.
     */  
    protected void resetCurrency() {
        
        Date now = new Date();
        currencyControl = new Timestamp(now.getTime());
       
    };
   
   /**
     * Called by a service to perform integrity validation.
     * Override if validation is required.
     * <p>
     * Returning a single error will result in a single message being returned, ignoring the list of errors.  
     * Otherwise an error can be added as follows (the message can be a property).
     * <pre>{@literal
     * ValidationError error = ValidationErrorFactory.getFieldError("message", "fieldname");
     * errors.add(error);}
     * </pre>
     *
     * @param action the type of action, {@link #REC_SAVE} or {@link #REC_REMOVE}.
     * @param errors the list of validation errors.
     * @return the error message or null.
     */  
   public ValidationError doIntegrityValidation(String action, List<ValidationError> errors) {
        
        return null; 
        
    }
   
    /**
     * Converts this entity to a Json Object.
     * If not automatically setting the master on load ('setmasteronload' = false) then may
     * set a value for "masterEntityId" here if available, e.g. through through a field that holds this a foreign key
     * 
     * @return the JsonObject representing this entity.
     * 
     */  
    @Override
    public JsonObject toJson() {
        
        JsonObjectBuilder builder = Json.createObjectBuilder();
        getJson(builder);
        
        return builder.build();

    }
    
    /**
     * Converts this entity into Json.
     * 
     * @param builder the JsonObjectBuilder to add the Json to.
     */
    public void getJson(JsonObjectBuilder builder) {
        
        if (getEntityId() != null)
            addJsonElement(builder, "entityId", getEntityId().toString());  
            
        if (masterEntityId != null)
            addJsonElement(builder, "masterEntityId", masterEntityId);
        
        if (currencyControl != null)
            addJsonElement(builder, "currencyControl", currencyControl);
            
        if (versionControl != null)
            addJsonElement(builder, "versionControl", versionControl);
        
        // Call sub class to process its fields
        addJson(builder);
        
    }  
    
    
    /**
     * Sets this entity from a Json Object.
     * 
     * @param jsonObject the object to create this object from.
     */  
    public void setFromJson(JsonObject jsonObject) {
        
        JsonObjectProcessor jp = new JsonObjectProcessor(jsonObject);
        
        // Ensure controls are re-set if related inputs don't exist
        currencyControl = jp.getTimestamp("currencyControl", null);
        versionControl = jp.getTimestamp("versionControl", null);
        masterEntityId = jp.getString("masterEntityId", null);
        
        // Call subclass to process its fields
        fromJson(jp);
        
    }
    
    /**
     * Sets blobs on this entity
     * @param blobs the blob to set
     */  
    public void setBlobs(HashMap<String, byte[]> blobs) {
        
    }
    
    /**
     * Tests if the input object is the same as this one.
     * 
     * @param obj the object to be tested.
     * @return the result.
     */  
    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final BusinessEntity other = (BusinessEntity) obj;
        return Objects.equals(this.getEntityId(), other.getEntityId());
    }

    @Override
    public int hashCode() {
        int hash = 7;
        hash = 59 * hash + Objects.hashCode(this.getEntityId());
        return hash;
    }
    
    /**
     * Copies the contents of an entity and sets it as a reference.
     * 
     * @param <T> the type of entity.
     * @param target the entity to be copied.
     */  
    public <T extends BusinessEntity> void copyFrom(T target) {
        JsonObject jsonObject = target.toJson();
        this.setFromJson (jsonObject);
        setReferenceEntity(target);
    }
    
    /**
     * Copies the contents of an entity's baseline and sets the entity as a reference.
     * 
     * @param <T> the type of entity.
     * @param target the entity to be copied.
     * @param fromBaseline flag to indicate if 
     */  
    public <T extends BusinessEntity> void copyFrom(T target, boolean fromBaseline) {
        if (fromBaseline) {
            JsonObject baseline = target.getBaseline();
            if (baseline != null) {
                this.setFromJson(baseline);
            }
        }
        setReferenceEntity(target);
    }
    
    /**
     * Determines if the entity is subject to version or currency control.
     * 
     * @return true if version or currency controlled.
     */  
    public boolean isVersioned() {
       
        return isVersionControlled || isCurrencyControlled;
        
    };
    
    /**
     * Gets a new, empty instance of this entity type.
     * 
     * @return the new instance.
     */  
    public BusinessEntity getNewInstance() {
        
        BusinessEntity entity = null;

        try {
            Class clazz = this.getClass();
            Constructor cons = clazz.getConstructor();
            entity = (BusinessEntity) cons.newInstance();
         } 
    
        catch (NoSuchMethodException | SecurityException | InstantiationException | IllegalAccessException | IllegalArgumentException | InvocationTargetException ex) {
            logger.error("Failed to create class instance of " + this.getClass());
        }   
        
        return entity;
        
    };
    
/**
     * Gets the overall master entity for this entity.
     * This will be a itself if it is a master.
     * Will return null if the master has not been loaded.
     * 
     * @return the master entity.
     */  
    public BusinessEntity getMasterEntity() {
    
        BusinessEntity masterEntity = null;
        
        if (isMastered) {            
            masterEntity = getMaster();

            if (masterEntity != null) {
                masterEntity = masterEntity.getMaster();
            }              
        } else {           
            masterEntity = this;
        }
        
        return masterEntity;
    }
    
    
    /**
     * Gets the master entity identifier for this entity.
     * This will be a it's own identifier if it is a master.
     * 
     * @return {@link #masterEntityId}.
     */  
    public String getMasterEntityId() {
              
        if (masterEntityId != null)
            return masterEntityId;
        
        masterEntityId = null;
        
        BusinessEntity master = getMasterEntity();
        
        if (master != null)
            masterEntityId = master.getEntityId().toString();
        
        return masterEntityId;
    };
    
     /**
     * Determines if the entity is up to date.
     * 
     * @return true if the entity is up to date or not version or currency controlled.
     */  
   public boolean isCurrentVersion() {
       
       logger.debug("version control: " + isVersionControlled + "  ,currency control: " + isCurrencyControlled);
   
       boolean isCurrent = true;
       
        // Check currency control first
        if (isCurrencyControlled) {
             isCurrent = checkCurrency();       
        } 
        
        // Then check version control (more robust)
        if (isCurrent && isVersionControlled) {
             isCurrent = checkVersion();              
        } 
        
        return isCurrent;
   }
    
    /**
     * Gets the version for this entity.
     * This will be a it's own version if it is a master.  
     * 
     * @return {@link #versionControl} or null if not version controlled.
     */  
    public Timestamp getVersion() {       
        
        if (!isVersionControlled)
            return null;
        
        if (versionControl != null)
            return versionControl;
         
        versionControl = null;
        
        BusinessEntity masterEntity = getMasterEntity();

        if (masterEntity != null) {
            versionControl = masterEntity.getOwnVersion(); 
        }
            
        return versionControl;
    };  
   
   /**
    * Determines if the entity's version is up to date.
    * Dependent on processing setting the value of {@link #versionControl} if {@link #isVersionControlled} is true.
    * Also dependent on processing setting {@link #referenceEntity} unless adding a master entity. 
    * 
    * @return true if the entity is up to date or not version controlled.
    */  
   protected boolean checkVersion() {
       
        logger.debug("version control: " + isVersionControlled);
        
        if (isVersionControlled == false)
            return true;
        
        // If the reference entity is not set then we should be adding a master
        if (referenceEntity == null) {            
            if (isMastered || getEntityId() != null)
                return false;  // existing or mastered entity so reference entity should be set
            else
                return true;  // adding a master entity
        }
        
        // Get current version; if none then we can overwrite
        Timestamp curVer = referenceEntity.getVersion();
        
        logger.debug("my version: " + versionControl + " ,current version; " + curVer);
        
        if (curVer == null)
            return true;
                        
        return versionControl != null && curVer.equals(versionControl);

    }
   
   /**
    * Gets the currency for this entity.
    * 
    * @return {@link #currencyControl} or null if not currency controlled.
    */  
   public Timestamp getCurrency() {
       return currencyControl;
   }
   
   /**
    * Determines if the entity's currency is up to date.
    * 
    * @return true if the entity is up to date or not currency controlled.
    */ 
   protected boolean checkCurrency() {
       
       logger.debug("currency control: " + isCurrencyControlled);
        
        if (isCurrencyControlled == false)
            return true;

        if (currencyControl == null && getEntityId() == null)
            return true;  // adding a new entity (currency control cannot be set)

        if (referenceEntity == null) {            
            if (isMastered || getEntityId() != null)
                return false;  // existing or mastered entity so reference entity should be set
            else
                return true;  // adding a master entity
        }
        
        // Get current version; if none then we can overwrite
        Timestamp curVer = referenceEntity.getVersion();
        
        logger.debug("my currency: " + currencyControl + " ,current version; " + curVer);
        
        if (curVer == null)
            return true;
        
        return currencyControl != null && !curVer.after(currencyControl);
    }
   
   /**
    * Creates an SQL query string to retrieve a list of this type of entity from the database.
    * The sorters and filters should be passed in a map of name-value pairs.  To enable filtering on 
    * master entity id {@link masterEntityIdMap} must be set.
    * <p>
    * Query strings to find the entity and to count the number of entities are returned and can be
    * obtained via get("FIND") and get("COUNT").
    * 
    * @param sorters a list of sort parameters to apply to the query.
    * @param filters a list of filter parameters to apply to the query.
    * @return a map containing a "FIND" and a "COUNT" query string. 
    */   
   public HashMap<String, String> createQueryStrings (HashMap<String, String> sorters, HashMap<String, String> filters) {      
       
        Class entityClass = this.getClass();
               
        String orderByPart = createOrderByClause(sorters);
        String wherePart = createWhereClause(filters);
          
        HashMap<String, String> queryStrings = new HashMap<>();
        
        String findQueryString = "SELECT e FROM " + entityClass.getSimpleName() + " e" + wherePart + orderByPart;
        String countQueryString = "SELECT COUNT(e) FROM " + entityClass.getSimpleName() + " e" + wherePart;
        
        logger.debug("findQuery: {}", findQueryString);
        logger.debug("countQuery {} ", countQueryString);
        
        queryStrings.put("FIND", findQueryString);
        queryStrings.put("COUNT", countQueryString);
       
        return queryStrings;
   }
   
   /**
    * Creates an SQL ORDER BY clause.
    * 
    * @param sorters a list of sort parameters to apply to the query.
    * @return the ORDER BY string. 
    */   
   public String createOrderByClause(HashMap<String, String> sorters) {
       
        String orderByClause = "";

        // Process sorters to create an "ORDER BY" clause
        if (sorters != null && sorters.isEmpty() == false) {
        
            orderByClause = " ORDER BY ";
            boolean first = true;
            
            for (String sortProp : sorters.keySet() ) {
                
                String sortDir = sorters.get(sortProp);
                
                if (!first)
                    orderByClause += " , ";
                
                orderByClause += "e." + sortProp + " " + sortDir;                
                first = false;
                
            }
        }
        
        return orderByClause;
   }
   
    /**
    * Creates an SQL WHERE clause.
    * 
    * @param filters a list of filter parameters to apply to the query.
    * @return the WHERE string. 
    */   
   public String createWhereClause(HashMap<String, String> filters) {
      
       String whereClause = "";
        Class entityClass = this.getClass();

        // Process filters to create an "WHERE" clause
        if (filters != null && filters.isEmpty() == false) {
            
             // Check if masterentityId
            String filterValue = filters.get("masterEntityId");

            if (filterValue != null) {
                addQueryFiltersForMasterEntityId(filterValue, filters);
                filters.remove("masterEntityId");
            }
           
            boolean first = true;
            
            for (String filterProp : filters.keySet() ) {
                               
                filterValue = filters.get(filterProp);
                
                if (filterValue == null)
                    continue;
                
                if (!first)
                    whereClause += " AND ";
                else
                    whereClause = " WHERE ";
                
                if (filterValue.startsWith("[") && filterValue.endsWith("]"))
                    filterValue = filterValue.substring(1, filterValue.length()-1);
                
                if (filterValue.startsWith("%") || filterValue.endsWith("%")) {
                    whereClause += "UPPER(e." + filterProp + ") LIKE \'" + filterValue.toUpperCase() + "\'";
                } else {
                    
                    Field[] fields = entityClass.getDeclaredFields();
                   
                    for (Field field : fields) {
                      
                        if (field.getName().equals(filterProp)) {

                            Class clazz = field.getType();

                            if (clazz == String.class || clazz == Timestamp.class) {
                                filterValue = "\'" + filterValue + "\'";
                            }

                            break;
                        }

                    }
                    
                    whereClause += "e." + filterProp;
                      
                    if (filterValue.contains("|")) {
                        String [] values = filterValue.split("\\|", -1);

                        whereClause += " IN (";

                        for (int i=0; i<values.length-1; i++) {
                            whereClause += values[i] + ",";
                        }
                        whereClause += values[values.length-1] + ")";

                    } else 
                            whereClause += " = " + filterValue;
                    }
                
                first = false;
            }     
        }
        
        return whereClause;
   }
   
   /**
    * Determines the filter required for a mastered entity.
    * 
    * @param masterEntityId the master entity identifier.
    * @param filters a list of filter parameters to apply to the query.
    */   
   protected void addQueryFiltersForMasterEntityId(String masterEntityId, HashMap<String, String> filters) {
           
       // Split master entity id based on mapping
       if (masterEntityIdMap != null && masterEntityId != null) {
           
            // Find the first delimiter
            String[] idFields = masterEntityId.split("\\|", -1);          
            String[] mapFields = masterEntityIdMap.split("\\|", -1);
                       
            // The array lengths should match
            if (idFields.length == mapFields.length) {
               
               for (int i=0; i<idFields.length; i++) {
                   filters.put (mapFields[i], idFields[i]);
               }
            }
       }
    
    }
   
   /**
    * Creates an SQL query string to retrieve a copy of this entity from the database.
    * 
    * @return the find query string. 
    */   
   public String createFindQueryString() {        

        Class entityClass = this.getClass();       
        Field idField = null;
        
        for (Field field : entityClass.getDeclaredFields()) {
            
            Id idAnnotation = field.getAnnotation(Id.class);
            if (idAnnotation != null) {
                    idField = field;
                    break;
            }                    
        }
        
        if (idField == null) {
            logger.error("createFindQueryString, failed to find id column for entity");
            return null;
        }
        
        String findQueryString = "SELECT e FROM " + entityClass.getSimpleName() + " e WHERE e." + idField.getName() + " =  " + this.getEntityId();
        
        return findQueryString;
   }
   
   /**
    * Gets the baseline.
    * 
    * @return {@link #baselineJsonObject}.
    */   
    protected JsonObject getBaseline() {
        return baselineJsonObject;
    }
    
    /**
     * Sets the baseline by copying current values.
     */  
    public void setBaseline() {
        baselineJsonObject = toJson();
    }
    
    /**
    * Gets the reference entity.
    * 
    * @return {@link #referenceEntity}.
    */    
    public BusinessEntity getReferenceEntity() {
        return referenceEntity;
    }
    
    /**
    * Sets the reference entity.
    * 
     * @param referenceEntity the entity to reference.
    */    
    public void setReferenceEntity(BusinessEntity referenceEntity) {
        this.referenceEntity = referenceEntity;
    }
    
    /**
    * Gets the version control timestamp as a string.
    * 
    * @return {@link #versionControl} as a string.
    */  
    public String getVC() {
        if (versionControl != null) {
            return versionControl.toString();
        } else {
            return "null";
        }
    }

    /**
    * Gets the flag that indicates if this entity is mastered.
    * 
    * @return {@link #isMastered}.
    */  
    public boolean isMastered() {
        return isMastered;
    }
    
    /**
     * Determines if an entity is unique within a list of entities
     * 
     * @param <T> the type of the associated entity.
     * @param list the list of entities to test against.
     * @return true if only a single instance of this entity is found.
     */
    public <T extends BusinessEntity> boolean isOnlyMe(List<T> list) {

        boolean isUnique = false;

        if (list.isEmpty()) { 
            isUnique = true;
        } else if (list.size() == 1) {

            T otherEntity = list.get(0);
 
            if (otherEntity.getEntityId().equals(this.getEntityId())) {
                isUnique = true;
            }
        }

        return isUnique;
        
    }

    public void setMessageHelper(MessageHelper messageHelper) {
        this.messageHelper = messageHelper;
    }

    public boolean isIsAutoRefreshed() {
        return isAutoRefreshed;
    }


}
