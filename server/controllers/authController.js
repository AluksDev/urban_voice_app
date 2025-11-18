const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    console.log("Req.body: ", req.body);
    res.json({ message: "Signup route works" });
};

exports.login = async (req, res) => {
    // logic will go here
    res.json({ message: "Login route works" });
};
