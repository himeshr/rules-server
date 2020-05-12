import rulesService from '../service/RulesService';
import {programEnrolment} from '../RuleExecutor';
import {programEnrolmentCheck} from '../RuleExecutor';

const decisionRules = (req, res, next) => {
  rulesService.findRulesById(req.body, res, next) 
    .then(async function (data) {
        const rulevalidated = await programEnrolment(JSON.parse(JSON.stringify(data))[0].rules,req.body);
        res.status(200)
            .json({
                status: 'success',
                data: rulevalidated
            });
    })
      .catch(function (err) {
        return next(err);
      });
}

const programEnrolmentCheckRules = (req, res, next) => {
  rulesService.findRulesById(req.body, res, next)
    .then(async function (data) {
        const rulevalidated = await programEnrolmentCheck(JSON.parse(JSON.stringify(data))[0].rules,req.body);
        res.status(200)
            .json({
                status: 'success',
                data: rulevalidated
            });
    })
      .catch(function (err) {
        return next(err);
      });
}

module.exports = {
    decisionRules: decisionRules,
    programEnrolmentCheckRules: programEnrolmentCheckRules
};