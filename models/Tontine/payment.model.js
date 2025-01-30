const mongoose = require('mongoose')

const TontinePayment = new mongoose.Schema({
    tontineId: {type: mongoose.Schema.Types.ObjectId, ref: 'Tontine'},
    cycleId: {type: mongoose.Schema.Types.ObjectId, ref: 'TontineCycle'},
    memberId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    amount: Number,
    paymentDate: Date,
    paymentStatus: String,
    transactionId: String,
});

module.exports = mongoose.model('TontinePayment', TontinePayment);