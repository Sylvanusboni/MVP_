const express = require('express');
const campaignController = require('../controllers/campaign.controller');
const Interswitch = require('../controllers/interswitch')

const router = express.Router();

router.post('/create', campaignController.create);
router.get('/', campaignController.get);
router.get('/user', campaignController.getUserCampaigns);
router.post('/donate', campaignController.donateToCampaign);
router.post('/contribute', campaignController.externalContribution);
router.post('/collect', Interswitch.collectCampaignFunds)

module.exports = router;
