/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package com.midrig.evaluator.domain;

import com.midrig.baff.app.json.JsonItem;
import static com.midrig.baff.app.json.JsonItem.addJsonElement;
import java.util.ArrayList;
import java.util.List;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

/**
 *
 * @author midrig
 */
public class ChartSeries extends JsonItem {
    
    private String criteria;
    private List<String> options;
    private List<Integer> scores;
    
    public ChartSeries(String criteria) {
       
        this.criteria = criteria;
        options = new ArrayList<>();
        scores = new ArrayList<>();
        
    }
    
    @Override
    public JsonObject toJson() {
        
        JsonObjectBuilder builder = Json.createObjectBuilder();
        
        addJsonElement(builder, "criteria", this.criteria);
        
        for (int i=0; i<options.size(); i++) {
    
            addJsonElement(builder, options.get(i), scores.get(i));

        }
        
        return builder.build();

    }
    
    public void addOptionScore(String option, Integer score) {
        
        options.add(option);
        scores.add(score);
        
    }
    
}
