import Project from "../models/projectModel.js";
import Task from "../models/taskModel.js";
import User from "../models/userModel.js";

// @desc    Create a new project and assign to a PM
// @route   POST /api/admin/projects
// @access  Admin
const createProject = async (req, res) => {
  try {
    const { title, description, ownerId } = req.body;

    if (!title?.trim() || !ownerId) {
      return res
        .status(400)
        .json({ message: "Title and ownerId are required" });
    }

    const trimmedTitle = title.trim();

    const existingProject = await Project.findOne({
      title: { $regex: new RegExp(`^${trimmedTitle}$`, "i") },
    });

    if (existingProject) {
      return res.status(400).json({
        message:
          "A project with this title already exists. Please use a unique name.",
      });
    }

    const pm = await User.findById(ownerId);
    if (!pm || pm.role !== "pm") {
      return res.status(400).json({ message: "Invalid Project Manager ID" });
    }

    const project = new Project({
      title: trimmedTitle,
      description: description?.trim(),
      owner: pm._id,
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create Project Error:", error.message);
    res.status(500).json({ message: "Server error during project creation" });
  }
};

// @desc    Get all projects (ongoing & completed)
// @route   GET /api/admin/projects
// @access  Admin

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("owner", "name email role");

    res.status(200).json({
      success: true,
      total: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Fetch Projects Error:", error.message);
    res.status(500).json({ message: "Server error while fetching projects" });
  }
};

// @desc    Delete a project (cascade delete tasks)
// @route   DELETE /api/admin/projects/:id
// @access  Admin

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await Task.deleteMany({ project: project._id });

    await Project.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Project and related tasks deleted successfully",
    });
  } catch (error) {
    console.error("Delete Project Error:", error.message);
    res.status(500).json({ message: "Server error while deleting project" });
  }
};

// @desc    Get all users (PMs and Developers)
// @route   GET /api/admin/users
// @access  Admin

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["pm", "developer"] },
    }).select("-password");

    res.status(200).json({
      success: true,
      total: users.length,
      users,
    });
  } catch (error) {
    console.error("Get Users Error:", error.message);
    res.status(500).json({ message: "Server error while fetching users" });
  }
};

// @desc Update project title
// @route PUT /api/v1/admin/projects/:projectId
// @access Admin
const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Project title is required" });
    }

    const existing = await Project.findOne({
      _id: { $ne: projectId },
      title: { $regex: new RegExp(`^${title}$`, "i") },
    });
    if (existing)
      return res
        .status(400)
        .json({ message: "A project with this title already exists" });

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { title: title.trim() },
      { new: true }
    );

    if (!updatedProject)
      return res.status(404).json({ message: "Project not found" });

    res.status(200).json({
      success: true,
      message: "Project title updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating project title" });
  }
};

export {
  getAllProjects,
  deleteProject,
  createProject,
  getAllUsers,
  updateProject,
};
