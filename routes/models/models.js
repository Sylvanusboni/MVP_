const mongoose = require('mongoose')

const User = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    phone: {type: String},
    role: {type: String, enum: ['user', 'admin'], default: 'user'},
    wallet: {type: mongoose.Schema.Types.ObjectId, ref: 'Wallet'},
    createdAt: {type: Date, default: Date.now}
});

const organizationSchema = new mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String},
  wallet: {type: mongoose.Schema.Types.ObjectId, ref: 'Wallet'},
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

const Contribution = new mongoose.Schema({
    amount: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fundraiser: { type: mongoose.Schema.Types.ObjectId, ref: 'Fundraiser' },
    createdAt: { type: Date, default: Date.now },
});

const Don = new mongoose.Schema({
});

const FundRaising = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    targetAmount: { type: Number, required: true },
    raisedAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    createdAt: { type: Date, default: Date.now },
});

const Tontine = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    totalAmount: { type: Number, required: true },
    currentCycle: { type: Number, default: 1 },
    maxCycles: { type: Number, required: true },
    paymentSchedule: { type: String, enum: ['weekly', 'monthly'], required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
});

const Wallet = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, refPath: 'ownerModel' },
    ownerModel: { type: String, enum: ['User', 'Organization'] },
    balance: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

const Transaction = new mongoose.Schema({
    amount: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['donation', 'contribution', 'tontine'], required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    reference: { type: String, unique: true }, // Généré pour le suivi avec InterSwitch
    createdAt: { type: Date, default: Date.now },
});
