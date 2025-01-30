const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    goalAmount: { type: Number, required: true },
    collectedAmount: { type: Number, default: 0 },
    contributors: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            amount: { type: Number, required: true},
        },
    ],
    externalContributions: [
        {
            email: {type: String},
            amount: {type: Number, required: true},
        },
    ],
    status: {type: String, enum: ['active', 'closed'], default: 'active'},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    deleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('Campaign', CampaignSchema);
