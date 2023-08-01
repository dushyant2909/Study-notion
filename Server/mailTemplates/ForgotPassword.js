exports.forgotPassword = (name, email, link) => {
    return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <title>Forgot Password Link</title>
    </head>
    
    <body style="background-color: #fff; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.4; color: #333; margin: 0; padding: 0;">
        <div class="container" style="max-width: 800px; margin: 0 auto; padding: 20px; text-align: center;">
            <a href="https://studynotion-edtech-project.vercel.app" style="text-decoration: none;">
                <img class="logo" src="https://i.ibb.co/7Xyj3PC/logo.png" alt="StudyNotion Logo" style="max-width: 190px; margin-bottom: 20px;">
            </a>
            <div class="message" style="font-size: 19px; font-weight: bold; margin-bottom: 20px;">Reset Password Link</div>
            <div class="body" style="font-size: 16px; margin-bottom: 20px;">
                <p>Hey ${name},</p>
                <p>Your request for password reset has been received for email <span class="highlight" style="font-weight: bold; text-decoration: none;">${email}</span></p>
                <p>Please click below button to reset your password</p>
                <a class="forgot-button" href="${link}" style="display: inline-block; background-color: #007bff; color: white; font-size: 15px; padding: 8px 16px; border-radius: 4px; text-align: center; font-weight:bold; text-decoration: none;">Reset Password</a>
                <p>If not done by you, contact us immediately</p>
            </div>
            <div class="support" style="font-size: 14px; color: #999999; margin-top: 10px;">If you have any query or need further assistance, feel free to reach us at
                <a href="mailto:info@studynotion.com" style="color: #007bff; text-decoration: none;">info@studynotion.com</a>
                We are here to help.
            </div>
        </div>
    </body>
    
    </html>`;
}
