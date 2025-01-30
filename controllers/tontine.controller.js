const TontineGroup = require('../models/Tontine/group.model');
const TontineCycle = require('../models/Tontine/cycle.model');
const TontinePayment = require('../models/Tontine/payment.model');
const Invitation = require('../models/invitation.model');
const User = require('../models/user.model');

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

const TontineController = ({
    create: async(req, res) => {
        try {
            const {name, contributionAmount, cycleDuration, members, startDate} = req.body;

            if (!name || !contributionAmount || !cycleDuration || !members || !startDate) {
                return res.status(400).json({message: 'All fields are required'});
            }

            const user = await User.findById(req.query.userId || req.body.userId || req.user.id);

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

            const tontine = await TontineGroup.findById(tontineId);
            if (!tontine) return res.status(404).json({ message: 'Tontine not found' });

            if (tontine.status !== 'pending') {
                return res.status(400).json({ message: 'Tontine already started or completed'});
            }

            const startDate = new Date(tontine.startDate);
            const cycleDuration = tontine.cycleDuration;
            const members = tontine.members;

            for (let i = 0; i < members.length; i++) {
                const cycle = new TontineCycle({
                    tontineId,
                    cycleNumber: i + 1,
                    beneficiary: members[i],
                    dueDate: new Date(startDate.getTime() + i * cycleDuration * 24 * 60 * 60 * 1000),
                    status: 'pending',
                    collectedAmount: 0,
                });
                await cycle.save();
            }

            tontine.status = 'active';
            await tontine.save();

            res.status(200).json({ message: 'Tontine started successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
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
                const tontine = await TontineController.findById(res.query.tontineId);
                if (!tontine) {
                    return res.status(404).json('Undefined Tontine');
                }
                const cycles = await TontineCycle.find({tontineId: tontine._id});
                return res.status(200).json(cycles);
            }
            if (req.query.cycleId) {
                const tontineCycle = await TontineCycle.findById(cycleId);
    
                if (!tontineCycle) {
                    return res.status(404).json('Invalid Cycle');
                }
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
            
            const {beneficiary} = req.body;

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
    deleteMember: async(req, res) => {

    },
    delete: async(req, res) => {
        
    }
});

cron.schedule('0 9 * * *', async () => {
    const pendingPayments = await TontinePayment.find({ paymentStatus: 'pending' });
    pendingPayments.forEach(async (payment) => {
        const user = await User.findById(payment.memberId);
        if (user) {
            await sendReminderEmail(user.email, payment.amount);
        }
    });
});