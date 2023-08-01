const Categories = require('../Models/Categories');

exports.createCategoryController = async (req, res) => {
    try {
        //fetch data
        const { name, description } = req.body;

        //validation
        if (!name || !description) {
            return res.status(404).json({
                success: false,
                message: "Please enter data correctly"
            })
        }

        //Create category entry in db
        const categoryCreate = await Categories.create({
            name,
            description,
        })

        //return response
        return res.status(200).json({
            success: true,
            message: "Categories created successfully"
        });
    }

    catch (error) {
        console.error("Categories controller error: ", error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//get all category handler
exports.showAllCategoriesController = async (req, res) => {
    try {
        //fetch all categories
        const allCategories = await Categories.find({}, { name: true, description: true })//fetch all categories present having name and description value

        return res.status(200).json({
            success: true,
            message: "All categories fetched successfully",
            data: allCategories
        });
    }
    catch (error) {
        console.error("Getting categories error: ", error.message);
        return res.status(500).json(
            {
                success: false,
                message: error.message
            }
        )
    }
}

exports.categoryPageDetails = async (req, res) => {
    try {
        //get category id
        const { categoryId } = req.body;

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Category id not found"
            })
        }

        //Get category details by id from db
        const selectedCategory = await Categories.findById(categoryId)
            .populate('courses').exec();

        console.log("Selected category details: ", selectedCategory);

        //Handle the case when category is null
        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        //Handle the case when there are no courses
        if (selectedCategory.courses.length === 0) {
            console.log('No courses found for this category');
            return res.status(404).json({
                success: false,
                message: "No courses found for this category"
            })
        }

        //get selected course id
        const selectedCourses = selectedCategory.courses

        //Get courses for other categories
        const categoriesExceptSelected = await Categories.find(
            {
                _id: {
                    $ne: categoryId//id not equal to category id for rest categories then selected
                }
            }
        ).populate('courses').exec();

        let differentCourses = [];
        for (const category of categoriesExceptSelected) {
            differentCourses.push(...category.courses);
        }

        //Get top-selling courses accross all categories
        const allCategories = await Categories.find().populate('courses');
        const allCourses = allCategories.flatMap((category) => category.courses);
        const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10);

        return res.status(200).json({
            success: true,
            selectedCourses: selectedCourses,
            differentCourses: differentCourses,
            mostSellingCourses: mostSellingCourses
        });
    }
    catch (error) {
        console.error("Getting categories error: ", error);
        return res.status(500).json(
            {
                success: false,
                message: "Error in getting category page detail",
                error: error.message
            }
        )
    }
}