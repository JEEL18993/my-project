if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// --- IMPORT YOUR ACTUAL ROUTERS ---
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Database
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";
mongoose.connect(dbUrl).then(() => console.log("✅ DB Connected")).catch(err => console.log(err));

// Config
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// 🛡️ BULLETPROOF MONGO STORE CONFIGURATION 🛡️
let store;
try {
    const MongoStoreRaw = require("connect-mongo");

    if (typeof MongoStoreRaw.create === "function") {
        // We are successfully on Version 4+
        store = MongoStoreRaw.create({
            mongoUrl: dbUrl,
            crypto: { secret: "mysupersecret" },
            touchAfter: 24 * 3600
        });
    } else if (MongoStoreRaw.default && typeof MongoStoreRaw.default.create === "function") {
        // Catching weird Node.js module quirks
        store = MongoStoreRaw.default.create({
            mongoUrl: dbUrl,
            crypto: { secret: "mysupersecret" },
            touchAfter: 24 * 3600
        });
    } else {
        // Fallback: We are stuck on Version 3
        const LegacyStore = require("connect-mongo")(session);
        store = new LegacyStore({
            url: dbUrl,
            secret: process.env.SECRET || "thisshouldbeabettersecret!",
            touchAfter: 24 * 3600
        });
    }

    if (store) {
        store.on("error", function (e) {
            console.log("Session Store Error:", e);
        });
    }
} catch (err) {
    console.log("🚨 Failed to setup MongoStore. Error details:", err);
}

const sessionOptions = {
    store: store,
    secret: process.env.SECRET || "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

// --- CONNECT YOUR ROUTERS ---
app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Catch-all for 404 errors
app.all("*", (req, res, next) => {
    res.status(404).render("listings/error.ejs", { err: { message: "Page Not Found" } }); 
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.log("🚨 FULL ERROR REPORT:", err); 
    let errorMessage = err.message || "Something went wrong!";
    res.status(500).send(`<h3>Oops! An error occurred:</h3><p>${errorMessage}</p>`); 
});

app.listen(8080, () => {
    console.log("🚀 Server running on http://localhost:8080");
});