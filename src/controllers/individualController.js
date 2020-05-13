import rulesService from '../service/RulesService';
import {individualRegistration} from '../RuleExecutor';
import {individualValidationRegistration} from '../RuleExecutor';


const decisionRules = (req, res, next) => {
  rulesService.findRulesById(req.body, res, next) 
    .then(async function (data) {
        const rulevalidated = await individualRegistration(JSON.parse(JSON.stringify(data))[0].rules,req.body);
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


const validationRules = (req, res, next) => {

  rulesService.findRulesById(req.body, res, next) 
    .then(async function (data) {
        const rulevalidated = await individualValidationRegistration(JSON.parse(JSON.stringify(data))[0].rules,req.body);
        console.log(rulevalidated);
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
    decisionRules: decisionRules,
    validationRules: validationRules
};
