import Task from "../models/taskModel.js";
import Project from "../models/projectModel.js";

const refreshProjectStatus = async (projectId) => {
  const tasks = await Task.find({ project: projectId });
  if (tasks.length === 0) {
    await Project.findByIdAndUpdate(projectId, { status: "ongoing" });
    return;
  }
  const allCompleted = tasks.every((task) => task.status === "completed");
  await Project.findByIdAndUpdate(projectId, {
    status: allCompleted ? "completed" : "ongoing",
  });
};

// @desc Get all tasks assigned to the logged-in developer
// @route GET /api/dev/tasks
// @access Developer

const getMyTasks = async (req, res) => {
  try {
    const devId = req.user.id;

    const tasks = await Task.find({ assignedTo: devId })
      .populate("project", "title status")
      .populate("assignedTo", "name email role");

    res.status(200).json({
      success: true,
      total: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Error fetching dev tasks:", error.message);
    res.status(500).json({ message: "Server error fetching tasks" });
  }
};

// @desc Update task status (pending → ongoing → completed)
// @route PUT /api/dev/tasks/:taskId
// @access Developer

const updateTaskStatus = async (req, res) => {
  try {
    const devId = req.user.id;
    const { taskId } = req.params;
    const { status } = req.body;

    if (!status)
      return res.status(400).json({ message: "Status field is required" });

    const allowedStatuses = ["pending", "ongoing", "completed"];
    if (!allowedStatuses.includes(status.toLowerCase()))
      return res.status(400).json({ message: "Invalid status value" });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Check ownership
    if (task.assignedTo.toString() !== devId.toString())
      return res.status(403).json({
        message: "You are not authorized to update this task",
      });

    if (task.status === "pending" && status === "completed")
      return res
        .status(400)
        .json({ message: "Task must be ongoing before marking completed" });

    if (
      (task.status === "completed" && status !== "completed") ||
      (task.status === "ongoing" && status === "pending")
    )
      return res.status(400).json({
        message: "Cannot revert task to a previous state",
      });

    const updates = {};

    if (task.status === "pending" && status === "ongoing") {
      updates.status = "ongoing";
      updates.initiatedAt = new Date();
    } else if (task.status === "ongoing" && status === "completed") {
      updates.status = "completed";
      updates.completedAt = new Date();
    }

    const updatedTask = await Task.findByIdAndUpdate(task._id, updates, {
      new: true,
    });

    await refreshProjectStatus(task.project);

    res.status(200).json({
      success: true,
      message: "Task status updated",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task status:", error.message);
    res.status(500).json({ message: "Server error updating task status" });
  }
};

export { getMyTasks, updateTaskStatus };
