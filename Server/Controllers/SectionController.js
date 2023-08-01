const Section = require('../Models/Section');
const Course = require('../Models/Course');

exports.createSection = async (req, res) => {
    try {
        // Fetch section details
        const { sectionName, courseId } = req.body;

        // Validation
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Missing section details"
            });
        }

        // Create entry in Section collection
        const newSection = await Section.create({ sectionName });

        // Update Course document with the new section reference
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id
                }
            },
            { new: true }
        ).populate({ //populate se id nhi poora data aajaega when console
            path: 'courseContent',
            populate: {
                path: 'subSection',
                model: 'Subsection'
            }
        }).exec();

        console.log(updatedCourse); // This will log the Course object with populated courseContent field

        return res.status(200).json({
            success: true,
            message: "Section created and Course updated successfully",
            updatedCourse
        });
    } catch (error) {
        console.error("Section Creation error: ", error);
        return res.status(500).json({
            success: false,
            message: "Error in creating section"
        });
    }
}

exports.updateSection = async (req, res) => {
    try {
        //fetch updated data
        const { sectionId, sectionName } = req.body;

        //validation
        if (!sectionId || !sectionName) {
            return res.status(400).json({
                status: false,
                message: "Please fill update section details correctly"
            })
        }
        //no need to update course as id is stored in course

        //update detils
        const updatedSectionDetails = await Section.findByIdAndUpdate(sectionId,
            { sectionName },
            { new: true });

        //return response
        return res.status(200).json({
            success: true,
            messag: "Session updated successfully"
        })
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: "Unable to update section, try again"
        })
    }
}

//delete Section controller
exports.deleteSection = async (req, res) => {
    try {
        //we give id in params
        const { sectionId } = req.params;
        if (!sectionId) {
            return res.status(400).json({
                status: false,
                message: "Please fill section details correctly"
            })
        }
        await Section.findByIdAndDelete(sectionId)
        return res.status(200).json({
            success: true,
            message: "Section deleted successfully"
        })
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: "Unable to delete section, try again"
        })
    }
}
