const express = require('express');
const router = express.Router();
const Transaction = require('../controllers/transaction.controller')

/**
 * @swagger
 * /api/transaction/complete:
 *   post:
 *     summary: Complete a transaction
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionReference:
 *                 type: string
 *               email:
 *                 type: string
 *               userId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Transaction completed successfully
 *       404:
 *         description: Need Trans Reference and Amount to confirm, Unknown Transaction, Campaign not found, Unknown Tontine, Unexisting Cycle, Member not registered in this Tontine, or Member not found
 */
router.post('/complete', Transaction.complete);

/**
 * @swagger
 * /api/transaction/user-transactions:
 *   get:
 *     summary: Get transactions for a user
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         description: ID of the user to get transactions for
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of transactions per page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of transactions for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: Unknown User
 */

router.get('/user-transactions', Transaction.getUserTransaction);

module.exports = router;