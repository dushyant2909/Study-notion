const { default: mongoose } = require('mongoose');
const { razorpayConnect } = require('../Configurations/razorpay');
const Course = require('../Models/Course');
const User = require('../Models/User');
const mailSender = require('../Utils/mailSender');
const { courseEnrollmentEmail } = require('../mailTemplates/courseEnrollment');

exports.createPaymentOrder = async (req, res) => {
    try {
        //get course id
        const { courseId } = req.body;
        //get user id
        const userId = req.user.id;

        if (!courseId || !userId) {
            return res.status(400).json({
                success: false,
                message: "Didn't get id for payment"
            })
        };

        const courseDetails = await Course.findById(courseId);

        if (!courseDetails) {
            return res.json({
                success: false,
                message: "Could not found a course with this id"
            })
        }

        //since userId is string type and in course model user if is object tyupe stores so convert it
        const uid = new mongoose.Schema.Types.ObjectId(userId);

        //check if user has already paid it
        if (Course.studentEnrolled.includes(uid)) {
            return res.status(200).json({
                success: false,
                message: "Student already enrolled"
            })
        }

        //create order
        const amount = courseDetails.price;
        const currency = "INR";

        const options = {
            amount: amount * 100,
            currency,
            receipt: Math.random(Date.now()).toString(),
            notes: {
                courseId: courseId,
                userId,
            }
        };

        try {
            //initiate the payment using razorpay
            const paymentResponse = await razorpayConnect.orders.create(options);
            console.log(paymentResponse);
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({
                succes: false,
                message: "Could initiate payment order"
            });
        };

        return res.status(200).json({
            success: true,
            courseName: Course.courseName,
            courseDescription: Course.courseDescription,
            thumbnail: Course.thumbnail,
            orderId: PaymentResponse.id,
            currency: PaymentResponse.currency,
            amount: PaymentResponse.amount
        })

    }
    catch (error) {
        console.error("Payments error: ", error.message);
        return res.status(500).json({
            success: false,
            message: "Error in creating payment"
        })
    }
}

//verify signature of Razorpay and Server
exports.verifyRazorpaySignature = async (req, res) => {
    try {
        const webHookSecret = "12345678";//my signature
        const signature = req.headers["x-razorpay-signature"];//razorpay signature

        const shasum = crypto.createHmac("sha256", webHookSecret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest("hex");

        if (signature === digest) {
            console.log("Payment is Authorised");
            const { courseId, userId } = req.body.payload.payment.entity.notes;

            try {
                //fulfil the action
                //find the course and enroll student in it
                const enrolledCourse = await Course.findOneAndUpdate(
                    { _id: courseId },
                    { $push: { studentsEnrolled: userId } },
                    { new: true }
                );

                if (!enrolledCourse) {
                    return res.status(500).json({
                        success: false,
                        message: "Course not found",
                    })
                }

                console.log(enrolledCourse);

                //find the student and add the student to enrolled courses
                const enrolledStudent = await User.findOneAndUpdate(
                    { _id: userId },
                    { $push: { courses: courseId } },
                    { new: true }
                );
                console.log(enrolledCourse);

                //send confirmation mail
                const emailResponse = await mailSender(
                    enrolledStudent.email,
                    "Congratulations from StudyNotion",
                    "Congratulations for your new course",
                );

                console.log(emailResponse);

                return res.status(200).json({
                    success: true,
                    message: "Signature verified and course added"
                })
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({
                    success: false,
                    message: "Error in verifying signature and creating payment"
                })
            }
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error in verifying signature"
        })
    }
}