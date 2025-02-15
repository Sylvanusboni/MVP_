const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

function validMail(email) {
    return true;
}

function generateRandomCode() {

}

const GOOGLE_PASS = process.env.GOOGLE_PASS; //'gdls oztc hqmr vdpf'

const sendEmail = async (destinataire, sujet, message) => {
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'sylvanusboni21@gmail.com',
                pass: 'gdls oztc hqmr vdpf'
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

async function comparePassword(password, user, res)
{
    const check = await bcrypt.compare(password, user.password);
    console.log(check);
    if (check) {
        console.log('Good Password');
        const payload = {
            name: user.name,
            id: user._id,
            email: user.email
        };
    
        const token = generateJwtToken(user);
            return {
                token: token,
                id: user._id,
                email: user.email,
                name: user.name
            };
    }
    return null;
}

function generateJwtToken(user) {
    const payload = {
        name: user.name,
        id: user._id,
        email: user.email
    }
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: '1h'});
}

const userController = ({
    signUp: async(req, res) => {
        const {name, email, phone, password} = req.body;

        if (!name || !password || !email) {
            return res.status(404).json('Please Fill the fields');
        }

        const check = await User.findOne({
            email: email
        });
        if (check) {
            return res.status(404).json('Email Already User! Connect Yourself');
        }
        const hashed = await bcrypt.hash(password, 10);

        console.log(hashed)
        let user = await User.create({
            name,
            email,
            phone,
            password: hashed,
        });
        console.log("|", user.password, "|", password, "|");
        user.token = generateJwtToken(user);
        await user.save();
        console.log(user);
        return res.status(200).json(user);
    },
    login: async(req, res) => {
        try {
            const {email, password} = req.body;

            if (!email || !password) {
                return res.status(404).json('Fill the fields');
            }
            const user = await User.findOne({email: email});
            if (!user) {
                return res.status(404).json('Unknown email! Please Sign Up');
            }
            console.log("|", user.password, "|", password, "|");
            const ct = await comparePassword(password, user, res);
            console.log(ct);
            if (!ct) {
                return res.status(404).json('Invalid Password');
            }
            user.token = ct.token;
            await user.save();
            console.log(user, ct);
            return res.status(200).json({
                _id: user._id,
                token: user.token,
                name: user.name,
                email: user.email,
                phone: user.phone
            })
        } catch (error) {
            return res.status(404).json(error);
        }
    },
    getId: async(req, res) => {
        try {
            const {id} = req.params.id;
            const user = await User.findById(id);

            if (!user)
                return res.status(404).json('Unknown User');
            return res.status(200).json(user);
        } catch (error) {
            return res.status(404).json(error);
        }
    },
    validCode: async (req, res) => {

    },
    sendValidationCode: async(req, res) => {

    }
})

module.exports = userController;