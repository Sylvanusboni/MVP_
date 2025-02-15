const mongoose = require('mongoose')

const TontineGroup = new mongoose.Schema({
    name: String,
    admin: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    members: [{
            userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
            status: {type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending'},
            benefited: {type: Boolean, default: false}
        }
    ],
    contributionAmount: Number,
    cycleDuration: Number,
    startDate: Date,
    status: {type: String, enum: ['pending', 'started', 'completed'], default: 'pending'},
    totalCollected: Number,
});

module.exports = mongoose.model('TontineGroup', TontineGroup);