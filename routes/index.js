var express = require('express');
var router = express.Router();

var programEncounterController = require('../src/controllers/programEncounterController');
var individualController = require('../src/controllers/individualController');
var programEnrolmentController = require('../src/controllers/programEnrolmentController');
var encounterController = require('../src/controllers/encounterController');


router.post('/api/program_encounter_rule', programEncounterController.generateRules);

router.post('/api/encounter_rule', encounterController.generateRules);

router.post('/api/individual_rule', individualController.decisionRules);

router.post('/api/program_enrolment_rule',programEnrolmentController.decisionRules);

router.post('/api/individual_validation_rule',individualController.validationRules);

router.post('/api/program_enrolment_check_rule',programEnrolmentController.programEnrolmentCheckRules);

module.exports = router;