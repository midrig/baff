/** 
 * Interface Specification
 **/
public interface MyBusinessService {

    public ServiceResponse<MyEntity> findMyEntity(ServiceRequest<Integer> request);
    public ServiceResponse<MyEntity> findAllMyEntities(ServiceRequest<Integer> request);
    public ServiceResponse<MyEntity> saveMyEntity(ServiceRequest<Integer> request);
    public ServiceResponse<MyEntity> removeMyEntity(ServiceRequest<Integer> request);

}

/** 
 * Implementation 
 **/
@Transactional
@Service("myService")
public class MyBusinessServiceImpl extends BusinessService implements MyBusinesService {

    @Autowired
    protected MyEntityDao myEntityDao;
    
    @Resource 
    Validator validator;
    
    public MyBusinessServiceImpl() {
        super();       
    }

    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    @Override
    public ServiceResponse<MyEntity> findMyEntity(ServiceRequest<Integer> request) {
       
        return findEntity(myEntityDao, request);
    }
    
    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    @Override
    public ServiceResponse<MyEntity> findAllMyEntities(ServiceRequest<Integer> request) {
        
        return findPageOfEntities(request, new MyEntity());  
        
    }

    @Transactional(readOnly = false, propagation = Propagation.REQUIRED)
    @Override
    public ServiceResponse<MyEntity> saveMyEntity(ServiceRequest<Integer> request) {
   
        return saveEntity(myEntityDao, request, validator, new MyEntity());
        
    }

    @Transactional(readOnly = false, propagation = Propagation.REQUIRED)
    @Override    
    public ServiceResponse<MyEntity> removeMyEntity(ServiceRequest<Integer> request) {
        
        return removeEntity(myEntityDao, request);
 
    }
    
    @Override
    protected String validateFeasibility(ServiceRequest request, String action, MappedBusinessEntity revEntity, List<ValidationError> errors) {
   
        // Check which type of entity we are dealing with (if this service supports multiple entities)
        if (revEntity instanceof MyEntity) {
            
            MyEntity myEntity = (MyEntity)revEntity;
            
            // Check the action being performed
            if (action.equals(MappedBusinessEntity.REC_SAVE)) {
                
                // Check if the entity is unique
                List<MyEntity> list = myEntityDao.myUniqueQueryString(myEntity.getFoo(), myEntity.getBar());
                
                boolean isUnique = revEntity.isOnlyMe(list);
                
                if (!isUnique) {
                    ValidationError error = new ValidationError ("bar", "must be unqiue for given foo");
                    errors.add(error);
                }

            } else if (action.equals(MappedBusinessEntity.REC_REMOVE)) {
                
                // Confirm remove (the client needs to set the action code equal to the resultCode and re-try) 
                if (!"REMOVE_CONF".equals(request.getActionCode())) {
                    throw new ServiceResponseException(ServiceResponseFactory.getWarningFailResponse("REMOVE_CONF", "Are you sure"));       
                }
            }
            
        }
        
        return null;
        
    }

}