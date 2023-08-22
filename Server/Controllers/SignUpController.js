const User = require('../Models/User');
const OTP = require('../Models/Otp');
const Profile = require('../Models/Profile');
const Course = require('../Models/Course');
const CourseProgress = require('../Models/CourseProgress');
const emailValidator = require('validator');
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');

exports.sendOTP = async (req, res) => {
    try {
        // Fetch email from req.body
        const { email } = req.body;

        // Check for correct email format
        if (!emailValidator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format',
            });
        }

        // Check if user already exists
        const checkUser = await User.findOne({ email });

        if (checkUser) {
            return res.status(401).json({
                success: false,
                message: "User already registered."
            });
        }

        // Generate OTP containing only numeric digits (0-9)
        const otp = otpGenerator.generate(6, {
            digits: true,
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        // OTP must be unique
        let otpUniqueness = await OTP.findOne({ otp });
        while (otpUniqueness) {
            // Regenerate OTP if already exists in the database
            const otp = otpGenerator.generate(6, {
                digits: true,
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            otpUniqueness = await OTP.findOne({ otp });
        }

        // Store OTP in the database
        await OTP.create({
            email,
            otp
        });

        // Return response successfully
        return res.status(200).json({
            success: true,
            message: "OTP generated successfully.",
            otp: otp
        });

    } catch (error) {
        console.error("OTP generation error: ", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.signUpController = async (req, res) => {
    try {
        // Fetch data
        const { firstName, lastName, email, password, confirmPassword, accountType, otp } = req.body;
        //otp will be provided by user for validation in req.body

        //Check if details present
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).send({
                success: false,
                message: "All fields are required for signup"
            })
        }

        // Validate email
        if (!emailValidator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format',
            });
        }

        // Match password and confirm password
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password and Confirm Password do not match',
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists, kindly login"
            });
        }

        // Find most recent OTP
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

        // Validate OTP
        if (recentOtp.length === 0) {
            //otp not found
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }
        else if (otp !== recentOtp[0].otp) {
            //Invalid otp
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        //Hash password before saving to database
        let hashedPassword// So that it is available below
        try {
            hashedPassword = await bcrypt.hash(password, 10);
        }
        catch (err) {
            return res.status(500).json(
                {
                    success: false,
                    message: "Error in hashing password"
                }
            )
        }

        //Create the user
        let approved = "";
        approved === "Instructor" ? (approved = false) : (approved = true);

        //Create entry in database
        //Since in additional password i give reference of profile model so create profile model
        const createProfile = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        })

        const createdUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            approved,
            additionalDetails: createProfile._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}%20${lastName}`,
        });

        //Send response
        return res.status(200).json({
            success: true,
            message: "User registered successfully",
            createdUser
        })
    } catch (error) {
        // Handle errors here
        console.error("Error in signUpController: ", error.message);
        res.status(500).json({
            success: false,
            message: "Fail to register user, please try again"
        });
    }
};
