

package com.midrig.evaluator.dao;

import com.midrig.evaluator.domain.Scorecard; 
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository; 
import org.springframework.stereotype.Repository;

@Repository
public interface ScorecardDao extends JpaRepository<Scorecard, Integer> {
    
    List<Scorecard> findByNameInGroup(Integer evalGroupId, String name);
   
   
}
