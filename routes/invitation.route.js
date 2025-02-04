const Invitation = require('../controllers/invitation.controller');
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/invitation/:
 *   get:
 *     summary: Get pending invitations for a user
 *     tags: [Invitations]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         description: ID of the user to get invitations for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of pending invitations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   email:
 *                     type: string
 *                   status:
 *                     type: string
 *                   invitedBy:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                   groupId:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *       404:
 *         description: Unknown User
 */
router.get('/', Invitation.get);

/**
 * @swagger
 * /api/invitation/view:
 *   post:
 *     summary: View all invitations for a user
 *     tags: [Invitations]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         description: ID of the user to view invitations for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of viewed invitations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: Unknown User
 */
router.post('/view', Invitation.viewAll);

/**
 * @swagger
 * /api/invitation/group:
 *   get:
 *     summary: Get group details for an invitation
 *     tags: [Invitations]
 *     parameters:
 *       - in: query
 *         name: groupId
 *         required: true
 *         description: ID of the group
 *         schema:
 *           type: string
 *       - in: query
 *         name: invitationId
 *         required: true
 *         description: ID of the invitation
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *       404:
 *         description: Unknown Invitation or Set Ids
 */

router.get('/group', Invitation.getGroup);

/**
 * @swagger
 * /api/invitation/reply:
 *   post:
 *     summary: Respond to an invitation
 *     tags: [Invitations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invitationId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, declined]
 *     responses:
 *       200:
 *         description: Invitation responded successfully
 *       404:
 *         description: Set the invitation Id or Undefined Invitation
 */
router.post('/reply', Invitation.respondInvitation);

module.exports = router;
