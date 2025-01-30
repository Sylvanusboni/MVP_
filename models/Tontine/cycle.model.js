const mongoose = require('mongoose')

const TontineCyle = new mongoose.Schema({
    tontineId: {type: mongoose.Schema.Types.ObjectId, ref: 'Tontine'},
    cycleNumber: Number,
    beneficiary: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    dueDate: Date,
    status: String,
    collectedAmount: Number,
});

module.exports = mongoose.model('TontineCycle', TontineCyle);