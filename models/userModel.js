import mongoose from "mongoose";
import bcrypt, { hash } from "bcrypt";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "pm", "developer"],
    required: true,
  },
});

userSchema.methods.hashPassword = async function (userPassword) {
  const salt = await bcrypt.genSalt(10);

  const hashedUserPassword = await bcrypt.hash(userPassword, salt);

  return hashedUserPassword;
};

const User = mongoose.model("user", userSchema);

export default User;
