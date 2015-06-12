

package com.midrig.evaluator.dao;

import com.midrig.evaluator.domain.GroupForEval; 
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository; 
import org.springframework.stereotype.Repository;

@Repository
public interface GroupForEvalDao extends JpaRepository<GroupForEval, Integer> {
    
    List<GroupForEval> findAllForEvaluator(String username);
    
   
}
