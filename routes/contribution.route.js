const Contribution = require('../controllers/contribution.controller');
const express = require('express');
const router = express.Router();

router.post('/create', Contribution.createGroup);

router.patch('/', Contribution.update);

router.get('/user', Contribution.getUserGroups);

router.post('/invite', Contribution.inviteMembers);

router.post('/pay', Contribution.payContibution);

router.post('/collect', Contribution.collect);

module.exports = router;