import BaseService from "./BaseService";

class RulesService extends BaseService{
    findRulesById (req, res, next) {
        if(req.rule && req.rule.ruleType == 'Decision'){
            return this.db.any('select decision_rule as rules from form where uuid = $1', [req.rule.formUuid]);
        }
	else if(req.rule && req.rule.ruleType == 'Validation'){
            return this.db.any('select validation_rule as rules from form where uuid = $1', [req.rule.formUuid]);
        }
     else if(req.rule && req.rule.ruleType == 'ProgramEnrolmentCheck'){
            return this.db.any('SELECT enrolment_eligibility_check_rule as rules from program inner join program_enrolment on  program.id=program_enrolment.program_id where uuid = $1', [req.rule.programUuid]);
                }
    }
}

export default new RulesService();