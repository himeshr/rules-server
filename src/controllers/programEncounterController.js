import rulesService from '../service/RulesService';
import {programEncounter} from '../RuleExecutor';

const generateRules = (req, res, next) => {
  rulesService.findRulesById(req.body, res, next) 
    .then(async function (data) {
        const rulevalidated = await programEncounter(JSON.parse(JSON.stringify(data))[0].rules,req.body);
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

const visitScheduleRules = (req, res, next) => {
  rulesService.findRulesById(req.body, res, next) 
    .then(async function (data) {
        const rulevalidated = await programEncounter(JSON.parse(JSON.stringify(data))[0].rules,req.body);
        res.status(200)
            .json({
                status: 'success',
                visitSchedules: rulevalidated
            });
    })
      .catch(function (err) {
        return next(err);
      });
}

const validationRules = (req, res, next) => {
  rulesService.findRulesById(req.body, res, next)
    .then(async function (data) {
        const rulevalidated = await programEncounter(JSON.parse(JSON.stringify(data))[0].rules,req.body);
        res.status(200)
            .json({
                status: 'success',
                formValidate: rulevalidated
            });
    })
      .catch(function (err) {
        return next(err);
      });

}

module.exports = {
  generateRules: generateRules,
  visitScheduleRules : visitScheduleRules,
  validationRules: validationRules
};
