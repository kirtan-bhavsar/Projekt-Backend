import express from "express";
import dotenv from "dotenv/config";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/authRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import pmRouter from "./routes/pmRoutes.js";
import devRouter from "./routes/devRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

// ✅ Connect MongoDB
connectDB();

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "http://localhost:4173", // vite preview
  "https://projekt-frontend-1ldm.onrender.com", // your Render frontend URL
  process.env.CLIENT_URL, // fallback from .env
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // allow cookies
  })
);

// ✅ Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/pm", pmRouter);
app.use("/api/v1/dev", devRouter);

// ✅ Test API
app.get("/", (req, res) => {
  res.status(200).json({ message: "API Running successfully 🚀" });
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
