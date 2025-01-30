const Invitation = require('../models/invitation.model');
const ContributionGroup = require('../models/Contribution/group.model');
const TontineGroup = require('../models/Tontine/group.model');
const User = require('../models/invitation.model');

const invitationController = ({
    get: async(req, res) => {
        try {
            const {userId} = req.query.userId;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json('Unknown User');
            }

            const invitations = await Invitation.find({
                user: user._id
            }).populate('invitedTo', ('name')).populate('invitedBy', 'name email');
            return res.status(404).json(invitations);
        } catch (error) {
            return res.status(404).json(error);
        }
    },
    viewAll: async(req, res) => {
        try {
            const {userId} = req.query.userId;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json('Unknown User');
            }

            const invitations = await Invitation.find({
                user: user._id,
                viewed: false
            }).populate('invitedTo', ('name')).populate('invitedBy', 'name email');

            for (const invitation of invitations) {
                invitation.viewed = true;
                await invitation.save();
            }
            return res.status(200).json(invitations);
        } catch (error) {
            return res.status(404).json(error);
        }
    },
    getGroup: async(req, res) => {
        try {
            const groupId = req.query.groupId;

            const invitationId = req.query.invitationId;
            if (!invitationId) {
                return res.status(404).json('Set Ids');
            }
            const invitation = await Invitation.findById(invitationId);
            
            if (!invitation) {
                return res.status(404).json("Unknown Invitation");
            }
            const group = await ((invitation.groupType === 'ContributionGroup') ? 
                ContributionGroup.findById(groupId || invitation.groupId)
                    .select('name description members')
                    .populate('members.userId', 'name email') :
                TontineGroup.findById(groupId || invitation.groupId)
                    .select('name description startDate members'))
                    .populate('members.userId', 'name email');
        } catch (error) {
            return res.status(404).json(error);
        }
    },
    respondInvitation: async(req, res) => {
        try {
            const invitationId = req.query.invitationId || req.body.invitationId;
            const status = req.body.status;

            if (!invitationId) {
                return res.status(404).json('Set the invitation Id');
            }
            const invitation = await Invitation.findById(invitationId);
            if (!invitation) {
                return res.status(404).json('Undefined Invitation');
            }
            const now = Date.now;
            if (invitation.expiryDate > now) {
                return res.status(204).json('Invitation Expired');
            }
            const _status = ['pending', 'accepted', 'declined'];
            if (!_status.includes(status)) {
                return res.status(404).json('Unknown status');
            }
            invitation.status = status;

            if (status === 'declined' || status === 'accepted') {
                const group = await ((invitation.groupType === 'ContributionGroup') ? 
                ContributionGroup.findById(invitation.groupId) :
                TontineGroup.findById(invitation.groupId));

                const member = group.members.find(it => it.userId.toString() === invitation.user.toString());
                if (!member) {
                    return res.status(404).json('Never send invitaiton');
                }
                member.status = status;
                await group.save();
            }
            await invitation.save();
        } catch (error) {
            return res.status(404).json(error);
        }
    },
    
})