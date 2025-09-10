const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true }, // new field
  email: { type: String, required: true, unique: true },
  totalpass: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Password"
  }],
});

// Keep email as the usernameField for login
userSchema.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model("User", userSchema);
