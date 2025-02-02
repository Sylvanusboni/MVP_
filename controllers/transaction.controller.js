const Transaction = require('../models/transaction.model');
const TontineCycle = require('../models/Tontine/cycle.model');
const TontineGroup = require('../models/Tontine/group.model');
const ContributionGroup = require('../models/Contribution/group.model');
const Campaign = require('../models/campaign.model');
const axios = require('axios');
const { externalContribution } = require('./campaign.controller');

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

const transactionController = ({
    complete: async(req, res) => {
        try {
            const {transactionReference, email, userId} = req.body;
            const amount = parseInt(req.body.amount) / 100;

            if (!transactionReference || !amount) {
                return res.status(404).json('Need Trans Reference and Amount to confirm');
            }

            const transaction = await Transaction.findOne({transactionReference: transactionReference});

            if (!transaction) {
                return res.status(404).json('UnknownTransaction');
            }

            const data = await generateToken();
            const merchantCode = data.merchant_code;
            const headers = {
                'Content-Type': 'application/json'
            }

            const response = await axios.get(`https://qa.interswitchng.com/collections/api/v1/gettransaction.json?merchantcode=${merchantCode}&transactionreference=${transactionReference}&amount=${amount}`,
                'grant_type=client_credentials',
                {headers}
            );

            console.log('Transaction status:', response.data);
            if (response.data.ResponseCode !== "00") {
                transaction.status = 'failed';
            } else {
                if (transaction.campaignId) {
                    const campaign = await Campaign.findById(transaction.campaignId);

                    if (!campaign)
                        return res.status(404).json("Campaign not found");
                    if (transaction.user) {
                        const userCampaign = campaign.contributors.find(it => it.userId.toString() === transaction.user.toString());
                        if (userCampaign) {
                            userCampaign.amount += amount;
                        } else {
                            campaign.contributors.push({
                                userId: transaction.user,
                                amount: amount
                            })
                        }
                    } else {
                        const extUser = campaign.externalContributions.find(it => it.email === email);
                        if (extUser) {
                            extUser.amount += amount;
                        } else {
                            campaign.externalContributions.push({
                                email: email,
                                amount: amount
                            })
                        }
                    }
                    campaign.collectedAmount += amount;
                    await campaign.save();
                }
                if (transaction.tontineId && transaction.tontineCycle) {
                    const tontine = await TontineGroup.findById(transaction.tontineId);
                    if (!tontine)
                        return res.status(404).json('Unknown Tontine');
                    const cycle = await TontineCycle.findById(transaction.tontineCycle);
                    if (!cycle)
                        return res.status(404).json('Unexisting Cycle');
                    console.log('Cycle:', cycle);
                    console.log('User', userId);
                    const _member = cycle.members.find(it => it.userId.toString() === transaction.user.toString());
                    if (!_member)
                        return res.status(404).json('Member not registered in this Tontine');
                    _member.payed += amount;
                    cycle.collectedAmount += amount;
                    tontine.rest -= amount;
                    await tontine.save();
                    await cycle.save();
                    await transaction.save();
                }
                if (transaction.contribution) {
                    const contribution = await ContributionGroup.findById(transaction.contribution);
                    if (!contribution) {
                        return res.status(404).json('Contribution Group not found')
                    }
                    const _member = contribution.members.find(it => it.userId.toString() === userId);
                    if (!_member)
                        return res.status(404).json('Member not found');
                    _member.collectedAmount += amount;
                    await contribution.save();
                }
                transaction.status = 'completed';
            }
            return res.status(200).json("Good");
        } catch (error) {
            console.log(error);
            return res.status(404).json(error);
        }
    },
    getUserTransaction: async(req, res) => {
        try {
            const userId = req.query.userId;
            const page = req.query.page || 1;
            const limit = req.query.limit || 15;

            const transactions = await Transaction.find({user: userId}).skip((page - 1) * limit).limit(limit).sort({_id: -1});
            return res.status(200).json(transactions);
            
        } catch (error) {
            return res.status(404).json(error);
        }
    }
});

module.exports = transactionController;