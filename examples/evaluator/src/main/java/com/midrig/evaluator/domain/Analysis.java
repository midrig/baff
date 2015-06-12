/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package com.midrig.evaluator.domain;

import com.midrig.baff.app.json.JsonItem;
import static com.midrig.baff.app.json.JsonItem.addJsonElement;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

/**
 *
 * @author midrig
 */
public class Analysis extends JsonItem {
    
    private String category;
    private String winner;
    private Integer score;
    private String runnerup;
    private Integer margin;
    
    private Boolean  isNoOutrightWinner;
    
    private String tmpWinner;
    private Integer tmpScore;
    
    
    public Analysis(String category) {
       
        this.category = category;
        winner = "";
        score = 0;
        runnerup = "";
        margin = 0;
        isNoOutrightWinner = false;
        
    }
    
    @Override
    public JsonObject toJson() {
        
        JsonObjectBuilder builder = Json.createObjectBuilder();
        
        addJsonElement(builder, "category", getCategory());
        addJsonElement(builder, "winner", getWinner());
        addJsonElement(builder, "score", getScore());     
        addJsonElement(builder, "runnerup", getRunnerup());
        addJsonElement(builder, "margin", getMargin());
        addJsonElement(builder, "isNoOutrightWinner", getIsNoOutrightWinner());
        
        return builder.build();

    }
    
    public void setIfWinner(String name, Integer score) {
        
         if (score > this.score) {
             
             if (this.isNoOutrightWinner) {
                 
                 this.runnerup = "No Outright Runner Up";
                 this.isNoOutrightWinner = false;
                 
             } else {
                 
                this.runnerup = this.winner;
 
             }
             
            this.margin = score - this.score;
            this.winner = name;
            this.score = score;           
            
        } else if (score == this.score) {
            
            this.isNoOutrightWinner = true;
        
            this.runnerup = "";
            this.margin = 0;
            this.winner = "No Outright Winner";
            this.score = score;
        
        } else if (score > (this.score - this.margin)) {
            
            this.runnerup = name;
            this.margin = this.score - score;
        
        } else if (score == (this.score - this.margin)) {
            
            if (!this.runnerup.equals(""))
                this.runnerup = "No Outright Runner Up";
            else            
                this.runnerup = name;
            
            this.margin = this.score - score;
        
        } 
        
        
        
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getWinner() {
        return winner;
    }

    public void setWinner(String winner) {
        this.winner = winner;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public String getRunnerup() {
        return runnerup;
    }

    public void setRunnerup(String runnerup) {
        this.runnerup = runnerup;
    }

    public Integer getMargin() {
        return margin;
    }

    public void setMargin(Integer margin) {
        this.margin = margin;
    }

    public Boolean getIsNoOutrightWinner() {
        return isNoOutrightWinner;
    }

    public void setIsNoOutrightWinner(Boolean isNoOutrightWinner) {
        this.isNoOutrightWinner = isNoOutrightWinner;
    }
    
    
}
