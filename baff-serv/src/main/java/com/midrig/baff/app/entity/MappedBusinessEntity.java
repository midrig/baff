package com.midrig.baff.app.entity;

import com.midrig.baff.utility.locale.MessageHelper;
import java.io.Serializable;
import javax.persistence.MappedSuperclass;
import javax.persistence.PostLoad;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * MappedBusinessEntity is a lightweight extension to the superclass in order to apply
 * Entity annotations.
 * All business entities should inherit from this class, although refer to {@link BusinessEntity} for
 * implementation details.
 * 
 * @param <ID> the type of the entity identifier
 */

@MappedSuperclass
public abstract class MappedBusinessEntity<ID extends Serializable> extends BusinessEntity<ID> {
    
    
    /**
     * Sets the master and version following load from the database.
     */
    @PostLoad
    public void PostDBOperation(){
        
        setMasterAndVersion(isMasterSetOnLoad);
        
    }
    
    /**
     * Sets the master and version.
     */
    public void setMasterAndVersion() {
        
        setMasterAndVersion(true);

    }
    
    /**
     * Sets the master and version.
     * @param setMaster a flag to indicate if the master should be set.
     */
    public void setMasterAndVersion(boolean setMaster) {
        
        masterEntityId = null;
        versionControl = null;
        currencyControl = null;
        
        if (isMastered) {
            
            if (setMaster) {
                
               // This will set the master entity id
                getMasterEntityId();
            
                // This will set the version control properties
                if (isVersionControlled) {
                    getVersion();
                }
            } 
            
        } else {
            
            // This wil set the master entity id (equal to this entity id)
            getMasterEntityId();
            
            if (isVersionControlled)
                versionControl = getOwnVersion();
        }
        
        if (isCurrencyControlled)
                resetCurrency();

       
    }
    
    
}
