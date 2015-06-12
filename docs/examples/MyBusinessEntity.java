/**
 * Associated Data Access Object
 */
@Repository
public interface MyEntityDao extends JpaRepository<MyEntity, Integer> {
   
    // Add any custom queries here
  
}

/**
 * Business Entity
 */
@Entity
@Table(name = "my_entity")
@NamedQueries({
    @NamedQuery(name = "MyBusinessEntity.findAll", query = "SELECT e FROM MyBusinessEntity e")})
public class MyBusinessEntity extends MappedBusinessEntity<Integer> {
    private static final long serialVersionUID = 1L;
    
    // Identifier (required for all, recommend this to be an Integer
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id_myentity")
    private Integer myEntityId;
    
    // Local version control (required for master or if using currency control)
    @Version
    @Column(name = "last_updated")
    private Timestamp lastUpdated;
    
    // Other Fields - note that these should be based on non-primitive data types to faciliate conversion 
    @Size(max = 200)
    @Column(name = "otherField")
    private String otherField;
    
    // More fields here
   
    // Master entity (if mastered)
    @JoinColumn(name = "id_master", referencedColumnName = "id_master")
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private MasterEntity myMaster;
    
    // Mastered entities (if this is the master)
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "product")
    private List<MasteredEntity> masteredEntityList;

    // Constructor
    public MyBusinessEntity() {
        
        // Set to true for mastered entities
        isMastered = true;
        
        // Set for both master and mastered entities
        masterEntityIdMap = "myEntityId"; // master
        masterEntityIdMap = "myMaster.id";  // mastered
               
        // Set for both master and mastered entities
        isVersionControlled = true;
        
        // Set for mastered entities to load the master when this entity is loaded
        // This will also set the version if "isVersionControlled" above flag is set to true
        isMasterSetOnLoad = true;
        
    }

    // Must be set for all entities    
    @Override
    public Integer getEntityId() {     
        return myEntitId;
    }
    
    // Must be set for all entities
    @Override
    public void setEntityId(Integer id) {     
        myEntitId = id;
    }
    
    // Only required for mastered entities (master entities will return a reference to self)
    @Override
    public BusinessEntity getMaster() {
        return myMaster;
    };
    
    // Only required for mastered entities
    @Override
    public void setMaster(BusinessEntity master) {
        myMaster = (Master)master;
    };
    
    // Return version field 
    @Override
    public Timestamp getLocalVersion() {
        return lastUpdated;
    };
    
    // Create Json from this entitity
    @Override
    public void addJson(JsonObjectBuilder builder) {
        
        addJsonElement(builder, "myEntityId", myEntityId);
        addJsonElement(builder, "lastUpdated", lastUpdated);
        addJsonElement(builder, "otherField", otherField);
        
        // More fields
         
        // Deal with nullable referenced domain objects, for example to set master id
        if (myMaster == null) {
            addJsonNull(builder, "masterId");
        } else {
            addJsonElement(builder, "masterId", myMaster.getEntityId());
        }

    } 
    
    // Set this entitiy from Json
    @Override
     public void fromJson(JsonObjectProcessor jp) {
         
        // Do not allow existing values for keys and version fields to be kept 
        myEntityId = jp.getInteger("myEntityId", null);
        lastUpdated = jp.getTimestamp("lastUpdated", null);        
        
        // Other fields that will only be overwritten if input not null       
        otherField = jp.getString("otherField", otherField);

        // Existing keys for master and other entity relationships should not be kept if nullable
        Integer masterId = jp.getInteger("masterId", null);
        
        // Set master or other relationship entity
        if (masterId != null) {
            myMaster = new Master();
            myMaster.setId(masterId);           
        } 
        
     }
     
    // Fo integrity validation
    @Override
    public String doIntegrityValidation(String action, List<ValidationError> errors) {
        
        // Returning a message will result in a single message being returned (ignoring any validator messages)
        
        // Or else add to errors
        ValidationError error = new ValidationError("field", "message");
        errors.add(error);
        
        return null;
    }
    
    // Validation can also be specified as follows
    @AssertTrue(message="error message") 
    public boolean isReference_OK() {
        
        return true;
    }
    
    // Getters and setters
   
    public Integer getMyBusinessEntityId() {
        return myEntityId;
    }

    public void setMyBusinessEntityId(Integer myEntityId) {
        this.myEntityId = myEntityId;
    }
    
    public Timestamp getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Timestamp lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public String getOtherField() {
        return otherField;
    }

    public void setMake(String otherField) {
        this.otherField = otherField;
    }

    public Master getMyMaster() {
        return myMaster;
    }

    public void setMyMaster(Master master) {
        this.myMaster = master;
    }
    
    public List<MasteredEntity> getMasteredEntityList() {
        return masteredEntityList;
    }

    public void setMasteredEntityList(List<MasteredEntity> masteredEntityList) {
        this.masteredEntityList = masteredEntityList;
    }
    
}
