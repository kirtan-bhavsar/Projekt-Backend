import express from "express";
import dotenv from "dotenv/config";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import User from "./models/userModel.js";
import authRouter from "./routes/authRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import auth from "./middleware/authMiddleware.js";
import pmRouter from "./routes/pmRoutes.js";
import devRouter from "./routes/devRoutes.js";

const app = express();

const port = process.env.PORT || 5000;

connectDB();

// Backend Dependencies
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// import cors from "cors";

// const allowedOrigins = [
//   "http://localhost:5173",
//   "http://localhost:4173",
//   process.env.CLIENT_URL, // e.g., https://projekt-frontend.onrender.com
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/pm", pmRouter);
app.use("/api/v1/dev", devRouter);

// test api
app.get("/", (req, res) => {
  res.status(200).json({
    message: "API Running successfully",
  });
});

app.listen(port, () => {
  console.log(`App running successfully on port : ${port}`);
});
