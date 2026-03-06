const User = require("../models/user");
const passport = require("passport");

// 🔹 RENDER SIGNUP FORM
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup");
};

// 🔹 SIGNUP USER
module.exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const newUser = new User({ email, username });

    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);

      req.flash("success", "Welcome to WanderLust!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// 🔹 RENDER LOGIN FORM
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login");
};

// 🔹 LOGIN USER
module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

// 🔹 LOGOUT
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.flash("success", "Logged out successfully!");
    res.redirect("/listings");
  });
};