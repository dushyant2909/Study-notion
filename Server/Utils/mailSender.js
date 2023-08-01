const nodemailer = require('nodemailer');
const transporter = require('../Configurations/transporter');

const mailSender = async (email, title, body) => {
    try {
        let info = await transporter.sendMail({
            from: 'StudyNotion || A learning platform',
            to: email,
            subject: title,
            html: body
        });
        return info;
    }
    catch (error) {
        console.error("Error occured in mail sender utility", error);
        throw error;
    }
};

module.exports = mailSender;