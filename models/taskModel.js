import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "ongoing", "completed"],
    default: "pending",
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
    validate: {
      validator: (value) => value >= new Date(),
      message: "Due date cannot be in the past",
    },
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "project",
    required: true,
  },
  initiatedAt: Date,
  completedAt: Date,
});

const Task = mongoose.model("task", taskSchema);

export default Task;
