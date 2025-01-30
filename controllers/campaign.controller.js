const Campaign = require('../models/campaign.model');
const Contribution = require('../models/contribution.model');
const User = require('../models/user.model');

const campaignController = ({
    create: async (req, res) => {
        try {
            const { title, description, goalAmount } = req.body;
            
            const newCampaign = new Campaign({
                title,
                description,
                goalAmount,
                createdBy: req.user.id || req.query.userId,
            });

            await newCampaign.save();
            res.status(200).json({ message: 'Campaign created successfully', data: newCampaign });
        } catch (error) {
            res.status(404).json({ message: 'Server Error', error: error.message});
        }
    },
    getUserCampaigns: async(req, res) => {
        try {
            const userId = req.query.userId;

            const user = await User.findById(userId);

            if (!user)
                return res.status(404).json('Unknown User');
            const campaigns = await Campaign.find({
                createdBy: user._id,
                deleted: false
            }).select('title description goalAmount collectedAmount status createdAt updatedAt');
            return res.status(200).json(campaigns);
        } catch(error) {
            return res.status(404).json(error);
        }
    },
    get: async (req, res) => {
        try {
            const page = req.query.page || 1;
            const limits = req.query.limit || 10;
    
            const campaigns = await Campaign.find().limit(limits).skip((page - 1) * limits).populate('createdBy', 'name email');
            res.status(200).json(campaigns);    
        } catch (error) {
            res.status(404).json({message: 'Campaign getting error', error: error.message});
        }
    },
    donateToCampaign: async (req, res) => {
        try {
            const { campaignId, userId, amount } = req.body;
            const campaign = await Campaign.findById(campaignId);
    
            if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    
            campaign.collectedAmount += amount;
            campaign.contributors.push({userId, amount});
            await campaign.save();

            res.status(200).json({message: 'Donation successful', data: campaign});    
        } catch (error) {
            res.status(404).json({
                message: 'Donnation Error',
                error: error.message
            });
        }
    },
    externalContribution: async (req, res) => {
        try {
            const { campaignId, amount, email } = req.body;

            const campaign = await Campaign.findById(campaignId);
            if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    
            const newContribution = new Contribution({
                campaignId,
                email,
                amount,
            });
    
            await newContribution.save();
    
            campaign.collectedAmount += amount;
            campaign.externalContributions.push({ email, amount });
            await campaign.save();
    
            res.status(200).json({ message: 'Contribution successful', data: newContribution });
        } catch (error) {
            res.status(404).json({
                message: 'Donnation Error',
                error: error.message
            });
        }
    },
    getContributors: async(req, res) => {
        try {
            const {campaignId} = req.body;

            const campaign = await Campaign.findById(campaignId).populate('contributors.userId', 'name email');
            if (!campaign) {
                return res.status(404).json('Uniexisting Campaign');
            }
            return res.status(404).json({
                id: campaign._id,
                title: campaign.title,
                contributors: campaign.contributors
            });
        } catch (error) {
            return res.status(404).json({
                message: 'Getting Error',
                error: error.message                
            })
        }
    },
    getExternalContributors: async(req, res) => {
        try {
            const {campaignId} = req.body;

            const campaign = await Campaign.findById(campaignId).populate('externalContributions.userId', 'name email');
            if (!campaign) {
                return res.status(404).json('Uniexisting Campaign');
            }
            return res.status(404).json({
                id: campaign._id,
                title: campaign.title,
                contributions: campaign.externalContributions
            });
        } catch (error) {
            return res.status(404).json({
                message: 'Getting Error',
                error: error.message                
            })
        }
    },
    update: async(req, res) => {
        try {
            const {title, description, goalAmount, status} = req.body;
            const campaignId = req.query.campaignId || req.body.campaignId;

            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                return res.status(404).json('Unexisting Error');
            }

            if (title) {
                campaign.title = title;
            }
            if (description) {
                campaign.description = description;
            }
            if (goalAmount) {
                campaign.goalAmount = parseFloat(goalAmount);
            }
            if (status) {
                if ((status !== 'active' && status !== 'closed')) {
                    return res.status(404).json('Invalid Status');
                }
                campaign.status = status;
            }
            campaign.updatedAt = Date.now();
            await campaign.save();
            return res.status(200).json(campaign);
        } catch (error) {
            return res.status(404).json({
                message: 'Updating Error'
            })
        }
    },
    delete: async(req, res) => {
        try {
            const campaignId = req.query.campaignId;

            const campaign = await Campaign.findById(campaign);

            if (!campaign)
                return res.status(404).json(campaign);
            campaign.status = 'closed';
            campaign.deleted = true;
            await campaign.save();
            return res.status(200).json({message: 'Deletion Done'});
        } catch (error) {
            return res.status(404).json(error);
        }
    }
})

module.exports = campaignController;