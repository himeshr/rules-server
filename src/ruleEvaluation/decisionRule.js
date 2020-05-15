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

export const enrolmentEligibilityCheckRule = async (rule,entity) => {
    const ruleFunc = eval(rule);
    const ruleProgramEnrolmentChecks = ruleFunc({
        params: {entity},
        imports: {rulesConfig, lodash , moment}
    });
    return ruleProgramEnrolmentChecks;
}

export const encounterEligibilityCheckRule = async (rule,entity) => {
    const ruleFunc = eval(rule);
    const ruleEncounterChecks = ruleFunc({
        params: {entity},
        imports: {rulesConfig, lodash , moment}
    });
    return ruleEncounterChecks;
}

export const validationRule = async (rule,entity) => {
    const ruleFunc = eval(rule);
    const ruleValidations = ruleFunc({
        params: {entity},
        imports: { rulesConfig, lodash , moment }
    });
    return ruleValidations;
}