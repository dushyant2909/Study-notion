const mongoose = require('mongoose');

require('dotenv').config();

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("Connected successfully with database");
    }
    catch (error) {
        console.error("Error connecting database");
        process.exit(1);
    }
}

module.exports = dbConnect;