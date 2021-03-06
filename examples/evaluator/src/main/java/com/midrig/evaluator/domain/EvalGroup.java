/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package com.midrig.evaluator.domain;

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
import javax.persistence.Lob;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Version;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;

/**
 *
 * @author midrig
 */
@Entity
@Table(name = "eval_group")
//@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "EvalGroup.findAll", query = "SELECT e FROM EvalGroup e"),
    @NamedQuery(name = "EvalGroup.findByName", query = "SELECT e FROM EvalGroup e WHERE e.name = ?1")
    })
public class EvalGroup extends MappedBusinessEntity<Integer> {
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
    
    @Version
    @Column(name = "last_updated")
    private Timestamp lastUpdated;
    
    @OneToMany(cascade = CascadeType.REMOVE, mappedBy = "evalGroup")
    private List<Scorecard> scorecardList;
    
    @OneToMany(cascade = CascadeType.REMOVE, mappedBy = "evalGroup")
    private List<Evaluator> evaluatorList;

    public EvalGroup() {
        
        
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
    public Timestamp getOwnVersion() {
        return lastUpdated;
    };
    
    
    @Override
    public void addJson(JsonObjectBuilder builder) {
        
        addJsonElement(builder, "id", id);
        addJsonElement(builder, "name", name);
        addJsonElement(builder, "description", description);
        addJsonElement(builder, "lastUpdated", lastUpdated);

    } 
    
    @Override
     public void fromJson(JsonObjectProcessor jp) {
         
        // Do not allow existing keys and version fields to be kept 
        id = jp.getInteger("id", null);
        lastUpdated = jp.getTimestamp("lastUpdated", null);
        
        // Other fields that will only be overwritten if input not null       
        name = jp.getString("name", name);
        description = jp.getString("description",description);
        
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

    public Timestamp getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Timestamp lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    @XmlTransient
    public List<Scorecard> getScorecardList() {
        return scorecardList;
    }

    public void setScorecardList(List<Scorecard> scorecardList) {
        this.scorecardList = scorecardList;
    }

    public List<Evaluator> getEvaluatorList() {
        return evaluatorList;
    }
    
}
