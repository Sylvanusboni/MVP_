const axios = require('axios');
const TontineCycle = require('../models/Tontine/cycle.model');
const TontineGroup = require('../models/Tontine/group.model');
const ContributionGroup = require('../models/Contribution/group.model');
const Transaction = require('../models/transaction.model');
const Campaign = require('../models/campaign.model');

const baseURL = process.env.INTERSWITCH_BASE_URL;
const clientId = process.env.INTERSWITCH_CLIENT_ID;
const secretKey = process.env.INTERSWITCH_SECRET_KEY;
const User = require('../models/user.model');
const crypto = require("crypto");

function calculateMac(initiatingAmount,
    initiatingCurrencyCode, initiatingPaymentMethodCode,
    terminatingAmount, terminatingCurrencyCode,
    terminatingPaymentMethodCode, terminatingCountryCode) {

  const data = `${initiatingAmount}${initiatingCurrencyCode}${initiatingPaymentMethodCode}${terminatingAmount}${terminatingCurrencyCode}${terminatingPaymentMethodCode}${terminatingCountryCode}`;
  const mac = crypto.createHash("sha512").update(data).digest("hex");
  console.log(`mac: ${mac}`);
  return mac.toString();
};

function getAuthHeader(clientId, secretKey) {
    return `Basic ${Buffer.from(`${clientId}:${secretKey}`).toString('base64')}`;
}

function generateTransferCode() {
    const timestamp = Date.now(); 
    const randomPart = Math.floor(Math.random() * 1000000); 
    return `${timestamp}${randomPart}`;
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
            console.log(req);
            console.log(req.query);
            console.log(req.body);
            return res.redirect('http://localhost:3000/api/interswitch/callback');
            //https://qa.interswitchng.com/paymentgateway/api/v1/paybill
        } catch (error) {
            return res.status(404).json('Callback Error');
        }
    },
    validatCard: async(req, res) => {
        try {
            const data = await generateToken(process.env.INTERSWITCH_TRANSFER_CLIENT_ID,
                process.env.INTERSWITCH_TRANSFER_SECRET_KEY);
            const {accountNumber, bankCode} = req.body;

            const accessToken = data.access_token;
 
            const response = await axios.get(
            `https://qa.interswitchng.com/quicktellerservice/api/v5/transactions/DoAccountNameInquiry`, //?accountNumber=${accountNumber}&bankCode=${bankCode}
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    TerminalId: '3PBL0001',
                    bankCode: bankCode,
                    accountId: accountNumber,
                    'Content-Type': 'application/json'
                },
            });
            return res.status(200).json(response.data);
        } catch (error) {
          console.log("Erreur lors de la validation du compte :", error);
          return res.status(404).json(error);
        }
    },
    transfertFunds: async(req, res) => {
        try {
            //transfertDetails: {
            //    accountNumber,
            //    amount,
            //    bankCode,
            //    
            //}

            const data = await generateToken(process.env.INTERSWITCH_TRANSFER_CLIENT_ID,
                                             process.env.INTERSWITCH_TRANSFER_SECRET_KEY);

            const transferDetails = req.body;

            const payload = {
                transferCode: generateTransferCode(),
                mac: calculateMac(transferDetails.amount.toString(), "566", "CA",  transferDetails.amount.toString(), "566", "AC", "NG"),
                termination: {
                    amount: transferDetails.amount,
                    accountReceivable: {
                        accountNumber: transferDetails.accountNumber,
                        accountType: "00",
                    },
                    entityCode: transferDetails.bankCode,
                    currencyCode: "566",
                    paymentMethodCode: "AC",
                    countryCode: "NG",
                },
                sender: {
                    phone: transferDetails.senderPhone || "08124888436",
                    email: transferDetails.senderEmail || "dadubiaro@interswitch.com",
                    lastname: transferDetails.senderLastName || "Adubiaro",
                    othernames: transferDetails.senderOtherNames || "Deborah",
                },
                initiatingEntityCode: "PBL",
                initiation: {
                    amount: transferDetails.amount,
                    currencyCode: "566",
                    paymentMethodCode: "CA",
                    channel: "7",
                },
                beneficiary: {
                    lastname: transferDetails.beneficiaryLastName || "ralph",
                    othernames: transferDetails.beneficiaryOtherNames || "apho",
                },
            };

        const response = await axios.post(
            "https://qa.interswitchng.com/quicktellerservice/api/v5/transactions/TransferFunds",
            payload,
            {
                headers: {
                    Authorization: `Bearer ${data.access_token}`,
                    "Content-Type": "application/json",
                    accept: "application/json",
                    terminalId: "3PBL",
                },
            }
        );

        console.log(response.data);
        return res.status(200).json(response.data);
        } catch (err) {
            console.log('Error while transfering funds', err);
            return res.status(404).json(err);
        }
    },
    collectContribution: async(req, res) => {
        try {
            const userId = req.query.userId;
            const groupId = req.body.groupId;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json('Unknown User');
            }

            const {accountNumber, bankCode, amount} = req.body;
            if (!accountNumber || !bankCode || !amount)
                return res.status(404).json('Need this informations');

            const contribution = await ContributionGroup.findById(groupId).populate('admin');
            if (!contribution) {
                return res.status(404).json('Unknown Contribution');
            }

            if (contribution.admin.toString() !== user._id.toString()) {
                return res.status(403).json('Unauthorized! Only Admin can collect');
            }

            if (amount > contribution.totalCollected)
                return res.status(404).json('Unsuffiscient sold');

            const data = await transferFunds({
                amount,
                accountNumber,
                bankCode,
                senderEmail: contribution.admin.email,
                senderPhone: contribution.admin.phone,
                senderLastName: contribution.admin.name,
                senderOtherNames: contribution.admin.name,
                beneficiaryLastName: user.name,
                beneficiaryOtherNames: user.name
            });

            if (data.ResponseCode === "90000") {
                const transaction = await Transaction.create({
                    amount,
                    transactionReference: data.transactionReference,
                    contribution: contribution._id,
                    user: user._id
                });

                contribution.totalCollected -= amount;
                await contribution.save();
                return res.status(200).json("Funds Collected");
            }
            return res.status(404).json('Transfer Error');
        } catch(error) {
            return res.status(404).json(error);
        }
    },
    collectTontine: async(req, res) => {
        try {
            const userId = req.query.userId;
            const cycleId = req.body.cycleId;
            const amount = parseInt(req.body.amount);

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json('Unknown User');
            }

            const cycle = await TontineCycle.findById(cycleId);
            if (!cycle)
                return res.status(404).json('Unknown Cycle');

            const tontine = await TontineGroup.findById(cycle.tontineId).populate('admin');
            if (!tontine)
                return res.status(404).json('Without Admin we can t do anything');


            if (cycle.beneficiary.toString() !== user._id.toString())
                return res.status(403).json('Unauthorized! You aint this cycle beneficiary');

            if (cycle.totalCollected < amount)
                return res.status(404).json('Unsuffiscient Sold !');

            const data = await transferFunds({
                amount,
                accountNumber,
                bankCode,
                senderEmail: tontine.admin.email,
                senderPhone: tontine.admin.phone,
                senderLastName: tontine.admin.name,
                senderOtherNames: tontine.admin.name,
                beneficiaryLastName: user.name,
                beneficiaryOtherNames: user.name
            });

            if (data.ResponseCode === "90000") {
                const transaction = await Transaction.create({
                    amount,
                    transactionReference: data.transactionReference,
                    tontineCycle: cycle._id,
                    tontineId: cycle.tontineId,
                    user: user._id
                });

                cycle.totalCollected -= amount;
                await cycle.save();
                return res.status(200).json("Funds transfered");
            }
            return res.status(404).json('Transfer Error');
        } catch(error) {
            return res.status(404).json(error);
        }
    },
    collectCampaignFunds: async(req, res) => {
        try {
            const userId = req.query.userId;
            const campaignId = req.body.campaignId;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json('Unknown User');
            }

            const {accountNumber, bankCode, amount} = req.body;
            if (!accountNumber || !bankCode || !amount)
                return res.status(404).json('Need this informations');

            const campaign = await Campaign.findById(campaignId).populate('admin');
            if (!campaign) {
                return res.status(404).json('Unknown Contribution');
            }

            if (campaign.admin.toString() !== user._id.toString()) {
                return res.status(403).json('Unauthorized! Only Admin can collect');
            }

            if (amount > campaign.totalCollected)
                return res.status(404).json('Unsuffiscient sold');

            const data = await transferFunds({
                amount,
                accountNumber,
                bankCode,
                senderEmail: campaign.admin.email,
                senderPhone: campaign.admin.phone,
                senderLastName: campaign.admin.name,
                senderOtherNames: campaign.admin.name,
                beneficiaryLastName: user.name,
                beneficiaryOtherNames: user.name
            });

            if (data.ResponseCode === "90000") {
                const transaction = await Transaction.create({
                    amount,
                    transactionReference: data.transactionReference,
                    campaignId,
                    user: user._id
                });

                campaign.totalCollected -= amount;
                await campaign.save();
                return res.status(200).json("Funds Collected");
            }
            return res.status(404).json('Transfer Error');
        } catch(error) {
            return res.status(404).json(error);
        }
    }
})

const validateAccount = async (accessToken, accountNumber, bankCode) => {
    try {
        const {accessToken, accountNumber, bankCode} = req.body;
        
        const response = await axios.get(
        `https://qa.interswitchng.com/quicktellerservice/api/v5/transactions/DoAccountNameInquiry?accountNumber=${accountNumber}&bankCode=${bankCode}`,
        {
            headers: {
            Authorization: `Bearer ${accessToken}`,
            terminalId: '3PBL0001',
            bankCode: bankCode,
            accountId: accountNumber
            },
        });
        return response.data;
    } catch (error) {
      console.error("Erreur lors de la validation du compte :", error.response.data);
      return null;
    }
};

async function generateToken(cl_id, sc_key) {
    const clientId = cl_id || process.env.INTERSWITCH_CLIENT_ID;
    const secretKey = sc_key || process.env.INTERSWITCH_SECRET_KEY;

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

async function transferFunds(transferDetails) {    
    const data = await generateToken(process.env.INTERSWITCH_TRANSFER_CLIENT_ID,
        process.env.INTERSWITCH_TRANSFER_SECRET_KEY);

    const payload = {
        transferCode: generateTransferCode(),
        mac: calculateMac(transferDetails.amount.toString(), "566", "CA",  transferDetails.amount.toString(), "566", "AC", "NG"),
        termination: {
            amount: transferDetails.amount,
            accountReceivable: {
                accountNumber: transferDetails.accountNumber,
                accountType: "00",
            },
            entityCode: transferDetails.bankCode,
            currencyCode: "566",
            paymentMethodCode: "AC",
            countryCode: "NG",
        },
        sender: {
            phone: transferDetails.senderPhone || "08124888436",
            email: transferDetails.senderEmail || "dadubiaro@interswitch.com",
            lastname: transferDetails.senderLastName || "Adubiaro",
            othernames: transferDetails.senderOtherNames || "Deborah",
        },
        initiatingEntityCode: "PBL",
        initiation: {
            amount: transferDetails.amount,
            currencyCode: "566",
            paymentMethodCode: "CA",
            channel: "7",
        },
        beneficiary: {
            lastname: transferDetails.beneficiaryLastName || "ralph",
            othernames: transferDetails.beneficiaryOtherNames || "apho",
        },
    };

    const response = await axios.post(
        "https://qa.interswitchng.com/quicktellerservice/api/v5/transactions/TransferFunds",
        payload,
        {
            headers: {
                Authorization: `Bearer ${data.access_token}`,
                "Content-Type": "application/json",
                accept: "application/json",
                terminalId: "3PBL",
            }
        }
    );

    return response.data;
}

module.exports = interswitchController;
