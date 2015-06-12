package com.midrig.evaluator.web;

import com.midrig.baff.app.controller.ServiceController;
import com.midrig.baff.app.json.JsonObjectProcessor;
import com.midrig.baff.app.service.ServiceRequest;
import com.midrig.baff.app.service.ServiceRequest.PageInfo;
import com.midrig.baff.app.service.ServiceRequestFactory;
import com.midrig.baff.app.service.ServiceResponse;
import com.midrig.baff.app.service.ServiceResponseException;
import com.midrig.baff.app.service.ServiceResponseFactory;
import com.midrig.evaluator.domain.Option;
import com.midrig.evaluator.service.EvaluatorService;
import java.util.Map;
import java.util.Map.Entry;
import javax.json.Json;
import javax.json.JsonObject;
import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/option")
public class OptionController extends ServiceController {

    @Autowired
    protected EvaluatorService evalService;
    
    @RequestMapping(value = "/find", method = RequestMethod.GET, produces = {"application/json"})
    @ResponseBody
    public String findOption(
            @RequestParam(value = "entityId", required = true) Integer entityId,
            HttpServletRequest request) {

        logger.trace("findOption");       
        ServiceResponse<Option> resp;
        
        try {
        
            ServiceRequest<Integer> req = ServiceRequestFactory.getFindRequest(entityId);        
            resp = evalService.findOption(req);        
        
        } catch (ServiceResponseException valEx) {            
            resp = valEx.getResponse();
            
        } catch (Exception ex) {
            ex.printStackTrace();
            resp = ServiceResponseFactory.getSystemFailResponse("GENERAL_EXCEPTION", messageHelper.getMessage("exception.general", "EVAL013"));
            
        }               
            
        return resp.toString(); 
        
    }
    
    @RequestMapping(value = "/findAll", method = RequestMethod.GET, produces = {"application/json"})
    @ResponseBody
    public String findAllOptions(
            @RequestParam(value = "limit", required = false) Integer limit,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "sort", required = false) String sort,
            @RequestParam(value = "start", required = false) Integer start,
            @RequestParam(value = "filter", required = false) String filter,
            @RequestParam(value = "evaluatorId", required = false) Integer evaluatorId,
            HttpServletRequest request) {

        logger.trace("findAllOptions");
        ServiceResponse<Option> resp; 
        
        try {
          
            JsonObject data = Json.createObjectBuilder().add("evaluatorId", evaluatorId).build();
            
            PageInfo pageInfo = new PageInfo(limit, page, start, sort, filter);
            ServiceRequest<Integer> req = ServiceRequestFactory.getFindRequest(pageInfo, data);

            resp = evalService.findAllOptions(req);

        } catch (ServiceResponseException valEx) {            
            resp = valEx.getResponse();
            
        } catch (Exception ex) {    
            ex.printStackTrace();
            resp = ServiceResponseFactory.getSystemFailResponse("GENERAL_EXCEPTION", messageHelper.getMessage("exception.general", "EVAL014"));
             
        }        
            
        logger.debug(resp.toString());
        return resp.toString();

    }

    @RequestMapping(value = "/save", method = RequestMethod.POST, produces = {"application/json"})
    @ResponseBody
    public String saveOption(
            @RequestParam(value = "entityId", required = true) Integer entityId,
            @RequestParam(value = "data", required = true) String jsonData,
            @RequestParam(value = "actionCode", required = false) String actionCode,
            HttpServletRequest request) {
        
        logger.trace("saveOption");
        logger.debug(jsonData);
        ServiceResponse<Option> resp;
        
        try {
        
            JsonObjectProcessor jp = new JsonObjectProcessor(jsonData);
            JsonObject object = jp.getJsonObject();

            ServiceRequest<Integer> req = ServiceRequestFactory.getSaveRequest(entityId, object, actionCode);

            resp = evalService.saveOption(req);

        } catch (ServiceResponseException valEx) {          
            resp = valEx.getResponse();
            
        } catch (Exception ex) {
            ex.printStackTrace();
            resp = ServiceResponseFactory.getSystemFailResponse("GENERAL_EXCEPTION", messageHelper.getMessage("exception.general", "EVAL015"));
            
        }
        
        return resp.toString();

    }
    
    @RequestMapping(value = "/remove", method = RequestMethod.POST, produces = {"application/json"})
    @ResponseBody
    public String removeOption(
            @RequestParam(value = "entityId", required = true) Integer entityId,
            @RequestParam(value = "data", required = true) String jsonData,
            @RequestParam(value = "actionCode", required = false) String actionCode,
            HttpServletRequest request) {

        logger.trace("removeOption");        
        ServiceResponse<Option> resp;
       
        try {
            
            JsonObjectProcessor jp = new JsonObjectProcessor(jsonData);
            JsonObject object = jp.getJsonObject();
            ServiceRequest<Integer> req = ServiceRequestFactory.getRemoveRequest(entityId, object, actionCode);

            resp = evalService.removeOption(req);

        } catch (ServiceResponseException valEx) {           
            resp = valEx.getResponse();
            
        } catch (Exception ex) {
            ex.printStackTrace();
            resp = ServiceResponseFactory.getSystemFailResponse("GENERAL_EXCEPTION", messageHelper.getMessage("exception.general", "EVAL016"));
            
        }
        
        return resp.toString();
    }
    

}
