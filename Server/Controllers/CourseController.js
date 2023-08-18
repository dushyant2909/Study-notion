const Course = require('../Models/Course');
const { uploadFileTocloudinary } = require('../Utils/fileUploadToCloudinary');
const User = require('../Models/User');
// const Tag = require('../Models/Categories');
const Category = require('../Models/Categories');

//create course controller
exports.createCourse = async (req, res) => {
    try {
        //since u are creating a course so logged in
        //fetch data
        const { courseName, courseDescription, whatYouWillLearn, price, category, status } = req.body;
        const thumbnail = req.files.thumbnail;

        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !category) {
            return res.status(400).json({
                success: false,
                message: "Please fill all course details correctly"
            })
        }

        //check instructor as you have to fill instructor id in course db
        const userId = req.user.id;
        //get instructor details
        const instructorDetails = await User.findById({ _id: userId });

        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor details not found"
            })
        }

        //check given category is valid or not
        const categoryDetails = await Category.findById({ _id: category });
        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category not found.."
            })
        }

        //upload image to cloudinary
        const thumbnailImage = await uploadFileTocloudinary(thumbnail, process.env.FOLDER_NAME);

        if (!thumbnailImage) {
            return res.status(400).json({
                success: false,
                message: "Fail to upload thumbnail on cloudinary"
            })
        }

        //create entry in db
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            // courseContent,
            // ratingAndReviews,
            price,
            thumbnail: thumbnailImage.secure_url,
            category,
            status,
            // tag: tagDetails,
        });

        //Add course to instructor(user) db
        const userCourseUpdate = await User.findOneAndUpdate(
            { _id: instructorDetails._id },
            {
                $push: {
                    courses: newCourse._id
                }
            },
            { new: true }
        );

        //update Category schema
        const categoryCourseSectionUpdate = await Category.findOneAndUpdate(
            { _id: category },
            {
                $push: {
                    courses: newCourse._id
                }
            },
            { new: true }
        )

        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse
        })

    }
    catch (error) {
        console.error("Error in creating course: ", error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};


//get all courses handler
exports.getAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({}, {
            courseName: true,
            price: true,
            thumbnail: true,
            instructor: true,
            // ratingAndReviews: true,
            // studentsEnrolled: true
        })
            .populate('instructor')
            .populate('category')
            .exec()

        return res.status(200).json({
            success: true,
            message: "All course get successfully",
            data: allCourses
        })
    }
    catch (error) {
        console.error("Error in getting all course: ", error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getCourseDetails = async (req, res) => {
    try {
        //get course id
        const { courseId } = req.body;

        const courseDetails = await Course.find({ _id: courseId })
            .populate(
                {
                    path: "instructor",
                    populate: {
                        path: "additionalDetails"
                    }
                }
            ).populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "SubSection"
                }
            }).exec();


        if (courseDetails.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Could not find course with given course id'
            })
        }

        return res.status(200).json({
            success: true,
            message: "Selected course details get successfully",
            data: courseDetails
        })
    }
    catch (error) {
        console.log("Error in getting selected course details: ", error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.deleteSelectedCourse = async (req, res) => {
    try {
        //get course id for deletion
        const { courseId } = req.body;
        const userId = req.user.id;

        if (!courseId) {
            return res.status(404).json({
                success: false,
                message: "Didn't get courseId for deletion"
            })
        };

        //Delete course from instructor db also
        const instructor = await User.findById({ _id: userId });

        // Remove the course from the courses array in the instructor's document
        instructor.courses = instructor.courses.filter(
            (course) => course.toString() !== courseId
        );

        // Remove the course from the categories
        const categories = await Category.find({ courses: courseId });

        for (const category of categories) {
            category.courses = category.courses.filter(
                (course) => course.toString() !== courseId
            );
            await category.save();
        }

        // Save the modified instructor document
        await instructor.save();

        //Delete course from course db
        const courseDeletion = await Course.findByIdAndDelete({ _id: courseId });

        console.log("Delete result: ", courseDeletion);
        if (!courseDeletion) {
            return res.status(400).json({
                success: false,
                message: "Unable to delete course, try again"
            })
        };

        return res.status(200).json({
            sucess: true,
            message: "Course Deleted Successfully"
        })
    }
    catch (error) {
        console.error("Error while deleting course: ", error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
