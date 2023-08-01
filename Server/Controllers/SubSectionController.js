const Section = require('../Models/Section');
const Subsection = require('../Models/SubSection');
const { uploadFileTocloudinary } = require('../Utils/fileUploadToCloudinary');

exports.createSubSection = async (req, res) => {
    try {
        //fetch data
        const { title, timeDuration, description, sectionId } = req.body;

        //fetch video url from cloudinary
        const video = req.files.videoUrl;

        //validate
        if (!title || !timeDuration || !description || !videoUrl) {
            return res.status(400).json({
                status: false,
                message: "Please fill sub-section details correctly"
            })
        }

        //upload video to cloudinary
        const videoUpload = await uploadFileTocloudinary(video, process.env.FOLDER_NAME);

        //create subsection
        const newSubsection = await Subsection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: videoUpload.secure_url
        });

        //update section model
        const updatedSection = await Section.findByIdAndUpdate({ _id: sectionId },
            {
                $push: {
                    subSection: newSubsection._id
                }
            },
            { new: true }).populate('subSection');

        console.log(updatedSection);

        return res.status(200).json({
            success: true,
            message: "Subsection created successfully",
            updatedSection
        })
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: "Unable to create sub section, try again"
        })
    }
}

//update sub section
exports.updateSubSection = async (req, res) => {
    try {
        const { subSectionId, title, description, timeDuration } = req.body;
        const video = req.files.videoUrl;

        if (!subSectionId || !title) {
            return res.status(400).json({
                status: false,
                message: "Please fill update section details correctly"
            })
        }

        const updatedSubSection = await Subsection.findByIdAndUpdate(subSectionId,
            {
                title,
                description,
                timeDuration,
                videoUrl: video
            },
            { new: true });

        return res.status(200).json({
            success: true,
            messag: "Session updated successfully"
        })
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: "Unable to update sub section, try again"
        })
    }
};

exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId } = req.params;

        if (!subSectionId) {
            return res.status(400).json({
                status: false,
                message: "Please fill sub section details correctly"
            })
        }
        await Subsection.findByIdAndDelete(subSectionId)
        return res.status(200).json({
            success: true,
            message: "Sub section deleted successfully"
        })
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: "Unable to delete sub section, try again"
        })
    }
}