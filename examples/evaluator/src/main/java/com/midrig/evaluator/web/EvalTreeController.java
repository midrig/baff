package com.midrig.evaluator.web;

import com.midrig.baff.app.controller.ServiceController;
import com.midrig.baff.app.service.ServiceRequest;
import com.midrig.baff.app.service.ServiceRequestFactory;
import com.midrig.baff.app.service.ServiceResponse;
import com.midrig.baff.app.service.ServiceResponseException;
import com.midrig.baff.app.service.ServiceResponseFactory;
import com.midrig.evaluator.domain.EvalTreeNode;
import com.midrig.evaluator.service.EvaluatorService;
import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/evaltree")
public class EvalTreeController extends ServiceController {

    @Autowired
    protected EvaluatorService evalService;
    
    @RequestMapping(value = "/findNode", method = RequestMethod.GET, produces = {"application/json"})
    @ResponseBody
    public String findNode(
            @RequestParam(value = "node", required = true) String node,
            @RequestParam(value = "username", required = true) String username,
            HttpServletRequest request) {

        logger.trace("findNode: " + node);
        ServiceResponse<EvalTreeNode> resp; 
        
        try {
        
            ServiceRequest<String> req = ServiceRequestFactory.getFindRequest(node);

            resp = evalService.findEvalTreeNode(req, username);

        } catch (ServiceResponseException valEx) {            
            resp = valEx.getResponse();
            
        } catch (Exception ex) {
            ex.printStackTrace();
            resp = ServiceResponseFactory.getSystemFailResponse("GENERAL_EXCEPTION", messageHelper.getMessage("exception.general", "EVAL009"));
            
        }               
        
        logger.debug(resp.toString());
        return(resp.toString());
              
    }

}
