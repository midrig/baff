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
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
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
@Table(name = "eval_option")
@NamedQueries({
    @NamedQuery(name = "Option.findAll", query = "SELECT o FROM Option o"),
    @NamedQuery(name = "Option.findByName", query = "SELECT o FROM Option o WHERE o.scorecard.id = ?1 AND o.name = ?2"),
    @NamedQuery(name = "Option.findByScorecard", query = "SELECT o FROM Option o WHERE o.scorecard.id = ?1")
})
public class Option extends MappedBusinessEntity<Integer> {
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
    
    // Demonstrates setup for avoiding ORM during entity retrieval (assuming setmasteronload = false)
    @Basic(optional = false)
    @NotNull
    @Column(name = "scorecard_id")
    protected Integer scorecardId;
    
    // Need to make the master entity reference read-only as only one column reference allowed to update
    @JoinColumn(name = "scorecard_id", referencedColumnName = "id", insertable=false, updatable=false)
    @ManyToOne(optional = false)
    private Scorecard scorecard;  
    
    @OneToMany(cascade = CascadeType.REMOVE, mappedBy = "option")
    private List<Score> scoreList;
    
    @Transient
    private Integer score;
    
    @Transient
    private Integer relativeScore;
    
    @Transient
    private Integer weightedScore;
    
    @Transient
    private Integer relativeWeightedScore;
    
    @Transient
    private Integer balancedScore;
    
    @Transient
    private Integer relativeBalancedScore;
    
    
    public Option() {
        
        isMastered = true;
        //masterEntityIdMap = "scorecard.id";
        masterEntityIdMap = "scorecardId";
        
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
       
        return scorecard;
    };
     
    @Override
    public void setMaster(BusinessEntity entity) {
        scorecard = (Scorecard)entity;
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
        addJsonElement(builder, "lastUpdated", lastUpdated);
        
        addJsonElement(builder, "score", getScore());
        addJsonElement(builder, "relativeScore", getRelativeScore());
        addJsonElement(builder, "weightedScore", getWeightedScore());
        addJsonElement(builder, "relativeWeightedScore", getRelativeWeightedScore());
        addJsonElement(builder, "balancedScore", getBalancedScore());
        addJsonElement(builder, "relativeBalancedScore", getRelativeBalancedScore());
        
        addJsonElement(builder, "scorecard.id", getScorecardId());
        
        // Deal with nullable domain objects
        /*if (scorecard == null) {
            addJsonNull(builder, "scorecard.id");
        } else {
            addJsonElement(builder, "scorecard.id", scorecard.getId());
        }*/

    } 
    
    @Override
     public void fromJson(JsonObjectProcessor jp) {
         
        // Do not allow existing keys and version fields to be kept 
        id = jp.getInteger("id", null);
        lastUpdated = jp.getTimestamp("lastUpdated", null);
        
        // Other fields that will only be overwritten if input not null       
        name = jp.getString("name", name);
        description = jp.getString("description", description);
        
        setScorecardId(jp.getInteger("scorecard.id", null));
        
        //Integer scorecardId = jp.getInteger("scorecard.id", null);
        
        if (getScorecardId() == null) {
            scorecard = null;
        } else {
            scorecard = new Scorecard();
            scorecard.setId(getScorecardId());
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

    public Timestamp getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Timestamp lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
    
    public Scorecard getScorecard() {
        return scorecard;
    }
    
    public void setScorecard(Scorecard scorecard) {
        this.scorecard = scorecard;
    }

    public List<Score> getScoreList() {
        return scoreList;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getRelativeScore() {
        return relativeScore;
    }

    public void setRelativeScore(Integer relativeScore) {
        this.relativeScore = relativeScore;
    }

    public Integer getWeightedScore() {
        return weightedScore;
    }

    public void setWeightedScore(Integer weightedScore) {
        this.weightedScore = weightedScore;
    }

    public Integer getRelativeWeightedScore() {
        return relativeWeightedScore;
    }

    public void setRelativeWeightedScore(Integer relativeWeightedScore) {
        this.relativeWeightedScore = relativeWeightedScore;
    }

    public Integer getBalancedScore() {
        return balancedScore;
    }

    public void setBalancedScore(Integer balancedScore) {
        this.balancedScore = balancedScore;
    }

    public Integer getRelativeBalancedScore() {
        return relativeBalancedScore;
    }

    public void setRelativeBalancedScore(Integer relativeBalancedScore) {
        this.relativeBalancedScore = relativeBalancedScore;
    }

    public Integer getScorecardId() {
        return scorecardId;
    }

    public void setScorecardId(Integer scorecardId) {
        this.scorecardId = scorecardId;
    }


    
}
