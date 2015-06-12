

package com.midrig.evaluator.dao;

import com.midrig.evaluator.domain.Option;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository; 
import org.springframework.stereotype.Repository;

@Repository
public interface OptionDao extends JpaRepository<Option, Integer> {
    
    List<Option> findByName(Integer scorecardId, String name);
    List<Option> findByScorecard(Integer scorecardId);
   
   
}
