package com.midrig.baff.app.service;

import com.midrig.baff.app.entity.MappedBusinessEntity;
import com.midrig.baff.app.entity.BusinessEntity;
import com.midrig.baff.app.service.ServiceRequest.PageInfo;
import com.midrig.baff.utility.locale.MessageHelper;
import com.midrig.baff.utility.refdata.RefDataCache;
import com.midrig.baff.utility.usersecurity.UserSecurityHelper;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Set;
import javax.json.JsonObject;
import javax.persistence.EntityManager;
import javax.persistence.LockModeType;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import javax.validation.ConstraintViolation;
import javax.validation.Validator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.orm.jpa.JpaOptimisticLockingFailureException;

/**
 * A BusinessService encapsulates operations on business entities that are performed as
 * part of completing an overall business activity.
 * All business services should inherit from this class directly. 
 * <p>
 * A typical implementation is described 
 * <a href="../../../../../../examples/MyBusinessService.html" target="_blank">here</a>
 * <p>
 * Business Service operations are stateless methods involved by a controller as part of discrete 
 * business activity, such as maintaining a business data entity, where an activity represents a logical 
 * unit of work involving CRUD operations upon upon a particular {@link BusinessEntity} using its
 * associated data access object.
 * <p>
 * The BusinessService superclass supports the following key features:
 * <ul>
 * <li>Processing for standard entity CRUD operations   
 * <li>Support for version control utilising an optimistic locking strategy 
 * <li>Support for business entity integrity and general feasibility validation
 */  
public abstract class BusinessService {
    
    /**
     * The logger.
     */
    final protected Logger logger = LoggerFactory.getLogger(this.getClass());
     
    /**
     * The injected entity manager.
     */
    @PersistenceContext
    protected EntityManager em;
    
    /**
     * The injected reference data cache
     */
    @Autowired
    protected RefDataCache refDataCache;
    
    @Autowired 
    protected MessageHelper messageHelper;
    
    @Autowired 
    protected UserSecurityHelper userSecurityHelper;
    
    /**
     * Override to process a list of retrieved entities found via {@link #findPageOfEntities}.
     * 
     * @param <T> the type of the associated entity.
     * @param <ID> the entity indentifier type
     * @param request the service request
     * @param entity a copy of a new entity for testing the type.
     * @param entities the list of entities retrieved
     * @param totalCount the total count of entities
     * @return the service response
     * 
     */     
    protected <T extends MappedBusinessEntity, ID extends Serializable> ServiceResponse<T> processRetrievedEntities(ServiceRequest<ID> request, T entity, List<T> entities, Long totalCount) {
        logger.trace("processRetrievedEntities");
        
        return ServiceResponseFactory.getSuccessResponse(entities, totalCount);
    }
    
    /**
     * Performs feasibility validation.
     * Override if validation is required.
     * <p>
     * Returning a message will result in a single message being returned, ignoring the list of errors.  
     * Otherwise an error can be added as follows:
     * <pre>{@literal
     * ValidationError error = new ValidationError("field", "message");
     * errors.add(error);}
     * </pre>
     * 
     * @param request the input service request.
     * @param action the type of action, {@link #REC_SAVE} or {@link #REC_REMOVE}.
     * @param revEntity the revised entity.
     * @param errors the list of validation errors.
     * @return the error message or null.
     */
    protected ValidationError validateFeasibility(ServiceRequest request, String action, MappedBusinessEntity revEntity, List<ValidationError> errors) {
   
        return null;
        
    }
    
    /**
     * Performs business operations post validation and prior to completing any database transaction.
     * Override if required.
     * 
     * @param request the input service request.
     * @param action the type of action, {@link #REC_SAVE} or {@link #REC_REMOVE}.
     * @param revEntity the revised entity.
     * @return a message or null.
     */ 
    protected String doBusinessOperations(ServiceRequest request, String action, MappedBusinessEntity revEntity) {
       
        return null;
        
     }
    
    /**
     * Retrieves a single entity from the database based on its identifier.
     * 
     * @param <T> the type of the associated entity.
     * @param <ID> the type of the associated entity's identifier.
     * @param entityDao the associated entity's data access object.
     * @param request the input service request.
     * @return a response containing the entity or a null entity if not found
     */     
    public <T extends MappedBusinessEntity, ID extends Serializable> ServiceResponse<T> findEntity(JpaRepository<T, ID> entityDao, ServiceRequest<ID> request) {     
        logger.trace("findEntity");
        
        T entity = entityDao.findOne(request.getEntityId());      
        return ServiceResponseFactory.getSuccessResponse(entity);
    
     }
   
    /**
     * Retrieves a all entities of a given type from the database.
     * 
     * @param <T> the type of the associated entity.
     * @param <ID> the type of the associated entity's identifier.
     * @param entityDao the associated entity's data access object.
     * @param request the input service request.
     * @return a response containing the list of entities found.
     */     
    protected <T extends MappedBusinessEntity, ID extends Serializable> ServiceResponse<T> findAllEntities(JpaRepository<T, ID> entityDao, ServiceRequest<ID> request) {        
        logger.trace("findAllEntities");

        List<T> list = entityDao.findAll();    
        
        return ServiceResponseFactory.getSuccessResponse(list);

    }
    
    /**
     * Retrieves a subset of entities from the database based on query criteria and paging information.
     * Obtains paging information, including filter and sort criteria, from {@link ServiceRequest#getPageInfo}.
     * Obtains the query strings from {@link BusinessEntity#createFindQueryString}.
     * 
     * @param <T> the type of the associated entity.
     * @param <ID> the type of the associated entity's identifier.
     * @param request the input service request.
     * @param newEntity a new instance of the associated entity.
     * @return a response containing the list of entities found.
     */     
    protected <T extends MappedBusinessEntity, ID extends Serializable> ServiceResponse<T> findPageOfEntities(ServiceRequest<ID> request, T newEntity) {        
        logger.trace("findPageOfEntities");
        
        Class entityClass = newEntity.getClass();
        PageInfo pageInfo = request.getPageInfo();
        
        // Get the query strings for the entity
        HashMap<String, String> queryStrings = newEntity.createQueryStrings(pageInfo.sorters, pageInfo.filters);
        
        String findQueryString = queryStrings.get("FIND");
        String countQueryString = queryStrings.get("COUNT");
        
        // Create and execute the queries
        Query countQuery = em.createQuery(countQueryString); 
        long count = (long)countQuery.getSingleResult();
        
        logger.debug("findPageOfEntities count= {}", count);
                
        TypedQuery<T> findQuery = em.createQuery(findQueryString, entityClass);
        
        logger.debug("findPageOfEntities start= {}, limit= {}", pageInfo.start, pageInfo.limit);
        
        findQuery.setFirstResult(pageInfo.start);
        findQuery.setMaxResults(pageInfo.limit); 
                    
        List<T> entities = findQuery.getResultList();
        
        // Allow the subclass to process the list
        return processRetrievedEntities(request, newEntity, entities, count);

    }
    
     /**
     * Saves a new or updated entity to the database.
     * Performs the following actions:
     * <ul>
     * <li>Prepares the entity for saving via {@link #prepareForSave}.  
     * <li>Verifies the entity version via {@link #verifyCurrentVersion}. 
     * <li>Performs validation via {@link #validateSave}.
     * <li>Performs business operations via {@link #doBusinessOperations}.
     * <li>Executes the save via {@link #executeSave}.
     * </ul>
     * @param <T> the type of the associated entity.
     * @param <ID> the type of the associated entity's identifier.
     * @param entityDao the associated entity's data access object.
     * @param request the input service request.
     * @param validator the associated entity's validator.
     * @param newEntity a new instance of the associated entity.
     * @return a response containing the persisted entity and its master.
     */     
    protected <T extends MappedBusinessEntity, ID extends Serializable> ServiceResponse<T> saveEntity(JpaRepository<T, ID> entityDao, ServiceRequest<ID> request, Validator validator, T newEntity) {       
        logger.trace("saveEntity");
        
        // Setup the entity to be saved
        T revEntity = prepareForSave(entityDao, request, newEntity);
        
        // Check the entity version
        verifyCurrentVersion(revEntity);
             
        // Do  validation (throws exceptions)
        validateSave(request, validator, revEntity);
        
        // Save the new entity
        T storedEntity = executeSave(entityDao, revEntity);
        
        // Do further business operations
        String message = doBusinessOperations(request, MappedBusinessEntity.REC_SAVE, storedEntity);
             
        // Store the updated entity
        return ServiceResponseFactory.getSuccessResponse(storedEntity, storedEntity.getMasterEntity(), message);

    }
    
    /**
     * Prepares an entity for the save operation.
     * Retrieves the existing entity from the database (if updating).  The process for setting up the revised entity
     * is as follows:
     *    1. Create a new entity
     *    2. Copy the contents of any existing entity into the new entity
     *    3. Copy the request data into the entity; the entity should typically be setup to overwrite all key or
     *        mandatory fields, but only overwrite optional fields if the provided data is not null
     *    4. If this is a new entity then retrieve the master and set it for a dummy "existing" entity
     * 
     * @param <T> the type of the associated entity.
     * @param <ID> the type of the associated entity's identifier.
     * @param entityDao the associated entity's data access object.
     * @param request the input service request.
     * @param revEntity a new entity instance that will hold the revised version.
     * @return a response containing the persisted entity and its master.
     */     
    protected <T extends MappedBusinessEntity, ID extends Serializable> T prepareForSave(JpaRepository<T, ID> entityDao, ServiceRequest<ID> request, T revEntity) {       
        logger.trace("prepareForSave");
        
        ID idEntity = request.getEntityId();
        JsonObject jsonEntity = request.getData(); 
        HashMap <String, byte[]> blobs = request.getBlobs();
        
        T curEntity;
        
        try {
        
            // Check if it's a new entity
            if (idEntity != null) {

                logger.debug("prepareForSave: updating existing entity");    

                // Get the existing entity
                curEntity = entityDao.findOne(idEntity);

                if (curEntity == null) {
                    // If it's been removed, assume an update has taken place
                    throw new ServiceResponseException(ServiceResponseFactory.getOpLockFailResponse());
                }
                
                // Ensure the revised entity reflects the current entity before copying in new values        
                revEntity.setBaseline();
                revEntity.copyFrom(curEntity);
                revEntity.setFromJson(jsonEntity);
                revEntity.setBlobs(blobs);

            } else {

                logger.debug("prepareForSave: adding new entity");    

                revEntity.setFromJson(jsonEntity);
                revEntity.setBlobs(blobs);

                if (revEntity.isMastered()) { 

                    // If mastered we still need to get the master in order to support version control
                    // The reference master must be created and populated with the id           
                    curEntity = (T) revEntity.getNewInstance();
                    BusinessEntity master = getEntity(revEntity.getMaster());
                    curEntity.setMaster(master);
                    revEntity.setReferenceEntity(curEntity);
                }
            }
        
         } catch (JpaOptimisticLockingFailureException|NoResultException ex) {
           
            // Optimisitic lock exception
            throw new ServiceResponseException(ServiceResponseFactory.getOpLockFailResponse());
            
        }
        
        return revEntity;
        
    }
    
    /**
     * Executes the save operation.
     * Persists the entity to the database, retrieves the saved copy and sets the master and version.
     * 
     * @param <T> the type of the associated entity.
     * @param <ID> the type of the associated entity's identifier.
     * @param entityDao the associated entity's data access object.
     * @param revEntity a new entity instance that will hold the revised version.
     * @return a response containing the persisted entity and its master.
     */     
    protected <T extends MappedBusinessEntity, ID extends Serializable> T executeSave(JpaRepository<T, ID> entityDao, T revEntity) {       
        logger.trace("executeSave");
        
        T storedEntity;
        
        try {
    
            // Always flush to ensure subsequent reads are correct
            storedEntity = entityDao.saveAndFlush(revEntity);
            em.flush();
    
            // Refresh the entity from the database to ensure it's current as the entity saved
            // and returned from the save is just a reference (so any domain object related fields
            // will not reflect the actual stored state. 
            // This updates the version control settings
            // This also removes the reference entity, which is no longer relevant
            if (storedEntity.isIsAutoRefreshed())
                em.refresh(storedEntity);
            
            
            // Ensure the version and master are populated
            storedEntity.setMasterAndVersion();
            
            
        } catch (JpaOptimisticLockingFailureException ex) {
           
            // Optimisitic lock exception
            logger.debug("Optimistic lock failure on save");
            throw new ServiceResponseException(ServiceResponseFactory.getOpLockFailResponse());
            
        } 
 
        // Get master will return a reference to self when record is it's own master    
        return storedEntity;
        
    }
    
    /**
     * Removes an entity from the database.
     * Performs the following actions:
     * <ul>
     * <li>Prepares the entity for removal via {@link #prepareForRemove}.  
     * <li>Verifies the entity version via {@link #verifyCurrentVersion}. 
     * <li>Performs validation via {@link #validateRemove}.
     * <li>Performs business operations via {@link #doBusinessOperations}.
     * <li>Executes the removal via {@link #executeRemove}.
     * </ul>
     * @param <T> the type of the associated entity.
     * @param <ID> the type of the associated entity's identifier.
     * @param entityDao the associated entity's data access object.
     * @param request the input service request.
     * @return a response containing the persisted entity and its master.
     */     
    protected <T extends MappedBusinessEntity, ID extends Serializable> ServiceResponse<T> removeEntity(JpaRepository<T, ID> entityDao, ServiceRequest<ID> request) {
        
        logger.trace("removeEntity");
        
        // Setup the entity to be removed        
        T remEntity = prepareForRemove(entityDao, request);
        
        // Check the entity version
        verifyCurrentVersion(remEntity);
             
        // Do  validation (throws exceptions)
        validateRemove(request, remEntity);
        
        // Do further business operations
        String message = doBusinessOperations(request, MappedBusinessEntity.REC_REMOVE, remEntity);
        
        // Remove the entity
        executeRemove(entityDao, (T)remEntity.getReferenceEntity());
        
        return ServiceResponseFactory.getSuccessResponse(message);
    
    }
    
    /**
     * Prepares an entity for the remove operation.
     * Retrieves the existing entity from the database along with its master.
     * 
     * @param <T> the type of the associated entity.
     * @param <ID> the type of the associated entity's identifier.
     * @param entityDao the associated entity's data access object.
     * @param request the input service request.
     * @return a response containing the persisted entity and its master.
     */     
    protected <T extends MappedBusinessEntity, ID extends Serializable> T prepareForRemove(JpaRepository<T, ID> entityDao, ServiceRequest<ID> request) {
        logger.trace("prepareForRemove");
        
        ID idEntity = request.getEntityId();
        JsonObject jsonEntity = request.getData();        
        
        if (idEntity == null) {
            logger.error("Null entity identifier specified");
            throw new ServiceResponseException(ServiceResponseFactory.getSystemFailResponse("REMOVE_REC_NOT_DEFINED", messageHelper.getMessage("exception.general", "BEX001")));
        } 
        
        try {

            T curEntity = entityDao.findOne(idEntity);

            if (curEntity == null) {
                // If it's been removed, assume an update has taken place
                logger.debug("Optimistic lock failure on remove, entity Id = " + idEntity.toString());
                throw new ServiceResponseException(ServiceResponseFactory.getOpLockFailResponse());
            } 

            T remEntity =  (T) curEntity.getNewInstance();

            remEntity.copyFrom(curEntity);
            remEntity.setBaseline(); 
            remEntity.setFromJson(jsonEntity);  

            return remEntity;
        
         } catch (JpaOptimisticLockingFailureException|NoResultException ex) {
           
            // Optimisitic lock exception
            throw new ServiceResponseException(ServiceResponseFactory.getOpLockFailResponse());
            
        }
    
    }
    
    /**
     * Executes the remove operation.
     * Deletes the entity from the database.
     * 
     * @param <T> the type of the associated entity.
     * @param <ID> the type of the associated entity's identifier.
     * @param entityDao the associated entity's data access object.
     * @param remEntity the entity to be removed.
     */     
    protected <T extends MappedBusinessEntity, ID extends Serializable> void executeRemove(JpaRepository<T, ID> entityDao, T remEntity) {       
        logger.trace("executeRemove");
            
        try {
           
            // Delete the reference entity, i.e. the one retrieved as it
            // will have the links to any dependants established, so these will be deleted too
            entityDao.delete((T)remEntity);
             
            // Flush to ensure all changes are reflected on the database (within this txn)
            entityDao.flush(); 
            em.flush();
            
            // Clear the entity manager to avoid retrieving out of date entities
            em.detach((T)remEntity);
            
        
        } catch (JpaOptimisticLockingFailureException ex) {
           
            // Optimisitic lock exception
            throw new ServiceResponseException(ServiceResponseFactory.getOpLockFailResponse());
            
        } 

    }    
    
    /**
     * Performs validation for a save operation.
     * Performs the following validation steps:
     * <ul>
     * <li>Validates the entity via the validator provided. 
     * <li>Validates the entity via {@link BusinessEntity#doIntegrityValidation}. 
     * <li>Performs feasibility validation via {@link #validateFeasibility}.
     * </ul>
     * Any validation errors from the above methods are consolidated before throwing a
     * {@link ServiceResponseException}.  However if a specific error message is returned by one of
     * the methods then only this will be returned in the exception.
     * 
     * @param request the input service request.
     * @param validator the associated entity's validator.
     * @param revEntity the revised entity.
     */     
    protected void validateSave(ServiceRequest request, Validator validator, MappedBusinessEntity revEntity) {  
        logger.trace("validateSave");
        
        revEntity.setMessageHelper(this.messageHelper);
        
        List<ValidationError> errors = processConstraints(validator.validate(revEntity));
       
        ValidationError error = revEntity.doIntegrityValidation(MappedBusinessEntity.REC_SAVE, errors);
        
        // General errors considered higher priority than errors as the generally cannot be resolved by amending fields
        if (error != null) {
            String message = messageHelper.getMessage(error.getMessage(),error.getContextArgs());
            throw new ServiceResponseException (ServiceResponseFactory.getValidationFailResponse(message)); 
        
        }
        
        error = validateFeasibility(request, MappedBusinessEntity.REC_SAVE, revEntity, errors);
        
        if (error != null) {
            String message = messageHelper.getMessage(error.getMessage(),error.getContextArgs());
            throw new ServiceResponseException (ServiceResponseFactory.getValidationFailResponse(message)); 
        
        }
        
        if (errors.isEmpty() == false) {    
            errors = processValidationErrors(errors);
            throw new ServiceResponseException(ServiceResponseFactory.getValidationFailResponse(errors));
        }
     
    }
   
    /**
     * Performs validation for a remove operation.
     * Performs the following validation steps:
     * <ul>
     * <li>Validates the entity via {@link BusinessEntity#doIntegrityValidation}. 
     * <li>Performs feasibility validation via {@link #validateFeasibility}.
     * </ul>
     * Any validation errors from the above methods are consolidated before throwing a
     * {@link ServiceResponseException}.  However if a specific error message is returned by one of
     * the methods then only this will be returned in the exception.
     * 
     * @param request the input service request.
     * @param revEntity the revised entity.
     */     
    protected void validateRemove(ServiceRequest request, MappedBusinessEntity revEntity) {  
        logger.trace("validateRemove");
        
        revEntity.setMessageHelper(this.messageHelper);
        
        List<ValidationError> errors = new ArrayList<>();
        
        ValidationError error = revEntity.doIntegrityValidation(MappedBusinessEntity.REC_REMOVE, errors);
        
        // General errors considered higher priority than errors as the generally cannot be resolved by amending fields
        if (error != null) {
            String message = messageHelper.getMessage(error.getMessage(),error.getContextArgs());
            throw new ServiceResponseException (ServiceResponseFactory.getValidationFailResponse(message)); 
        
        }
        
        error = validateFeasibility(request, MappedBusinessEntity.REC_REMOVE, revEntity, errors);
        
        if (error != null) {
            String message = messageHelper.getMessage(error.getMessage(),error.getContextArgs());
            throw new ServiceResponseException (ServiceResponseFactory.getValidationFailResponse(message)); 
        
        }
        
        if (errors.isEmpty() == false) {      
            errors = processValidationErrors(errors);
            throw new ServiceResponseException(ServiceResponseFactory.getValidationFailResponse(errors));
        }
        
    }
    
    /**
     * Verifies that the entity is up to date.
     * Throws a {@link  ServiceResponseException} containing an optimistic lock exception if the entity
     * is out of date.  If not, then the master entity version is updated.
     * 
     * @param revEntity the revised entity.
     */
    protected void verifyCurrentVersion(MappedBusinessEntity revEntity) {           
        
        boolean isFresh = revEntity.isCurrentVersion();
 
        if (isFresh == false) {
            logger.debug("verifyCurrentVersion - out of date");
            throw new ServiceResponseException(ServiceResponseFactory.getOpLockFailResponse());

        } else {

            // Update the master entity (if it is not the master)
            if (revEntity.isMastered()) 
                  updateMasterVersion(revEntity);
        }

    }
    
    /**
     * Updates the version of the entity's master.
     * Is dependent on the referenced master having had its identifier set. 
     * 
     * @param revEntity the revised entity who's referenced master will be updated.
     */
    protected void updateMasterVersion(BusinessEntity revEntity) {       
        
        BusinessEntity master;
        
        if (revEntity.getReferenceEntity() != null)
            master = revEntity.getReferenceEntity().getMasterEntity();
        else
            master = revEntity.getMasterEntity();
        
        try {

        // This will update the version - note that the master entity must be created with the id set
        getEntity(master, true);     
    
        } catch (JpaOptimisticLockingFailureException|NoResultException ex) {
           
            // Optimisitic lock exception
            throw new ServiceResponseException(ServiceResponseFactory.getOpLockFailResponse());
            
        }
        
    }
    
    /**
     * Retrieves the the database copy of the entity provided.
     * 
     * @param entity the entity to retrieve.
     * @return the retrieved entity.
     */
    protected BusinessEntity getEntity(BusinessEntity entity) {
        
        return getEntity(entity, false);
    
    }    
    
    /**
     * Retrieves the the database copy of the entity provided and updates its version.
     * 
     * @param entity the entity to retrieve.
     * @param updateVersion a flag to indicate if the version should be updated.
     * @return the retrieved entity.
     */
    protected BusinessEntity getEntity(BusinessEntity entity, boolean updateVersion) {       
        
        String findQueryString = entity.createFindQueryString();
        
        TypedQuery<MappedBusinessEntity> findQuery = em.createQuery(findQueryString, MappedBusinessEntity.class);
        
        if (updateVersion)
            findQuery.setLockMode(LockModeType.OPTIMISTIC_FORCE_INCREMENT);
        
        MappedBusinessEntity storeEntity = findQuery.getSingleResult();   
        
        // Need to flush the changes to synchronise the database 
        // Otherwise retrieves within this transaction context won't reflect the update
        // So when the version on a mastered entity is set following a save it would pick up
        // the old version from the master being updated here
        // NB setting FlushMode to AUTO on the Query does not result in a flush
        em.flush();  
        
        // Now need to refresh the entity so as to get the version updated from the database
        em.refresh(storeEntity);
                
        return storeEntity;
 
    }
    
    /**
     * Converts constraint violations such as those returned by a validator into validation errors.
     * 
     * @param <T> the type of the associated entity.
     * @param constraints the list of constraint violations.
     * @return the list of validation errors.
     */
    protected <T> List<ValidationError> processConstraints (Set<ConstraintViolation<T>> constraints) {        
        
        List<ValidationError> errors = new ArrayList<>();
        
        if (constraints.isEmpty() == false) {
            
            for(ConstraintViolation<T> v: constraints) {
                
                String message = messageHelper.getMessage(v.getMessage());
                ValidationError error = ValidationErrorFactory.getFieldError(message, v.getPropertyPath().toString());
                errors.add(error);

            }        
        }
        
        return errors;
        
    }
    
     /**
     * Converts validation errors to set the message.
     * 
     * @param errors the list of validation errors
     * @return the list of validation errors.
     */
    protected List<ValidationError> processValidationErrors (List<ValidationError> errors) {        
       
        for(ValidationError v: errors) {
            v.setMessage(messageHelper.getMessage(v.getMessage(), v.getContextArgs()));
        }
        
        return errors;
        
    }
   
    /**
     * Flushes the reference data cache
     */
    protected void flushRefDataCache() {   
        refDataCache.flushCache();
    }

}
