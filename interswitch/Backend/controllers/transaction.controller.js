const axios = require('axios');
const { Payment, User } = require("../models/appModel");

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

const transactionController = {
    complete: async (req, res) => {
      try {
        const { transactionReference, amount, userId } = req.body;
        console.log("Transaction Reference:", transactionReference);
        console.log("Amount:", amount);
        console.log("User ID:", userId);
  
        if (!transactionReference || !amount || !userId) {
          return res.status(400).json({ success: false, message: "Transaction reference, amount, and userId are required" });
        }
  
        // Fetch the payment record from the database
        const payment = await Payment.findOne({ userId, transactionReference });
  
        if (!payment) {
          return res.status(404).json({ success: false, message: "Payment record not found" });
        }
        console.log("Payment record:", payment);
        // Validate the amount
        if (payment.amount !== Number(amount)) {
            return res.status(400).json({ success: false, message: "Amount does not match the recorded transaction" });
          }
  
        // Generate authorization token
        const data = await generateToken();
        const merchantCode = data.merchant_code;
  
        const headers = {
          Authorization: `Bearer ${data.access_token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        };
  
        // Verify transaction with Interswitch
        const response = await axios.get(
          `https://qa.interswitchng.com/collections/api/v1/gettransaction.json?merchantcode=${merchantCode}&transactionreference=${transactionReference}&amount=${amount * 100}`,
          { headers }
        );
  
        console.log("Transaction status:", response.data);
  
        if (response.data.ResponseCode !== "00") {
          return res.status(400).json({ success: false, message: "Transaction verification failed" });
        }
  
        // Update the payment status to "Completed"
        payment.status = "Completed";
        await payment.save();
  
        return res.status(200).json({ success: true, message: "Transaction completed successfully" });
  
      } catch (error) {
        console.error("Transaction verification error:", error.response?.data || error.message);
        return res.status(500).json({
          success: false,
          message: "Transaction verification failed",
          error: error.response?.data || error.message,
        });
      }
    },
  };

module.exports = transactionController;