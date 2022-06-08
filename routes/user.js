const express = require("express");
const router = express.Router();

let userSchema = require("../Models/user");

//add beat to mybeats
router.route("/add-mybeat").put(async (req, res) => {
  //get user id and beat id
  const user = req.body.id;
  const beat = req.body.beatid;

  try {
    //add beat id to array
    let result = await userSchema.findByIdAndUpdate(
      user,
      { $push: { beats: beat } },
      { upsert: true, new: true }
    );
    res.status(200).json({
      success: true,
      message: "This beat has been successfully added to your beat stash",
      beats: result.beats,
    });
  } catch (error) {
    res.send(error);
  }
});

//Delete a beat
router.route("/delete-beat").delete(async (req, res) => {
  //get user id and beat id
  const user = req.body.id;
  const beat = req.body.beatId;

  try {
    //find user
    userSchema.findByIdAndUpdate(
      user,
      { $pullAll: { beats: [beat] } },
      { new: true },
      function (err, data) {
        res.status(200).json({
          success: true,
          messege:
            "The beat was successfully removed from your beat collection",
        });
      }
    );
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

//Get User including beats
router.route("/user-tracks/").post(async (req, res, next) => {
  console.log(req);
  //get id from body
  const id = req.body.id;

  try {
    //find user...populate beats.. return data
    const userData = await userSchema.findById(id).populate("beats").exec();
    res.status(200).json({ userData });
    console.log(userData);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
