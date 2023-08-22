const { default: mongoose } = require('mongoose');
const { razorpayConnect } = require('../Configurations/razorpay');
const Course = require('../Models/Course');
const User = require('../Models/User');
const mailSender = require('../Utils/mailSender');
const { courseEnrollmentEmail } = require('../mailTemplates/courseEnrollment');

//initiate the razorpay order
exports.createPaymentOrder = async (req, res) => {
    const { courses } = req.body;
    const userId = req.user.id;

    if (!userId) {
        return res.status(200).json({
            success: false,
            message: "User id not found in payment order creation"
        })
    }

    if (courses.length === 0) {
        return res.json(
            {
                success: false,
                message: "Please provide course Id"
            }
        )
    }

    let totalAmount = 0;

    //To get all courses
    for (const course_id of courses) {
        let course;
        try {
            course = await Course.findById(course_id);
            if (!course) {
                return res.status(200).json({
                    success: false,
                    message: "Could not find the course"
                })
            }

            const uid = new mongoose.Types.ObjectId(userId);

            if (course.studentsEnrolled.includes(uid)) {
                return res.status(200).json({
                    success: false,
                    message: "Student already enrolled"
                })
            }

            totalAmount = course.price;

        }
        catch (error) {
            console.log("Error in capturing payment: ", error.message);
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }

        const options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: Math.random(Date.now()).toString()
        }

        try {
            const paymentResponse = await instance.orders.create(options);
            res.json({
                success: true,
                message: paymentResponse
            })
        }
        catch (error) {
            console.log("Error in payment response: ", error.message);
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }
}

//verify signature of Razorpay and Server
exports.verifyRazorpaySignature = async (req, res) => {
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.courses;
    const userId = req.user.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userId) {
        return res.status(200).json({
            success: false,
            message: "Payment Failed"
        })
    }
    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        //enroll a student
        await enrollStudents(courses, userId, res);
        //return res
        return res.status(200).json({
            success: true,
            message: "Payment verified"
        })
    }
    return res.status(200).json({
        success: false,
        message: "Payment failed"
    })
}

const enrollStudents = async (courses, userId, res) => {
    if (!courses || !userId) {
        return res.status(400).json({
            success: false,
            message: "pleae provide data for courses or userId"
        });
    };
    try {
        for (const courseId of courses) {
            //find the course and enroll the student in it
            const enrollCourse = await Course.findByIdAndUpdate(
                { _id: courseId },
                { $push: { studentsEnrolled: userId } },
                { new: true }
            )

            if (!enrollCourse) {
                return res.status(500).json({
                    success: false,
                    message: "Course not found"
                })
            }

            //find the student and add course to their list of courses
            const enrolledStudent = await User.findByIdAndUpdate(userId,
                {
                    $push: {
                        courses: courseId,
                    }
                },
                { new: true });

            //Send mail to student
            const emailResponse = await mailSender(
                enrolledStudent.email,
                `Successfull enrollment to ${enrollCourse.courseName}`,
                courseEnrollmentEmail(enrollCourse.courseName, `${enrolledStudent.firstName} ${enrolledStudent.lastName}`)
            )
            console.log("Email Sent Response: ", emailResponse);

        }
    }
    catch (error) {
        console.log("Error in sending course enrollment email: ", error.message);
        return res.status(200).json({
            success: false,
            message: error.message
        })
    }

}

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body

    const userId = req.user.id

    if (!orderId || !paymentId || !amount || !userId) {
        return res
            .status(400)
            .json({ success: false, message: "Please provide all the details" })
    }

    try {
        const enrolledStudent = await User.findById(userId)

        await mailSender(
            enrolledStudent.email,
            `Payment Received`,
            paymentSuccessEmail(
                `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
                amount / 100,
                orderId,
                paymentId
            )
        )
    } catch (error) {
        console.log("error in sending mail", error)
        return res
            .status(400)
            .json({ success: false, message: "Could not send email" })
    }
}