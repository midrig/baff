package com.midrig.baff.utility.refdata;

import com.midrig.baff.app.json.JsonObjectProcessor;
import com.midrig.baff.app.service.ServiceRequest;
import com.midrig.baff.app.service.ServiceRequestFactory;
import com.midrig.baff.app.service.ServiceResponse;
import com.midrig.baff.app.service.ServiceResponseException;
import com.midrig.baff.app.service.ServiceResponseFactory;
import com.midrig.baff.utility.locale.MessageHelper;
import java.util.HashMap;
import java.util.List;
import javax.json.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

/**
 * A RefDataCache stores reference data for efficient access by services.
 */
@Component("refDataCache")
public class RefDataCache {  
    
     final protected Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    protected RefDataService refDataService;
    
    @Autowired
    protected MessageHelper messageHelper;
    
    /**
     * Represents a reference data record
     */
    static public class RefDataRecord {
        
        public String key;
        public String code;
        public String decode;
        
        public RefDataRecord(String key, String code, String decode) {
             
            this.key = key;
            this.code = code;
            this.decode = decode;

        }       
    }
    
    public RefDataCache() {
        
    }
    
    /**
     * Get the code for a fully qualified reference key.
     * @param key The fully qualified reference data key
     * @return The code
     */
    public String getCode(String key) {
        
        String [] sep = key.split("\\.", -1);
        
        if (sep.length == 3) {
            String refDataClass = sep[0] + "." + sep[1];
            key = sep[2];
            return this.getCode(key, refDataClass);
        }
        else {
            logger.error("Invalid reference data class specified");
            return null;
        }
        
    }       
    
    /**
     * Get the code for a  reference data class and record key.
     * @param key The reference data key
     * @param refDataClass The reference data class
     * @return The code
     */
    public String getCode(String key, String refDataClass) {       
        
        HashMap<String, HashMap> maps = findRefData(refDataClass);       
        
        if (maps == null)
            return null;
        
        HashMap<String, String> codeMap = maps.get("codemap");
        
        key = refDataClass + "." + key;
        
        String code = codeMap.get(key);
        
        if (code != null) {
            return code;
        } else {
            logger.error("Reference data code not found");
            return null;
        }
        
    }
    
    /**
     * Get the decode for a given code and reference data class
     * @param code The code as a number
     * @param refDataClass The reference data class
     * @return  The decode
     */
    public String getDecode(Number code, String refDataClass) {
        
        String strCode = code.toString();
        
        return getDecode(strCode, refDataClass);
        
    }
    
    /**
     * Get the decode for a given code and reference data class
     * @param code The code as a string
     * @param refDataClass The reference data class
     * @return The decode
     */
    public String getDecode(String code, String refDataClass) {
        
        HashMap<String, HashMap> maps = findRefData(refDataClass);       
        
        if (maps == null)
            return null;
        
        HashMap<String, String> decodeMap = maps.get("decodemap");
        
        String decode = decodeMap.get(code);
        
        if (decode != null) {
            return decode;
        } else {
            logger.error("Reference data decode not found");
            return null;
        }
    }
    
    /**
     * Gets the reference data code and decode lists for the given class. 
     * @param refDataClass
     * @return 
     */
    @Cacheable("refdata")
    private HashMap<String, HashMap> findRefData(String refDataClass) {
      
        ServiceResponse<RefData> resp;
        
        HashMap<String, HashMap> maps = null;
        
        try { 
       
            ServiceRequest<String> req = ServiceRequestFactory.getFindRequest(refDataClass);        
            resp = refDataService.findRefDataClass(req); 
            
            List<JsonObject> list = resp.getData();
            
            HashMap<String, String> codeMap = new HashMap<>();
            HashMap<String, String> decodeMap = new HashMap<>();
            
            for(JsonObject obj: list) {
            
                JsonObjectProcessor jp = new JsonObjectProcessor(obj);
                
                String rdKey = jp.getString("key", "");
                String rdCode = jp.getString("code", "");
                String rdDecode = jp.getString("decode", "");
                
                codeMap.put(rdKey, rdCode);
                decodeMap.put(rdCode, rdDecode);
            
            }
            
            maps = new HashMap<>();
            
            maps.put("codemap", codeMap);
            maps.put("decodemap", decodeMap);
        
            
        } catch (Exception ex) {
            
            throw new ServiceResponseException(ServiceResponseFactory.getSystemFailResponse("REF_DATA_CACHE_RETRIEVE_FAIL", messageHelper.getMessage("exception.general", "BEX004")));   
            
        }               
        
        return maps;
        
    } 
    
    /**
     * Flushes the reference data cache.
     */
    @CacheEvict(value="refdata" , allEntries=true)
    public void flushCache() {}

   
}
