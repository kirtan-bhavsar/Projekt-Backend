// routes/adminRoutes.js
import express from "express";
import auth from "../middleware/authMiddleware.js";
import authorizationMiddleware from "../middleware/authorizationMiddleware.js";
import {
  createProject,
  getAllProjects,
  deleteProject,
  getAllUsers,
  updateProject,
} from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.use(auth, authorizationMiddleware(["admin"]));

adminRouter.post("/projects", createProject);
adminRouter.get("/projects", getAllProjects);
adminRouter.delete("/projects/:id", deleteProject);
adminRouter.get("/users", getAllUsers);
adminRouter.put("/projects/:projectId", updateProject);

export default adminRouter;
