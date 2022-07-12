if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const fs = require("fs");
const bcrypt = require("bcrypt");
const initializePassport = require("../passport-config");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");

const router = express.Router();

//* Functions
// For Passport
initializePassport(
  passport,
  (email) => {
    const users = JSON.parse(fs.readFileSync("./json/users.json", "utf-8"));

    return users.find((user) => user.email === email);
  },
  (id) => {
    const users = JSON.parse(fs.readFileSync("./json/users.json", "utf-8"));

    return users.find((user) => user.id === id);
  }
);

// For Authenicated Middleware
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect("/auth");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }

  return next();
}

//* Middlewares
router.use(flash());
router.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
router.use(passport.initialize());
router.use(passport.session());
router.use(methodOverride("_method"));

//! Main Routes
router.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

router.get("/contact-us", (req, res) => {
  res.render("contact");
});

//! Meeting Routes
router.get("/meeting", checkAuthenticated, (req, res) => {
  res.render("meetings", { user: req.user });
});

router.get("/meeting/:id", checkAuthenticated, (req, res) => {
  res.render("inMeet", { roomId: req.params.id, user: req.user });
});

//! Auth routes
router.get("/auth", checkNotAuthenticated, (req, res) => {
  res.render("auth");
});

router.post("/register", checkNotAuthenticated, (req, res) => {
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  user = {
    id: Date.now().toString(),
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  };

  const data = JSON.parse(fs.readFileSync("./json/users.json", "utf-8"));
  data.push(user);
  console.log(data);
  fs.writeFileSync("./json/users.json", JSON.stringify(data));

  res.redirect("/auth");
});

router.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth",
    failureFlash: true,
  })
);

router.delete("/logout", (req, res) => {
  req.logOut(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
