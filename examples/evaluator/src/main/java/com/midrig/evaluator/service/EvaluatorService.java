package com.midrig.evaluator.service;

import com.midrig.baff.app.service.ServiceRequest;
import com.midrig.baff.app.service.ServiceResponse;
import com.midrig.evaluator.domain.Analysis;
import com.midrig.evaluator.domain.ChartSeries;
import com.midrig.evaluator.domain.Criteria;
import com.midrig.evaluator.domain.CriteriaTpl;
import com.midrig.evaluator.domain.EvalGroup;
import com.midrig.evaluator.domain.EvalTreeNode;
import com.midrig.evaluator.domain.Evaluator;
import com.midrig.evaluator.domain.GroupForEval;
import com.midrig.evaluator.domain.Option;
import com.midrig.evaluator.domain.Score;
import com.midrig.evaluator.domain.Scorecard;
import com.midrig.evaluator.domain.ScorecardTpl;


public interface EvaluatorService {

    public ServiceResponse<EvalGroup> findEvalGroup(ServiceRequest<Integer> request);
    public ServiceResponse<EvalGroup> findAllEvalGroups(ServiceRequest<Integer> request);
    public ServiceResponse<EvalGroup> saveEvalGroup(ServiceRequest<Integer> request, String username);
    public ServiceResponse<EvalGroup> removeEvalGroup(ServiceRequest<Integer> request);  
    public ServiceResponse<GroupForEval> findEvalGroupsByEvaluator(ServiceRequest<Integer> request);
    
    public ServiceResponse<Evaluator> findEvaluator(ServiceRequest<Integer> request);
    public ServiceResponse<Evaluator> findAllEvaluators(ServiceRequest<Integer> request);
    public ServiceResponse<Evaluator> saveEvaluator(ServiceRequest<Integer> request);
    public ServiceResponse<Evaluator> removeEvaluator(ServiceRequest<Integer> request);
    
    public ServiceResponse<Scorecard> findScorecard(ServiceRequest<Integer> request);
    public ServiceResponse<Scorecard> findAllScorecards(ServiceRequest<Integer> request);
    public ServiceResponse<Scorecard> saveScorecard(ServiceRequest<Integer> request);
    public ServiceResponse<Scorecard> removeScorecard(ServiceRequest<Integer> request);
    
    public ServiceResponse<Criteria> findCriteria(ServiceRequest<Integer> request);
    public ServiceResponse<Criteria> findAllCriterias(ServiceRequest<Integer> request);
    public ServiceResponse<Criteria> saveCriteria(ServiceRequest<Integer> request);
    public ServiceResponse<Criteria> removeCriteria(ServiceRequest<Integer> request);
    
    public ServiceResponse<Option> findOption(ServiceRequest<Integer> request);
    public ServiceResponse<Option> findAllOptions(ServiceRequest<Integer> request);
    public ServiceResponse<Option> saveOption(ServiceRequest<Integer> request);
    public ServiceResponse<Option> removeOption(ServiceRequest<Integer> request);
    
    public ServiceResponse<Score> findScore(ServiceRequest<Integer> request);
    public ServiceResponse<Score> findAllScores(ServiceRequest<Integer> request);
    public ServiceResponse<Score> saveScore(ServiceRequest<Integer> request);
    public ServiceResponse<Score> removeScore(ServiceRequest<Integer> request);
    
    public ServiceResponse<Analysis> findAllAnalysis(ServiceRequest<Integer> request);
    public ServiceResponse<ChartSeries> findChartSeries(ServiceRequest<Integer> request);
    
    public ServiceResponse<ScorecardTpl> findScorecardTpl(ServiceRequest<Integer> request);
    public ServiceResponse<ScorecardTpl> findAllScorecardTpls(ServiceRequest<Integer> request);
    public ServiceResponse<CriteriaTpl> findAllCriteriaTpls(ServiceRequest<Integer> request);
    public ServiceResponse<ScorecardTpl> createScorecardTpl(ServiceRequest<Integer> request);
    public ServiceResponse<ScorecardTpl> removeScorecardTpl(ServiceRequest<Integer> request);
    
    public ServiceResponse<EvalTreeNode> findEvalTreeNode(ServiceRequest<String> request, String username);
    
    

}