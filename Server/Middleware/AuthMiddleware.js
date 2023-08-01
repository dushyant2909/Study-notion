const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../Models/User');

//authentication middleware
exports.auth = (req, res, next) => {
    try {
        // fetch token
        // There are 3 ways to fetch token body, cookies, header(best method)
        const token = req.cookies.token || req.body.token || req.headers["authorization"].replace("Bearer ", "");
        if (!token) {
            return res.status(401).json(
                {
                    success: false,
                    message: "Token missing.."
                }
            )
        }
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET)
            //You add user to req
            req.user = payload;
            next();
        }
        catch (error) {
            return res.status(401).json(
                {
                    success: false,
                    message: "Token is invalid"
                }
            )
        }
    }
    catch (error) {
        console.log("Verifying token error: ", error.message);
        res.status(401).json(
            {
                success: false,
                message: error.message
            }
        )
    }
}

//authorization middleware
exports.isStudent = (req, res, next) => {
    try {
        if (req.user.accountType !== 'Student') {
            return res.status(401).json({
                success: false,
                message: "This protected route is only available to students"
            });
        }
        next(); // Add this line to move to the next middleware or route handler.
    } catch (error) {
        console.log("Error in matching student role: ", error.message);
        return res.status(500).json({
            success: false,
            message: "Error in matching role"
        });
    }
};

exports.isInstructor = (req, res, next) => {
    try {
        if (req.user.accountType !== 'Instructor') {
            return res.status(401).json({
                success: false,
                message: "This protected route is only available to Instructor"
            });
        }
        next(); // Add this line to move to the next middleware or route handler.
    } catch (error) {
        console.log("Error in matching instructor role: ", error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.isAdmin = (req, res, next) => {
    try {
        if (req.user.accountType !== 'Admin') {
            return res.status(401).json({
                success: false,
                message: "This protected route is only available to Admin"
            });
        }
        next(); // Add this line to move to the next middleware or route handler.
    } catch (error) {
        console.log("Error in matching admin role: ", error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
