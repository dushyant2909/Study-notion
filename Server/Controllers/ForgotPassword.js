const emailValidator = require('validator');
const User = require('../Models/User');
const mailSender = require('../Utils/mailSender');
//after forgot password link comes here
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const { forgotPassword } = require('../mailTemplates/ForgotPassword');
const { passwordUpdate } = require('../mailTemplates/passwordResetTemplate');

exports.forgotPasswordController = async (req, res) => {
    try {
        //get mail from req body
        const { email } = req.body;
        // Validate details
        if (!emailValidator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format',
            });
        }

        //Verify user
        const userExist = await User.findOne({ email });
        //if not found
        if (!userExist) {
            return res.status(401).json({
                success: false,
                message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
            })
        }

        //generate a token for password verification link
        const forgotToken = crypto.randomBytes(20).toString("hex");

        //add token details in user db
        const updatedDetails = await User.findOneAndUpdate(
            { email: email },
            {
                resetPasswordToken: forgotToken,
                resetPasswordExpiration: Date.now() + 5 * 60 * 1000
            },
            { new: true }//You will get updated document in return to updatedDetails
        )

        //Generate a link for password change
        const url = `http://localhost:3000/update-password/${forgotToken}`;

        //Send link to mail
        const emailSent = await mailSender(email, "Password Reset Link", forgotPassword(userExist.firstName + " " + userExist.lastName, email, `${url}`));

        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: "Failed to send update link to email."
            });
        }

        // Password updated successfully
        return res.status(200).json({
            success: true,
            message: "Link Send to email, kindly reset your password.",
        });

    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error in forgot password handler"
        })
    }
}

exports.resetPasswordController = async (req, res) => {
    try {
        //Fetch data
        const { password, confirmPassword, resetPasswordToken } = req.body;

        //validation
        if (!password || !confirmPassword || !resetPasswordToken) {
            return res.status(404).json({
                success: false,
                message: "Please fill all details correctly"
            })
        }

        if (password !== confirmPassword) {
            return res.json({
                success: false,
                message: "Password not match"
            })
        }

        //get user details from db using token
        const userDetails = await User.findOne({ resetPasswordToken })

        //if no entry - invalid token
        if (!userDetails) {
            return res.json({
                success: false,
                message: "Token is invalid"
            });
        }

        //token time check
        if (userDetails.resetPasswordExpiration < Date.now()) {
            return res.status(403).json({
                success: false,
                message: "Token expired, please regenerate token"
            });
        }

        //Hash new password
        const hashedPwd = await bcrypt.hash(password, 10);

        //Password update in db
        const result = await User.findOneAndUpdate(
            { resetPasswordToken: resetPasswordToken },
            { password: hashedPwd },
            { new: true }
        )

        //Send notification to mail
        const emailSent = await mailSender(userDetails.email, "Password Updated Successfully", passwordUpdate(userDetails.email, userDetails.firstName + " " + userDetails.lastName));

        if (!emailSent) {
            return res.status(200).json({
                success: false,
                message: "password changed but mail not sent as notification"
            })
        }

        return res.status(200).json(
            {
                success: true,
                message: "Password Reset successfully",
                user: result
            }
        )
    }
    catch (error) {
        console.error("Error in resetting password", error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}