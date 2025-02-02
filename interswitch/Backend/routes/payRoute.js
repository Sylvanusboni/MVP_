const express = require("express");
const axios = require("axios");
const { Payment, User, Transfer } = require("../models/appModel");
const crypto = require("crypto");
const router = express.Router();
// Payment initiation route

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

    // Generate authentication parameters
    const transferCode = `TX-${Date.now()}`;
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(16).toString('hex');

    console.log ('Setting up payload for transfer request to Interswitch');

    const payload = {
      mac: '<computed_mac>',
      beneficiary: { lastname, othernames },
      initiatingEntityCode: 'DMO',
      initiation: {
        amount: String(amount),
        channel: 7,
        currencyCode: 'NG',
        paymentMethodCode: 'CA',
      },
      sender: {
        email: user.email,
        lastname: 'Oyelayo',
        othernames: 'Toyosi',
        phone: '0732246413',
      },
      termination: {
        accountReceivable: { accountNumber, accountType },
        amount,
        countryCode: 'NG',
        currencyCode: 566,
        entityCode: '058',
        paymentMethodCode: 'AC',
      },
      transferCode,
    };

    // Convert payload to JSON string
    const params = JSON.stringify(payload);

    // const data = await generateToken();
    // const merchantCode = data.merchant_code;
    // const paymentItemId = process.env.INTERSWITCH_PAY_ITEM_ID;

    const headers = {
      Authorization: `InterswitchAuth ${Buffer.from(process.env.INTERSWITCH_CLIENT_ID).toString('base64')}`,
      'Content-Type': 'application/json',
      'Signature': '<COMPUTED_SIGNATURE>',
      'Timestamp': timestamp,
      'Nonce': nonce,
      'TerminalID': '<TERMINAL_ID>',
      'SignatureMethod': 'SHA1',
    };

    console.log('Headers:', headers);
    console.log('Payload:', params);

    console.log('Sending transfer request to Interswitch');

    // Send transfer request to Interswitch
    const response = await axios.post(
      'https://sandbox.interswitchng.com/api/v2/quickteller/payments/transfers',
      params,
      { headers,
        timeout: 10000,
       }
    );

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

    res.status(200).json({ success: true, message: 'Transfer initiated', data: response.data });

  } catch (error) {
    console.error('Transfer Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Transfer failed',
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;
