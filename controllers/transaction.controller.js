const Transaction = require('../models/transaction.model');
const TontineCycle = require('../models/Tontine/cycle.model');
const TontineGroup = require('../models/Tontine/group.model');
const ContributionGroup = require('../models/Contribution/group.model');
const axios = require('axios');

function getAuthHeader(clientId, secretKey) {
    return `Basic ${Buffer.from(`${clientId}:${secretKey}`).toString('base64')}`;
}

async function generateToken() {
    const clientId = process.env.INTERSWITCH_CLIENT_ID;
    const secretKey = process.env.INTERSWITCH_SECRET_KEY;

    const headers = {
        'Authorization': getAuthHeader(clientId, secretKey),
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json'
    };

    try {
        const response = await axios.post(
            'https://passport.k8.isw.la/passport/oauth/token?grant_type=client_credentials',
            'grant_type=client_credentials',
            {
                headers
            }
        );
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        console.error('Error generating token:', error);
    }
};

const transactionController = ({
    complete: async(req, res) => {
        try {
            const {transactionReference, amount, email, userId} = req.body;

            if (!transactionReference || !amount) {
                return res.status(404).json('Need Trans Reference and Amount to confirm');
            }
            const data = generateToken();
            const merchantCode = data.merchant_code;
            const headers = {
                'Content-Type': 'application/json'
            }

            const response = await axios.post(`https://qa.interswitchng.com/collections/api/v1/gettransaction.json?merchantcode=${merchantCode}&transactionreference=${transactionReference}&amount=${amount}`,
                '',
                {headers}
            );

            
        } catch (error) {
            return res.status(404).json(error);
        }
    },
    getUserTransaction: async(req, res) => {
        try {

        } catch (error) {
            return res.status(404).json(error);
        }
    }
})