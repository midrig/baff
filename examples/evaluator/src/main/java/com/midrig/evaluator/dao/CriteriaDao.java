

package com.midrig.evaluator.dao;

import com.midrig.evaluator.domain.Criteria; 
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository; 
import org.springframework.stereotype.Repository;

@Repository
public interface CriteriaDao extends JpaRepository<Criteria, Integer> {
    
    List<Criteria> findByName(Integer scorecardId, String name);
   
   
}
