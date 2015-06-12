/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package com.midrig.evaluator.domain;

import com.midrig.baff.app.entity.MappedBusinessEntity;
import static com.midrig.baff.app.json.JsonItem.addJsonElement;
import com.midrig.baff.app.json.JsonObjectProcessor;
import java.sql.Timestamp;
import javax.json.JsonObjectBuilder;
import javax.persistence.Basic;
import javax.persistence.Cacheable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.persistence.Version;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 *
 * @author midrig
 */
@Entity
@Cacheable(false)
@Table(name = "eval_groupforevaluator")
@NamedQueries({
    @NamedQuery(name = "GroupForEval.findAll", query = "SELECT e FROM GroupForEval e"),
    @NamedQuery(name = "GroupForEval.findAllForEvaluator", query = "SELECT e FROM GroupForEval e WHERE e.username = ?1")
    })
public class GroupForEval extends MappedBusinessEntity<Integer> {
    private static final long serialVersionUID = 1L;
    
    @Id
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
    
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 200)
    @Column(name = "username")
    private String username;
    
    @Basic(optional = false)
    @NotNull
    @Column(name = "role")
    private Short role;
    
    @JoinColumn(name = "id", referencedColumnName = "id", insertable=false, updatable=false)
    @ManyToOne(optional = false)
    private EvalGroup evalGroup;
    
    @JoinColumn(name = "evaluator_id", referencedColumnName = "id")
    @ManyToOne(optional = false)
    private Evaluator evaluator;


    public GroupForEval() {
        
        
    }

    @Override
    public Integer getEntityId() {
     
        return evalGroup.getEntityId();
    }
    
    @Override
    public void setEntityId(Integer id) {
        // Read Only
    }
    
    
    @Override
    public Timestamp getOwnVersion() {
        return getLastUpdated();
    };
    
    
    @Override
    public void addJson(JsonObjectBuilder builder) {
        
        addJsonElement(builder, "id", evalGroup.getId());
        addJsonElement(builder, "name", name);
        addJsonElement(builder, "description", description);
        addJsonElement(builder, "userrole", role);
        addJsonElement(builder, "evaluator.id", evaluator.getId());
        addJsonElement(builder, "lastUpdated", lastUpdated);
        
    } 
    
    @Override
     public void fromJson(JsonObjectProcessor jp) {
         
        // Not relevant as is based on a view
        
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

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Short getRole() {
        return role;
    }

    public void setRole(Short role) {
        this.role = role;
    }

    public EvalGroup getEvalGroup() {
        return this.evalGroup;
    }
    
    public Evaluator getEvaluator() {
        return this.evaluator;
    }
   
   
    
}
