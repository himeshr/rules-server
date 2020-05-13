import BaseService from "./BaseService";

class RulesService extends BaseService{
    findRulesById (req, res, next) {
        let ruleQuery = "";
        if(req.rule){
            switch(req.rule.ruleType){
                case 'Decision': ruleQuery = 'select decision_rule as rules from form where uuid = $1';
                                 break;
                case 'VisitSchedule': ruleQuery = 'select visit_schedule_rule as rules from form where uuid = $1';
                                 break;
                case 'FormValidation' : ruleQuery = 'select validation_rule as rules from form where uuid = $1';
                            break;
                case 'EnrolmentEligibilityCheck' : ruleQuery = 'select enrolment_eligibility_check_rule as rules from program inner join program_enrolment on program.id=program_enrolment.program_id where program_enrolment.uuid = $1';
  						break;

            }
        }
        return this.db.any(ruleQuery, [req.rule.formUuid])
    }
}

export default new RulesService();
