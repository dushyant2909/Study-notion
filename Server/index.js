const express = require('express');
const app = express();//It is an instance of express, with this you can create routes, middleware etc.

const cors = require('cors');//CORS (Cross-Origin Resource Sharing) is to allow web servers to specify 
//which origins (domains) are allowed to access their resources. 
//It is a security feature implemented by web browsers to prevent unauthorized cross-origin requests, which could potentially lead to security vulnerabilities.

const cookieParser = require('cookie-parser');//is a middleware that parses and handles HTTP cookies in the request object. It makes it easier to work with cookies.

const fileUpload = require('express-fileupload');//is a middleware that handles file uploads from the client to the server. It simplifies the process of handling multipart/form-data requests, such as file uploads.

const otpGenerator = require('otp-generator');

const dbConnect = require('./Configurations/database');
dbConnect();// To connect with database

const { cloudinaryConnect } = require('./Configurations/cloudinary');
cloudinaryConnect();// Connect with cloudinary

const { transporter } = require('./Configurations/transporter')// To send Email
const { razorpayConnect } = require('./Configurations/razorpay')// Razorpay connectivity

//Load config from env
require('dotenv').config();

const port = process.env.PORT || 8000;


app.use(express.json()); // middleware to parse json request body

app.use(cookieParser()); // This line adds the cookieParser middleware to the application, allowing it to parse incoming cookies and make them accessible through req.cookies.

app.use(
    cors({
        origin: "http://localhost:3000",//vimp to write
        credentials: true
    })
)
// This line enables Cross-Origin Resource Sharing (CORS) for all routes in the application. It allows the application to respond to requests from the specified origin (http://localhost:3000) and includes the credentials option, which allows the client to send cookies in cross-origin requests.

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp"
    })
)
// This line adds the fileUpload middleware to the application, enabling it to handle file uploads. The configuration provided includes options for using temporary files during file uploads.

//import routes 
const StudyNotionRoutes = require('./Routes/StudyNotionRoutes');

//mount the api routes
app.use("/api/v1/auth", StudyNotionRoutes);// This line mounts the StudyNotionRoutes router under the /api/v1/auth path. All routes defined in StudyNotionRoutes will be accessible under this base path.

//start server
app.listen(port, () => {
    console.log(`Server started successfully at ${port} `);
})

//default router
app.get('/', (req, res) => {
    return res.json({
        success: true,
        message: "Your server is up and running..."
    })
})