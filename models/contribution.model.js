const mongoose = require('mongoose');

const ContributionSchema = new mongoose.Schema({
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    email: {type: String},
    amount: {type: Number, required: true},
    paymentStatus: {type: String, enum: ['pending', 'completed', 'failed'], default: 'pending'},
    transactionId: {type: String},
    createdAt: {type: Date, default: Date.now},
});

const ContributionGroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    members: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            status: { type: String, enum: ['pending', 'accepted'], default: 'pending' }, 
        },
    ],
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true }, 
    contributionAmount: { type: Number, required: true },
    totalCollected: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Contribution', ContributionSchema);
