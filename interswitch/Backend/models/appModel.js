const mongoose = require('mongoose');

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'user'],
    default: 'user',
  },
  medicalHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord' }],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);

// Medical Record Schema
const MedicalRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  diagnosis: String,
  prescription: String,
  doctor: String,
  date: { type: Date, default: Date.now },
});

const MedicalRecord = mongoose.model('MedicalRecord', MedicalRecordSchema);

// Appointment Schema
const AppointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: String,
  date: Date,
  status: { type: String, enum: ['Pending', 'Confirmed', 'Completed'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);

// Payment Schema
const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: Number,
  transactionId: String,
  transactionReference: String,
  status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

const Payment = mongoose.model('Payment', PaymentSchema);

const TransferSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transferCode: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  beneficiary: {
    lastname: String,
    othernames: String,
  },
  sender: {
    email: String,
    lastname: String,
    othernames: String,
    phone: String,
  },
  termination: {
    accountNumber: String,
    accountType: Number,
    countryCode: String,
    entityCode: String,
    paymentMethodCode: String,
  },
  createdAt: { type: Date, default: Date.now },
});

const Transfer = mongoose.model('Transfer', TransferSchema);

module.exports = { User, MedicalRecord, Appointment, Payment, Transfer };
