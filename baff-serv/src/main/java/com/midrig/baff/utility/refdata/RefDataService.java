package com.midrig.baff.utility.refdata;

import com.midrig.baff.app.service.ServiceRequest;
import com.midrig.baff.app.service.ServiceResponse;

/**
 * The interface for the Reference Data Service.
 */
public interface RefDataService {

    public ServiceResponse<RefData> findRefDataClass(ServiceRequest<String> request);
    
}