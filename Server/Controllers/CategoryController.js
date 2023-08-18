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
        const allCategories = await Categories.find({}).
            populate({
                path: "courses",
                match: { status: "Published" },
            }).
            exec();

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
            .populate({
                path: "courses",
                match: { status: "Published" },
                populate: { path: "instructor", select: "firstName lastName" }
                // populate: "ratingAndReviews",
            })
            .exec()

        //Handle the case when category is null
        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

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
            .filter(course => course.status === "Published")
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10);

        // Populate instructor field for most selling courses
        const mostSellingCoursesPopulated = await Categories.populate(mostSellingCourses, { path: "instructor", select: "firstName lastName" });

        // Populate instructor field for different courses
        const differentCoursesPopulated = await Categories.populate(differentCourses, { path: "instructor", select: "firstName lastName" });

        return res.status(200).json({
            success: true,
            categoryDetails: selectedCategory,
            allCourses: allCourses,
            differentCourses: differentCoursesPopulated,
            mostSellingCourses: mostSellingCoursesPopulated
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