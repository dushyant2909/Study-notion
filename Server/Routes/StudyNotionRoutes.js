const express = require('express');
const router = express.Router();

//import controller
const { createCategoryController, showAllCategoriesController, categoryPageDetails } = require('../Controllers/CategoryController');
const { createCourse, getAllCourses, getCourseDetails, deleteSelectedCourse } = require('../Controllers/CourseController');
const { forgotPasswordController, resetPasswordController } = require('../Controllers/ForgotPassword');
const { loginController } = require('../Controllers/LoginController');
const { createPaymentOrder, verifyRazorpaySignature, sendPaymentSuccessEmail } = require('../Controllers/PaymentsController');
const { createProfile, deleteAccount, getProfileDetails, updateDisplayPicture } = require('../Controllers/ProfileController');
const { createRating, getAverageRating, getAllRatings } = require('../Controllers/RatingController');
const { createSection, updateSection, deleteSection } = require('../Controllers/SectionController');
const { sendOTP, signUpController } = require('../Controllers/SignUpController');
const { createSubSection, updateSubSection, deleteSubSection } = require('../Controllers/SubSectionController');
const { auth, isAdmin, isInstructor, isStudent } = require('../Middleware/AuthMiddleware');

//login route
router.post('/login', loginController);

//otp router
router.post('/sendOtpForSignup', sendOTP);

//signup route
router.post('/signup', signUpController);

//category routes
router.post('/createCategory', auth, isAdmin, createCategoryController);
router.get('/showAllCategories', showAllCategoriesController);
router.post('/categoryDetails', categoryPageDetails);

//course routes
router.post('/createCourse', auth, isInstructor, createCourse);
router.get('/allCourses', getAllCourses);
router.post('/courseDetails', getCourseDetails);
router.delete('/deleteCourse', auth, isInstructor, deleteSelectedCourse);

//forgotpassword routes
router.post('/forgotPassword', forgotPasswordController);
router.post('/resetPassword', resetPasswordController);

//payment routes
router.post('/createPayment', auth, isStudent, createPaymentOrder);
router.post('/verifySignature', auth, isStudent, verifyRazorpaySignature);
router.post('/sendPaymentSuccessMail', auth, isStudent, sendPaymentSuccessEmail);

//profile routes
router.put('/updateProfile', auth, createProfile);
router.delete('/deleteUser', auth, deleteAccount);
router.get('/profileDetails', auth, getProfileDetails);
router.put('/updateImage', auth, updateDisplayPicture);


//ratings router
router.post('/createRating', createRating);
router.get('/getAverageRating', getAverageRating);
router.get('/getAllRatingsAndReviews', getAllRatings);

//section router
router.post('/createSection', createSection);
router.put('/updateSection', updateSection);
router.delete('/deleteSection', deleteSection);



//sub-section controller
router.post('/createSubSection', createSubSection);
router.put('/updataeSubSection', updateSection);
router.delete('/deleteSubSection', deleteSubSection);


module.exports = router;