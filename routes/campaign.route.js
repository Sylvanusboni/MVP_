const express = require('express');
const { createCampaign, getCampaigns, donateToCampaign,  contributeToCampaign} = require('../controllers/campaign.controller');

const router = express.Router();

router.post('/create', createCampaign);
router.get('/', getCampaigns);
router.post('/donate', donateToCampaign);
router.post('/contribute', contributeToCampaign);

module.exports = router;
