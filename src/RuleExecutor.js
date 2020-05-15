import {createEntity} from './models/programEncounterModel';
import {mapEncounter} from './models/encounterModel';
import { mapProfile } from './models/individualModel';
import { mapProgramEnrolment } from './models/programEnrolmentModel';
import {decisionRule,visitScheduleRule,enrolmentEligibilityCheckRule, encounterEligibilityCheckRule, validationRule} from './ruleEvaluation/decisionRule';

const convertDateTomilliseconds = (visitSchedules) => {
    visitSchedules.forEach((visitSchedule, index, array) => {
        array[index].maxDate = visitSchedule.maxDate ? new Date(visitSchedule.maxDate).getTime(): null;
        array[index].earliestDate = visitSchedule.earliestDate ? new Date(visitSchedule.earliestDate).getTime():null;
    });
    return visitSchedules;
}

export const programEncounter = async (rule,request) => {
    switch(request.rule.ruleType){
        case 'Decision' : return decisionRule(rule,createEntity(request));
        case 'VisitSchedule' : return convertDateTomilliseconds(await visitScheduleRule(rule,createEntity(request),request.visitSchedules));
         case 'FormValidation' : return validationRule(rule,createEntity(request));
    }
}

export const encounter = async (rule,request) => {
    switch(request.rule.ruleType){
        case 'Decision' : return decisionRule(rule,mapEncounter(request));
        case 'VisitSchedule' : return visitScheduleRule(rule,mapEncounter(request),request.visitSchedules);
        case 'EncounterEligibilityCheck' : return encounterEligibilityCheckRule(rule,mapEncounter(request).individual);
        case 'FormValidation' : return validationRule(rule,mapEncounter(request));
    }
}

export const individualRegistration = async (rule,request) => {
    switch(request.rule.ruleType){
        case 'Decision' : return decisionRule(rule,mapProfile(request));
        case 'FormValidation' : return validationRule(rule,mapProfile(request));
    }
}

export const programEnrolment = async (rule,request) => {
    switch(request.rule.ruleType){
        case 'Decision' : return decisionRule(rule,mapProgramEnrolment(request));
        case 'VisitSchedule' : return convertDateTomilliseconds(await visitScheduleRule(rule,mapProgramEnrolment(request),request.visitSchedules));
        case 'FormValidation' : return validationRule(rule,mapProgramEnrolment(request));
        case 'EnrolmentEligibilityCheck' : return enrolmentEligibilityCheckRule(rule,mapProgramEnrolment(request).individual);
    }
}
