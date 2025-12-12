const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
require('dotenv').config();

exports.signup = async (req, res) => {
    try {
        let { name, surname, email, password } = req.body;
        let trimmedName = validator.trim(name || '');
        let trimmedSurname = validator.trim(surname || '');
        let trimmedEmail = validator.trim(email || '').toLowerCase();
        let trimmedPsw = validator.trim(password || '');

        if (!validator.isEmail(trimmedEmail)) {
            return res.status(400).json({
                success: false,
                code: "INVALID_EMAIL_FORMAT"
            });
        }
        if (!validator.isLength(trimmedName, { min: 1, max: 100 }) || !validator.isAlpha(trimmedName, 'en-US', { ignore: ' ' })) {
            return res.status(400).json({
                success: false,
                code: "INVALID_NAME_FORMAT"
            });
        }
        if (!validator.isLength(trimmedSurname, { min: 1, max: 100 }) || !validator.isAlpha(trimmedSurname, 'en-US', { ignore: ' ' })) {
            return res.status(400).json({
                success: false,
                code: "INVALID_SURNAME_FORMAT"
            });
        }
        if (!validator.isLength(trimmedPsw, { min: 8, max: 100 })) {
            return res.status(400).json({
                success: false,
                code: "INVALID_PASSWORD_FORMAT"
            });
        }

        const saltRounds = 10;
        const hashedPsw = await bcrypt.hash(trimmedPsw, saltRounds);

        let [rows] = await req.db.query("SELECT * FROM users WHERE email = ?", [trimmedEmail]);
        if (rows.length > 0) {
            return res.status(400).json({
                success: false,
                code: "USER_ALREADY_REGISTERED"
            });
        }

        let [result] = await req.db.query(
            "INSERT INTO users (name, surname, email, hashed_psw, created_at) VALUES (?, ?, ?, ?, NOW())",
            [trimmedName, trimmedSurname, trimmedEmail, hashedPsw]
        );

        if (result.affectedRows === 1) {
            const newUserId = result.insertId;
            const userObj = { id: newUserId, name: trimmedName, surname: trimmedSurname, email: trimmedEmail, role: 'user', photo_url: null };

            const tokenSecret = process.env.JWT_SECRET;
            if (!tokenSecret) {
                return res.status(500).json({ success: false, code: "SERVER_CONFIG_ERROR" });
            }

            const token = jwt.sign(
                { id: userObj.id, email: userObj.email, role: userObj.role },
                tokenSecret,
                { expiresIn: '1d' }
            );

            res.cookie('auth_token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000
            });

            return res.status(201).json({
                success: true,
                code: "SIGNUP_SUCCESS",
                user: userObj,
            });
        } else {
            return res.status(500).json({
                success: false,
                code: "REGISTER_FAILED"
            });
        }
    } catch (err) {
        console.error('Signup error:', err);
        return res.status(500).json({ success: false, code: "SERVER_ERROR" });
    }
};

exports.login = async (req, res) => {
    try {
        let { email, password } = req.body;
        let trimmedLoginEmail = validator.trim(email || '').toLowerCase();
        let trimmedLoginPsw = validator.trim(password || '');

        if (!validator.isEmail(trimmedLoginEmail)) {
            return res.status(400).json({
                success: false,
                code: "INVALID_EMAIL_FORMAT"
            });
        }
        if (!validator.isLength(trimmedLoginPsw, { min: 8, max: 100 })) {
            return res.status(400).json({
                success: false,
                code: "INVALID_PASSWORD_FORMAT"
            });
        }

        let [rows] = await req.db.query("SELECT * FROM users WHERE email = ?", [trimmedLoginEmail]);
        if (rows.length == 0) {
            return res.status(401).json({
                success: false,
                code: "INVALID_CREDENTIALS"
            });
        }

        const user = rows[0];
        const pswMatch = await bcrypt.compare(trimmedLoginPsw, user.hashed_psw);

        if (!pswMatch) {
            return res.status(401).json({
                success: false,
                code: "INVALID_CREDENTIALS"
            });
        }

        const userObj = {
            id: user.id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            role: user.role,
            photo_url: `${req.protocol}://${req.get("host")}${user.photo_url}`
        };

        const token = jwt.sign(
            { id: userObj.id, email: userObj.email, role: userObj.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            code: "LOGIN_SUCCESS",
            user: userObj
        });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ success: false, code: "SERVER_ERROR" });
    }
};

exports.logout = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, code: 'NOT_AUTHENTICATED' });
    }

    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 0
    });

    return res.status(200).json({ success: true, code: 'LOGOUT_SUCCESS' });
};

exports.verify = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, valid: false, code: 'NOT_AUTHENTICATED' });
        }

        const user = req.user;
        user.photo_url = `${req.protocol}://${req.get("host")}${user.photo_url}`;

        return res.status(200).json({ success: true, user });
    } catch (err) {
        console.error('Verify error:', err);
        return res.status(500).json({ success: false, code: 'SERVER_ERROR' });
    }
};
