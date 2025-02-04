const express = require('express');
const campaignController = require('../controllers/campaign.controller');
const Interswitch = require('../controllers/interswitch')

const router = express.Router();

/**
* @swagger
* /api/campaign/create:
*   post:
*     summary: Create a new campaign
*     tags: [Campaigns]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               title:
*                 type: string
*               description:
*                 type: string
*               goalAmount:
*                 type: number
*               images:
*                 type: array
*                 items:
*                   type: string
*     responses:
*       200:
*         description: Campaign created successfully
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
*         description: Server Error
*/
router.post('/create', campaignController.create);

/**
 * @swagger
 * /api/campaign/:
 *   get:
 *     summary: Get all campaigns
 *     tags: [Campaigns]
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: Campaign getting error
 */

router.get('/', campaignController.get);

/**
 * @swagger
 * /api/campaign/user:
 *   get:
 *     summary: Get campaigns created by a user
 *     tags: [Campaigns]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of user campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: Unknown User
 */

router.get('/user', campaignController.getUserCampaigns);

/**

 * @swagger

 * /api/campaign/donate:
 *   post:
 *     summary: Donate to a campaign
 *     tags: [Campaigns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campaignId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Donation successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Donation Error
 */

router.post('/donate', campaignController.donateToCampaign);

/**

 * @swagger
 * /api/campaign/contribute:
 *   post:
 *     summary: Contribute to a campaign externally
 *     tags: [Campaigns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campaignId:
 *                 type: string
 *               email:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Contribution successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Donation Error
 */
router.post('/contribute', campaignController.externalContribution);

/**
 * @swagger

 * /api/campaign/collect:
 *   post:
 *     summary: Collect funds from a campaign
 *     tags: [Campaigns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campaignId:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               bankCode:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Funds collected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       404:
 *         description: Transfer Error
 */

router.post('/collect', Interswitch.collectCampaignFunds)

module.exports = router;
