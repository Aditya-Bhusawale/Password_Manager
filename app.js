const Password = require("./models/password.js"); 
const User = require("./models/user"); 
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const passport = require("passport");
const LocalStrategy = require('passport-local');
const session = require('express-session');
const flash = require("connect-flash");



const app = express();
app.use(flash());

const PORT = 3000;
const MONGO_URL = "mongodb://127.0.0.1:27017/manage";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));


passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.use(session({
  secret: 'mysupersecretcode',  
  resave: false,
  saveUninitialized: true,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect(MONGO_URL)
  .then(() => {
    console.log(" Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(` Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(" DB connection error:", err);
  });
  

app.get("/manage", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");  
  }
  res.render("index.ejs");
});

app.get("/add", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");  
  }
  res.render("add.ejs"); 
});


app.post("/add", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }

    const { credentials, password } = req.body;

    // Create new password entry
    const newEntry = await Password.create({
      title: credentials,
      pass: password,
      userId: req.user._id
    });

    // Push the password ID into the user's totalpass array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { totalpass: newEntry._id }
    });

    return res.redirect("/vault"); // redirect to vault so user can see it
  } catch (err) {
    console.error("Error saving password:", err);
    res.status(500).json({ error: "Something went wrong!" });
  }
});




app.get("/login", (req, res) => {
  res.render("users/login", { message: req.flash("error") });
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/manage",
  failureRedirect: "/login",
  failureFlash: true
}));



  app.get("/logout",(req,res,next)=>{
    req.logOut((err)=>{
        return next(err);
    })

    res.redirect("/login");
  })

  app.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
})

app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const newUser = new User({ username, email });

    await User.register(newUser, password);

    req.login(newUser, (err) => {
      if (err) {
        console.error(err);
        return res.redirect("/signup");
      }
      return res.redirect("/manage"); // redirect after login
    });

  } catch (err) {
    console.error(err);
    res.redirect("/signup");
  }
});


app.get("/vault", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }

    const passwords = await Password.find({ userId: req.user._id });

    res.render("vault", { passwords });
  } catch (err) {
    console.error("Error fetching passwords:", err);
    res.status(500).send("Internal Server Error");
  }
});

