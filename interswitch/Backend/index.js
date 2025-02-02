require('dotenv').config();
const express = require('express');
const axios = require('axios');
const base64 = require('base-64');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoute.js');
const payRoutes = require('./routes/payRoute.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({origin:"*"}));
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB Cluster');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

  // API Routes
app.use('/api/auth', authRoutes);
app.use('/api/interswitch', require('./routes/interswitch.route'));
app.use('/api/transaction', require('./routes/transaction.route'));

app.use(payRoutes);

const CLIENT_ID = process.env.CLIENT_ID;
const SECRET_KEY = process.env.SECRET_KEY;
const TOKEN_URL = 'https://passport.k8.isw.la/passport/oauth/token';

// Obtenir le token d'authentification
async function getAuthToken() {
    const authHeader = 'Basic ' + base64.encode(`${CLIENT_ID}:${SECRET_KEY}`);
    
    try {
        const response = await axios.post(TOKEN_URL, 'grant_type=client_credentials', {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Erreur lors de la récupération du token:', error);
        throw error;
    }
}

app.get('/auth', async (req, res) => {
    try {
        const token = await getAuthToken();
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Erreur d\'authentification' });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});