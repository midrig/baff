@Controller
@RequestMapping("/mydomain")
public class MyServiceController extends ServiceController {

    @Autowired
    protected MyService myService;
    
    @RequestMapping(value = "/myentity/find", method = RequestMethod.GET, produces = {"application/json"})
    @ResponseBody
    public String findMyEntity(
            @RequestParam(value = "entityId", required = true) Integer entityId,
            HttpServletRequest request) {
 
        ServiceResponse<MyEntity> resp;
        
        try {       
            ServiceRequest<Integer> req = ServiceRequestFactory.getFindRequest(entityId);        
            resp = myService.findMyEntity(req);        
        
        } catch (ServiceResponseException valEx) {            
            resp = valEx.getResult();
            
        } catch (Exception ex) {
            resp = ServiceResponseFactory.getSystemFailResponse("XXXX", "General exception: " + ex.getMessage());
            
        }               
            
        return resp.toString();
        
    } 
    
    @RequestMapping(value = "/myentity/findAll", method = RequestMethod.GET, produces = {"application/json"})
    @ResponseBody
    public String findAllMyEntities(
            @RequestParam(value = "limit", required = false) Integer limit,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "sort", required = false) String sort,
            @RequestParam(value = "start", required = false) Integer start,
            @RequestParam(value = "filter", required = false) String filter,  
            HttpServletRequest request) {

        ServiceResponse<MyEntity> resp;
        
        try {           
            PageInfo pageInfo = new PageInfo(limit, page, start, sort, filter);
            ServiceRequest<Integer> req = ServiceRequestFactory.getFindRequest(pageInfo);

            resp = myService.findAllMyEntities(req);

        } catch (ServiceResponseException valEx) {           
            resp = valEx.getResult();
            
        } catch (Exception ex) {
            resp = ServiceResponseFactory.getSystemFailResponse("XXXX", "General exception: " + ex.getMessage());
            
        }        
            
        return resp.toString();

    }

    @RequestMapping(value = "/myentity/save", method = RequestMethod.POST, produces = {"application/json"})
    @ResponseBody
    public String saveMyEntity(
            @RequestParam(value = "data", required = true) String jsonData,
            @RequestParam(value = "actionCode", required = false) String actionCode,
            HttpServletRequest request) {
                
        ServiceResponse<MyEntity> resp;
        
        try {       
            JsonObjectProcessor jp = new JsonObjectProcessor(jsonData);
            JsonObject jsonEntity = jp.getJsonObject();
            Integer myEntityId = jp.getInteger("myEntityId", null);

            ServiceRequest<Integer> req = ServiceRequestFactory.getSaveRequest(myEntityId, jsonEntity, actionCode);
            resp = myService.saveMyEntity(req);

        } catch (ServiceResponseException valEx) {           
            resp = valEx.getResult();
            
        } catch (Exception ex) {
            resp = ServiceResponseFactory.getSystemFailResponse("XXXX", "General exception: " + ex.getMessage());
            
        }
        
        return resp.toString();

    }
   
    @RequestMapping(value = "/myentity/remove", method = RequestMethod.POST, produces = {"application/json"})
    @ResponseBody
    public String removeMyEntity(
            @RequestParam(value = "data", required = true) String jsonData,
            @RequestParam(value = "actionCode", required = false) String actionCode,
            HttpServletRequest request) {

        ServiceResponse<MyEntity> resp;
       
        try {
            
            JsonObjectProcessor jp = new JsonObjectProcessor(jsonData);
            JsonObject jsonEntity = jp.getJsonObject();
            Integer myEntityId = jp.getInteger("myEntityId", null);
            ServiceRequest<Integer> req = ServiceRequestFactory.getRemoveRequest(myEntityId, jsonEntity, actionCode);

            resp = myService.removeMyEntity(req);

        } catch (ServiceResponseException valEx) {           
            resp = valEx.getResult();
            
        } catch (Exception ex) {
            resp = ServiceResponseFactory.getSystemFailResponse("XXXX", "General exception: " + ex.getMessage());
            
        }
        
        return resp.toString();
    }
    
}
