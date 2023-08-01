const RatingAndReview = require('../Models/RatingAndReview');
const Course = require('../Models/Course');
const User = require('../Models/User');
const { default: mongoose } = require('mongoose');

//crate rating
exports.createRating = async (req, res) => {
    try {
        //get user id
        const { userId } = req.user.id;

        //fetch data from user body
        const { rating, review, courseId } = req.body;

        //validate user if it is enrolled or not
        const courseDetails = Course.findOne(
            {
                _id: courseId,
                studentsEnrolled: { $elemMatch: { $eq: userId } }
            }
        );

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Student is not enrolled in course"
            })
        }

        //validate if already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId
        });

        if (alreadyReviewed) {
            return res.status(403).json({
                success: false,
                message: "Course is already reviewed by user"
            })
        }

        //create rating
        const ratingCreation = await RatingAndReview.create({
            rating,
            review,
            course: courseId,
            user: userId
        })

        //Update course
        const courseUpdateResult = await Course.findByIdAndUpdate(
            { _id: courseId },
            {
                $push: { ratingAndReviews: ratingCreation._id }
            },
            { new: true }
        );

        console.log("Updated rating in course: ", courseUpdateResult);

        //return response
        return res.status(200).json({
            success: true,
            message: "Rating and review created successfully",
            ratingCreation
        })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error in rating and review controller"
        })
    }
};

//Average rating controller
exports.getAverageRating = async (req, res) => {
    try {
        //get course id
        const courseId = req.body.courseId;//this courseId is string
        //so for comparison convert to object type using mongoose.types.objectId()

        //get rating details
        const ratingDetails = await RatingAndReview.aggregate([
            //provide the rating details for selected course
            {
                $match: { course: new mongoose.Types.ObjectId(courseId) }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" }
                }//group all rating in a single group
            }
        ]);

        //return rating
        if (ratingDetails.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: ratingDetails[0].averageRating
            })
        }

        //if no rating comes
        return res.status(200).json({
            success: true,
            message: "Average rating not found, no rating done",
            averageRating: 0
        })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error in getting average rating"
        })
    }
}

//get all rating and reviews of all courses
exports.getAllRatings = async (req, res) => {
    try {
        const allReviewsAndRating = await RatingAndReview.find({})
            .sort({ rating: "desc" })
            .populate({
                path: "User",
                select: "firstName lastName email image"//to gety only these details of user
            })
            .populate({
                path: "course",
                select: "courseName"
            }).exec();

        return res.status(200).json({
            success: true,
            message: "All reviews fetched successfully",
            data: allReviewsAndRating
        })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error in getting all ratings"
        })
    }
}