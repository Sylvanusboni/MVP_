const express = require('express');
const router = express.Router();
const Transaction = require('../controllers/transaction.controller')

router.post('/complete', Transaction.complete);

module.exports = router;