
package com.midrig.baff.utility.refdata;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository; 
import org.springframework.stereotype.Repository;

/**
 * The data access object for reference data persistence.
 */
@Repository
public interface RefDataDao extends JpaRepository<RefData, Integer> {
   
    List<RefData> findRefDataClass(String rdDomain, String rdClass);
    
}
