package com.midrig.evaluator.web;

import com.midrig.baff.app.controller.ServiceController;
import com.midrig.baff.app.json.JsonObjectProcessor;
import com.midrig.baff.app.service.ServiceRequest;
import com.midrig.baff.app.service.ServiceRequest.PageInfo;
import com.midrig.baff.app.service.ServiceRequestFactory;
import com.midrig.baff.app.service.ServiceResponse;
import com.midrig.baff.app.service.ServiceResponseException;
import com.midrig.baff.app.service.ServiceResponseFactory;
import com.midrig.evaluator.domain.Scorecard;
import com.midrig.evaluator.service.EvaluatorService;
import javax.json.JsonObject;
import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/scorecard")
public class ScorecardController extends ServiceController {

    @Autowired
    protected EvaluatorService evalService;
    
    @RequestMapping(value = "/find", method = RequestMethod.GET, produces = {"application/json"})
    @ResponseBody
    public String findScorecard(
            @RequestParam(value = "entityId", required = true) Integer entityId,
            HttpServletRequest request) {

        logger.trace("findScorecard");       
        ServiceResponse<Scorecard> resp;
        
        try {
        
            ServiceRequest<Integer> req = ServiceRequestFactory.getFindRequest(entityId);        
            resp = evalService.findScorecard(req);        
        
        } catch (ServiceResponseException valEx) {            
            resp = valEx.getResponse();
            
        } catch (Exception ex) {
            ex.printStackTrace();
            resp = ServiceResponseFactory.getSystemFailResponse("GENERAL_EXCEPTION", messageHelper.getMessage("exception.general", "EVAL009"));
            
        }               
         
        return resp.toString(); 
        
    }
    
    @RequestMapping(value = "/findAll", method = RequestMethod.GET, produces = {"application/json"})
    @ResponseBody
    public String findAllScorecards(
            @RequestParam(value = "limit", required = false) Integer limit,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "sort", required = false) String sort,
            @RequestParam(value = "start", required = false) Integer start,
            @RequestParam(value = "filter", required = false) String filter,  
            HttpServletRequest request) {

        logger.trace("findAllScorecards");
        ServiceResponse<Scorecard> resp; 
       
        try {
            
            PageInfo pageInfo = new PageInfo(limit, page, start, sort, filter);
            ServiceRequest<Integer> req = ServiceRequestFactory.getFindRequest(pageInfo);

            resp = evalService.findAllScorecards(req);

        } catch (ServiceResponseException valEx) {            
            resp = valEx.getResponse();
            
        } catch (Exception ex) {    
            ex.printStackTrace();
            resp = ServiceResponseFactory.getSystemFailResponse("GENERAL_EXCEPTION", messageHelper.getMessage("exception.general", "EVAL010"));
             
        }        
            
        return resp.toString();

    }

    @RequestMapping(value = "/save", method = RequestMethod.POST, produces = {"application/json"})
    @ResponseBody
    public String saveScorecard(
            @RequestParam(value = "entityId", required = true) Integer entityId,
            @RequestParam(value = "data", required = true) String jsonData,
            @RequestParam(value = "actionCode", required = false) String actionCode,
            @RequestParam(value = "scorecardTplId", required = false) Integer scorecardTplId, 
            HttpServletRequest request) {
        
        logger.trace("saveScorecard");       
        ServiceResponse<Scorecard> resp;
        
        try {
        
            JsonObjectProcessor jp = new JsonObjectProcessor(jsonData);
            JsonObject object = jp.getJsonObject();

            ServiceRequest<Integer> req = ServiceRequestFactory.getSaveRequest(entityId, object, actionCode);
            
            req.context.put("scorecardTplId", scorecardTplId);
            
            resp = evalService.saveScorecard(req);

        } catch (ServiceResponseException valEx) {          
            resp = valEx.getResponse();
            
        } catch (Exception ex) {
            ex.printStackTrace();
            resp = ServiceResponseFactory.getSystemFailResponse("GENERAL_EXCEPTION", messageHelper.getMessage("exception.general", "EVAL011"));
            
        }
        
        return resp.toString();

    }
    
    @RequestMapping(value = "/remove", method = RequestMethod.POST, produces = {"application/json"})
    @ResponseBody
    public String removeScorecard(
            @RequestParam(value = "entityId", required = true) Integer entityId,
            @RequestParam(value = "data", required = true) String jsonData,
            @RequestParam(value = "actionCode", required = false) String actionCode,
            HttpServletRequest request) {

        logger.trace("removeScorecard");        
        ServiceResponse<Scorecard> resp;
       
        try {
            
            JsonObjectProcessor jp = new JsonObjectProcessor(jsonData);
            JsonObject object = jp.getJsonObject();
            
            ServiceRequest<Integer> req = ServiceRequestFactory.getRemoveRequest(entityId, object, actionCode);

            resp = evalService.removeScorecard(req);

        } catch (ServiceResponseException valEx) {           
            resp = valEx.getResponse();
            
        } catch (Exception ex) {
            ex.printStackTrace();
            resp = ServiceResponseFactory.getSystemFailResponse("GENERAL_EXCEPTION", messageHelper.getMessage("exception.general", "EVAL012"));
            
        }
        
        return resp.toString();
    }
    

}
