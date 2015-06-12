/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package com.midrig.evaluator.domain;

import com.midrig.baff.app.entity.BusinessEntity;
import com.midrig.baff.app.entity.MappedBusinessEntity;
import static com.midrig.baff.app.json.JsonItem.addJsonElement;
import static com.midrig.baff.app.json.JsonItem.addJsonNull;
import com.midrig.baff.app.json.JsonObjectProcessor;
import com.midrig.baff.app.service.ValidationError;
import java.sql.Timestamp;
import java.util.List;
import javax.json.JsonObjectBuilder;
import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.Version;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 *
 * @author midrig
 */
@Entity
@Table(name = "eval_tpl_criteria")
@NamedQueries({
    @NamedQuery(name = "CriteriaTpl.findAll", query = "SELECT c FROM CriteriaTpl c"),
    @NamedQuery(name = "CriteriaTpl.findByName", query = "SELECT c FROM CriteriaTpl c WHERE c.scorecardTpl.id = ?1 AND c.name = ?2")
})
public class CriteriaTpl extends MappedBusinessEntity<Integer> {
    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;
    
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 200)
    @Column(name = "name")
    private String name;
    
    @Lob
    @Size(max = 65535)
    @Column(name = "description")
    private String description;
    
    @Basic(optional = false)
    @NotNull
    @Column(name = "weight")
    private Integer weight;
    
    @Version
    @Column(name = "last_updated")
    private Timestamp lastUpdated;
    
    @JoinColumn(name = "tpl_scorecard_id", referencedColumnName = "id")
    @ManyToOne(optional = false)
    private ScorecardTpl scorecardTpl;  
    
    @Transient
    private Integer relativeWeight;
   
    
    public CriteriaTpl() {

        isMastered = true;
        masterEntityIdMap = "scorecardTpl.id";       
        
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
       
        return scorecardTpl;
    };
     
    @Override
    public void setMaster(BusinessEntity entity) {
        scorecardTpl = (ScorecardTpl)entity;
    };
      
    
    @Override
    public Timestamp getOwnVersion() {
        return lastUpdated;
    };
    
    
    @Override
    public void addJson(JsonObjectBuilder builder) {
        
        addJsonElement(builder, "id", id);
        addJsonElement(builder, "name", name);
        addJsonElement(builder, "description", description);
        addJsonElement(builder, "weight", weight);       
        addJsonElement(builder, "relativeWeight", relativeWeight);        
        addJsonElement(builder, "lastUpdated", lastUpdated);
      
        // Deal with nullable domain objects
        if (scorecardTpl == null) {
            addJsonNull(builder, "scorecardTpl.id");
        } else {
            addJsonElement(builder, "scorecardTpl.id", scorecardTpl.getId());
        }

    } 
    
    @Override
     public void fromJson(JsonObjectProcessor jp) {
         
        // Do not allow existing keys and version fields to be kept 
        id = jp.getInteger("id", null);
        lastUpdated = jp.getTimestamp("lastUpdated", null);
        
        // Other fields that will only be overwritten if input not null       
        name = jp.getString("name", name);
        description = jp.getString("description", description);
        weight = jp.getInteger("weight", weight);
        
        Integer scorecardTplId = jp.getInteger("scorecardTpl.id", null);
        
        if (scorecardTplId == null) {
            scorecardTpl = null;
        } else {
            scorecardTpl = new ScorecardTpl();
            scorecardTpl.setId(scorecardTplId);

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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getWeight() {
        return weight;
    }

    public void setWeight(Integer weight) {
        this.weight = weight;
    }

    public Timestamp getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Timestamp lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
    
    public ScorecardTpl getScorecardTpl() {
        return scorecardTpl;
    }
    
    public void setScorecardTpl(ScorecardTpl scorecardTpl) {
        this.scorecardTpl = scorecardTpl;
    }

    public Integer getRelativeWeight() {
        return relativeWeight;
    }

    public void setRelativeWeight(Integer relativeWeight) {
        this.relativeWeight = relativeWeight;
    }

    
}
