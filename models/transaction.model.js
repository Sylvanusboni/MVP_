const mongoose = require('mongoose')

const TransactionSchema = new mongoose.Schema({
    date: {type: Date, default: Date.now},
    amount: Number,
    transactionReference: String,
    status: {type: String, enum: ['pending', 'failed', 'completed'], default: 'pending'},
    campaignId: {type: mongoose.Schema.Types.ObjectId, ref: 'Campaign'},
    tontineId: {type: mongoose.Schema.Types.ObjectId, ref: 'TontineGroupe'},
    tontineCycle: {type: mongoose.Schema.Types.ObjectId, ref: 'TontineCycle'},
    contribution: {type: mongoose.Schema.Types.ObjectId, ref: 'ContributionGroup'},
    user:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    external: {type: Boolean, default: false},
    email: String
});

module.exports = mongoose.model('Transaction', TransactionSchema);
