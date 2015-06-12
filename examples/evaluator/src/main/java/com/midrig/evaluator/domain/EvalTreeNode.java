
package com.midrig.evaluator.domain;

import com.midrig.baff.app.entity.BusinessEntity;
import com.midrig.baff.app.entity.TreeNode;
import java.util.List;
import javax.json.JsonObjectBuilder;
import javax.persistence.Cacheable;

/**
 *
 * @author midrig
 */
public class EvalTreeNode<T extends BusinessEntity> extends TreeNode<T> {
    
    public EvalTreeNode(List<T> entityList, String nodeId, T newEntity, boolean canAddChild) {
        
        super(entityList, nodeId, true, newEntity, canAddChild);        
       
    }
         
    @Override
    protected boolean getLeafAndCustomFields(T entity, JsonObjectBuilder childBuilder) {
     
        boolean leaf = true;
        String name = "";
        String description = "";
        
        if (entity instanceof GroupForEval || entity instanceof EvalGroup) {
            
            EvalGroup evalGroup = null;
            
            if (entity instanceof GroupForEval)
                evalGroup = (((GroupForEval)entity).getEvalGroup());
            else
                evalGroup = (EvalGroup)entity;        

            if (evalGroup.getScorecardList() == null) {
                leaf = true;
                name = "Add a new group.....";
                description = "";
            } else {
                leaf = !canAddChild && evalGroup.getScorecardList().isEmpty(); 
                name = evalGroup.getName();
                description = evalGroup.getDescription();
            }

        } else if (entity instanceof Scorecard) {
           
            Scorecard scorecard = (Scorecard)entity; 
            
            if (scorecard.getOptionList() == null) {
                leaf = true;
                name = "Add a new scorecard.....";
                description = "";
            } else {
                leaf = !canAddChild && scorecard.getOptionList().isEmpty(); 
                name = scorecard.getName();
                description = scorecard.getDescription();
            }
        
        } else if (entity instanceof Option) {
            
            Option option = (Option)entity;        

            if (option.getScoreList() == null) {
                leaf = true;
                name = "Add a new option.....";
                description = "";
            } else {
                leaf = option.getScoreList().isEmpty(); 
                name = option.getName();
                description = option.getDescription();
            }
            
        } else if (entity instanceof Score) {
            
            Score score = (Score)entity;        

            leaf = true;
            name = score.getCriteria().getName();
            description = score.getCriteria().getDescription();
        
        }
        
        addJsonElement(childBuilder, "name", name);
        addJsonElement(childBuilder, "description", description);    
            
        return leaf;

    }
   
    
}
