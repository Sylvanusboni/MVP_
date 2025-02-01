const axios = require('axios');
const baseURL = process.env.INTERSWITCH_BASE_URL;
const clientId = process.env.INTERSWITCH_CLIENT_ID;
const secretKey = process.env.INTERSWITCH_SECRET_KEY;
const crypto = require("crypto");

function calculateMac(initiatingAmount,
    initiatingCurrencyCode, initiatingPaymentMethodCode,
    terminatingAmount, terminatingCurrencyCode,
    terminatingPaymentMethodCode, terminatingCountryCode) {

  const data = `${initiatingAmount}${initiatingCurrencyCode}${initiatingPaymentMethodCode}${terminatingAmount}${terminatingCurrencyCode}${terminatingPaymentMethodCode}${terminatingCountryCode}`;
  return crypto.createHash("sha512").update(data).digest("hex");
};

function getAuthHeader(clientId, secretKey) {
    return `Basic ${Buffer.from(`${clientId}:${secretKey}`).toString('base64')}`;
}

function generateTransferCode() {
    const timestamp = Date.now(); 
    const randomPart = Math.floor(Math.random() * 1000000); 
    return `${timestamp}${randomPart}`;
}


async function fundTransfer(transferDetails) {
    const token = await generateToken();
    const url = "https://qa.interswitchng.com/quicktellerservice/api/v5/transactions/TransferFunds";

    const headers = {
        "Authorization": `Bearer ${token}`,
        "TerminalID": "3PBL",
        "Content-Type": "application/json"
    };

    const body = {
        transferCode: generateTransferCode(),
        mac: transferDetails.mac,
        termination: transferDetails.termination,
        sender: transferDetails.sender,
        initiatingEntityCode: transferDetails.initiatingEntityCode,
        initiation: transferDetails.initiation,
        beneficiary: transferDetails.beneficiary
    };

    try {
        const response = await axios.post(url, body, { headers });
        return response.data;
    } catch (error) {
        throw new Error(error.response ? error.response.data : error.message);
    }
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
            const data = await generateToken();
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
            
            const payload = {
                transferCode: "030009998999",
                mac: "9f4e4f53c57be63e1f08d8f07a7bc1a9461e4a7d5304043daa1ef54bd727b6cde148f4fbfc5e2ad8c4a60f78dfa76304de671fbeb70657b1628f14b6b6baa5e1",
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
                    phone: transferDetails.senderPhone,
                    email: transferDetails.senderEmail,
                    lastname: transferDetails.senderLastName,
                    othernames: transferDetails.senderOtherNames,
                },
                initiatingEntityCode: "PBL",
                initiation: {
                    amount: transferDetails.amount,
                    currencyCode: "566",
                    paymentMethodCode: "CA",
                    channel: "7",
                },
                beneficiary: {
                    lastname: transferDetails.beneficiaryLastName || "",
                    othernames: transferDetails.beneficiaryOtherNames || "",
                },
            };

        } catch (err) {
            console.log('Error while transfering funds', err);
            return res.status(404).json(err);
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

// const Transfer = () => {
//   const [amount, setAmount] = useState("");
//   const [accountNumber, setAccountNumber] = useState("");
//   const [bankCode, setBankCode] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [transactionDetails, setTransactionDetails] = useState(null);

//   const getAccessToken = async () => {
//     const clientId = "TON_CLIENT_ID";
//     const clientSecret = "TON_CLIENT_SECRET";
//     const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

//     try {
//       const response = await axios.post(
//         "https://sandbox.interswitchng.com/passport/oauth/token",
//         "grant_type=client_credentials",
//         {
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//             Authorization: `Basic ${auth}`,
//           },
//         }
//       );
//       return response.data.access_token;
//     } catch (error) {
//       console.error("Erreur lors de l'obtention du token :", error.response.data);
//       return null;
//     }
//   };

//   const initiateTransfer = async (accessToken, transferDetails) => {
//     const payload = {
//       transferCode: "030009998999",
//       mac: "9f4e4f53c57be63e1f08d8f07a7bc1a9461e4a7d5304043daa1ef54bd727b6cde148f4fbfc5e2ad8c4a60f78dfa76304de671fbeb70657b1628f14b6b6baa5e1",
//       termination: {
//         amount: transferDetails.amount,
//         accountReceivable: {
//           accountNumber: transferDetails.accountNumber,
//           accountType: "00",
//         },
//         entityCode: transferDetails.bankCode,
//         currencyCode: "566",
//         paymentMethodCode: "AC",
//         countryCode: "NG",
//       },
//       sender: {
//         phone: transferDetails.senderPhone,
//         email: transferDetails.senderEmail,
//         lastname: transferDetails.senderLastName,
//         othernames: transferDetails.senderOtherNames,
//       },
//       initiatingEntityCode: "PBL",
//       initiation: {
//         amount: transferDetails.amount,
//         currencyCode: "566",
//         paymentMethodCode: "CA",
//         channel: "7",
//       },
//       beneficiary: {
//         lastname: transferDetails.beneficiaryLastName || "",
//         othernames: transferDetails.beneficiaryOtherNames || "",
//       },
//     };

//     try {
//       const response = await axios.post(
//         "https://qa.interswitchng.com/quicktellerservice/api/v5/transactions/TransferFunds",
//         payload,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             "Content-Type": "application/json",
//             terminalId: "3PBL",
//           },
//         }
//       );
//       return response.data;
//     } catch (error) {
//       console.error("Erreur lors du transfert :", error.response.data);
//       return null;
//     }
//   };

//   const handleTransfer = async () => {
//     setLoading(true);
//     setMessage("");

//     const accessToken = await getAccessToken();
//     if (!accessToken) {
//       setMessage("Erreur d'authentification. Veuillez réessayer.");
//       setLoading(false);
//       return;
//     }

//     // Détails du transfert
//     const transferDetails = {
//       amount: parseFloat(amount) * 100,
//       accountNumber: accountNumber,
//       bankCode: bankCode,
//       senderPhone: "08124888436",
//       senderEmail: "dadubiaro@interswitch.com",
//       senderLastName: "Adubiaro",
//       senderOtherNames: "Deborah",
//       beneficiaryLastName: "ralph",
//       beneficiaryOtherNames: "ralpo",
//     };

//     // Initier le transfert
//     const result = await initiateTransfer(accessToken, transferDetails);
//     if (result) {
//       setTransactionDetails(result);
//       setMessage("Transfert réussi !");
//     } else {
//       setMessage("Erreur lors du transfert. Veuillez réessayer.");
//     }

//     setLoading(false);
//   };

//   return (
//     <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
//       <h1>Transfert d'Argent</h1>
//       <div>
//         <label>Montant (NGN) :</label>
//         <input
//           type="number"
//           value={amount}
//           onChange={(e) => setAmount(e.target.value)}
//         />
//       </div>
//       <div>
//         <label>Numéro de Compte :</label>
//         <input
//           type="text"
//           value={accountNumber}
//           onChange={(e) => setAccountNumber(e.target.value)}
//         />
//       </div>
//       <div>
//         <label>Code de la Banque :</label>
//         <input
//           type="text"
//           value={bankCode}
//           onChange={(e) => setBankCode(e.target.value)}
//         />
//       </div>
//       <button onClick={handleTransfer} disabled={loading}>
//         {loading ? "Traitement..." : "Transférer"}
//       </button>
//       {message && <p>{message}</p>}
//       {transactionDetails && (
//         <div>
//           <h2>Détails de la Transaction</h2>
//           <p>Référence : {transactionDetails.TransactionReference}</p>
//           <p>Date : {transactionDetails.TransactionDate}</p>
//           <p>Statut : {transactionDetails.ResponseCodeGrouping}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Transfer;

module.exports = interswitchController;
