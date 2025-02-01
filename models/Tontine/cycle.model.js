const mongoose = require('mongoose')

const TontineCyle = new mongoose.Schema({
    tontineId: {type: mongoose.Schema.Types.ObjectId, ref: 'Tontine'},
    cycleNumber: Number,
    beneficiary: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    dueDate: Date,
    status: {type: String, enum: ['pending', 'started', 'completed'], default: 'pending'},
    collectedAmount: Number,
    members: [{
        userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        payed: {type: Number, default: 0},
        rest: {type: Number, default: 0}
    }],
    collected: {type: Boolean, default: false}
});

module.exports = mongoose.model('TontineCycle', TontineCyle);