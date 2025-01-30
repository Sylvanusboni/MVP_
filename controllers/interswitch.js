const axios = require('axios');
const baseURL = process.env.INTERSWITCH_BASE_URL;
const clientId = process.env.INTERSWITCH_CLIENT_ID;
const secretKey = process.env.INTERSWITCH_SECRET_KEY;

function getAuthHeader(clientId, secretKey) {
    return `Basic ${Buffer.from(`${clientId}:${secretKey}`).toString('base64')}`;
}

const interswitchController = ({
    getToken: async(req, res) => {
        const clientId = process.env.INTERSWITCH_CLIENT_ID_2;
        const secretKey = process.env.INTERSWITCH_SECRET_KEY_2;

        const headers = {
            'Authorization': getAuthHeader(clientId, secretKey),
            'Content-Type': 'application/x-www-form-urlencoded',
            'accept': 'application/json'
        };

        try {
            // 'https://sandbox.interswitchng.com/passport/oauth/token?env=test',
            const response = await axios.post(
                'https://passport.k8.isw.la/passport/oauth/token?grant_type=client_credentials',
                'grant_type=client_credentials',
                {
                    headers
                }
            );

            return res.status(200).json(response.data);
        } catch (error) {
            console.log(error);
            console.error('Error generating token:', error);
            res.status(404).json('Error');
        }
    },
    start: async(req, res) => {
        try {
            const data = await generateToken();
            const merchantCode = data.merchant_code;
            const paymentItemId = process.env.INTERSWITCH_PAY_ITEM_ID;

            // Ajout des headers requis
            const headers = {
                Authorization: `Bearer ${data.token}`,
                'Content-Type': 'application/json',
                'Client-Id': process.env.INTERSWITCH_CLIENT_ID,
                'Timestamp': new Date().toISOString(),
                'Nonce': Math.random().toString(36).substring(2)
            };

            const transactionData = {
                merchantCode: merchantCode,
                paymentItemId: paymentItemId,
                amount: 50000,
                customerId: "12345",
                currency: "NGN",
                transactionReference: `TX-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                redirectUrl: "http://localhost:8080/api/payment/callback",
                description: "Dons pour l'association"
            };

            const response = await axios.post(
                'https://sandbox.interswitchng.com/api/v2/purchases', // URL mise à jour
                transactionData,
                { headers }
            );

            console.log('Transaction started successfully:', response.data);
            return res.status(200).json(response.data);
        } catch (error) {
            console.error('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers
            });

            return res.status(500).json({
                success: false,
                message: 'Failed to initiate transaction',
                error: error.response?.data
            });
        }
        // const token = await generateToken();

        // const headers = {
        //     Authorization: `Bearer ${token}`,
        //     'Content-Type': 'application/json',
        // };

        // const transactionData = {
        //     amount: 50000, //Montant en Kobo (50,000 = 500 NGN)
        //     customerId: "12345",
        //     currency: "NGN",
        //     transactionRef: "TRANS-12345",
        //     redirectUrl: "http://localhost:8080/api/payment/callback",
        //     paymentItem: "Dons pour l'association",
        // };

        // try {
        //     const response = await axios.post(
        //         'https://sandbox.interswitchng.com/payments/api/v1/purchases',
        //         transactionData,
        //         {headers}
        //     );

        //     console.log('Transaction started successfully:', response.data);
        //     return res.status(200).json(response.data);
        // } catch (error) {
        //     console.error('Error starting transaction:', error.response.data);
        // }
    },
    callback: async(req, res) => {
        try {
            console.log(req.query);
            console.log(req.body);
            return res.status(200).json('Got it');
        } catch (error) {
            return res.status(404).json('Callback Error');
        }
    },
    validate: async(req, res) => {
        const token = await generateToken();

        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        };

        try {
            const response = await axios.get(
                `https://sandbox.interswitchng.com/payments/api/v1/transactions/${req.body.transactionRef}`,
                {headers}
            );

            console.log('Transaction status:', response.data);
            return res.status(200).json(response.data);
        } catch (error) {
            console.error('Error validating transaction:', error);
            return res.status(404).json(error);
        }
    }
})

async function generateToken() {
    const clientId = process.env.INTERSWITCH_CLIENT_ID;
    const secretKey = process.env.INTERSWITCH_SECRET_KEY;

    const headers = {
        'Authorization': getAuthHeader(clientId, secretKey),
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json'
    };

    try {
        // 'https://sandbox.interswitchng.com/passport/oauth/token?env=test',
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

async function startTransaction(req, res) {
    const token = await generateToken();

    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const transactionData = {
        amount: 50000, // Montant en Kobo (50,000 = 500 NGN)
        customerId: "12345",
        currency: "NGN",
        transactionRef: "TRANS-12345",
        redirectUrl: "http://localhost:8080/payment/callback",
        paymentItem: "Dons pour l'association",
    };

    try {
        const response = await axios.post(
            'https://sandbox.interswitchng.com/payments/api/v1/payment-requests',
            transactionData,
            { headers }
        );

        console.log('Transaction started successfully:', response.data);
        return response.data.paymentUrl; // URL à laquelle rediriger l'utilisateur pour payer
    } catch (error) {
        console.error('Error starting transaction:', error.response.data);
    }
};

const validateTransaction = async (transactionRef) => {
    const token = await generateToken();

    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    try {
        const response = await axios.get(
            `https://sandbox.interswitchng.com/payments/api/v1/transactions/${transactionRef}`,
            { headers }
        );

        console.log('Transaction status:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error validating transaction:', error.response.data);
    }
};

async function initiatePayment(amount, transactionRef, description, returnUrl) {
    try {
        const authHeader = await getAuthHeader();
        const response = await axios.post(
            `${baseURL}/ipg/payments`,
            {
                amount,
                transactionRef,
                description,
                returnUrl,
                currency: "NGN", // Devise (à ajuster selon le cas)
            },
            {
                headers: {
                    Authorization: authHeader,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error initiating payment:', error.response?.data || error.message);
        throw new Error('Failed to initiate payment');
    }
};

module.exports = interswitchController;
