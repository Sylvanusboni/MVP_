const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/connect');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// const campaigns = require('./routes/campaign.route');
// app.use('/api/campaigns', campaigns);

app.use('/api/interswitch', require('./routes/interswitch.route'));

app.use('/api/user', require('./routes/user.route'));

app.use('/api/campaign', require('./routes/campaign.route'));

app.use('/api/transaction', require('./routes/transaction.route'));

app.use('/api/contribution', require('./routes/contribution.route'));

app.use('/api/invitation', require('./routes/invitation.route'));


app.use('/api/tontine', require('./routes/tontine.route'))

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
