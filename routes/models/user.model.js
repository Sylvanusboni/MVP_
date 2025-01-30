const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    token: String,
    code: String,
    password: String,
    validmail: {type: Boolean, default: false}
});

module.exports = mongoose.model('User', UserSchema);