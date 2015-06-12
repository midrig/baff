

package com.midrig.evaluator.dao;

import com.midrig.evaluator.domain.EvalGroup; 
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository; 
import org.springframework.stereotype.Repository;

@Repository
public interface EvalGroupDao extends JpaRepository<EvalGroup, Integer> {
    
    List<EvalGroup> findByName(String name);
    
   
}
