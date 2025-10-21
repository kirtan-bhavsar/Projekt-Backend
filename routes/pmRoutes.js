// routes/pmRoutes.js
import express from "express";
import auth from "../middleware/authMiddleware.js";
import authorizationMiddleware from "../middleware/authorizationMiddleware.js";
import {
  getMyProjects,
  createTask,
  getProjectTasks,
  updateTask,
  deleteTask,
  getMyTasks,
  fetchUsers,
} from "../controllers/pmController.js";

const pmRouter = express.Router();

pmRouter.use(auth, authorizationMiddleware(["pm"]));

pmRouter.get("/projects", getMyProjects);
pmRouter.get("/myTasks", getMyTasks);
pmRouter.post("/projects/:projectId/tasks", createTask);
pmRouter.get("/projects/:projectId/tasks", getProjectTasks);
pmRouter.put("/tasks/:taskId", updateTask);
pmRouter.delete("/tasks/:taskId", deleteTask);
pmRouter.get("/users", fetchUsers);

export default pmRouter;
