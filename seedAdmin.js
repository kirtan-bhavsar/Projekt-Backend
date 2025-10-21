// seedAdmin.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/userModel.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists:", existingAdmin.email);
      process.exit();
    }

    const admin = new User({
      name: "System Admin",
      email: process.env.ADMIN_EMAIL,
      role: "admin",
    });

    // hash password via model method
    admin.password = await admin.hashPassword(process.env.ADMIN_PASSWORD);

    await admin.save();

    console.log("🎉 Admin created successfully!");
    console.log(`👤 Email: ${admin.email}`);
    console.log(`🔐 Password: ${process.env.ADMIN_PASSWORD}`);
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
