const Contribution = require('../models/Contribution/contribution.model');
const groupModel = require('../models/Contribution/group.model');
const ContributionGroup = require('../models/Contribution/group.model');
const Invitation = require('../models/invitation.model');
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const GOOGLE_PASS = process.env.GOOGLE_PASS; //'gdls oztc hqmr vdpf'
const nodemailer = require('nodemailer');
const axios = require('axios');

const sendEmail = async (destinataire, sujet, message) => {
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'sylvanusboni21@gmail.com',
                pass: GOOGLE_PASS
            }
        });

        let mailOptions = {
            from: 'sylvanusboni21@gmail.com',
            to: destinataire,
            subject: sujet,
            text: message
        };
        let info = await transporter.sendMail(mailOptions);
        console.log('Email envoyé: ' + info.response);
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email: ', error);
    }
};

async function sendInvitation(groupType, sender, groupId, dest)
{
    const invitation = await Invitation.create({
        groupId,
        groupType,
        invitedBy: sender._id,
        invitedTo: dest._id,
        status: 'pending',
        user: dest._id
    });
}

function getAuthHeader(clientId, secretKey) {
    return `Basic ${Buffer.from(`${clientId}:${secretKey}`).toString('base64')}`;
}

async function generateToken(cl_id, sc_key) {
    const clientId = cl_id || process.env.INTERSWITCH_CLIENT_ID;
    const secretKey = sc_key || process.env.INTERSWITCH_SECRET_KEY;

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

const contributionController = ({
    createGroup: async(req, res) => {
        try {
            const {name, description, frequency, contributionAmount, admin} = req.body;

            const newGroup = new ContributionGroup({
                name,
                description,
                admin,
                frequency,
                contributionAmount,
            });

            await newGroup.save();
            res.status(200).json({ message: 'Group created successfully', data: newGroup});
        } catch (error) {
            res.status(404).json({ message: 'Server Error', error: error.message});
        }
    },
    update:async(req, res) => {
        try {
            const {name, description, frequency, contributionAmount, times} = req.body;

            const {groupId} = req.query.groupId;

            const group = await ContributionGroup.findById()
            const frequencies = ['daily', 'weekly', 'monthly', 'yearly'];

            if (name)
                group.name = name;
            if (description)
                group.description = description;
            if (frequency && (frequencies.includes(frequency)))
                group.frequency = frequency;
            if (times)
                group.times = parseInt(times);
            if (contributionAmount) {
                group.contributionAmount = parseFloat(contributionAmount);
            }
            await group.save();
        } catch (error) {
            return res.status(404).json(error);
        }
    },
    getUserGroups: async(req, res) => {
        try {
            const userId = req.query.userId || req.body.userId;

            const user = await User.findById(userId);
            if (!user)
                return res.status(404).json('Unknown User');
            const groups = await ContributionGroup.find({members: {$elemMatch: {userId: userId}}}).populate('admin', 'name email').populate('members.userId', 'name email');
            const admins = await ContributionGroup.find({admin: user._id}).populate('members.userId', 'name email');

            console.log('My groups: ', groupModel, admins);

            return res.status(200).json({
                groups: groups,
                admins: admins
            });
        } catch (error) {
            return res.status(404).json({error: error});
        }
    },
    inviteMembers: async(req, res) => {
        try {
            const {groupId, emails, userId} = req.body;

            const group = await ContributionGroup.findById(groupId).populate('admin');

            if (!group) return res.status(404).json({message: 'Group not found'});

            if (group.admin._id.toString() !== userId)
                return res.status(403).json({ message: 'Only admin can invite members' });

            for (const email of emails) {
                const user = await User.findOne({email: email});
                if (!user) {
                    sendEmail(email, `Invitation to Join ${group.name}`, `${group.admin.name} invites you to join ${group.name}. Register yourself at http://localhost:8080/login, to succed to join `);
                    continue;
                }
                const check = group.members.find(member => member.userId.toString() === user._id.toString());
                sendInvitation('ContributionGroup', group.admin, group._id, user);
                if (check) continue;
                group.members.push({
                    userId: user._id,
                    status: 'pending'
                });
            }
    
            await group.save();
            res.status(200).json({ message: 'Invitations sent successfully', data: group });
        } catch (error) {
            res.status(404).json({ message: 'Server Error', error: error.message });
        }    
    },
    getUserContributions: async(req, res) => {
        try {
            const page = req.query.page || 1;
            const limit = req.query.limit || 10;

            const userId = req.query.userId;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json('Unknown User');
            }
            const contributions = await Contribution.find({userId: user._id}).skip((page - 1) * limit).limit(limit);

            return res.status(200).json(contributions);
        } catch (error) {
            return res.status(404).json('error');
        }
    },
    payContibution: async(req, res) => {
        try {
            const {amount, groupId} = req.body;
            const userId = req.query.userId;

            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json('Unknown User');
            }

            const group = await ContributionGroup.findById(groupId);
            if (!group)
                return res.status(404).json('Unknown Cycle');

            const member = group.members.find(it => it.userId.toString() === user._id.toString());
            if (!member) {
                return res.status(404).json('This user is not in this Contribution Group');
            }

            const data = await generateToken();
            const merchantCode = data.merchant_code;
            const paymentItemId = process.env.INTERSWITCH_PAY_ITEM_ID;

            const headers = {
                Authorization: `Bearer ${data.access_token}`,
                "Content-Type": "application/json",
                "accept": "application/json"
            }
            const transactionReference = `MVP-CTN-${user._id}-${Date.now()}`;
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
            console.log(response.data);
            const newContribution = await Transaction.create({
                amount,
                transactionReference: transactionReference,
                contribution: group._id,
                user: user._id
            });
            
            await newContribution.save();
            //await campaign.save();
            return res.status(200).json(response.data);
        } catch (error) {
            return res.status(404).json(error);
        }
    },
    collect: async(req, res) => {
        try {
            const userId = req.query.userId;
            const groupId = req.body.groupId;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json('Unknown User');
            }

            const contribution = await ContributionGroup.findById(groupId);
            if (!contribution) {
                return res.status(404).json('Unknown Contribution');
            }

            if (contribution.admin.toString() !== user._id.toString()) {
                return res.status(403).json('Unauthorized! Only Admin can collect');
            }

            //Collection

            return res.status(200).json('Let s collect our money');
        } catch (error) {
            return res.status(404).json(error);
        }
    },
    getMembers: async(req, res) => {
        try {
            const groupId = req.query.groupId;

            const group = await ContributionGroup.findById(groupId).populate('members.userId', 'name email');

            if (!group) return res.status(404).json('Group not found');

            return res.status(200).json(group.members);
        } catch (error) {
            return res.status(404).json(error);
        }
    }
})


module.exports = contributionController;

//Model Asking
//Data 
//
