const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("./models/categoryModel");
const categories = require("./data/categories");

dotenv.config();

mongoose.connect(process.env.MONGO_URL);

const importData = async () => {
  try {
    await Category.deleteMany();
    await Category.insertMany(categories);
    console.log("Veriler yüklendi");
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
