import {createEntity} from './models/programEncounterModel';
import {mapEncounter} from './models/encounterModel';
import { mapProfile } from './models/individualModel';
import { mapProgramEnrolment } from './models/programEnrolmentModel';
import {decisionRule} from './ruleEvaluation/decisionRule';
import {validationRule} from './ruleEvaluation/validationRule';
import {programEnrolmentCheckRule} from './ruleEvaluation/programEnrolmentCheckRule';

export const programEncounter = async (rule,request) => {
    return decisionRule(rule,createEntity(request));
}

export const encounter = async (rule,request) => {
    return decisionRule(rule,mapEncounter(request));
}

export const individualRegistration = async (rule,request) => {
    return decisionRule(rule,mapProfile(request));
}

export const individualValidationRegistration = async (rule,request) => {
    return validationRule(rule,mapProfile(request));
}

export const programEnrolment = async (rule,request) => {
    return decisionRule(rule,mapProgramEnrolment(request));
}

export const programEnrolmentCheck = async (rule,request) => {
    return programEnrolmentCheckRule(rule,mapProgramEnrolment(request));
}
