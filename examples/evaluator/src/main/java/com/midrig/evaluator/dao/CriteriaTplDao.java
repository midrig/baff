

package com.midrig.evaluator.dao;

import com.midrig.evaluator.domain.CriteriaTpl;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository; 
import org.springframework.stereotype.Repository;

@Repository
public interface CriteriaTplDao extends JpaRepository<CriteriaTpl, Integer> {
    
    List<CriteriaTpl> findByName(Integer scorecardTplId, String name);
   
   
}
