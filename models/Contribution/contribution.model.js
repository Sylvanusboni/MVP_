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

module.exports = mongoose.model('Contribution', ContributionSchema);