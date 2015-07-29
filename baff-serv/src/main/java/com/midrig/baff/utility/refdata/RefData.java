
package com.midrig.baff.utility.refdata;

import com.midrig.baff.app.entity.MappedBusinessEntity;
import com.midrig.baff.app.json.JsonObjectProcessor;
import java.sql.Timestamp;
import javax.json.JsonObjectBuilder;
import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * A RefData object represents a reference data record.
 */  

@Entity
@Table(name = "refdata")
@NamedQueries({
    @NamedQuery(name = "RefData.findRefDataClass", query = "SELECT p FROM RefData p WHERE p.rdDomain = ?1 AND p.rdClass = ?2")
})
public class RefData extends MappedBusinessEntity<Integer> {
    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id_refdata")
    private Integer idRefdata; 
        
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 200)
    @Column(name = "rd_domain")
    private String rdDomain;
    
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 200)
    @Column(name = "rd_class")
    private String rdClass;
    
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 200)
    @Column(name = "rd_key")
    private String rdKey;
    
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 200)
    @Column(name = "rd_code")
    private String rdCode;
    
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 200)
    @Column(name = "rd_decode")
    private String rdDecode;
    
    public RefData() {
        
        
    }

    @Override
    public Integer getEntityId() {
     
        return idRefdata;
    }
    
    @Override
    public void setEntityId(Integer id) {
     
        idRefdata = id;
    }
    
    @Override
    public Timestamp getOwnVersion() {
        return null;
   };
    
    
    @Override
    public void addJson(JsonObjectBuilder builder) {
        
        addJsonElement(builder, "key", rdDomain + "." + rdClass + "." + rdKey);
        addJsonElement(builder, "code", rdCode);
        addJsonElement(builder, "decode", rdDecode);
        
       
    } 
    
    @Override
     public void fromJson(JsonObjectProcessor jp) {
         
 
        
    }
   
}
