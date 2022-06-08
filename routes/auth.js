const express = require("express");
const router = express.Router();
const User = require("../Models/user");
const cors = require("cors");
const ErrorResponse = require("../utils/errorResponse");
const jwt = require("jsonwebtoken");

router.route("/refresh_token").get(async (req, res) => {
  try {
    // [server checks if refresh_token cookie is absent, if true]
    const current_token = await req.cookies.refresh_token;

    //If false [send a 400 response and ...ask_user_to_login]
    //[server check if refresh_token cookie has expired, if true]
    const user = await User.findOne({ refresh_token: current_token });

    // no user found [send a 404 response]
    //[...ask_user_to_login] client
    if (!user) {
      return res.status(404).json("User not found");
    }
    //[server check if refresh_token cookie has been marked invalid, if true] (more on this later when we discuss /logout)
    //[send a 400 response]
    //[...ask_user_to_login]
    //User found create new refresh_token

    const token = await user.getSignedToken();

    //[server sends 200 response with jwt (in body) and a new refresh_token (as a cookie)]
    if (user._id == "61cf56769fad935c1c40902a") {
      //[server inserts refresh_token into it's stateStore]
      let randomKey = Math.floor(Math.random() * 10000000000);
      const refresh_token = jwt.sign({ randomKey }, process.env.JWT_SECRET, {
        expiresIn: 900000, // 5min
      });
      await user.updateOne({ refresh_token: refresh_token });
      await user.save();

      res.cookie("refresh_token", refresh_token, {
        maxAge: 900000,
        httpOnly: false,
      });
      res.status(200).json({
        success: true,
        user: user.username,
        id: user._id,
        token,
        admin: true,
      });
      return;
    } else {
      let randomKey = Math.floor(Math.random() * 10000000000);
      let refresh_token = jwt.sign({ randomKey }, process.env.JWT_SECRET, {
        expiresIn: 900000, // 5min
      });
      //[server inserts refresh_token into it's stateStore]
      await user.updateOne({ refresh_token: refresh_token });
      await user.save();
      res.cookie("refresh_token", user.refresh_token, {
        maxAge: 900000,
        httpOnly: false,
      });
      res.status(200).json({
        success: true,
        user: user.username,
        id: user._id,
        token,
        admin: false,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

router.route("/register").post(async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.create({
      username,
      email,
      password,
    });

    const token = user.getSignedToken();

    res.status(201).json({
      success: true,
      user: username,
      token,
    });
  } catch (error) {
    next(error);
  }
});

router.route("/login").post(async (req, res, next) => {
  const { email, password } = req.body;

  //check both fields were entered
  if (!email || !password) {
    return next(new ErrorResponse("Please provide email and password", 400));
  }
  //does user exist
  try {
    //look for user
    const user = await User.findOne({ email }).select("password");
    const userData = await User.findOne({ email });

    // no user found
    if (!user) {
      return next(new ErrorResponse("User not found", 401));
    }

    //user found validate password
    const isMatch = await user.matchPassword(password);

    //wrong password
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "username or password is incorrect",
      });
    }
    const token = user.getSignedToken();
    randomKey = Math.floor(Math.random() * 10000000000);
    let refresh_token = jwt.sign({ randomKey }, process.env.JWT_SECRET, {
      expiresIn: 900000,
    });

    //save refresh_token to db
    await user.updateOne({
      refresh_token: refresh_token,
    });
    await user.save();
    console.log("Setting refresh_token");

    //send res with refresh_token
    if (userData._id == "61cf56769fad935c1c40902a") {
      //let token = await user.refresh_token;
      res.cookie("refresh_token", refresh_token, {
        maxAge: 900000,
        httpOnly: false,
        secure: true,
        sameSite: "none",
      });
      res.status(200).json({
        success: true,
        user: userData.username,
        id: userData._id,
        token,
        admin: true,
      });
      return;
    }
    res.status(200).json({
      success: true,
      user: userData.username,
      id: userData._id,
      token,
      admin: false,
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
});

router.route("/logout").get(async (req, res) => {
  try {
    const current_token = await req.cookies.refresh_token;
    const user = await User.findOne({ refresh_token: current_token });

    await user.updateOne({ refresh_token: null });
    await user.save();
    return res.status(200);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

module.exports = router;
