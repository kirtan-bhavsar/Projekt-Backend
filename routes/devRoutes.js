// routes/devRoutes.js
import express from "express";
import auth from "../middleware/authMiddleware.js";
import authorizationMiddleware from "../middleware/authorizationMiddleware.js";
import { getMyTasks, updateTaskStatus } from "../controllers/devController.js";

const router = express.Router();

// 🔒 All routes protected and restricted to developers
router.use(auth, authorizationMiddleware(["developer"]));

router.get("/tasks", getMyTasks);
router.put("/tasks/:taskId", updateTaskStatus);

export default router;
