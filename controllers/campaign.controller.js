const Campaign = require('../models/campaign.model');
const Contribution = require('../models/contribution.model');
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const axios = require('axios');

function getAuthHeader(clientId, secretKey) {
    return `Basic ${Buffer.from(`${clientId}:${secretKey}`).toString('base64')}`;
}

async function generateToken() {
    const clientId = process.env.INTERSWITCH_CLIENT_ID;
    const secretKey = process.env.INTERSWITCH_SECRET_KEY;

    const headers = {
        'Authorization': getAuthHeader(clientId, secretKey),
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json'
    };

    try {
        // 'https://sandbox.interswitchng.com/passport/oauth/token?env=test',
        const response = await axios.post(
            'https://passport.k8.isw.la/passport/oauth/token?grant_type=client_credentials',
            'grant_type=client_credentials',
            {
                headers
            }
        );
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        console.error('Error generating token:', error);
    }
};

const campaignController = ({
    create: async (req, res) => {
        try {
            const {title, description, goalAmount, images} = req.body;

            const newCampaign = new Campaign({
                title,
                description,
                goalAmount,
                createdBy: req.query.userId,
                images
            });

            await newCampaign.save();
            res.status(200).json({
                message: 'Campaign created successfully',
                data: newCampaign
            });
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
    externalContribution: async (req, res) => {
        try {
            const {campaignId, email, amount} = req.body;
            const campaign = await Campaign.findById(campaignId);
            
            if (!campaign) return res.status(404).json({ message: 'Campaign not found'});

            const user = await User.findOne({email: email});
            const sub = false;
            if (user)
                sub = true;

            const data = await generateToken();
            const merchantCode = data.merchant_code;
            const paymentItemId = process.env.INTERSWITCH_PAY_ITEM_ID;

            const headers = {
                Authorization: `Bearer ${data.token}`,
                "Content-Type": "application/json",
                "accept": "application/json"
            }
            const transactionReference = `MVP-CPN-${Date.now}`;
            const response = await axios.post('https://qa.interswitchng.com/paymentgateway/api/v1/paybill',{
                    "merchantCode": merchantCode,
                    "payableCode": paymentItemId,
                    "amount": amount * 100,
                    "redirectUrl": "http://localhost:3000/api/interswitch/callback",
                    "customerId": user.email,
                    "currencyCode": "566",
                    "customerEmail": user.email,
                    "transactionReference": transactionReference
                },
                {headers}
            );
            const newContribution = await Transaction.create({
                amount,
                transactionReference: transactionReference,
                campaignId: campaign._id,
                user: (user) ? user._id : null,
                external: (user) ? false : true,
                email: email
            });

            // campaign.collectedAmount += amount;
            // campaign.contributors.push({userId, amount});
            // await campaign.save();

            res.status(200).json({message: 'Donation successful', data: response});
        } catch (error) {
            res.status(404).json({
                message: 'Donnation Error',
                error: error.message
            });
        }
    },
    donateToCampaign: async (req, res) => {
        try {
            const { campaignId, amount} = req.body;
            const userId = req.query.userId;

            if (!userId || !campaignId || !amount) {
                return res.status(404).json('Fill the fields');
            }

            const campaign = await Campaign.findById(campaignId);
            if (!campaign)
                return res.status(404).json({message: 'Campaign not found'});
            const user = await User.findById(userId);
            if (!user)
                return res.status(404).json('Undefined User');

            const data = await generateToken();
            const merchantCode = data.merchant_code;
            const paymentItemId = process.env.INTERSWITCH_PAY_ITEM_ID;

            const headers = {
                Authorization: `Bearer ${data.access_token}`,
                "Content-Type": "application/json",
                "accept": "application/json"
            }
            const transactionReference = `MVP-CPN-${Date.now()}`;
            const response = await axios.post('https://qa.interswitchng.com/paymentgateway/api/v1/paybill',{
                    "merchantCode": merchantCode,
                    "payableCode": paymentItemId,
                    "amount": amount * 100,
                    "redirectUrl": "http://localhost:8080/api/interswitch/callback",
                    "customerId": user.email,
                    "currencyCode": "566",
                    "customerEmail": user.email,
                    "transactionReference": transactionReference
                },
                {headers}
            );
            console.log(response);
            console.log(response.data);
            const newContribution = await Transaction.create({
                amount,
                transactionReference: transactionReference,
                campaignId: campaign._id,
                user: user._id
            });
            
            console.log(response);
            await newContribution.save();
            await campaign.save();

            res.status(200).json(response.data);
        } catch (error) {
            console.log(error);
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