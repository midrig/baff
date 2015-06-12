

package com.midrig.evaluator.dao;

import com.midrig.evaluator.domain.ScorecardTpl; 
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository; 
import org.springframework.stereotype.Repository;

@Repository
public interface ScorecardTplDao extends JpaRepository<ScorecardTpl, Integer> {
    
    List<ScorecardTpl> findByName(String name);
   
   
}
