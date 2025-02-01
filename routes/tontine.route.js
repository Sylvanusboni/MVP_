const express = require('express');
const router = express.Router();
const Tontine = require('../controllers/tontine.controller');

router.get('/user', Tontine.getUserTontine);

router.post('/create', Tontine.create);

router.post('/start/:tontineId', Tontine.start);

router.post('/invite', Tontine.inviteMembers);

router.get('/cycle', Tontine.getCycle);

router.patch('/', Tontine.updateCycle);

router.get('/member', Tontine.getMembers);

router.post('/pay', Tontine.payTontine);

router.post('/collect', Tontine.collectTontine);

module.exports = router;