package com.midrig.baff.utility.refdata;

import com.midrig.baff.app.service.ServiceRequest;
import com.midrig.baff.app.service.ServiceResponse;
import com.midrig.baff.app.service.ServiceResponseException;
import com.midrig.baff.app.service.ServiceResponseFactory;
import com.midrig.baff.utility.locale.MessageHelper;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
  
/**
 * A Reference Data Service implementation retrieves reference data from the database.
 */ 
@Transactional
@Service("refDataService")
public class RefDataServiceImpl implements RefDataService {

     final protected Logger logger = LoggerFactory.getLogger(this.getClass());
    
    @Autowired
    protected RefDataDao refDataDao;

    @Autowired
    protected MessageHelper messageHelper;
    
    public RefDataServiceImpl() {
        super();
        
    }

    /**
     * Retrieves a list of reference data records for a given reference data class.
     * @param request
     * @return 
     */
    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    @Override
    public ServiceResponse<RefData> findRefDataClass(ServiceRequest<String> request) {
        
        String refDataClass = (String)request.getEntityId();       
        String [] values = refDataClass.split("\\.", -1);

        if (values.length == 2) {
            List<RefData> refDataList = refDataDao.findRefDataClass(values[0], values[1]);
             return ServiceResponseFactory.getSuccessResponse(refDataList); 
        } else {
             throw new ServiceResponseException(ServiceResponseFactory.getSystemFailResponse("REF_DATA_CLASS_NOT_FOUND", messageHelper.getMessage("exception.general", "BEX004")));         
        }
         
    }
    
    
}