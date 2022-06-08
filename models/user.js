const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  //beats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Track", unique: true }],
  username: {
    type: String,
    required: [true, "please provide a username"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "please enter a email"],
    unique: true,
    match: [
      /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/,
      "please provide a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please enter your pasword"],
    minlength: 6,
    select: false,
  },
  refresh_token: { type: String },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.methods.getSignedToken = function (password) {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: 5 * 60000,
  });
};
UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = date.now() + 10 * (60 * 1000);

  return resetToken;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
