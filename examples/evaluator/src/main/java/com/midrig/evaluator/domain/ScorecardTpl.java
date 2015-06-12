/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package com.midrig.evaluator.domain;

import com.midrig.baff.app.entity.MappedBusinessEntity;
import static com.midrig.baff.app.json.JsonItem.addJsonElement;
import static com.midrig.baff.app.json.JsonItem.addJsonNull;
import com.midrig.baff.app.json.JsonObjectProcessor;
import com.midrig.baff.app.service.ValidationError;
import java.lang.reflect.Field;
import java.sql.Timestamp;
import java.util.HashMap;
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
import javax.persistence.Lob;
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
@Table(name = "eval_tpl_scorecard")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "ScorecardTpl.findAll", query = "SELECT s FROM ScorecardTpl s"),
    @NamedQuery(name = "ScorecardTpl.findByName", query = "SELECT s FROM ScorecardTpl s WHERE s.name = ?1")
    })
public class ScorecardTpl extends MappedBusinessEntity<Integer> {
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
    
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 200)
    @Column(name = "owning_username")
    private String owningUsername;
    
    @Basic(optional = true)
    @NotNull
    @Size(max = 100)
    @Column(name = "tags")
    private String tags;
    
    @Basic(optional = false)
    @NotNull
    @Column(name = "private")
    private Boolean isPrivate;
    
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "scorecardTpl")
    private List<CriteriaTpl> criteriaTplList;


    public ScorecardTpl() {
        
        
    }

    @Override
    public Integer getEntityId() {
     
        return getId();
    }
    
    @Override
    public void setEntityId(Integer id) {
     
        this.setId(id);
    }
    
    
    @Override
    public Timestamp getOwnVersion() {
        return getLastUpdated();
    };
    
    
    @Override
    public void addJson(JsonObjectBuilder builder) {
        
        addJsonElement(builder, "id", getId());
        addJsonElement(builder, "name", getName());
        addJsonElement(builder, "description", getDescription());
        addJsonElement(builder, "owningUsername", getOwningUsername());
        addJsonElement(builder, "tags", getTags());
        addJsonElement(builder, "isPrivate", getIsPrivate());
        addJsonElement(builder, "lastUpdated", getLastUpdated());
        
    } 
    
    @Override
     public void fromJson(JsonObjectProcessor jp) {
         
        // Do not allow existing keys and version fields to be kept 
        id = jp.getInteger("id", null);
        lastUpdated = jp.getTimestamp("lastUpdated", null);
        
        // Other fields that will only be overwritten if input not null       
        name = jp.getString("name", name);
        description = jp.getString("description", description);
        tags = jp.getString("tags", tags);
        owningUsername = jp.getString("owningUsername", owningUsername);
        isPrivate = jp.getBoolean("isPrivate", isPrivate);
        
    }
     
    @Override
    public String createWhereClause(HashMap<String, String> filters) {
          
        String whereClause = "";
        String addClause = "";
        
        // Strip out the owner
        if (filters != null && filters.isEmpty() == false) {
           
            String owner = filters.remove("owningUsername");
            String isPrivate = filters.get("isPrivate");

            whereClause = super.createWhereClause(filters);
            
            if (isPrivate == null && owner != null)
                addClause = " (e.isPrivate = false OR e.owningUsername = \'" + owner + "\')";
            else if (isPrivate == "true")
                addClause = " e.owningUsername = \'" + owner + "\'";
            
            if (addClause != "") {
                 if (whereClause == "")
                    whereClause += " WHERE" + addClause;
                else
                    whereClause += " AND" + addClause;
            }
            
        }
        
        return whereClause;
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

    public List<CriteriaTpl> getCriteriaTplList() {
        return criteriaTplList;
    }

    public String getOwningUsername() {
        return owningUsername;
    }

    public void setOwningUsername(String owningUsername) {
        this.owningUsername = owningUsername;
    }

    public Boolean getIsPrivate() {
        return isPrivate;
    }

    public void setIsPrivate(Boolean isPrivate) {
        this.isPrivate = isPrivate;
    }

    public void setCriteriaTplList(List<CriteriaTpl> criteriaTplList) {
        this.criteriaTplList = criteriaTplList;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    
}
