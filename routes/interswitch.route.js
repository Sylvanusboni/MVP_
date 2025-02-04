const Interswitch = require('../controllers/interswitch');

const express = require('express');
const router = express.Router();

router.get('/token', Interswitch.getToken);

router.post('/callback', Interswitch.callback);

/**
 * @swagger
 * /api/interswitch/validate:
 *   post:
 *     summary: Valide les informations d'une carte ou d'un compte bancaire
 *     description: Utilise l'API Interswitch pour valider les informations d'un compte bancaire (numéro de compte et code de banque).
 *     tags: [Contribution]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountNumber:
 *                 type: string
 *                 description: Numéro de compte bancaire à valider.
 *               bankCode:
 *                 type: string
 *                 description: Code de la banque associée au compte.
 *             required:
 *               - accountNumber
 *               - bankCode
 *     responses:
 *       200:
 *         description: Validation réussie. Retourne les informations du compte.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   description: Réponse de l'API Interswitch contenant les informations du compte.
 *       404:
 *         description: Erreur lors de la validation du compte.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur lors de la validation du compte"
 *                 error:
 *                   type: string
 *                   description: Détails de l'erreur.
 *       500:
 *         description: Erreur serveur lors de la communication avec l'API Interswitch.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur serveur"
 *                 error:
 *                   type: string
 *                   description: Détails de l'erreur.
 */
router.post('/start', Interswitch.start)

router.post('/validate', Interswitch.validatCard);

router.post('/transfer', Interswitch.transfertFunds);

module.exports = router;