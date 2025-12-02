const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      validate: {
        validator: function (password) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+<>?]).{8,}$/.test(
            password
          );
        },
        message:
          "Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number and one special character",
      },
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    puzzleRating: {
      type: Number,
      default: 600,
      min: 0,
    },
    studiesCreated: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
