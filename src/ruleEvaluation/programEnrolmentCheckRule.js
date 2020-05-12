import * as rulesConfig from 'rules-config';
import lodash from 'lodash';
import moment from 'moment';

export const programEnrolmentCheckRule = async (rule,entity) => {
    const defaultDecisions = {
        "visibility":''
    };
    const ruleFunc = eval(rule);
    const ruleProgramEnrolmentChecks = ruleFunc({
        params: {decisions: defaultDecisions, entity},
        imports: {rulesConfig, lodash , moment}
    });
    return ruleProgramEnrolmentChecks;
}