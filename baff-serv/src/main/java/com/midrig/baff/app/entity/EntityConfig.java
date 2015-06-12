/**
 * Loads entity configuration from "baff.properties" file, which should be located in classpath. 
 **/

package com.midrig.baff.app.entity;

import java.io.IOException;
import java.util.Properties;

public class EntityConfig {
    
    private boolean versionControl;   
    private boolean currencyControl;   
    private boolean setMasterOnLoad;

    public boolean isVersionControl() {
        return this.versionControl;
    }
    
    public boolean isCurrencyControl() {
        return this.currencyControl;
    }
    
    public boolean isSetMasterOnLoad() {
        return this.setMasterOnLoad;
    }
    
    public EntityConfig() {
        
        // Defaults
        versionControl = true;
        currencyControl = false;
        setMasterOnLoad = true;
        
        Properties prop = new Properties();

        try {

                prop.load(getClass().getClassLoader().getResourceAsStream("baff.properties"));
                
                if (prop != null) {
                 
                    versionControl = Boolean.parseBoolean(prop.getProperty("entity.versioncontrol"));
                    currencyControl = Boolean.parseBoolean(prop.getProperty("entity.currencycontrol"));
                    setMasterOnLoad = Boolean.parseBoolean(prop.getProperty("entity.setmasteronload"));
                
                    System.out.println("Loaded entity config");
                    
                } else {
                     System.out.println("Could not load entity config from baff.properties");
                }
                    
                System.out.println("vc= "  + this.isVersionControl());
                System.out.println("cc= "  + this.isCurrencyControl());
                System.out.println("smol= "  + this.isSetMasterOnLoad());
                
                
                

        } catch (IOException ex) {
                ex.printStackTrace();
        } 
        
        
    }
    
    
}
