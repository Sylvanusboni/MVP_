const mongoose = require('mongoose')

const TontineGroup = new mongoose.Schema({
    name: String,
    admin: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    members: [{
            userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
            status: {type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending'},
            beneficiary: {type: Boolean, default: false}
        }
    ],
    contributionAmount: Number,
    cycleDuration: Number,
    startDate: Date,
    status: String,
    totalCollected: Number,
});

module.exports = mongoose.model('TontineGroup', TontineGroup);