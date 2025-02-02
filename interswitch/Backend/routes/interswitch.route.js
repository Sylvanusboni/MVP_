const Interswitch = require('../controllers/interswitch');

const express = require('express');
const router = express.Router();

router.get('/token', Interswitch.getToken);

router.post('/callback', Interswitch.callback);

router.post('/start', Interswitch.start)

module.exports = router;