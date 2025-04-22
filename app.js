if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const port = 8080;
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const MongoStore = require("connect-mongo");
const ExpressErr = require("./utils/ExpressErr.js");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const db_url = process.env.ATLASDB_URL;

const store = MongoStore.create({
    mongoUrl: db_url,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.error("ERROR IN MONGO SESSION STORE:", err);
});

const sessionOptions = {
    store,
    secret: "set_your_secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(session());
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.failure = req.flash("error");
    res.locals.nowUser = req.user;
    console.log("Flash Messages:", res.locals.success);
    next();
});

// Importing routes
app.use("/listings", require("./routes/listing.js"));
app.use("/", require("./routes/user.js"));
app.use("/", require("./routes/otherCategory.js"));
app.use("/", require("./routes/review.js"));

// Connecting to MongoDB
async function main() {
    await mongoose.connect(db_url);
}

main()
    .then(() => console.log("Successfully Connected to Database!"))
    .catch((err) => console.error("Database Connection Error:", err));

// API Middleware
app.use("/api", (req, res, next) => {
    console.log("API Middleware - Authentication Process");
    next();
});

// Register Demo User
app.get("/registerDemoUser", async (req, res) => {
    let newUser = new User({ email: "user3@gmail.com", username: "nagabhushana4" });
    let newDataDemo = await User.register(newUser, "helloworld");
    res.send(newDataDemo);
});

// Error Handling Middleware
app.all("*", (req, res, next) => {
    return next(new ExpressErr(404, "PAGE NOT FOUND!!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    console.error(`Error (${statusCode}): ${message}`);
    res.status(statusCode).render("./listings/error.ejs", { message });
});

// Start Server
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});