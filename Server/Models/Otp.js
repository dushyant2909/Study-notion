const mongoose = require('mongoose');
const mailSender = require('../Utils/mailSender');
const otpTemplate = require('../mailTemplates/otpVerificationTemplate');

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true
        },
        otp: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            expires: 5 * 60,
            required: true
        }
    }
);

//Schema ke baad model ke pehle use kareing pre or post
async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(email, "OTP Verification email from studyNotion", otpTemplate(otp));
    }
    catch (error) {
        console.error("Error while sending verification email: ", error);
        throw error;
    }
};

otpSchema.pre("save", async function (next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
})

module.exports = mongoose.model("OTP", otpSchema);