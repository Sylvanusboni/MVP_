const express = require("express");
const axios = require("axios");
const { Payment, User, Transfer } = require("../models/appModel");
const crypto = require("crypto");
const router = express.Router();
// Payment initiation route

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

async function generateToken(cl_id, sc_key) {
  const clientId = cl_id ? cl_id : process.env.INTERSWITCH_CLIENT_ID;
  const secretKey = sc_key ? sc_key : process.env.INTERSWITCH_SECRET_KEY;

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

function generateTransferCode() {
  const timestamp = Date.now(); 
  const randomPart = Math.floor(Math.random() * 1000000); 
  return `PSHOP-${timestamp}${randomPart}`;
}

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
                accountType: transferDetails.accountType || "00",
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

router.post("/pay", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res
        .status(400)
        .json({ success: false, message: "userId and amount are required" });
    }

    // Fetch the user email from the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const email = user.email;

    // Generate authorization token
    const data = await generateToken();
    const merchantCode = data.merchant_code;
    const paymentItemId = process.env.INTERSWITCH_PAY_ITEM_ID;

    const headers = {
      Authorization: `Bearer ${data.access_token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Generate unique transaction reference
    const transactionReference = `MVP-ECPN-${Date.now()}`;
    console.log("transactionReference", transactionReference);

    // Make API request to Interswitch
    const response = await axios.post(
      "https://qa.interswitchng.com/paymentgateway/api/v1/paybill",
      {
        merchantCode: merchantCode,
        payableCode: paymentItemId,
        amount: amount * 100, // Convert to kobo
        redirectUrl: "http://localhost:8080/api/interswitch/callback",
        customerId: email,
        currencyCode: "566",
        customerEmail: email,
        transactionReference: transactionReference,
      },
      { headers }
    );

    // Save the payment request in the database (status is "Pending")
    const newPayment = new Payment({
      userId,
      amount,
      transactionId: response.data.reference, // Storing the reference from Interswitch response
      transactionReference: transactionReference,
      status: "Pending", // Payment is pending until callback confirms it
    });

    await newPayment.save();

    // Return the payment response, including the payment URL
    res.status(200).json({
      success: true,
      message: "Payment initiated",
      paymentUrl: response.data.paymentUrl,
      transactionReference,
    });
  } catch (error) {
    console.error("Payment error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Payment failed",
      error: error.response?.data || error.message,
    });
  }
});

router.post('/transfer', async (req, res) => {
  try {
    const { userId, amount, accountNumber, accountType, lastname, othernames } = req.body;

    if (!userId || !amount || !accountNumber || !accountType) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Fetch the user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const transferCode = generateTransferCode();
    const response = await transferFunds({
      amount,
      accountNumber,
      accountType,
      lastname,
      othernames,
      transferCode,
      bankCode,
      senderEmail,
      senderLastName,
      senderPhone,
      senderOtherNames,
      beneficiaryLastName,
      beneficiaryOtherNames
    });

    // Save transaction to MongoDB
    const newTransfer = new Transfer({
      userId,
      transferCode,
      amount,
      status: 'Pending',
      beneficiary: { lastname, othernames },
      sender: { email: user.email, lastname: 'Oyelayo', othernames: 'Toyosi', phone:'0732246413' },
      termination: { accountNumber, accountType, countryCode: 'NG', entityCode: '058', paymentMethodCode: 'AC' },
    });

    await newTransfer.save();
    res.status(200).json({ success: true, message: 'Transfer initiated', data: response });
  } catch (error) {
    console.error('Transfer Error:', error.response?.data || error.message);
    res.status(404).json({
      success: false,
      message: 'Transfer failed',
      error: error.response?.data || error.message,
    });
  }
});

router.post('/validate', async (req, res) => {
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
})

module.exports = router;
