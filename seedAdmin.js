// seedAdmin.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/userModel.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
 
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      process.exit();
    }

    const admin = new User({
      name: "System Admin",
      email: process.env.ADMIN_EMAIL,
      role: "admin",
    });

    admin.password = await admin.hashPassword(process.env.ADMIN_PASSWORD);

    await admin.save();

    console.log("Admin created successfully!");
    process.exit();
  } catch (error) {
    console.error("Error :", error.message);
    process.exit(1);
  }
};

seedAdmin();
