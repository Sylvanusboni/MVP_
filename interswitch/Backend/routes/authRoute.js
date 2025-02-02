const express = require('express');
const {User} = require('../models/appModel.js');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const router = express.Router();
const generateToken = require('../utils/jwt.js');

const exchangeCodeForToken = async (code) => {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      });
  
      return response.data; // Contains the access_token, id_token, etc.
    } catch (error) {
      console.error('Error exchanging code for token:', error.response?.data || error.message);
      throw new Error('Failed to exchange code for token');
    }
  };
  
  const getUserInfo = async (accessToken) => {
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      return response.data; // Contains user info such as name, email, etc.
    } catch (error) {
      console.error('Error fetching user info:', error.response?.data || error.message);
      throw new Error('Failed to fetch user info');
    }
  };
  
// Register a new user
router.post('/signup', async (req, res) => {
    try {
      const { fullName, email, password, role } = req.body;
      console.log(req.body);
  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Set the role to default if not provided
      const userRole = role || 'user'; // Default to 'user'
  
      // Create new user
      const newUser = new User({
        name: fullName,
        email,
        password: hashedPassword,
        role: userRole,
      });
      await newUser.save();
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  router.post('/google', async (req, res) => {
    const { code } = req.body;
  
    try {
      // Step 1: Exchange the code for tokens
      const tokenData = await exchangeCodeForToken(code);
  
      // Step 2: Fetch user info using access token
      const userInfo = await getUserInfo(tokenData.access_token);
  
      // Step 3: Check if the user already exists in the database
      let user = await User.findOne({ email: userInfo.email });
  
      if (!user) {
        // If user doesn't exist, create a new user
        user = new User({
          name: userInfo.name,
          email: userInfo.email,
          role: 'user',
          status: 'active', // Set status for new users
        });
        await user.save();
      } else {
        // Ensure the user's status is active
        if (user.status !== 'active') {
          user.status = 'active';
          await user.save();
        }
      }
  
      const token = generateToken(user);
  
      // Step 4: Send the user data or a token to the frontend
      res.status(200).json({
        message: 'Authentication successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Google Authentication Failed:', error.message);
      res.status(500).json({ message: 'Failed to authenticate with Google' });
    }
  });
  
  // Login route
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'User does not exist' });
      }
  
      // Compare passwords
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Ensure the user's status is active
      // if (user.status !== 'active') {
      //   user.status = 'active';
      //   await user.save();
      // }
  
      const token = generateToken(user);
  
      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Login Failed:', error.message);
      res.status(500).json({ message: 'Failed to log in' });
    }
  });

  module.exports = router;