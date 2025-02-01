const Contribution = require('../controllers/contribution.controller');
const Interswitch = require('../controllers/interswitch');
const express = require('express');
const router = express.Router();

router.post('/create', Contribution.createGroup);

router.patch('/', Contribution.update);

router.get('/user', Contribution.getUserGroups);

router.get('/members', Contribution.getMembers);

router.post('/invite', Contribution.inviteMembers);

router.post('/pay', Contribution.payContibution);

router.post('/collect', Interswitch.collectContribution);

module.exports = router;