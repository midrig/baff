

package com.midrig.evaluator.dao;

import com.midrig.evaluator.domain.Evaluator; 
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository; 
import org.springframework.stereotype.Repository;

@Repository
public interface EvaluatorDao extends JpaRepository<Evaluator, Integer> {
    
    List<Evaluator> findByUsername(Integer evalGroupId, String username);
   
   
}
