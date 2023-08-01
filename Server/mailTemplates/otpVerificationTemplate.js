const otpTemplate = (otp) => {
    return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <title>OTP Verification Email</title>
        <style>
            body {
                background-color: #fff;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333;
                margin: 0;
                padding: 0;
            }
    
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
    
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
    
            .message {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }
    
            .body {
                font-size: 16px;
                margin-bottom: 20px;
            }
    
            .support {
                font-size: 14px;
                color: #999;
                margin-top: 20px;
            }
    
            .highlight {
                font-weight: bold;
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <a href="https://studynotion-edtech-project.vercel.app">
                <img class="logo" src="https://i.ibb.co/7Xyj3PC/logo.png" alt="StudyNotion Logo">
            </a>
            <div class="message">OTP Verification E-mail</div>
            <div class="body">
                <p>Dear User,</p>
                <p>Thank you for registering with StudyNotion. To continue further please use the following One Time
                    Password (OTP) to veriy your account</p>
                <h2 class="highlight">${otp}</h2>
                <p>This otp is only valid for 5 minutes. Once your account is verified, you will have access to our platform
                    and its features</p>
            </div>
            <div class="support">If you have any query or need further assistance, feel free to reach us at
                <a href="mailto:info@studynotion.com">info@studynotion.com</a>
                We are here to help.
            </div>
        </div>
    </body>
    
    </html>`
}

module.exports = otpTemplate;