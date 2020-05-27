import * as rulesConfig from 'rules-config';
import lodash from 'lodash';
import moment from 'moment';
import * as models  from "openchs-models";

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

export const workListRule = async (rule,entity,workLists) => {
    const ruleFunc = eval(rule);
    const workList = ruleFunc({
        params: { workLists, context:entity },
        imports: { rulesConfig, lodash, moment, models }
    });
    return workList;
}