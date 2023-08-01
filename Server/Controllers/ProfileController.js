//since we created a fake profile in user model having null values so we now update that profile
//alternatively you can also create a new profile and then push to user
const Profile = require('../Models/Profile');
const User = require('../Models/User');
const { uploadFileTocloudinary } = require('../Utils/fileUploadToCloudinary');

//Basically we created a fake profile while sigup so we update profile (logically)
exports.createProfile = async (req, res) => {//Here we are updating profile
    try {
        const { gender = "", dateOfBirth = "", about = "" } = req.body;

        //get userId
        const userId = req.user.id;// added due to auth middleware in req.user

        //find profile
        const userDetails = await User.findById({ _id: userId });

        if (!userDetails) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            })
        }

        const profileId = userDetails.additionalDetails;

        if (!profileId) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            })
        }

        // update profile
        const updatedProfileResult = await Profile.findByIdAndUpdate(
            { _id: profileId },
            {
                gender,
                dateOfBirth,
                about
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Profile created successfully",
            profile: updatedProfileResult
        })
    }
    catch (error) {
        console.error("Error in creating user profile: ", error.message);
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

//delete account
exports.deleteAccount = async (req, res) => {
    try {
        //get id
        const userId = req.user.id;

        //validation
        const UserDetails = await User.findById(userId);
        if (!UserDetails) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        };

        //delete profile
        await Profile.findByIdAndDelete({ _id: UserDetails.additionalDetails });

        //deleteUser
        await User.findByIdAndDelete({ _id: userId });

        // clear token cookie
        res.clearCookie('token'); // 'token' is the name of your token cookie

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    }
    catch (error) {
        console.error("Error in deleting user: ", error.message);
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

//get all user details
exports.getProfileDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        //get data
        const userDetails = await User.findById(userId)
            .populate('additionalDetails')
            .populate('courses').exec();

        if (!userDetails) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Get user details successfully",
            user: userDetails
        });
    }
    catch (error) {
        console.error("Error in getting profile details: ", error.message);
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
        //get image
        const file = req.files.updateImage;
        const userId = req.user.id;
        console.log("USer id: ", userId);

        if (!file) {
            return res.status(404).json({
                success: false,
                message: "Image not found to be updated"
            })
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User id not found to be updated"
            })
        }

        // Validation
        const supportedType = ["jpg", "jpeg", "png"];
        const myFileType = file.name.split('.').pop().toLowerCase();

        if (!supportedType.includes(myFileType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid file type"
            });
        }

        //upload image to cloudinary
        const uploadImageResult = await uploadFileTocloudinary(
            file,
            process.env.FOLDER_NAME
        );

        //update user details
        const userUpdate = await User.findByIdAndUpdate({ _id: userId },
            {
                image: uploadImageResult.secure_url
            },
            { new: true });

        return res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            user: userUpdate
        })
    }
    catch (error) {
        console.error("Error in updating picture: ", error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}