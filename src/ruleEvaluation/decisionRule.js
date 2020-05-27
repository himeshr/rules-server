import * as rulesConfig from 'rules-config';
import lodash from 'lodash';
import moment from 'moment';

export const decisionRule = async (rule,entity) => {
    const defaultDecisions = {
        "enrolmentDecisions": [],
        "encounterDecisions": [],
        "registrationDecisions": []
    };
    const ruleFunc = eval(rule);
    const ruleDecisions = ruleFunc({
        params: {decisions: defaultDecisions, entity},
        imports: {rulesConfig, lodash, moment}
    });
    return ruleDecisions;
}

export const visitScheduleRule = async (rule,entity,scheduledVisits) => {
    const ruleFunc = eval(rule);
    const nextVisits = ruleFunc({
        params: { visitSchedule: scheduledVisits, entity },
        imports: { rulesConfig, lodash, moment }
    });
    return nextVisits;
}

export const summaryRule = async (rule,entity) => {
console.log(entity.findObservationInEntireEnrolment('R15 number'));
    const ruleFunc = eval(rule);
    const ruleSummaries = ruleFunc({

        params: {entity},
        imports: { rulesConfig, lodash , moment }
    });
    return ruleSummaries;
}