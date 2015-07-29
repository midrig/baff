/**
 * Loads entity configuration from "baff.properties" file, which should be located in classpath. 
 **/

package com.midrig.baff.app.entity;

import java.io.IOException;
import java.util.Properties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class EntityConfig {
    
    final protected Logger logger = LoggerFactory.getLogger(this.getClass());
    
    private boolean versionControl;   
    private boolean currencyControl;   
    private boolean setMasterOnLoad;
    private boolean autoRefresh;
    
    public boolean isVersionControl() {
        return this.versionControl;
    }
    
    public boolean isCurrencyControl() {
        return this.currencyControl;
    }
    
    public boolean isSetMasterOnLoad() {
        return this.setMasterOnLoad;
    }
    
    public boolean isAutoRefreshed() {
        return this.autoRefresh;
    }
    
    
    public EntityConfig() {
        
        // Defaults
        versionControl = true;
        currencyControl = true;
        setMasterOnLoad = true;
        autoRefresh = true;
        
        Properties prop = new Properties();

        try {

                prop.load(getClass().getClassLoader().getResourceAsStream("baff.properties"));
                
                if (prop != null) {
  
                    String property = prop.getProperty("entity.versioncontrol");
                    
                    if (property != null)
                        versionControl = Boolean.parseBoolean(property);
                    
                    property = prop.getProperty("entity.currencycontrol");
                    
                    if (property != null)
                        currencyControl = Boolean.parseBoolean(property);
                    
                    property = prop.getProperty("entity.setmasteronload");
                    
                    if (property != null)
                        setMasterOnLoad = Boolean.parseBoolean(property);
                    
                    property = prop.getProperty("entity.autoRefresh");
                    
                    if (property != null)                    
                        autoRefresh = Boolean.parseBoolean(property);
                    
                
                } else {
                     logger.info("Could not load entity config from baff.properties");
                }
                    
                logger.info("Default entity version control =  "  + this.isVersionControl());
                logger.info("Default entity currence control = " + this.isCurrencyControl());
                logger.info("Default entity set master on load = "  + this.isSetMasterOnLoad());
                logger.info("Default entity auto refresh = "  + this.isAutoRefreshed());
                

        } catch (IOException ex) {
                ex.printStackTrace();
        } 
        
        
    }
    
    
}
