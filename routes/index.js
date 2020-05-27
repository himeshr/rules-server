var express = require('express');
var router = express.Router();

var programEncounterController = require('../src/controllers/programEncounterController');
var individualController = require('../src/controllers/individualController');
var programEnrolmentController = require('../src/controllers/programEnrolmentController');
var encounterController = require('../src/controllers/encounterController');


router.post('/api/decision_program_encounter_rule', programEncounterController.generateRules);

router.post('/api/decision_encounter_rule', encounterController.generateRules);

router.post('/api/decision_individual_rule', individualController.decisionRules);

router.post('/api/decision_program_enrolment_rule',programEnrolmentController.decisionRules);

router.post('/api/visitschedule_program_enrolment_rule',programEnrolmentController.visitScheduleRules);

/** Encounter VisitSchedule , Not in scope of 2nd Release*/
// router.post('/api/visitschedule_encounter_rule',encounterController.visitScheduleRules);

router.post('/api/visitschedule_program_encounter_rule',programEncounterController.visitScheduleRules);

router.post('/api/worklist_individual_rule',individualController.workListRules);

module.exports = router;