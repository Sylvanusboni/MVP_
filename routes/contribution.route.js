const Contribution = require('../controllers/contribution.controller');
const Interswitch = require('../controllers/interswitch');
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/contribution/create:
 *   post:
 *     summary: Crée un nouveau groupe de contribution
 *     tags: [Contribution]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               frequency:
 *                 type: string
 *               contributionAmount:
 *                 type: number
 *               admin:
 *                 type: string
 *     responses:
 *       200:
 *         description: Groupe créé avec succès
 *       404:
 *         description: Erreur serveur
 */
router.post('/create', Contribution.createGroup);

/**
 * @swagger
 * /api/contribution/:
 *   patch:
 *     summary: Met à jour un groupe de contribution
 *     tags: [Contribution]
 *     parameters:
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               frequency:
 *                 type: string
 *               contributionAmount:
 *                 type: number
 *               times:
 *                 type: number
 *     responses:
 *       200:
 *         description: Groupe mis à jour avec succès
 *       404:
 *         description: Erreur serveur
 */
router.patch('/', Contribution.update);

/**
 * @swagger
 * /api/contribution/user:
 *   get:
 *     summary: Récupère les groupes d'un utilisateur
 *     tags: [Contribution]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Groupes récupérés avec succès
 *       404:
 *         description: Utilisateur inconnu ou erreur serveur
 */
router.get('/user', Contribution.getUserGroups);

/**
 * @swagger
 * /api/contribution/members:
 *   get:
 *     summary: Récupère les membres d'un groupe
 *     tags: [Contribution]
 *     parameters:
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Membres récupérés avec succès
 *       404:
 *         description: Groupe non trouvé ou erreur serveur
 */
router.get('/members', Contribution.getMembers);

/**
 * @swagger
 * /api/contribution/invite:
 *   post:
 *     summary: Invite des membres à rejoindre un groupe
 *     tags: [Contribution]
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
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invitations envoyées avec succès
 *       404:
 *         description: Groupe non trouvé ou erreur serveur
 */
router.post('/invite', Contribution.inviteMembers);

/**
 * @swagger
 * /api/contribution/pay:
 *   post:
 *     summary: Effectue un paiement de contribution
 *     tags: [Contribution]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               groupId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Paiement effectué avec succès
 *       404:
 *         description: Utilisateur inconnu ou erreur serveur
 */
router.post('/pay', Contribution.payContibution);

/**
 * @swagger
 * /api/contribution/collect:
 *   post:
 *     summary: Collecte les fonds d'un groupe de contribution
 *     description: Permet à l'administrateur d'un groupe de collecter les fonds disponibles dans le groupe.
 *     tags: [Contribution]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur administrateur du groupe.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: string
 *                 description: ID du groupe de contribution.
 *               accountNumber:
 *                 type: string
 *                 description: Numéro de compte bancaire du bénéficiaire.
 *               bankCode:
 *                 type: string
 *                 description: Code de la banque du bénéficiaire.
 *               amount:
 *                 type: number
 *                 description: Montant à collecter.
 *             required:
 *               - groupId
 *               - accountNumber
 *               - bankCode
 *               - amount
 *     responses:
 *       200:
 *         description: Fonds collectés avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Funds Collected"
 *       400:
 *         description: Données manquantes ou invalides.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Need this informations"
 *       403:
 *         description: Non autorisé. Seul l'administrateur peut collecter les fonds.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized! Only Admin can collect"
 *       404:
 *         description: Utilisateur inconnu, groupe inconnu, ou solde insuffisant.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unknown User"
 *       500:
 *         description: Erreur lors du transfert ou erreur serveur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Transfer Error"
 */
router.post('/collect', Interswitch.collectContribution);

module.exports = router;