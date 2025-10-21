import jwt from "jsonwebtoken";
import dotenv from "dotenv/config";

const generateToken = (res, user) => {
  const payload = {
    user: {
      id: user.id,
      role: user.role,
    },
  };

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

  res
    .status(200)
    .cookie("jwtToken", token, cookieOptions)
    .json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
};

export default generateToken;
