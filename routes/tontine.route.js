const express = require('express');
const router = express.Router();
const Tontine = require('../controllers/tontine.controller');
const interswitch = require('../controllers/interswitch')

/**

 * @swagger

 * /api/tontine/user/:
 *   get:
 *     summary: Get tontines for a user
 *     tags: [Tontine]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         description: ID of the user to get tontines for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of tontines and admin roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tontines:
 *                   type: array
 *                   items:
 *                     type: object
 *                 admins:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Unknown User
 */
router.get('/user', Tontine.getUserTontine);

/**
 * @swagger
 * /api/tontine/create:
 *   post:
 *     summary: Create a new tontine
 *     tags: [Tontine]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               contributionAmount:
 *                 type: number
 *               cycleDuration:
 *                 type: number
 *               members:
 *                 type: array
 *                 items:
 *                   type: object
 *               startDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Tontine created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 tontine:
 *                   type: object
 *       400:
 *         description: All fields are required
 *       404:
 *         description: Undefined User
 */
router.post('/create', Tontine.create);

/**
 * @swagger
 * /api/tontine/start/{tontineId}:
 *   post:
 *     summary: Start a tontine
 *     tags: [Tontine]
 *     parameters:
 *       - in: path
 *         name: tontineId
 *         required: true
 *         description: ID of the tontine to start
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tontine started successfully
 *       404:
 *         description: Tontine not found
 *       400:
 *         description: Tontine already started or completed
 *       403:
 *         description: Only admin can start tontine
 */
router.post('/start/:tontineId', Tontine.start);

/**
 * @swagger
 * /api/tontine/invite:
 *   post:
 *     summary: Invite members to a tontine
 *     tags: [Tontine]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: string
 *               emails:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Invitations sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       404:
 *         description: Group not found
 *       403:
 *         description: Only admin can invite members
 */
router.post('/invite', Tontine.inviteMembers);

/**
 * @swagger
 * /api/tontine/cycle:
 *   get:
 *     summary: Get cycles for a tontine
 *     tags: [Tontine]
 *     parameters:
 *       - in: query
 *         name: tontineId
 *         required: false
 *         description: ID of the tontine
 *         schema:
 *           type: string
 *       - in: query
 *         name: cycleId
 *         required: false
 *         description: ID of the cycle
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of cycles or a specific cycle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Set Ids or Undefined Tontine
 */
router.get('/cycle', Tontine.getCycle);

/**
 * @swagger
 * /api/tontine:
 *   patch:
 *     summary: Update a cycle
 *     tags: [Tontine]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cycleId:
 *                 type: string
 *               tontineId:
 *                 type: string
 *               beneficiary:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cycle updated successfully
 *       404:
 *         description: Undefined Cycle or Tontine
 */
router.patch('/', Tontine.updateCycle);

/**
 * @swagger
 * /api/tontine/member:
 *   get:
 *     summary: Get members of a tontine
 *     tags: [Tontine]
 *     parameters:
 *       - in: query
 *         name: tontineId
 *         required: true
 *         description: ID of the tontine
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of members
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Unknown Tontine
 */
router.get('/member', Tontine.getMembers);

/**
 * @swagger
 * /api/tontine/pay:
 *   post:
 *     summary: Pay contribution for a tontine cycle
 *     tags: [Tontine]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               cycleId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment initiated successfully
 *       404:
 *         description: Unknown User or Cycle
 */
router.post('/pay', Tontine.payTontine);

/**
 * @swagger
 * /api/tontine/collect:
 *   post:
 *     summary: Collect funds from a tontine cycle
 *     tags: [Tontine]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cycleId:
 *                 type: string
 *               amount:
 *                 type: number
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         description: ID of the user collecting funds
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Funds transferred successfully
 *       404:
 *         description: Unknown User, Unknown Cycle, Insufficient Funds, or Transfer Error
 *       403:
 *         description: Unauthorized! You are not the beneficiary of this cycle
 */
router.post('/collect', interswitch.collectTontine);

module.exports = router;