

package com.midrig.evaluator.dao;

import com.midrig.evaluator.domain.Score;
import org.springframework.data.jpa.repository.JpaRepository; 
import org.springframework.stereotype.Repository;

@Repository
public interface ScoreDao extends JpaRepository<Score, Integer> {
    
    
}
