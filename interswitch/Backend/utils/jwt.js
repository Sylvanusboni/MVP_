const jwt = require('jsonwebtoken');
const dotenv = require ('dotenv');

dotenv.config();

const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '24h',
  });
};

module.exports = generateToken;