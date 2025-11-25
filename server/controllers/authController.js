const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var validator = require('validator');
require('dotenv').config();

exports.signup = async (req, res) => {
    try {
        let { name, surname, email, password } = req.body;
        let trimmedName = validator.trim(name || '');
        let trimmedSurname = validator.trim(surname || '');
        let trimmedEmail = validator.trim(email || '');
        let trimmedPsw = validator.trim(password || '');

        //Validación inputs
        if (!validator.isEmail(trimmedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }
        if (!validator.isLength(trimmedName, { min: 2, max: 100 }) || !validator.isAlpha(trimmedName, 'en-US', { ignore: ' ' })) {
            return res.status(400).json({
                success: false,
                message: "Invalid name format"
            });
        }
        if (!validator.isLength(trimmedSurname, { min: 2, max: 100 }) || !validator.isAlpha(trimmedSurname, 'en-US', { ignore: ' ' })) {
            return res.status(400).json({
                success: false,
                message: "Invalid surname format"
            });
        }
        if (!validator.isLength(trimmedPsw, { min: 8, max: 100 })) {
            return res.status(400).json({
                success: false,
                message: "Invalid password format"
            });
        }
        //Hash password antes de guardar en la base de datos
        const saltRounds = 10;
        const hashedPsw = await bcrypt.hash(trimmedPsw, saltRounds);
        let [rows] = await req.db.query("SELECT * FROM users WHERE email = ?", [trimmedEmail]);
        if (rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "User already registered"
            });
        }
        let [result] = await req.db.query("INSERT INTO users (name, surname, email, hashed_psw, created_at) VALUES (?, ?, ?, ?, NOW())", [trimmedName, trimmedSurname, trimmedEmail, hashedPsw]);
        if (result.affectedRows === 1) {
            // Build user object for response
            const newUserId = result.insertId;
            const userObj = { id: newUserId, name: trimmedName, surname: trimmedSurname, email: trimmedEmail, role: 'user' };

            const tokenSecret = process.env.JWT_SECRET;
            if (!tokenSecret) {
                console.error('JWT_SECRET not set');
                return res.status(500).json({ success: false, message: 'Server configuration error' });
            }

            const token = jwt.sign({ id: userObj.id, email: userObj.email, role: userObj.role }, tokenSecret, { expiresIn: '1d' });

            return res.status(201).json({
                success: true,
                message: "User registered",
                user: userObj,
                token: token
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Could not register user"
            });
        }
    } catch (err) {
        console.error('Signup error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        let { email, password } = req.body;
        let trimmedLoginEmail = validator.trim(email || '');
        let trimmedLoginPsw = validator.trim(password || '');

        if (!validator.isEmail(trimmedLoginEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }
        if (!validator.isLength(trimmedLoginPsw, { min: 8, max: 100 })) {
            return res.status(400).json({
                success: false,
                message: "Invalid password format"
            });
        }
        let [rows] = await req.db.query("SELECT * FROM users WHERE email = ?", [trimmedLoginEmail]);
        if (rows.length == 0) {
            return res.status(401).json({
                success: false,
                message: "Username or password incorrect"
            });
        }
        const user = rows[0];
        const hashedPassword = user.hashed_psw;
        const pswMatch = await bcrypt.compare(trimmedLoginPsw, hashedPassword);
        if (!pswMatch) {
            return res.status(401).json({
                success: false,
                message: "Username or password incorrect",
            });
        }

        const userId = user.id;
        const userName = user.name;
        const userSurname = user.surname;
        const userEmail = user.email;
        const userRole = user.role;

        const tokenSecret = process.env.JWT_SECRET;
        const tokenPayload = {
            id: userId,
            email: userEmail,
            role: userRole
        }
        const token = jwt.sign(
            tokenPayload,
            tokenSecret,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                id: userId,
                name: userName,
                surname: userSurname,
                email: userEmail,
                role: userRole,
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.verify = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, valid: false, message: 'Not authenticated' });
        }

        const user = req.user;

        // Keep verify response minimal for MVP — server still enforces token expiry.
        return res.status(200).json({ success: true, user });
    } catch (err) {
        console.error('Verify error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
