import {mapForm} from "../models/FormModel";
import {
    chain,
    differenceWith,
    filter,
    find,
    flatMap,
    forEach,
    get,
    head,
    isEmpty,
    isNil,
    map,
    remove,
    replace,
    size,
    startCase,
    toNumber,
    trim
} from 'lodash';
import {
    Concept,
    FormElementGroup,
    MultipleCodedValues,
    ObservationsHolder,
    SingleCodedValue,
    ValidationResult,
} from "openchs-models";
import moment from "moment";
import {decisionRule, getFormElementsStatuses, visitScheduleRule} from "../services/RuleEvalService";
import {mapIndividual} from "../models/individualModel";
import {mapEncounter} from "../models/encounterModel";
import {mapProgramEncounter} from "../models/programEncounterModel";
import {mapProgramEnrolment} from "../models/programEnrolmentModel";
import {transformVisitScheduleDates} from "../RuleExecutor";

const DATE_FORMAT = `YYYY-MM-DD`;

const formTypeToEntityMapper = {
    IndividualProfile: mapIndividual,
    Encounter: mapEncounter,
    ProgramEncounter: mapProgramEncounter,
    ProgramEnrolment: mapProgramEnrolment,
};

export const BuildObservations = async ({row, form, entity}) => {
    const entityModel = formTypeToEntityMapper[form.formType](entity);
    const observationsHolder = new ObservationsHolder(entityModel.observations);
    const errors = [];
    const formModel = mapForm(form);
    const allValidationResults = [];
    const handleValidationResults = (validationResults) => {
        validationResults.forEach((validationResult) => handleValidationResult(validationResult));
    };
    const handleValidationResult = (validationResult) => {
        remove(allValidationResults, (existingValidationResult) => existingValidationResult.formIdentifier === validationResult.formIdentifier);
        if (!validationResult.success) {
            allValidationResults.push(validationResult);
        }
    };
    forEach(formModel.getFormElementGroups(), (feg) => {
        forEach(feg.getFormElements(), fe => {
            const concept = fe.concept;
            const obsValue = addObservationValue(observationsHolder, concept, fe, trim(row[concept.name]), errors);
            entityModel.observations = observationsHolder.observations;
            const formElementStatuses = getFormElementStatuses(entityModel, feg, observationsHolder);
            const filteredFormElements = FormElementGroup._sortedFormElements(feg.filterElements(formElementStatuses));
            observationsHolder.updatePrimitiveCodedObs(filteredFormElements, formElementStatuses);
            const currentFormElementStatus = find(formElementStatuses, ({uuid}) => uuid === fe.uuid);
            const validationResults = validate(
                fe,
                obsValue,
                observationsHolder.observations,
                allValidationResults,
                formElementStatuses
            );
            handleValidationResults(validationResults);
        })
    });
    pushErrorMessages(formModel, allValidationResults, errors);
    const observations = map(entityModel.observations, (obs) => obs.toResource);
    const responseObject = {observations, errors};

    if (size(errors) > 0) {
        //return fast and don't run rules
        return responseObject
    }
    if (!isEmpty(formModel.decisionRule)) {
        const payload = {decisionCode: formModel.decisionRule, formUuid: formModel.uuid};
        responseObject.decisions = await decisionRule(payload, entityModel);
    }
    if (!isEmpty(formModel.visitScheduleRule)) {
        const payload = {visitScheduleCode: formModel.visitScheduleRule, formUuid: formModel.uuid};
        responseObject.visitSchedules = transformVisitScheduleDates(await visitScheduleRule(payload, entityModel, []));
    }
    return responseObject;
};

const pushErrorMessages = (form, allValidationResults, errors) => {
    const validationErrors = filter(allValidationResults, ({success}) => !success);
    if (size(validationErrors) === 0) {
        return
    }
    forEach(validationErrors, ({formIdentifier, messageKey}) => {
        const formElement = getFormElementByUUID(form, formIdentifier);
        const readableMessage = messageKey === 'emptyValidationMessage' ? 'Empty value not allowed' : startCase(messageKey);
        errors.push(`Concept: "${get(formElement, 'concept.name')}" Error message: "${readableMessage}."`)
    })
};

function addObservationValue(observationsHolder, concept, fe, answerValue, errors) {
    switch (concept.datatype) {
        case Concept.dataType.Coded:
            if (fe.isMultiSelect()) {
                const providedAnswers = splitMultiSelectAnswer(answerValue);
                const answerUUIDs = [];
                forEach(providedAnswers, answerName => {
                    const conceptAnswer = concept.getAnswerWithConceptName(answerName);
                    if (!isNil(conceptAnswer)) {
                        answerUUIDs.push(conceptAnswer.concept.uuid)
                    } else {
                        errors.push(`Concept: "${concept.name}" Error message: "Answer concept ${answerName} not found."`)
                    }
                });
                observationsHolder.addOrUpdateObservation(concept, answerUUIDs);
                return new MultipleCodedValues(answerUUIDs);
            } else {
                const conceptAnswer = concept.getAnswerWithConceptName(answerValue);
                if (!isNil(conceptAnswer)) {
                    observationsHolder.addOrUpdateObservation(concept, conceptAnswer.concept.uuid);
                    return new SingleCodedValue(conceptAnswer.concept.uuid);
                }
                errors.push(`Concept: "${concept.name}" Error message: "Answer concept ${conceptAnswer} not found."`);
            }
            break;
        case Concept.dataType.Numeric: {
            const value = toNumber(answerValue);
            observationsHolder.addOrUpdatePrimitiveObs(concept, value);
            return value;
        }
        case Concept.dataType.Date: {
            const value = moment(answerValue).format(DATE_FORMAT);
            observationsHolder.addOrUpdatePrimitiveObs(concept, value);
            return value;
        }
        case Concept.dataType.DateTime: {
            const value = moment(answerValue).toISOString();
            observationsHolder.addOrUpdatePrimitiveObs(concept, value);
            return value;
        }
        case Concept.dataType.PhoneNumber:
            observationsHolder.updatePhoneNumberValue(concept, answerValue, false);
            return answerValue;
        //TODO: subject, location and media are not supported
        default:
            observationsHolder.addOrUpdatePrimitiveObs(concept, answerValue);
            return answerValue;
    }
}

const getFormElementByUUID = (form, formElementUUID) => {
    let formElement;
    _.forEach(form.nonVoidedFormElementGroups(), (formElementGroup) => {
        const foundFormElement = _.find(
            formElementGroup.getFormElements(),
            (formElement) => formElement.uuid === formElementUUID
        );
        if (!_.isNil(foundFormElement)) formElement = foundFormElement;
    });
    return formElement;
};

const getFormElementStatuses = (entity, formElementGroup, observationsHolder) => {
    const formElementStatuses = getFormElementsStatuses(entity, formElementGroup);
    const filteredFormElements = FormElementGroup._sortedFormElements(
        formElementGroup.filterElements(formElementStatuses)
    );
    const removedObs = observationsHolder.removeNonApplicableObs(
        formElementGroup.getFormElements(),
        filteredFormElements
    );
    if (isEmpty(removedObs)) {
        return formElementStatuses;
    }
    return getFormElementStatuses(entity, formElementGroup, observationsHolder);
};

const splitMultiSelectAnswer = str => {
    return chain(str)
        .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
        .map(value => replace(trim(value), /"/g, ""))
        .value();
};

const getRuleValidationErrors = formElementStatuses => {
    return flatMap(
        formElementStatuses,
        status =>
            new ValidationResult(
                isEmpty(status.validationErrors),
                status.uuid,
                head(status.validationErrors)
            )
    );
};

const checkValidationResult = (ruleValidationErrors, validationResult) => {
    return map(ruleValidationErrors, error =>
        error.formIdentifier === validationResult.formIdentifier && !validationResult.success
            ? validationResult
            : error
    );
};

const addPreviousValidationErrors = (ruleValidationErrors, validationResult, previousErrors) => {
    const otherFEFailedStatuses = previousErrors.filter(
        ({formIdentifier, success}) => validationResult.formIdentifier !== formIdentifier && !success
    );
    return [
        ...checkValidationResult(ruleValidationErrors, validationResult),
        ...otherFEFailedStatuses
    ];
};

const validate = (formElement, value, observations, validationResults, formElementStatuses) => {
    const validationResult = formElement.validate(value);
    remove(
        validationResults,
        existingValidationResult =>
            existingValidationResult.formIdentifier === validationResult.formIdentifier
    );
    const ruleValidationErrors = getRuleValidationErrors(formElementStatuses);
    const hiddenFormElementStatus = filter(
        formElementStatuses,
        status => status.visibility === false
    );
    const ruleErrorsAdded = addPreviousValidationErrors(
        ruleValidationErrors,
        validationResult,
        validationResults
    );
    remove(ruleErrorsAdded, result => result.success);
    return differenceWith(
        ruleErrorsAdded,
        hiddenFormElementStatus,
        (a, b) => a.formIdentifier === b.uuid
    );
};