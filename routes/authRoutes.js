// routes/authRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  checkAuth,
} from "../controllers/authController.js";
import auth from "../middleware/authMiddleware.js";
import authorizationMiddleware from "../middleware/authorizationMiddleware.js";

const authRouter = express.Router();

authRouter.post(
  "/register",
  auth,
  authorizationMiddleware(["admin", "pm"]),
  registerUser
);

authRouter.get("/check", auth, checkAuth);

authRouter.post("/login", loginUser);

authRouter.post("/logout", auth, logoutUser);

export default authRouter;
