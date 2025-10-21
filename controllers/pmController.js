import Project from "../models/projectModel.js";
import Task from "../models/taskModel.js";
import User from "../models/userModel.js";

// Redundant code
const ensurePmOwnsProject = async (projectId, pmId) => {
  const project = await Project.findById(projectId);
  if (!project) throw { status: 404, message: "Project not found" };
  if (project.owner.toString() !== pmId.toString())
    throw { status: 403, message: "You do not own this project" };
  return project;
};

const refreshProjectStatus = async (projectId) => {
  const tasks = await Task.find({ project: projectId });
  if (tasks.length === 0) {
    await Project.findByIdAndUpdate(projectId, { status: "ongoing" });
    return;
  }
  const allCompleted = tasks.every((t) => t.status === "completed");
  await Project.findByIdAndUpdate(projectId, {
    status: allCompleted ? "completed" : "ongoing",
  });
};

// @desc Get all projects owned by the logged-in PM
// @route GET /api/pm/projects
// @access PM

const getMyProjects = async (req, res) => {
  try {
    const pmId = req.user.id;
    const projects = await Project.find({ owner: pmId }).populate(
      "owner",
      "name email role"
    );

    res.status(200).json({ success: true, total: projects.length, projects });
  } catch (error) {
    const code = error.status || 500;
    res.status(code).json({ message: error.message || "Server error" });
  }
};

// @desc Create a task under a PM-owned project
// @route POST /api/pm/projects/:projectId/tasks
// @access PM

const createTask = async (req, res) => {
  console.log("createTask called------------------------------------");
  try {
    const pmId = req.user.id;
    const { projectId } = req.params;
    let { title, assignedTo, dueDate } = req.body;

    title = title?.trim();
    dueDate = dueDate ? new Date(dueDate) : null;

    if (!title || !assignedTo || !dueDate)
      return res
        .status(400)
        .json({ message: "title, assignedTo and dueDate are required" });

    const project = await ensurePmOwnsProject(projectId, pmId);

    const assignee = await User.findById(assignedTo);
    if (!assignee)
      return res.status(400).json({ message: "Assigned user not found" });

    if (!["pm", "developer"].includes(assignee.role))
      return res
        .status(400)
        .json({ message: "Assignee must be a PM or Developer" });

    if (dueDate < new Date())
      return res.status(400).json({ message: "dueDate cannot be in the past" });

    // Prevent duplicate titles (case-insensitive)
    const existingTask = await Task.findOne({
      project: projectId,
      title: { $regex: new RegExp(`^${title}$`, "i") },
    });
    if (existingTask)
      return res
        .status(400)
        .json({ message: "A task with this title already exists" });

    const task = new Task({
      title,
      assignedTo: assignee._id,
      dueDate,
      project: project._id,
      status: "pending",
    });

    await task.save();
    await Project.findByIdAndUpdate(project._id, { status: "ongoing" });

    res.status(201).json({ success: true, message: "Task created", task });
  } catch (error) {
    const code = error.status || 500;
    res.status(code).json({ message: error.message || "Server error" });
  }
};

// @desc Get all tasks in a PM-owned project
// @route GET /api/pm/projects/:projectId/tasks
// @access PM

const getProjectTasks = async (req, res) => {
  try {
    const pmId = req.user.id;
    const { projectId } = req.params;

    await ensurePmOwnsProject(projectId, pmId);

    const tasks = await Task.find({ project: projectId }).populate(
      "assignedTo",
      "name email role"
    );

    res.status(200).json({ success: true, total: tasks.length, tasks });
  } catch (error) {
    const code = error.status || 500;
    res.status(code).json({ message: error.message || "Server error" });
  }
};

// @desc Update a task (title, dueDate, assignedTo, status)
// @route PUT /api/pm/tasks/:taskId
// @access PM
// @desc Update a task (title, dueDate, assignedTo)
// @route PUT /api/pm/tasks/:taskId
// @access PM
const updateTask = async (req, res) => {
  try {
    const pmId = req.user.id;
    const { taskId } = req.params;
    let { title, assignedTo, dueDate } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // ✅ Ensure PM owns the project
    await ensurePmOwnsProject(task.project, pmId);

    // ❌ Prevent editing if task is completed
    if (task.status === "completed") {
      return res
        .status(400)
        .json({ message: "Cannot modify a completed task" });
    }

    const updates = {};

    // 📝 Update title (if provided and different)
    if (title && title.trim() !== task.title) {
      const duplicate = await Task.findOne({
        _id: { $ne: task._id },
        project: task.project,
        title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
      });
      if (duplicate)
        return res
          .status(400)
          .json({ message: "A task with this title already exists" });

      updates.title = title.trim();
    }

    // 📅 Update dueDate (if provided and different)
    if (dueDate) {
      const newDue = new Date(dueDate);
      if (newDue < new Date()) {
        return res
          .status(400)
          .json({ message: "Due date cannot be in the past" });
      }
      if (newDue.getTime() !== new Date(task.dueDate).getTime()) {
        updates.dueDate = newDue;
      }
    }

    // 👤 Update assignedTo (only if changed)
    if (assignedTo && assignedTo !== String(task.assignedTo)) {
      if (task.status === "ongoing") {
        return res.status(400).json({
          message: "Cannot reassign a task that is already ongoing",
        });
      }

      const newAssignee = await User.findById(assignedTo);
      if (!newAssignee)
        return res.status(400).json({ message: "Assigned user not found" });

      if (!["pm", "developer"].includes(newAssignee.role)) {
        return res
          .status(400)
          .json({ message: "Assignee must be a PM or Developer" });
      }

      updates.assignedTo = assignedTo;
    }

    // ✅ Proceed only if there's something to update
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid changes detected" });
    }

    const updatedTask = await Task.findByIdAndUpdate(task._id, updates, {
      new: true,
    });
    res
      .status(200)
      .json({ success: true, message: "Task updated", task: updatedTask });
  } catch (error) {
    console.error("Update Task Error:", error.message);
    const code = error.status || 500;
    res.status(code).json({ message: error.message || "Server error" });
  }
};

// @desc Delete a task (only if not ongoing)
// @route DELETE /api/pm/tasks/:taskId
// @access PM

const deleteTask = async (req, res) => {
  try {
    const pmId = req.user.id;
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await ensurePmOwnsProject(task.project, pmId);

    if (task.status === "ongoing")
      return res.status(400).json({
        message: "Cannot delete a task that is in progress (ongoing)",
      });

    await Task.findByIdAndDelete(taskId);
    await refreshProjectStatus(task.project);

    res.status(200).json({ success: true, message: "Task deleted" });
  } catch (error) {
    const code = error.status || 500;
    res.status(code).json({ message: error.message || "Server error" });
  }
};

// @desc Get tasks assigned to the logged-in PM (self-assigned tasks)
// @route GET /api/pm/my-tasks
// @access PM

const getMyTasks = async (req, res) => {
  try {
    const pmId = req.user.id;

    // Fetch all tasks assigned to this PM
    const tasks = await Task.find({ assignedTo: pmId })
      .populate("project", "title status")
      .populate("assignedTo", "name email role");

    res.status(200).json({
      success: true,
      total: tasks.length,
      tasks,
    });
  } catch (error) {
    const code = error.status || 500;
    res.status(code).json({ message: error.message || "Server error" });
  }
};

// @desc Get list of assignable users (self + all developers)
// @route GET /api/pm/assignable-users
// @access PM
const fetchUsers = async (req, res) => {
  try {
    const pmId = req.user.id;

    // Fetch all developers
    const developers = await User.find({ role: "developer" }).select(
      "name email role"
    );

    // Fetch PM’s own profile
    const pm = await User.findById(pmId).select("name email role");

    const users = [pm, ...developers];

    res.status(200).json({
      success: true,
      total: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching assignable users:", error);
    const code = error.status || 500;
    res.status(code).json({ message: error.message || "Server error" });
  }
};

export {
  deleteTask,
  updateTask,
  createTask,
  getMyProjects,
  getProjectTasks,
  getMyTasks,
  fetchUsers,
};
