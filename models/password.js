const mongoose = require("mongoose");

const passwordSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  pass: {
    type: String,
    required: true,
  },
  userId: {   
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

const Password = mongoose.model("Password", passwordSchema);

module.exports = Password;
