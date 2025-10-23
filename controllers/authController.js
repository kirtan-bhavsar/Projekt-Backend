import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";

// @desc    Register user (Admin creates PM, PM creates Developer)
// @route   POST /api/v1/auth/register
// @access  Protected (role-based)
const registerUser = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    name = name?.trim();
    email = email?.trim().toLowerCase();
    role = role?.trim().toLowerCase();

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["pm", "developer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const creatorRole = req.user.role; 

    if (creatorRole === "admin") {
    } else if (creatorRole === "pm") {
      if (role !== "developer") {
        return res.status(403).json({
          message: "Project Manager can only create Developer accounts",
        });
      }
    } else {
      return res.status(403).json({
        message: "Developers are not authorized to create new accounts",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({ name, email, role });
    newUser.password = await newUser.hashPassword(password);

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: `${role} account created successfully`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// @desc    Login user (Admin, PM, or Developer)
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    let { email, password, role } = req.body;

    email = email?.trim().toLowerCase();
    role = role?.trim().toLowerCase();

    if (!email || !password?.trim() || !role) {
      return res
        .status(400)
        .json({ message: "Email, password, and role are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email, role });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid credentials or role mismatch" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    generateToken(res, user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Server error during login" });
  }
};

// @desc    Logout user (clear cookie)
// @route   POST /api/v1/auth/logout
// @access  Protected
const logoutUser = (req, res) => {
  try {
    res.clearCookie("jwtToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error.message);
    res.status(500).json({ message: "Server error during logout" });
  }
};

const checkAuth = (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Not authenticated" });
    res.status(200).json({ user: req.user });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export { registerUser, loginUser, logoutUser, checkAuth };
