const mongoose = require("mongoose");
const { URL, DEFAULT_VALIDATION } = require("../helpers/mongooseValidators");

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
    image: {
      url: URL,
      alt: DEFAULT_VALIDATION,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
