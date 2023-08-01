const User = require('../Models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailValidator = require('validator');

require('dotenv').config();

exports.loginController = async (req, res) => {
    try {
        //get email and password from req ki body
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all details carefully"
            });
        }

        if (!emailValidator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format',
            });
        }

        //Find user with provided email
        const userExist = await User.findOne({ email }).populate('additionalDetails').exec();

        if (!userExist) {
            return res.status(401).json({
                success: false,
                message: "User not found, kindly Register Yourself"
            });
        }

        try {
            const isMatch = await bcrypt.compare(password, userExist.password);

            if (isMatch) {
                // Password matched, so create a JWT token
                const payload = {
                    id: userExist._id,
                    email: userExist.email,
                    accountType: userExist.accountType
                };
                const token = jwt.sign(payload, process.env.JWT_SECRET, {
                    expiresIn: "2h"
                });
                // Convert Mongoose document to a plain JavaScript object
                const userObject = userExist.toObject();

                // Set the token field in the userObject
                userObject.token = token;

                // Exclude sensitive information from the userObject
                delete userObject.password;

                const options = {
                    expiresIn: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),//3 days
                    httpOnly: true
                }

                // Send the token and user details in the response
                return res.cookie("token", token, options).status(200).json({
                    success: true,
                    message: "Login successful",
                    token,
                    user: userObject // Send user details without the password
                });

            } else {
                return res.status(401).json({
                    success: false,
                    message: "Incorrect Password"
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error in comparing password"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
