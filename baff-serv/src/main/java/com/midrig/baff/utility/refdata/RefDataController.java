package com.midrig.baff.utility.refdata;

import com.midrig.baff.app.controller.ServiceController;
import com.midrig.baff.app.service.ServiceRequest;
import com.midrig.baff.app.service.ServiceRequestFactory;
import com.midrig.baff.app.service.ServiceResponse;
import com.midrig.baff.app.service.ServiceResponseException;
import com.midrig.baff.app.service.ServiceResponseFactory;
import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * A RefDataController provides the service interface for clients to retrieve reference data.
 */
@Controller
@RequestMapping("/refdata")
public class RefDataController extends ServiceController { 

    @Autowired
    protected RefDataService refDataService;
    
    /**
     * Retrieves a list of reference data records for the given reference data class.
     * @param refDataClass The reference data class
     * @param request The http request
     * @return The JSON encoded response.
     */
    @RequestMapping(value = "/find", method = RequestMethod.GET, produces = {"application/json"})
    @ResponseBody
    public String findRefData(
            @RequestParam(value = "refdataclass", required = false) String refDataClass,
            HttpServletRequest request) {

        logger.trace("/refdata/find: {}", refDataClass);       
        ServiceResponse<RefData> resp;
        
        try { 
       
            ServiceRequest<String> req = ServiceRequestFactory.getFindRequest(refDataClass);        
            resp = refDataService.findRefDataClass(req);        
        
        } catch (ServiceResponseException valEx) {
            
            resp = valEx.getResponse();
            
        } catch (Exception ex) {
            
            resp = ServiceResponseFactory.getSystemFailResponse("SERVICE_EXCEPTION", messageHelper.getMessage("exception.general", "BEX002"));
            
        }               
        
        return resp.toString();
        
    } 

   
}
