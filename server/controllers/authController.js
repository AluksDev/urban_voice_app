const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var validator = require('validator');

exports.signup = async (req, res) => {
    let { fullName, email, password } = req.body;
    let trimmedName = validator.trim(fullName);
    let trimmedEmail = validator.trim(email);
    let trimmedPsw = validator.trim(password);
    //Validación inputs
    if (!validator.isEmail(trimmedEmail)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }
    if (!validator.isLength(trimmedName, { min: 2, max: 100 }) || !validator.isAlpha(fullName, 'en-US', { ignore: ' ' })) {
        return res.status(400).json({
            success: false,
            message: "Invalid name format"
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
    res.json({ message: "Signup route works" });
};

exports.login = async (req, res) => {
    // logic will go here
    res.json({ message: "Login route works" });
};
