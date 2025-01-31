const Invitation = require('../controllers/invitation.controller');
const express = require('express');
const router = express.Router();

router.get('/', Invitation.get);

router.post('/view', Invitation.viewAll);

router.get('/group', Invitation.getGroup);

router.post('/reply', Invitation.respondInvitation);

module.exports = router;
