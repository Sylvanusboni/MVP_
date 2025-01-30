const mongoose = require('mongoose');

const TontineGroup = new mongoose.Schema({
    name: String,
    admin: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    contributionAmount: Number,
    cycleDuration: Number,
    startDate: Date,
    status: String,
    totalCollected: Number,
});

const TontineCyle = new mongoose.Schema({
    tontineId: {type: mongoose.Schema.Types.ObjectId, ref: 'Tontine'},
    cycleNumber: Number,
    beneficiary: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    dueDate: Date,
    status: String,
    collectedAmount: Number,
});

const TontinePayment = new mongoose.Schema({
    tontineId: {type: mongoose.Schema.Types.ObjectId, ref: 'Tontine'},
    cycleId: {type: mongoose.Schema.Types.ObjectId, ref: 'TontineCycle'},
    memberId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    amount: Number,
    paymentDate: Date,
    paymentStatus: String,
    transactionId: String,
})