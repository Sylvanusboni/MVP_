const TontineGroup = require('../models/Tontine/group.model');
const TontineCycle = require('../models/Tontine/cycle.model');
const TontinePayment = require('../models/Tontine/payment.model');
const Invitation = require('../models/invitation.model');
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const GOOGLE_PASS = process.env.GOOGLE_PASS;
const nodemailer = require('nodemailer')

const sendEmail = async (destinataire, sujet, message) => {
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'sylvanusboni21@gmail.com',
                pass: GOOGLE_PASS
            }
        });

        let mailOptions = {
            from: 'sylvanusboni21@gmail.com',
            to: destinataire,
            subject: sujet,
            text: message
        };
        let info = await transporter.sendMail(mailOptions);
        console.log('Email envoyé: ' + info.response);
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email: ', error);
    }
};

async function sendInvitation(groupType, sender, groupId, dest)
{
    const invitation = await Invitation.create({
        groupId,
        groupType,
        invitedBy: sender._id,
        invitedTo: dest._id,
        status: 'pending',
        user: dest._id
    });
    //Handle Expiry Date
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

const TontineController = ({
    getUserTontine: async(req, res) => {
        try {
            const userId = req.query.userId;

            console.log("Inside User Id: ", userId);
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json('Unknown User');
            }

            console.log("User: ", user);

            const tontines = await TontineGroup.find({members: {$elemMatch: {userId: user._id}}}).populate('members.userId', 'name email').populate('admin', 'name email');
            const admins = await TontineGroup.find({admin: user._id}).populate('members.userId', 'name email').populate('admin', 'name email');

            return res.status(200).json({
                tontines: tontines,
                admins: admins
            });
        } catch (error) {
            return res.status(404).json(error);
        }
    },
    create: async(req, res) => {
        try {
            const {name, contributionAmount, cycleDuration, members, startDate} = req.body;

            if (!name || !contributionAmount || !cycleDuration || !startDate || contributionAmount === 0) {
                return res.status(400).json({message: 'All fields are required'});
            }

            const user = await User.findById(req.query.userId);

            if (!user) {
                return res.status(404).json('Undefined User');
            }

            const tontine = new TontineGroup({
                name,
                admin: user._id,
                members,
                contributionAmount,
                cycleDuration,
                startDate,
                status: 'pending',
                totalCollected: 0,
            });
    
            await tontine.save();
    
            res.status(200).json({ message: 'Tontine created successfully', tontine });
        } catch (error) {
            res.status(404).json({ message: 'Server Error', error: error.message });
        }
    },
    start: async(req, res) => {
        try {
            const {tontineId} = req.params;
            console.log(tontineId);

            const tontine = await TontineGroup.findById(tontineId);
            if (!tontine) return res.status(404).json({ message: 'Tontine not found'});

            if (tontine.status !== 'pending') {
                return res.status(400).json({ message: 'Tontine already started or completed'});
            }

            if (tontine.admin.toString() !== req.query.userId) {
                return res.status(403).json({ message: 'Only admin can start tontine'});
            }

            const startDate = new Date(tontine.startDate);
            const cycleDuration = tontine.cycleDuration;
            const members = tontine.members;

            const _members = members.map(it => {
                return {
                    userId: it.userId,
                    payed: 0,
                    rest: tontine.contributionAmount
                }
            })

            for (let i = 0; i < members.length; i++) {
                const cycle = new TontineCycle({
                    tontineId,
                    cycleNumber: i + 1,
                    beneficiary: members[i],
                    dueDate: new Date(startDate.getTime() + i * cycleDuration * 24 * 60 * 60 * 1000),
                    status: 'pending',
                    collectedAmount: 0,
                    members: _members,
                    collected: false
                });
                await cycle.save();
            }

            tontine.status = 'started';
            await tontine.save();

            res.status(200).json({ message: 'Tontine started successfully' });
        } catch (error) {
            res.status(404).json({ message: 'Server Error', error: error.message });
        }
    },
    payCycleContribution: async(req, res) => {
        try {
            const {tontineId, cycleId} = req.params;
            const {amount} = req.body;

            const transactionRef = `TNT-${tontineId}-${cycleId}-${Date.now()}`;
    
            const paymentResponse = await initiatePayment(
                amount,
                transactionRef,
                `Payment for tontine cycle ${cycleId}`,
                `http://yourdomain.com/tontine/payment/callback`
            );
    
            const payment = new TontinePayment({
                tontineId,
                cycleId,
                memberId: req.user.id,
                amount,
                paymentDate: new Date(),
                paymentStatus: 'pending',
                transactionId: transactionRef,
            });
    
            await payment.save();
    
            res.status(200).json({
                message: 'Payment initiated successfully',
                data: paymentResponse,
            });
        } catch (error) {
            res.status(404).json({ message: 'Server Error', error: error.message });
        }
    },
    getReport: async(req, res) => {
        try {
            const {tontineId} = req.params;
    
            const payments = await TontinePayment.find({tontineId});
            const report = payments.map((payment) => ({
                member: payment.memberId,
                amount: payment.amount,
                status: payment.paymentStatus,
            }));
    
            res.status(200).json({ message: 'Report generated', data: report });
        } catch (error) {
            res.status(404).json({ message: 'Server Error', error: error.message });
        }
    },
    inviteMembers: async(req, res) => {
        try {
            const {groupId, emails} = req.body;

            const group = await TontineGroup.findById(groupId).populate('admin');

            if (!group) return res.status(404).json({message: 'Group not found'});

            if ((group.admin._id.toString() !== req.query.userId) || group.admin._id.toString() !== (req.query.userId) || group.admin._id.toString() !== (req.query.userId))
                return res.status(403).json({ message: 'Only admin can invite members' });

            for (const email of emails) {
                const user = await User.findOne({email: email});
                if (!user) {
                    sendEmail(email, `Invitation to Join ${group.name}`, `${group.admin.name} invites you to join ${group.name}. Register yourself at http://localhost:8080/login, to succed to join `);
                    continue;
                }
                sendInvitation('TontineGroup', group.admin, group._id, user);
                group.members.push({
                    userId: user._id,
                    status: 'pending'
                });
            }
    
            await group.save();
            res.status(200).json({ message: 'Invitations sent successfully', data: group });
        } catch (error) {
            res.status(404).json({ message: 'Server Error', error: error.message });
        }    
    },
    getCycle: async(req, res) => {
        try {
            if (!req.query.tontineId && !req.query.cycleId) {
                return res.status(404).json('Set Ids');
            }
            if (req.query.tontineId) {
                const tontine = await TontineController.findById(req.query.tontineId);
                if (!tontine) {
                    return res.status(404).json('Undefined Tontine');
                }
                const cycles = await TontineCycle.find({tontineId: tontine._id}).populate('members.userId', 'name email').populate('beneficiary', 'name email');
                return res.status(200).json(cycles);
            }
            if (req.query.cycleId) {
                const tontineCycle = await TontineCycle.findById(cycleId).populate('members.userId', 'name email').populate('beneficiary', 'name email');

                if (!tontineCycle)
                    return res.status(404).json('Invalid Cycle');
                return res.status(200).json(tontineCycle);
            }

         } catch (error) {
            return res.status(404).json(error);
        }
    },
    updateCycle: async(req, res) => {
        try {
            const cycleId = req.query.cycleId || req.body.cycleId;
            const tontineId = req.query.tontineId || req.body.tontineId;

            const cycle = await TontineCycle.findById(cycleId);

            if (!cycle) {
                return res.status(404).json('Undefined Cycle');
            }
            const tontine = await TontineGroup.findById(tontineId);
            if (!tontine)
                return res.status(404).json('Undefined Tontine');
            
            const {beneficiary} = req.body; //new Beneficiary Id
            const beneficiaryOldCycle = await TontineCycle.findOne({beneficiary: beneficiary});
            if (!beneficiaryOldCycle) {
                return res.status(404).json('Unknown Beneficiary');
            }
            beneficiaryOldCycle.beneficiary = cycle.beneficiary;
            cycle.beneficiary = beneficiary;
            await beneficiaryOldCycle.save();
            await cycle.save();
            await tontine.save();
            //Change le bénéficiaire et interchanger sa place avec celui dont il prend le tour
        } catch (error) {
            return res.status(404).json(error)
        }
    },
    getMembers: async(req, res) => {
        try {
            const tontineId = req.query.tontineId;

            const tontine = await TontineGroup.findById(tontineId).populate('members.userId', 'name email');

            if (!tontine) {
                return res.status(404).json('Unknown Tontine');
            }

            return res.status(200).json({
                id: tontine._id,
                members: tontine.members
            });
        } catch (error) {
            return res.status(404).json(error);
        }
    },
    collectTontine: async(req, res) => {
        try {
            const userId = req.query.userId;
            const cycleId = req.body.cycleId;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json('Unknown User');
            }

            const cycle = await TontineCycle.findById(cycleId);
            if (!cycle) {
                return res.status(404).json('Unknown Cycle');
            }

            if (cycle.beneficiary.toString() !== user._id.toString()) {
                return res.status(403).json('Unauthorized! You aint this cycle beneficiary');
            }

            return res.status(200).json('Keep Going Man')
        } catch (error) {

        }
    },
    payTontine: async(req, res) => {
        try {
            const {amount, cycleId} = req.body;
            const userId = req.query.userId;

            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json('Unknown User');
            }

            const cycle = await TontineCycle.findById(cycleId);
            if (!cycle) {
                return res.status(404).json('Unknown Cycle');
            }

            const member = cycle.members.find(it => it.userId.toString() === user._id.toString());
            if (!member) {
                return res.status(404).json('He is not in this tontine');
            }
            if (member.rest === 0) {
                return res.status(404).json('Already Payed for this Cycle');
            }

            const data = await generateToken();
            const merchantCode = data.merchant_code;
            const paymentItemId = process.env.INTERSWITCH_PAY_ITEM_ID;

            const headers = {
                Authorization: `Bearer ${data.access_token}`,
                "Content-Type": "application/json",
                "accept": "application/json"
            }
            const transactionReference = `MVP-TTN-${user._id}-${Date.now()}`;
            const response = await axios.post('https://qa.interswitchng.com/paymentgateway/api/v1/paybill',{
                    "merchantCode": merchantCode,
                    "payableCode": paymentItemId,
                    "amount": amount * 100,
                    "redirectUrl": "http://localhost:8080/api/interswitch/callback",
                    "customerId": user.email,
                    "currencyCode": "566",
                    "customerEmail": user.email,
                    "transactionReference": transactionReference
                },
                {headers}
            );
            console.log(response.data);
            const newContribution = await Transaction.create({
                amount,
                transactionReference: transactionReference,
                tontineCycle: cycle._id,
                tontineId: cycle.tontineId,
                user: user._id
            });
            
            await newContribution.save();
            await campaign.save();
            return res.status(200).json(response.data);
        } catch (error) {
            return res.status(404).json('Payment')
        }
    }
});

// cron.schedule('0 9 * * *', async () => {
//     const pendingPayments = await TontinePayment.find({ paymentStatus: 'pending' });
//     pendingPayments.forEach(async (payment) => {
//         const user = await User.findById(payment.memberId);
//         if (user) {
//             await sendReminderEmail(user.email, payment.amount);
//         }
//     });
// });

module.exports = TontineController;