const Interswitch = require('../controllers/interswitch');

const express = require('express');
const router = express.Router();

router.get('/token', Interswitch.getToken);

router.post('/callback', Interswitch.callback);

router.post('/start', Interswitch.start)

router.post('/validate', Interswitch.validatCard);

router.post('/transfer', Interswitch.transfertFunds);

module.exports = router;