const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

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

function comparePassword(password, user, res)
{
    bcrypt.compare(password, user.password)
        .then(goodPassword => {
            if (goodPassword) {
                const payload = {
                    name: user.name,
                    id: user._id,
                    email: user.email
                };

                const result = jwt.sign(payload, secret_key, {expiresIn: '1h'}, (err, token) => {
                    return {
                        token: token,
                        id: user._id,
                        email: user.email,
                        name: user.name
                    };
                });
            } else {
                return null;
            }
    })
}

function generateJwtToken(user) {
    const payload = {
        name: user.name,
        id: user.id,
        email: user.email
    }
    return jwt.sign(payload, secret_key, {expiresIn: '1h'});
}

const userController = ({
    signUp: async(req, res) => {
        const {name, surname, email, phone, password} = req.body;

        if (!name || !password || !email) {
            return res.status(404).json('Please Fill the fields');
        }

        const check = await User.findOne({
            email: email
        });
        if (check) {
            return res.status(404).json('Email Already User! Connect Yourself');
        }
        const hashed = bcrypt(password, 10);

        const user = await User.create({
            name,
            email,
            phone,
            password: hashed,
        });
        user.token = generateJwtToken(user);
        await user.save();
        return res.status(200).json(error);
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
            const ct = comparePassword(user.password, user, res);
            if (!ct) {
                return res.status(404).json('Invalid Password');
            }
            user.token = ct.token;
            return res.status(404).json({
                _id: user._id,
                token: user.token,
                name: user.name,
                email: user.email
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