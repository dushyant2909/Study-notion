const cloudinary = require('cloudinary').v2;

exports.uploadFileTocloudinary = async (file, folder, quality) => {
    try {
        const options = { folder };
        options.resource_type = "auto";
        if (quality)
            options.quality = quality;

        //file pehle server ke tempFile folder mein store then upload to cloudinary then temp deleted
        return await cloudinary.uploader.upload(file.tempFilePath, options);
    } catch (error) {
        console.error("Cloudinary Upload Error:", error); // Log the specific error message
        throw error; // Rethrow the error to be handled in the imageUpload function
    }
}