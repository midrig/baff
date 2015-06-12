package com.midrig.evaluator.service;

import com.midrig.baff.app.entity.MappedBusinessEntity;
import com.midrig.baff.app.entity.TreeNode.NodeId;
import com.midrig.baff.app.service.BusinessService;
import com.midrig.baff.app.service.ServiceRequest;
import com.midrig.baff.app.service.ServiceResponse;
import com.midrig.baff.app.service.ServiceResponseException;
import com.midrig.baff.app.service.ServiceResponseFactory;
import com.midrig.baff.app.service.ValidationError;
import com.midrig.baff.app.service.ValidationErrorFactory;
import com.midrig.evaluator.dao.CriteriaDao;
import com.midrig.evaluator.dao.CriteriaTplDao;
import com.midrig.evaluator.dao.EvalGroupDao;
import com.midrig.evaluator.dao.EvaluatorDao;
import com.midrig.evaluator.dao.GroupForEvalDao;
import com.midrig.evaluator.dao.OptionDao;
import com.midrig.evaluator.dao.ScoreDao;
import com.midrig.evaluator.dao.ScorecardDao;
import com.midrig.evaluator.dao.ScorecardTplDao;
import com.midrig.evaluator.domain.Analysis;
import com.midrig.evaluator.domain.ChartSeries;
import com.midrig.evaluator.domain.Criteria;
import com.midrig.evaluator.domain.CriteriaTpl;
import com.midrig.evaluator.domain.EvalGroup;
import com.midrig.evaluator.domain.Evaluator;
import com.midrig.evaluator.domain.GroupForEval;
import com.midrig.evaluator.domain.Option;
import com.midrig.evaluator.domain.Score;
import com.midrig.evaluator.domain.Scorecard;
import com.midrig.evaluator.domain.ScorecardTpl;
import com.midrig.evaluator.domain.EvalTreeNode;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;  
import javax.annotation.Resource;
import javax.json.JsonObject;
import javax.validation.Validator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
 

@Transactional
@Service("evalService")
public class EvaluatorServiceImpl extends BusinessService implements EvaluatorService {

    @Autowired
    protected EvalGroupDao evalGroupDao;
    
    @Autowired
    protected GroupForEvalDao groupForEvalDao;
    
    @Autowired
    protected EvaluatorDao evaluatorDao;
    
    @Autowired
    protected ScorecardDao scorecardDao;
    
    @Autowired
    protected CriteriaDao criteriaDao;
    
    @Autowired
    protected OptionDao optionDao;
    
    @Autowired
    protected ScoreDao scoreDao;
    
    @Autowired
    protected ScorecardTplDao scorecardTplDao;
    
    @Autowired
    protected CriteriaTplDao criteriaTplDao;
    
    @Resource 
    Validator validator;
    
    public EvaluatorServiceImpl() {
        super();
        
    }
    

    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    @Override
    public ServiceResponse<EvalGroup> findEvalGroup(ServiceRequest<Integer> request) {        
        logger.trace("findEvalGroup");
        
        return findEntity(evalGroupDao, request);
    }
    
    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    @Override
    public ServiceResponse<EvalGroup> findAllEvalGroups(ServiceRequest<Integer> request) {       
        logger.trace("findAllEvalGroups");
          
        return findPageOfEntities(request, new EvalGroup());  
        
    }

    @Transactional(readOnly = false, propagation = Propagation.REQUIRED)
    @Override
    public ServiceResponse<EvalGroup> saveEvalGroup(ServiceRequest<Integer> request, String username) {      
        logger.trace("saveEvalGroup");
        
        ServiceResponse response = saveEntity(evalGroupDao, request, validator, new EvalGroup());
        
        // If adding a new evaluaion group then create an admininstrator record
        if (request.getEntityId() == null) {
            
            JsonObject jsonEvalGroup = response.getSingleItem();
         
            if (jsonEvalGroup != null && username != null && !username.equals("")) {
            
                EvalGroup evalGroup = new EvalGroup();
                evalGroup.setFromJson(jsonEvalGroup);
            
                Evaluator evaluator = new Evaluator();
                evaluator.setEvalGroup(evalGroup);
                evaluator.setUsername(username);
                evaluator.setUserrole(new Short(refDataCache.getCode("EVALGROUP.USERROLE.ADMIN")));

                executeSave(evaluatorDao, evaluator);
            
            } else {
                throw new ServiceResponseException(ServiceResponseFactory.getSystemFailResponse("DATA_INTEGRITY_ERROR", messageHelper.getMessage("exception.general", "EVAL101")));

            }
            
        }
        
        return response;
    }

    @Transactional(readOnly = false, propagation = Propagation.REQUIRED)
    @Override    
    public ServiceResponse<EvalGroup> removeEvalGroup(ServiceRequest<Integer> request) {     
        logger.trace("removeEvalGroup");
        
        return removeEntity(evalGroupDao, request);
 
    }
    
    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    @Override
    public ServiceResponse<GroupForEval> findEvalGroupsByEvaluator(ServiceRequest<Integer> request) {       
        logger.trace("findEvalGroupsByEvaluator");
        
        return findPageOfEntities(request, new GroupForEval());  
        
    }
    
    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    @Override
    public ServiceResponse<Evaluator> findEvaluator(ServiceRequest<Integer> request) {        
        logger.trace("findEvaluator");
        
        return findEntity(evaluatorDao, request);
    }
    
    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    @Override
    public ServiceResponse<Evaluator> findAllEvaluators(ServiceRequest<Integer> request) {       
        logger.trace("findAllEvaluators");
        
        return findPageOfEntities(request, new Evaluator());  
        
    }

    @Transactional(readOnly = false, propagation = Propagation.REQUIRED)
    @Override
    public ServiceResponse<Evaluator> saveEvaluator(ServiceRequest<Integer> request) {      
        logger.trace("saveEvaluator");
        
        return saveEntity(evaluatorDao, request, validator, new Evaluator());
        
    }

    @Transactional(readOnly = false, propagation = Propagation.REQUIRED)
    @Override    
    public ServiceResponse<Evaluator> removeEvaluator(ServiceRequest<Integer> request) {     
        logger.trace("removeEvaluator");
        
        return removeEntity(evaluatorDao, request);
 
    }
    
    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    @Override
    public ServiceResponse<Scorecard> findScorecard(ServiceRequest<Integer> request) {        
        logger.trace("findScorecard");
        
        return findEntity(scorecardDao, request);
    }
    
    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    @Override
    public ServiceResponse<Scorecard> findAllScorecards(ServiceRequest<Integer> request) {       
        logger.trace("findAllScorecards");
        
        return findPageOfEntities(request, new Scorecard());  
        
    }

    @Transactional(readOnly = false, propagation = Propagation.REQUIRED)
    @Override
    public ServiceResponse<Scorecard> saveScorecard(ServiceRequest<Integer> request) {      
        logger.trace("saveScorecard");
        
        return saveEntity(scorecardDao, request, validator, new Scorecard());
        
    }

    @Transactional(readOnly = false, propagation = Propagation.REQUIRED)
    @Override    
    public ServiceResponse<Scorecard> removeScorecard(ServiceRequest<Integer> request) {     
        logger.trace("removeScorecard");
        
        return removeEntity(scorecardDao, request);
 
    }
    
    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    @Override
    public ServiceResponse<Criteria> findCriteria(ServiceRequest<Integer> request) {        
        logger.trace("findCriteria");
        
        return findEntity(criteriaDao, request);
    }
    
    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    @Override
    public ServiceResponse<Criteria> findAllCriterias(ServiceRequest<Integer> request) {       
        logger.trace("findAllCriterias");
        
        return findPageOfEntities(request, new Criteria());  
        
    }

    @Transactional(readOnly = false, propagation = Propagation.REQUIRED)
    @Override
    public ServiceResponse<Criteria> saveCriteria(ServiceRequest<Integer> request) {      
        logger.trace("saveCriteria");
        
        return saveEntity(criteriaDao, request, validator, new Criteria());
        
    }

    @Transactional(readOnly = false, propagation = Propagation.REQUIRED)
    @Override    
    public ServiceResponse<Criteria> removeCriteria(ServiceRequest<Integer> request) {     
        logger.trace("removeCriteria");
        
        return removeEntity(criteriaDao, request);
 
    }
    
    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    @Override
    public ServiceResponse<Option> findOption(ServiceRequest<Integer> request) {        
        logger.trace("findOption");
        
        return findEntity(optionDao, request);
    }
    
    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    @Override
    public ServiceResponse<Option> findAllOptions(ServiceRequest<Integer> request) {       
        logger.trace("findAllOptions");
        
        return findPageOfEntities(request, new Option());  
        
    }

    @Transactional(readOnly = false, propagation = Propagation.REQUIRED)
    @Override
    public ServiceResponse<Option> saveOption(ServiceRequest<Integer> request) {      
        logger.trace("saveOption");
        
        return saveEntity(optionDao, request, validator, new Option());
        
    }

    @Transactional(readOnly = false, propagation = Propagation.REQUIRED)
    @Override    
    public ServiceResponse<Option> removeOption(ServiceRequest<Integer> request) {     
        logger.trace("removeOption");
        
        return removeEntity(optionDao, request);
 
    }
    
    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    @Override
    public ServiceResponse<Score> findScore(ServiceRequest<Integer> request) {        
        logger.trace("findScore");
        
        return findEntity(scoreDao, request);
    }
    
    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    @Override
    public ServiceResponse<Score> findAllScores(ServiceRequest<Integer> request) {       
        logger.trace("findAllScores");
        
        return findPageOfEntities(request, new Score());  
        
    }

    @Transactional(readOnly = false, propagation = Propagation.REQUIRED)
    @Override
    public ServiceResponse<Score> saveScore(ServiceRequest<Integer> request) {      
        logger.trace("saveScore");
        
        return saveEntity(scoreDao, request, validator, new Score());
        
    }

    @Transactional(readOnly = false, propagation = Propagation.REQUIRED)
    @Override    
    public ServiceResponse<Score> removeScore(ServiceRequest<Integer> request) {     
        logger.trace("removeScore");
        
        return removeEntity(scoreDao, request);
 
    }
    
    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    @Override
    public ServiceResponse<ScorecardTpl> findScorecardTpl(ServiceRequest<Integer> request) {        
        logger.trace("findScorecardTpl");
        
        return findEntity(scorecardTplDao, request);
    }
    
    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    @Override
    public ServiceResponse<ScorecardTpl> findAllScorecardTpls(ServiceRequest<Integer> request) {       
        logger.trace("findAllScorecardTplss");
        
        return findPageOfEntities(request, new ScorecardTpl());  
        
    }
    
    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    @Override
    public ServiceResponse<CriteriaTpl> findAllCriteriaTpls(ServiceRequest<Integer> request) {       
        logger.trace("findAllCriteriaTpls");
        
        return findPageOfEntities(request, new CriteriaTpl());  
        
    }
    
    @Transactional(readOnly = false, propagation = Propagation.REQUIRED)
    @Override
    public ServiceResponse<ScorecardTpl> createScorecardTpl(ServiceRequest<Integer> request) {      
        logger.trace("createScorecardTpl");
        
        
        return saveEntity(scorecardTplDao, request, validator, new ScorecardTpl());
        
    }
    
    @Transactional(readOnly = false, propagation = Propagation.REQUIRED)
    @Override    
    public ServiceResponse<ScorecardTpl> removeScorecardTpl(ServiceRequest<Integer> request) {     
        logger.trace("removeScorecardTpl");
        
        return removeEntity(scorecardTplDao, request);
 
    }

    
    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    @Override
    public ServiceResponse<Analysis> findAllAnalysis(ServiceRequest<Integer> request) {       
        logger.trace("findAllAnalysis");
        
            // Create the analysis list
            List<Analysis> analysisList = new ArrayList<>();

             // Get the scorecard
            Scorecard scorecard = scorecardDao.findOne(request.getData().getInt("scorecardId"));
            
            if (scorecard == null || scorecard.getCriteriaList().isEmpty() || scorecard.getOptionList().isEmpty())
                return ServiceResponseFactory.getSuccessResponse(messageHelper.getMessage("operation.analysis.no_analysis"));            
                //return ServiceResponseFactory.getSuccessResponse(analysisList);

            // Call calculateOptionScoreValues with scorecard.optionList to score the options
            List<Option> optionList = calculateOptionScoreValues(request, scorecard.getOptionList());

            Analysis actualScore = new Analysis("Best Actual Score");
            Analysis weightedScore = new Analysis("Best Weighted Score");
            Analysis balancedScore = new Analysis("Best Balanced Score");

            analysisList.add(actualScore);
            analysisList.add(weightedScore);
            analysisList.add(balancedScore);


            // Loop through list to identify the top scores
            for(Option option : optionList) {

                actualScore.setIfWinner(option.getName(), option.getScore());
                weightedScore.setIfWinner(option.getName(), option.getWeightedScore());
                balancedScore.setIfWinner(option.getName(), option.getBalancedScore());

            }

            // Loop through the scorecard.criteriaList
            List<Criteria> criteriaList = scorecard.getCriteriaList();

            for(Criteria criteria : criteriaList) {

                Analysis criteriaScore = new Analysis("Best " + criteria.getName());

                // Calculate criteria scores
                List<Score> scoreList = calculateScoreValues(request, criteria.getScoreList());

                // Find the top scores
                for (Score score: scoreList) {

                    criteriaScore.setIfWinner(score.getOption().getName(), score.getScore());

                }

                analysisList.add(criteriaScore);

            }

            return ServiceResponseFactory.getSuccessResponse(analysisList,  new Long(analysisList.size()));
         
    }
    
    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    @Override
    public ServiceResponse<EvalTreeNode> findEvalTreeNode(ServiceRequest<String> request, String username) {        
        logger.trace("findEvalTreeNode");
        
        NodeId nodeId = EvalTreeNode.getNodeId(request.getEntityId());
        EvalTreeNode evalTreeNode = null;
        
        boolean allowAdd = userSecurityHelper.isUserInRole("evaluator.update");
        
        if (!nodeId.nodeType.equals("root")) {
            
            Integer entityId = new Integer(nodeId.entityId);
                 
            if (nodeId.entityType.equals("GroupForEval")) {
               
                EvalGroup evalGroup = evalGroupDao.findOne(entityId);
                Scorecard newScorecard = null;
                
                if (allowAdd)
                    newScorecard = new Scorecard();
                
                evalTreeNode = new EvalTreeNode(evalGroup.getScorecardList(), "SC", newScorecard, allowAdd);
                
            } else if (nodeId.entityType.equals("Scorecard")) {
                
                Scorecard scorecard = scorecardDao.findOne(entityId);
                
                Option newOption = null;
                
                if (allowAdd) {
                    newOption = new Option();
                    // Set master
                    newOption.setScorecardId(scorecard.getId());
                    newOption.setMaster(scorecard);
                }                
                
                evalTreeNode = new EvalTreeNode(scorecard.getOptionList(), "OP", newOption, allowAdd);                
            
            } else if (nodeId.entityType.equals("Option")) {
                
                Option option = optionDao.findOne(entityId);                
                List<Score> scores = new ArrayList<>();
                
                // NB May be more efficient to do a database query than determine via ORM
                for (Score score : option.getScoreList()) {
                    
                    if (score.getEvaluator().getUsername().equals(username))
                        scores.add(score);
                    
                }
                
                evalTreeNode = new EvalTreeNode(scores, "S_", null, false);                
            
            }
        }
        
        if (evalTreeNode == null) {
            
            EvalGroup newEvalGroup = null;
                
            if (allowAdd)
                newEvalGroup = new EvalGroup();

            List<GroupForEval> evalGroups = groupForEvalDao.findAllForEvaluator(username);
            evalTreeNode = new EvalTreeNode(evalGroups, "EG", newEvalGroup, allowAdd);
        }
        
        return ServiceResponseFactory.getTreeNodeResponse(evalTreeNode);
    }
        
    
    
    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    @Override
    public ServiceResponse<ChartSeries> findChartSeries(ServiceRequest<Integer> request) {       
        logger.trace("findChartSeries");
        
        List<ChartSeries> chartSeriesList = new ArrayList<>();
        
         // Get the scorecard
        Scorecard scorecard = scorecardDao.findOne(request.getData().getInt("scorecardId"));
        
        if (scorecard.getCriteriaList().isEmpty() || scorecard.getOptionList().isEmpty())
            return ServiceResponseFactory.getSuccessResponse(chartSeriesList);
        
        // Loop through the scorecard.criteriaList
         List<Criteria> criteriaList = scorecard.getCriteriaList();
         
         for(Criteria criteria : criteriaList) {
             
             ChartSeries criteriaSeries = new ChartSeries(criteria.getName());
             
             // Calculate criteria scores
             List<Score> scoreList = calculateScoreValues(request, criteria.getScoreList());
             
             // Find the top scores
             for (Score score: scoreList) {
                 
                 String optionName = score.getOption().getName();
                 
                 criteriaSeries.addOptionScore(optionName + "_Abs", score.getScore());
                 criteriaSeries.addOptionScore(optionName + "_Wgt", score.getWeightedScore());
                 criteriaSeries.addOptionScore(optionName + "_Bal", score.getBalancedScore());
                  
             }
             
             chartSeriesList.add(criteriaSeries);
             
         }
        
        return ServiceResponseFactory.getSuccessResponse(chartSeriesList);      
        
    }

    
    @Override
     protected <T extends MappedBusinessEntity, ID extends Serializable> ServiceResponse<T> processRetrievedEntities(ServiceRequest<ID> request, T entity, List<T> entities, Long totalCount) {
       logger.trace("processRetrievedEntities");
       
       List<T> newList = entities;
        
        if (entity instanceof Criteria) {
            newList = calculateCriteriaValues(entities);
        } else if (entity instanceof Option) {
            newList = calculateOptionScoreValues(request, entities);
        } else if (entity instanceof Score) {
            newList = calculateScoreValues(request, entities);
        } else if (entity instanceof CriteriaTpl) {
            newList = calculateCriteriaTplValues(entities);
        }
       
       return ServiceResponseFactory.getSuccessResponse(newList, totalCount);
           
       
    }

    protected <T extends MappedBusinessEntity> List<T> calculateCriteriaValues(List<T> entities) {
        logger.trace("calculateCriteriaValues");
        
        Integer totalWeight = 0;
        Criteria criteria;
        
        // Loop through to calculate total
        for(MappedBusinessEntity entity: entities) {
            
            criteria = (Criteria)entity;
            totalWeight += criteria.getWeight();          
        }
        
        // Loop through again to set relative weight
        for(MappedBusinessEntity entity: entities) {
           
           criteria = (Criteria)entity;
           criteria.setRelativeWeight((100*criteria.getWeight())/totalWeight);            
        }
        
        return entities;
        
    }
    
    protected <T extends MappedBusinessEntity> List<T> calculateCriteriaTplValues(List<T> entities) {
        logger.trace("calculateCriteriaTplValues");
        
        Integer totalWeight = 0;
        CriteriaTpl criteriaTpl;
        
        // Loop through to calculate total
        for(MappedBusinessEntity entity: entities) {
            
            criteriaTpl = (CriteriaTpl)entity;
            totalWeight += criteriaTpl.getWeight();          
        }
        
        // Loop through again to set relative weight
        for(MappedBusinessEntity entity: entities) {
           
           criteriaTpl = (CriteriaTpl)entity;
           criteriaTpl.setRelativeWeight((100*criteriaTpl.getWeight())/totalWeight);            
        }
        
        return entities;
        
    }
    
     protected <T extends MappedBusinessEntity, ID extends Serializable> List<T> calculateOptionScoreValues(ServiceRequest<ID> request, List<T> entities) {
        logger.trace("calculateOptionScoreValues");
        
        Integer totalScore = 0;
        Integer totalWeightedScore = 0;
        Integer totalBalancedScore = 0;
        
        Integer evaluatorId = request.getData().getInt("evaluatorId", -1);               
        
        Option option;
        
        // Loop through options to calculate scores
        for(MappedBusinessEntity entity: entities) {
            
            option = (Option)entity;
            List<Score> scoreList = option.getScoreList();
            
            List<Score> consolidatedList = consolidateScores(scoreList, evaluatorId);
            
            int scoreCount = calculateScores(consolidatedList, option);
            
            totalScore += option.getScore();
            totalWeightedScore += option.getWeightedScore();
            totalBalancedScore += option.getBalancedScore();
           
        }
        
         // Loop through again to set relative values
        for(MappedBusinessEntity entity: entities) {
           
           option = (Option)entity;
           
           if (option.getScore() > 0 && totalScore > 0)
                option.setRelativeScore((100*option.getScore())/totalScore);
           else
                option.setRelativeScore(0);
           
           if (option.getWeightedScore() > 0 && totalWeightedScore > 0)
                option.setRelativeWeightedScore((100*option.getWeightedScore())/totalWeightedScore); 
           else
                option.setRelativeWeightedScore(0);
           
           if (option.getBalancedScore() > 0 && totalBalancedScore > 0)
                option.setRelativeBalancedScore((100*option.getBalancedScore())/totalBalancedScore); 
           else
                option.setRelativeBalancedScore(0);
           
        }
        
        return entities;

        
     }
     
     protected List<Score> consolidateScores(List<Score> scoreList, Integer evaluatorId) {
        logger.trace("consolidateScores"); 
        
        // Needs to be sorted by option / criteria
        Collections.sort((List<Score>)(Object)scoreList);  // Not required if sorters are specified on client
        
        if (scoreList.isEmpty())
            return scoreList;
                
        List<Score> consolidatedScores = new ArrayList<>();
        
        Option option = scoreList.get(0).getOption();
        Criteria criteria = scoreList.get(0).getCriteria();
        
        int subTotalScore = 0, subCount = 0, scoreCount = 0;
        
        for(Score scoreEntity: scoreList) {
            
            if (evaluatorId > 0) {
                
                // Processing list for a single evaluator
                if (evaluatorId.equals(scoreEntity.getEvaluator().getId())) 
                    consolidatedScores.add(scoreEntity);
            
            } else {
                
                // Should be processing list for all evaluators - when the option or criteria name changes (filtered on one - so name
                // will be static - and sorted on the other) then we need to subtotal. 
                if (!option.getName().equals(scoreEntity.getOption().getName()) ||
                    !criteria.getName().equals(scoreEntity.getCriteria().getName())) {
                    
                    consolidatedScores.add(createConsolidatedScore(option,criteria,subTotalScore,subCount));
                   
                    option = scoreEntity.getOption();
                    criteria = scoreEntity.getCriteria();
                    
                    subTotalScore = 0;
                    subCount = 0;
                    scoreCount = 0;
                    
                }
               
                if (scoreEntity.getScore() > 0) {
                    subTotalScore += scoreEntity.getScore();
                    subCount++;
                }

                scoreCount++;

            }
        }
        
         if (evaluatorId <= 0) {
            // Process last one            
            consolidatedScores.add(createConsolidatedScore(option,criteria,subTotalScore,subCount));         
         }

        return consolidatedScores;

     }
     
    protected Score createConsolidatedScore(Option option, Criteria criteria, int totalScore, int count) {
        
        Score score = new Score();
        score.setCriteria(criteria);
        score.setOption(option);
        score.setNotes(messageHelper.getMessage("operation.score.consolidated"));
        
        if (totalScore > 0 && count > 0)
            score.setScore(totalScore / count);
        else
            score.setScore(0);
        
        return score;
        
    }
     
      
    protected <T extends MappedBusinessEntity, ID extends Serializable> List<T> calculateScoreValues(ServiceRequest<ID> request, List<T> entities) {
        logger.trace("calculateScoreValues");    

        List<Score> scoreList = (List<Score>)(Object)entities;
        Integer evaluatorId = request.getData().getInt("evaluatorId", -1);               
        
        if (evaluatorId != -2) {        
            scoreList = consolidateScores(scoreList, evaluatorId);
        
        } 
            
        calculateScores(scoreList, null);
        
        return (List<T>)scoreList;
     
    }
     
     protected <T extends MappedBusinessEntity> int calculateScores(List<Score> scoreList, Option option) {
        logger.trace("calculateScores");
        
        Integer totalScore = 0;
        Integer totalWeightedScore = 0;
        Integer totalBalancedScore = 0;
        
        Integer totalRelativeScore = 0;
        Integer totalRelativeWeightedScore = 0;
        Integer totalRelativeBalancedScore = 0;
        
        Integer score;
        Integer weight;
        Integer relativeScore;
        Integer weightedScore;
        Integer relativeWeightedScore;
        Integer balancedScore;
        Integer relativeBalancedScore;
        
        double scoreD;
        double bScore;
        double midScore = Math.log(50);
        
        int scoreCount = 0;
        
        // Loop through to set derived values
        for(Score scoreEntity: scoreList) {
            
            scoreCount += 1;
            score  = scoreEntity.getScore();
            
            if (score > 0) {
            
                    weight = scoreEntity.getCriteria().getWeight();
                    if (weight > 0 )
                        weightedScore = score * weight / 100;
                    else
                        weightedScore = 0;

                    scoreD = score.doubleValue();

                    if (scoreD > 50) {
                        bScore = midScore + Math.log(scoreD - 50);
                    } else {
                        bScore = Math.log(scoreD);
                    }

                    balancedScore = (int) ((100*bScore) / ( 2*midScore));

                    totalScore += score;
                    totalWeightedScore += weightedScore;
                    totalBalancedScore += balancedScore;

                    scoreEntity.setWeightedScore(weightedScore);
                    scoreEntity.setBalancedScore(balancedScore);
            } else {
                scoreEntity.setWeightedScore(0);
                scoreEntity.setBalancedScore(0);
            }
        
        }
                
        if (option != null) {
            if (totalScore > 0 && scoreCount > 0) {
                option.setScore(totalScore / scoreCount);
                
                if (totalWeightedScore > 0)
                    option.setWeightedScore(totalWeightedScore / scoreCount);
                else 
                     option.setWeightedScore(0);
                
                option.setBalancedScore(totalBalancedScore / scoreCount);
                
            } else {
                option.setScore(0);
                option.setWeightedScore(0);
                option.setBalancedScore(0);
            }
        } else {
            
            // Loop through again to set relative values
            for(Score scoreEntity: scoreList) {
                
                if (scoreEntity.getScore() > 0) {

                    relativeScore = (100*scoreEntity.getScore())/totalScore;
                    weightedScore = scoreEntity.getWeightedScore();
                    
                    if (weightedScore > 0 && totalWeightedScore > 0)
                        relativeWeightedScore = (100*weightedScore)/totalWeightedScore;
                    else
                        relativeWeightedScore = 0;
                    
                    relativeBalancedScore = (100*scoreEntity.getBalancedScore())/totalBalancedScore;

                    scoreEntity.setRelativeScore(relativeScore);    
                    scoreEntity.setRelativeWeightedScore(relativeWeightedScore);    
                    scoreEntity.setRelativeBalancedScore(relativeBalancedScore);    
                } else {
                    scoreEntity.setRelativeScore(0);    
                    scoreEntity.setRelativeWeightedScore(0);    
                    scoreEntity.setRelativeBalancedScore(0);    
                }

            }
        }
        
        return scoreCount;
            
    }
    
    @Override
    protected ValidationError validateFeasibility(ServiceRequest request, String action, MappedBusinessEntity revEntity, List<ValidationError> errors) {  
        logger.trace("validateFeasibility");
        
        if (revEntity instanceof EvalGroup) {
            return validateEvalGroupFeasibility(request, action, (EvalGroup) revEntity, errors);        
        }else if (revEntity instanceof Evaluator) {
            return validateEvaluatorFeasibility(request, action, (Evaluator) revEntity, errors);     
        }else if (revEntity instanceof Scorecard) {
            return validateScorecardFeasibility(request, action, (Scorecard) revEntity, errors);     
        }else if (revEntity instanceof ScorecardTpl) {
            return validateScorecardTplFeasibility(request, action, (ScorecardTpl) revEntity, errors);     
        }else if (revEntity instanceof Criteria) {
            return validateCriteriaFeasibility(request, action, (Criteria) revEntity, errors);     
        }else if (revEntity instanceof Option) {
            return validateOptionFeasibility(request, action, (Option) revEntity, errors);     
        }
                        
        return null;
        
    }
    
    protected ValidationError validateEvalGroupFeasibility(ServiceRequest request, String action, EvalGroup revEvalGroup, List<ValidationError> errors) {  
        logger.trace("validateEvalGroupFeasibility");
               
        // Check the action being performed
        if (action.equals(MappedBusinessEntity.REC_SAVE)) {
            
            // Fiind evalgroups with same name
            List<EvalGroup> listEvalGroups = evalGroupDao.findByName(revEvalGroup.getName());
        
            if (!revEvalGroup.isOnlyMe(listEvalGroups)) {
                ValidationError error = ValidationErrorFactory.getFieldError(messageHelper.getMessage("validation.evalgroup.unique_name"), "name");
                errors.add(error);
            }

        }

        return null;

    }
    
    protected ValidationError validateEvaluatorFeasibility(ServiceRequest request, String action, Evaluator revEvaluator, List<ValidationError> errors) {  
        logger.trace("validateEvaluatorFeasibility");
        
        // Check the action being performed
        if (action.equals(MappedBusinessEntity.REC_SAVE)) {
            
            // Fiind evaluators for the evaluaton group with same name
            List<Evaluator> listEvaluators = evaluatorDao.findByUsername(revEvaluator.getEvalGroup().getId(), revEvaluator.getUsername());
        
            if (!revEvaluator.isOnlyMe(listEvaluators)) {
                ValidationError error = ValidationErrorFactory.getFieldError(messageHelper.getMessage("validation.evaluator.unique_username"), "username");
                errors.add(error);
            }

        } 

        return null;

    }
    
    protected ValidationError validateScorecardFeasibility(ServiceRequest request, String action, Scorecard revScorecard, List<ValidationError> errors) {  
        logger.trace("validateScorecardFeasibility");
        
        // Check the action being performed
        if (action.equals(MappedBusinessEntity.REC_SAVE)) {
            
            // Fiind evaluators for the evaluaton group with same name
            List<Scorecard> listScorecards = scorecardDao.findByNameInGroup(revScorecard.getEvalGroup().getId(), revScorecard.getName());
        
            if (!revScorecard.isOnlyMe(listScorecards)) {
                ValidationError error = ValidationErrorFactory.getFieldError(messageHelper.getMessage("validation.scorecard.unique_name"), "name");
                errors.add(error);
            }

        } 

        return null;

    }
    
    protected ValidationError validateCriteriaFeasibility(ServiceRequest request, String action, Criteria revCriteria, List<ValidationError> errors) {  
        logger.trace("validateCriteriaFeasibility");
        
        // Check the action being performed
        if (action.equals(MappedBusinessEntity.REC_SAVE)) {
            
            // Fiind evaluators for the evaluaton group with same name
            List<Criteria> listCriterias = criteriaDao.findByName(revCriteria.getScorecard().getId(), revCriteria.getName());
        
            if (!revCriteria.isOnlyMe(listCriterias)) {
                ValidationError error = ValidationErrorFactory.getFieldError(messageHelper.getMessage("validation.criteria.unique_name"), "name");
                errors.add(error);
            }

        } 

        return null;

    }
    
    protected ValidationError validateOptionFeasibility(ServiceRequest request, String action, Option revOption, List<ValidationError> errors) {  
        logger.trace("validateOptionFeasibility");
        
        // Check the action being performed
        if (action.equals(MappedBusinessEntity.REC_SAVE)) {
            
            // Fiind evaluators for the evaluaton group with same name
            List<Option> listOptions = optionDao.findByName(revOption.getScorecard().getId(), revOption.getName());
        
            if (!revOption.isOnlyMe(listOptions)) {
                ValidationError error = ValidationErrorFactory.getFieldError(messageHelper.getMessage("validation.option.unique_name"), "name");
                errors.add(error);
            }

        } 

        return null;

    }
    
    protected ValidationError validateScorecardTplFeasibility(ServiceRequest request, String action, ScorecardTpl revScorecardTpl, List<ValidationError> errors) {  
        logger.trace("validateScorecardTplFeasibility");
        
        // Check the action being performed
        if (action.equals(MappedBusinessEntity.REC_SAVE)) {
            
            List<ScorecardTpl> listScorecardTpls = scorecardTplDao.findByName(revScorecardTpl.getName());
        
            if (!revScorecardTpl.isOnlyMe(listScorecardTpls)) {
                ValidationError error = ValidationErrorFactory.getFieldError(messageHelper.getMessage("validation.scorecardtpl.unique_name"), "name");
                errors.add(error);
            }

        } 

        return null;

    }


    @Override
    protected String doBusinessOperations(ServiceRequest request, String action, MappedBusinessEntity revEntity) {      
        logger.trace("doBusinessOperations");
        
        if (revEntity instanceof Option)
            return doOptionOperations(request, action, (Option)revEntity);   
        else if (revEntity instanceof Criteria)
            return doCriteriaOperations(request, action, (Criteria)revEntity);  
        else if (revEntity instanceof Scorecard)
            return doScorecardOperations(request, action, (Scorecard)revEntity);  
        else if (revEntity instanceof Evaluator)
            return doEvaluatorOperations(request, action, (Evaluator)revEntity);  
        else if (revEntity instanceof EvalGroup)
            return doEvalGroupOperations(request, action, (EvalGroup)revEntity);  
        else if (revEntity instanceof ScorecardTpl)
            return doScorecardTplOperations(request, action, (ScorecardTpl)revEntity);  
        
        return null;
       
    }
    
    protected String doOptionOperations(ServiceRequest request, String action, Option revEntity) {
        logger.trace("doOptionOperations");
        
        if (action.equals(MappedBusinessEntity.REC_SAVE)) {
            
            if (request.getEntityId() == null) {
                
                // Add criteria scores to option
                Scorecard scorecard = revEntity.getScorecard();              
                List<Criteria> criteriaList = scorecard.getCriteriaList();
                EvalGroup evalGroup = scorecard.getEvalGroup();
                List<Evaluator> evaluatorList = evalGroup.getEvaluatorList();
                
                for(Criteria criteria: criteriaList) {                    
                    for(Evaluator evaluator: evaluatorList) {                        
                        createScore(revEntity, criteria, evaluator);                        
                    }
                     
                }
            
            } else {
                
                // Updating
            }
        } else {
            
            // Confirm remove with the client
            if (!"REMOVE_CONF".equals(request.getActionCode())) {
                throw new ServiceResponseException(ServiceResponseFactory.getWarningFailResponse("REMOVE_CONF", messageHelper.getMessage("operation.score.remove_confirmation")));       
            }
            
            // Ensure the scores are loaded so that they are removed
            revEntity.getScoreList();
        }
        
        return null;
        
    }
    
    protected String doCriteriaOperations(ServiceRequest request, String action, Criteria revEntity) {
        logger.trace("doCriteriaOperations");
        
        if (action.equals(MappedBusinessEntity.REC_SAVE)) {
            
            if (request.getEntityId() == null) {
                
                // Add scores to options
                Scorecard scorecard = revEntity.getScorecard();              
                List<Option> optionList = scorecard.getOptionList();
                EvalGroup evalGroup = scorecard.getEvalGroup();
                List<Evaluator> evaluatorList = evalGroup.getEvaluatorList();
                
                for(Option option: optionList) {                    
                    for(Evaluator evaluator: evaluatorList) {                        
                        createScore(option, revEntity, evaluator);                        
                    }
                     
                }
            
            } else {
                
                // Updating
            }
        } else {
            
            // Confirm remove with the client
            if (!"REMOVE_CONF".equals(request.getActionCode())) {
                throw new ServiceResponseException(ServiceResponseFactory.getWarningFailResponse("REMOVE_CONF", messageHelper.getMessage("operation.score.remove_confirmation")));       
            }
            
            // Ensure the scores are loaded so that they are removed
            revEntity.getScoreList();
        }
        
        return null;
    
    }
    
    protected String doScorecardOperations(ServiceRequest request, String action, Scorecard revEntity) {
        logger.trace("doScorecardOperations");
        
         if (action.equals(MappedBusinessEntity.REC_REMOVE)) {
             
             // Confirm remove with the client
            if (!"REMOVE_CONF".equals(request.getActionCode())) {
                throw new ServiceResponseException(ServiceResponseFactory.getWarningFailResponse("REMOVE_CONF", messageHelper.getMessage("operation.scorecard.remove_confirmation")));       
            }
            
            // Ensure the options and criterias are loaded so that they are removed
            revEntity.getOptionList();
            revEntity.getCriteriaList();
             
         } else if (request.getEntityId() == null) {
             
             Integer scorecardTplId = (Integer)request.context.get("scorecardTplId");
             
             if (scorecardTplId != null) {
                 
                logger.debug("doScorecardOperations - creating scorecard from template");
             
                // Check if adding based on a template
                ScorecardTpl scorecardTpl = scorecardTplDao.findOne(scorecardTplId);

                // Loop through the scorecard.criteriaList
                List<CriteriaTpl> criteriaTplList = scorecardTpl.getCriteriaTplList();

                for(CriteriaTpl criteriaTpl : criteriaTplList) {

                   Criteria criteria = new Criteria();
                   criteria.setName(criteriaTpl.getName());
                   criteria.setDescription(criteriaTpl.getDescription());
                   criteria.setWeight(criteriaTpl.getWeight());
                   criteria.setScorecard(revEntity);

                   executeSave(criteriaDao, criteria);

                }
            }
             
         }
         
         return null;
       
    }
    
    protected String doEvaluatorOperations(ServiceRequest request, String action, Evaluator revEntity) {
        logger.trace("doEvaluatorOperations");
        
        if (action.equals(MappedBusinessEntity.REC_SAVE)) {
            
            if (request.getEntityId() == null) {
                
                // Add scores to evaluator for all scorecards in group
                EvalGroup evalGroup = revEntity.getEvalGroup();
                List<Scorecard> scorecardList = evalGroup.getScorecardList();
                
                for(Scorecard scorecard: scorecardList) {
                    
                    List<Option> optionList = scorecard.getOptionList();
                    List<Criteria> criteriaList = scorecard.getCriteriaList();
                    
                    for(Option option: optionList) {                    
                        for(Criteria criteria: criteriaList) {                        
                            createScore(option, criteria, revEntity);                        
                        }
                    }

                }
            
            } else {
                
                // Updating
            }
        } else {
            
            // Confirm remove with the client
            if (!"REMOVE_CONF".equals(request.getActionCode())) {
                throw new ServiceResponseException(ServiceResponseFactory.getWarningFailResponse("REMOVE_CONF", messageHelper.getMessage("operation.score.remove_confirmation")));       
            }
            
            // Ensure the scores are loaded so that they are removed
            revEntity.getScoreList();
        }
        
        return null;
    
       
    }
    
    protected String doEvalGroupOperations(ServiceRequest request, String action, EvalGroup revEntity) {
        logger.trace("doEvalGroupOperations");
        
        if (action.equals(MappedBusinessEntity.REC_REMOVE)) {
            
            // Confirm remove with the client
            if (!"REMOVE_CONF".equals(request.getActionCode())) {
                throw new ServiceResponseException(ServiceResponseFactory.getWarningFailResponse("REMOVE_CONF", messageHelper.getMessage("operation.evalgroup.remove_confirmation")));       
            }
            
            // Ensure the scorecards are loaded so that they are removed
            revEntity.getScorecardList();
            revEntity.getEvaluatorList();
        }
    
        return null;
       
    }
    
    protected String doScorecardTplOperations(ServiceRequest request, String action, ScorecardTpl revEntity) {
        logger.trace("doScorecardTplOperations");
        
         if (action.equals(MappedBusinessEntity.REC_REMOVE)) {
             
             // Confirm remove with the client
            if (!"REMOVE_CONF".equals(request.getActionCode())) {
                throw new ServiceResponseException(ServiceResponseFactory.getWarningFailResponse("REMOVE_CONF", messageHelper.getMessage("operation.scorecardtpl.remove_confirmation")));       
            }
            
            // Ensure the criterias are loaded so that they are removed
            revEntity.getCriteriaTplList();
             
         } else {
        
            // Saving
            Scorecard scorecard = scorecardDao.findOne((Integer)request.context.get("scorecardId"));
              
            // Loop through the scorecard.criteriaList
            List<Criteria> criteriaList = scorecard.getCriteriaList();

            for(Criteria criteria : criteriaList) {

                CriteriaTpl criteriaTpl = new CriteriaTpl();
                criteriaTpl.setName(criteria.getName());
                criteriaTpl.setDescription(criteria.getDescription());
                criteriaTpl.setWeight(criteria.getWeight());
                criteriaTpl.setScorecardTpl(revEntity);
                
                executeSave(criteriaTplDao, criteriaTpl);
               
            }
            
             return messageHelper.getMessage("operation.template.created");
            
         }
         
         return null;
         
        
       
    }
    
    protected void createScore(Option option, Criteria criteria, Evaluator evaluator) {
        logger.trace("createScore");

        Score score = new Score();

        score.setOption(option);
        score.setCriteria(criteria);
        score.setEvaluator(evaluator);
        score.setScore(0);  // Default score to zero and ignore in totals for all

        executeSave(scoreDao, score);

    }


    
  
    
}