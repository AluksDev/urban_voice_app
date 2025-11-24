const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var validator = require('validator');

exports.signup = async (req, res) => {
    let { name, surname, email, password } = req.body;
    let trimmedName = validator.trim(name);
    let trimmedSurname = validator.trim(surname);
    let trimmedEmail = validator.trim(email);
    let trimmedPsw = validator.trim(password);
    //Validación inputs
    if (!validator.isEmail(trimmedEmail)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }
    if (!validator.isLength(trimmedName, { min: 2, max: 100 }) || !validator.isAlpha(name, 'en-US', { ignore: ' ' })) {
        return res.status(400).json({
            success: false,
            message: "Invalid name format"
        });
    }
    if (!validator.isLength(trimmedSurname, { min: 2, max: 100 }) || !validator.isAlpha(surname, 'en-US', { ignore: ' ' })) {
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
        return res.status(201).json({
            success: true,
            message: "User registered",
            userId: result.insertId
        });
    } else {
        return res.status(500).json({
            success: false,
            message: "Could not register user"
        });
    }
};

exports.login = async (req, res) => {
    // logic will go here
    res.json({ message: "Login route works" });
};
