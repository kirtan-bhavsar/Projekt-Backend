import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  status: {
    type: String,
    enum: ["ongoing", "completed"],
    default: "ongoing",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Project = mongoose.model("project", projectSchema);

export default Project;
