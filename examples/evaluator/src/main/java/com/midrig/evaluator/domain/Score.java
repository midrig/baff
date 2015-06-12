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
import java.util.Date;
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
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;
import javax.persistence.Version;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 *
 * @author midrig
 */
@Entity
@Table(name = "eval_score")
@NamedQueries({
    @NamedQuery(name = "Score.findAll", query = "SELECT s FROM Score s")
})
public class Score extends MappedBusinessEntity<Integer> implements Comparable<Score> {
    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;
    
    @Lob
    @Size(max = 65535)
    @Column(name = "notes")
    private String notes;
    
    @Basic(optional = false)
    @NotNull
    @Column(name = "score")
    private Integer score;
    
    @Version
    @Column(name = "last_updated")
    private Timestamp lastUpdated;
    
    @JoinColumn(name = "criteria_id", referencedColumnName = "id")
    @ManyToOne(optional = false)
    private Criteria criteria;  
    
    @JoinColumn(name = "option_id", referencedColumnName = "id")
    @ManyToOne(optional = false)
    private Option option;  
    
    @JoinColumn(name = "evaluator_id", referencedColumnName = "id")
    @ManyToOne(optional = false)
    private Evaluator evaluator;  
    
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
    
    
    public Score() {
        
      
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
        
        addJsonElement(builder, "id", id);
        addJsonElement(builder, "notes", notes);
        addJsonElement(builder, "score", score);        
        addJsonElement(builder, "lastUpdated", lastUpdated);
        
        addJsonElement(builder, "relativeScore", relativeScore);
        addJsonElement(builder, "weightedScore", weightedScore);
        addJsonElement(builder, "relativeWeightedScore", relativeWeightedScore);
        addJsonElement(builder, "balancedScore", balancedScore);
        addJsonElement(builder, "relativeBalancedScore", relativeBalancedScore);
        
        // Deal with nullable domain objects
        if (getCriteria() == null) {
            addJsonNull(builder, "criteria.id");
        } else {
            addJsonElement(builder, "criteria.id", getCriteria().getId());
            addJsonElement(builder, "criteria.name", getCriteria().getName());
        }
        
        if (getOption() == null) {
            addJsonNull(builder, "option.id");
        } else {
            addJsonElement(builder, "option.id", getOption().getId());
            addJsonElement(builder, "option.name", getOption().getName());
        }
        
        if (getEvaluator() == null) {
            addJsonNull(builder, "evaluator.id");
        } else {
            addJsonElement(builder, "evaluator.id", getEvaluator().getId());
            addJsonElement(builder, "evaluator.username", getEvaluator().getUsername());        
        }

    } 
    
    @Override
     public void fromJson(JsonObjectProcessor jp) {
         
        // Do not allow existing keys and version fields to be kept 
        setId(jp.getInteger("id", null));
        setLastUpdated(jp.getTimestamp("lastUpdated", null));
        
        // Other fields that will only be overwritten if input not null       
        setNotes(jp.getString("notes", getNotes()));
        setScore(jp.getInteger("score", getScore()));
        
        Integer criteriaId = jp.getInteger("criteria.id", null);
        
        if (criteriaId == null) {
            setCriteria(null);
        } else {
            setCriteria(new Criteria());
            getCriteria().setId(criteriaId);
        }   
        
        Integer optionId = jp.getInteger("option.id", null);
        
        if (optionId == null) {
            setOption(null);
        } else {
            setOption(new Option());
            getOption().setId(optionId);
        }     
        
        Integer evaluatorId = jp.getInteger("evaluator.id", null);
        
        if (evaluatorId == null) {
            setEvaluator(null);
        } else {
            setEvaluator(new Evaluator());
            getEvaluator().setId(evaluatorId);
        }     
        
    }
     
    @Override
    public ValidationError doIntegrityValidation(String action, List<ValidationError> errors) {
          
        return null;
    }
    
    @Override
    public int compareTo(Score other) {
        
        int comparison = this.criteria.getName().compareTo(other.criteria.getName());
        
        if (comparison == 0)
            comparison = this.option.getName().compareTo(other.option.getName());
        
        return comparison;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Timestamp getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Timestamp lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
    

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Criteria getCriteria() {
        return criteria;
    }

    public void setCriteria(Criteria criteria) {
        this.criteria = criteria;
    }

    public Option getOption() {
        return option;
    }

    public void setOption(Option option) {
        this.option = option;
    }

    public Evaluator getEvaluator() {
        return evaluator;
    }

    public void setEvaluator(Evaluator evaluator) {
        this.evaluator = evaluator;
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


    
}
