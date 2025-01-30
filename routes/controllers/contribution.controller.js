const Contribution = require('../models/Contribution/contribution.model');
const ContributionGroup = require('../models/Contribution/group.model');
const Invitation = require('../models/invitation.model');
const User = require('../models/user.model');
const GOOGLE_PASS = process.env.GOOGLE_PASS; //'gdls oztc hqmr vdpf'

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

const contributionController = ({
    createGroup: async(req, res) => {
        try {
            const { name, description, frequency, contributionAmount } = req.body;
    
            const newGroup = new ContributionGroup({
                name,
                description,
                admin: req.user.id,
                frequency,
                contributionAmount,
            });
    
            await newGroup.save();
            res.status(200).json({ message: 'Group created successfully', data: newGroup });
        } catch (error) {
            res.status(404).json({ message: 'Server Error', error: error.message });
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
            const groups = await ContributionGroup.find({members: {userId: userId}});

            console.log('My groups: ', groups);

            return res.status(200).json(groups);
        } catch (error) {
            return res.status(404).json({error: error});
        }
    },
    inviteMembers: async(req, res) => {
        try {
            const {groupId, emails} = req.body;

            const group = await ContributionGroup.findById(groupId).populate('admin');

            if (!group) return res.status(404).json({message: 'Group not found'});

            if (group.admin._id.toString() !== req.user.id)
                return res.status(403).json({ message: 'Only admin can invite members' });
    
            for (const email of emails) {
                const user = await User.findOne({email: email});
                if (!user) {
                    sendEmail(email, `Invitation to Join ${group.name}`, `${group.admin.name} invites you to join ${group.name}. Register yourself at http://localhost:8080/login, to succed to join `);
                    continue;
                }
                sendInvitation('ContributionGroup', group.admin, group._id, user);
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
    accept: async(req, res) => {
        try {

        } catch (error) {
            
        }
    }
})

//Model Asking
//Data 
//
