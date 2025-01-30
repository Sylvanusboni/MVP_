const express = require('express');
const campaignController = require('../controllers/campaign.controller');

const router = express.Router();

router.post('/create', campaignController.create);
router.get('/', campaignController.get);
router.get('/', campaignController.getUserCampaigns);
router.post('/donate', donateToCampaign);
router.post('/contribute', contributeToCampaign);

module.exports = router;
