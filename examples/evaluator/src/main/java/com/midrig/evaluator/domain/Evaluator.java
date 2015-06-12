/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package com.midrig.evaluator.domain;

import com.midrig.baff.app.entity.BusinessEntity;
import com.midrig.baff.app.entity.MappedBusinessEntity;
import static com.midrig.baff.app.json.JsonItem.addJsonElement;
import com.midrig.baff.app.json.JsonObjectProcessor;
import com.midrig.baff.app.service.ValidationError;
import java.sql.Timestamp;
import java.util.List;
import javax.json.JsonObjectBuilder;
import javax.persistence.Basic;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Version;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import javax.xml.bind.annotation.XmlRootElement;

/**
 *
 * @author midrig
 */
@Entity
@Table(name = "eval_evaluator")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "Evaluator.findAll", query = "SELECT e FROM Evaluator e"),
    @NamedQuery(name = "Evaluator.findByUsername", query = "SELECT e FROM Evaluator e WHERE e.evalGroup.id = ?1 AND e.username = ?2")
    })
public class Evaluator extends MappedBusinessEntity<Integer> {
    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;
    
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 200)
    @Column(name = "username")
    private String username;
    
    @Basic(optional = false)
    @NotNull
    @Column(name = "role")
    private Short userrole;
    
    @Version
    @Column(name = "last_updated")
    private Timestamp lastUpdated;
    
    @JoinColumn(name = "group_id", referencedColumnName = "id")
    @ManyToOne(optional = false)
    private EvalGroup evalGroup;  
    
    @OneToMany(cascade = CascadeType.REMOVE, mappedBy = "evaluator")
    private List<Score> scoreList;

    public Evaluator() {
        
        isMastered = true;
        masterEntityIdMap = "evalGroup.id";
        
    }
    
    @Override
    public Integer getEntityId() {
     
        return id;
    }
    
    @Override
    public void setEntityId(Integer id) {
     
        this.id = id;
    }
    
    @Override
    public BusinessEntity getMaster() {
       
        return evalGroup;
    };
     
    @Override
    public void setMaster(BusinessEntity entity) {
        evalGroup = (EvalGroup)entity;
    };
      
    
    @Override
    public Timestamp getOwnVersion() {
        return lastUpdated;
    };
    
    
    @Override
    public void addJson(JsonObjectBuilder builder) {
        
        addJsonElement(builder, "id", id);
        addJsonElement(builder, "username", username);
        addJsonElement(builder, "userrole", userrole);
        addJsonElement(builder, "lastUpdated", lastUpdated);
        
        // Deal with nullable domain objects
        if (evalGroup == null) {
            addJsonNull(builder, "evalGroup.id");
        } else {
            addJsonElement(builder, "evalGroup.id", evalGroup.getId());
        }

    } 
    
    @Override
     public void fromJson(JsonObjectProcessor jp) {
         
        // Do not allow existing keys and version fields to be kept 
        id = jp.getInteger("id", null);
        lastUpdated = jp.getTimestamp("lastUpdated", null);
        
        // Other fields that will only be overwritten if input not null       
        username = jp.getString("username", username);
        userrole = jp.getShort("userrole", userrole);
        
        Integer evalGroupId = jp.getInteger("evalGroup.id", null);
        
        if (evalGroupId == null) {
            evalGroup = null;
        } else {
            evalGroup = new EvalGroup();
            evalGroup.setId(evalGroupId);

        }     
        
    }
     
    @Override
    public ValidationError doIntegrityValidation(String action, List<ValidationError> errors) {
          
        return null;
    }


    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Short getUserrole() {
        return userrole;
    }

    public void setUserrole(Short userrole) {
        this.userrole = userrole;
    }

    public Timestamp getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Timestamp lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
    
    public EvalGroup getEvalGroup() {
        return evalGroup;
    }

    public void setEvalGroup(EvalGroup evalGroup) {
        this.evalGroup = evalGroup;
    }

    public List<Score> getScoreList() {
        return scoreList;
    }


}
