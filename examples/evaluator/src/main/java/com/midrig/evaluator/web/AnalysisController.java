package com.midrig.evaluator.web;

import com.midrig.baff.app.controller.ServiceController;
import com.midrig.baff.app.service.ServiceRequest;
import com.midrig.baff.app.service.ServiceRequestFactory;
import com.midrig.baff.app.service.ServiceResponse;
import com.midrig.baff.app.service.ServiceResponseException;
import com.midrig.baff.app.service.ServiceResponseFactory;
import com.midrig.evaluator.domain.Analysis;
import com.midrig.evaluator.domain.ChartSeries;
import com.midrig.evaluator.service.EvaluatorService;
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
@RequestMapping("/analysis")
public class AnalysisController extends ServiceController {

    @Autowired
    protected EvaluatorService evalService;
    
    @RequestMapping(value = "/findAllAnalysis", method = RequestMethod.GET, produces = {"application/json"})
    @ResponseBody
    public String findAllAnalysis(
            @RequestParam(value = "scorecardId", required = true) Integer scorecardId,
            @RequestParam(value = "evaluatorId", required = true) Integer evaluatorId,
            HttpServletRequest request) {

        logger.trace("findAllAnalysis");
        ServiceResponse<Analysis> resp; 
        
        try {
           
            JsonObject data = Json.createObjectBuilder()
                    .add("scorecardId", scorecardId)
                    .add("evaluatorId", evaluatorId)
                    .build();
            
            ServiceRequest<Integer> req = ServiceRequestFactory.getOperationRequest(ServiceRequest.REQUEST_FIND, data);

            resp = evalService.findAllAnalysis(req);

        } catch (ServiceResponseException valEx) {            
            resp = valEx.getResponse();
            
        } catch (Exception ex) {    
            ex.printStackTrace();
            resp = ServiceResponseFactory.getSystemFailResponse("GENERAL_EXCEPTION", messageHelper.getMessage("exception.general", "EVAL020"));
             
        }        
       
        return resp.toString();

    }
    
    @RequestMapping(value = "/findChartSeries", method = RequestMethod.GET, produces = {"application/json"})
    @ResponseBody
    public String findChartSeries(
            @RequestParam(value = "scorecardId", required = true) Integer scorecardId,
            @RequestParam(value = "evaluatorId", required = true) Integer evaluatorId,
            HttpServletRequest request) {

        logger.trace("findChartSeries");
        ServiceResponse<ChartSeries> resp; 
        
        try {
            
            if (evaluatorId == null)
                evaluatorId = new Integer(-1);
            
            JsonObject data = Json.createObjectBuilder()
                    .add("scorecardId", scorecardId)
                    .add("evaluatorId", evaluatorId)
                    .build();
            
            ServiceRequest<Integer> req = ServiceRequestFactory.getOperationRequest(ServiceRequest.REQUEST_FIND, data);

            resp = evalService.findChartSeries(req);

        } catch (ServiceResponseException valEx) {            
            resp = valEx.getResponse();
            
        } catch (Exception ex) {    
            ex.printStackTrace();
            resp = ServiceResponseFactory.getSystemFailResponse("GENERAL_EXCEPTION", messageHelper.getMessage("exception.general", "EVAL021"));
             
        }        
            
        return resp.toString();

    }
    

}
