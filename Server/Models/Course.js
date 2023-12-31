const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
    {
        courseName: {
            type: String,
            required: true
        },
        courseDescription: {
            type: String,
            required: true
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        whatYouWillLearn: {
            type: String,
            required: true
        },
        courseContent: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Section",
                // required: true
            }
        ],
        ratingAndReviews: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "RatingAndReview",
                // required: true
            }
        ],
        price: {
            type: Number,
            required: true
        },
        thumbnail: {
            type: String,
            required: true
        },
        tag: {
            type: [String],
            // required: true
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        studentsEnrolled: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],
        instructions: {
            type: [String]
        },
        status: {
            type: String,
            enum: ['Draft', 'Published'],
            required: true,
        }

    }
);

module.exports = mongoose.model("Course", courseSchema);