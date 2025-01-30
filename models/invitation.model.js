const mongoose = require('mongoose');

const groupInvitationSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'groupType',
    },
    groupType: {
        type: String,
        required: true,
        enum: ['ContributionGroup', 'TontineGroup'],
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    invitedTo: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    viewed: {
        type: Boolean,
        default: false
    },
    expiryDate: Date
});

module.exports = mongoose.model('Invitation', groupInvitationSchema);
