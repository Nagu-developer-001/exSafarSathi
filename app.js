const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const port = 8080;
const methodOverload = require("method-override");
const ejsMate = require("ejs-mate");
//TODO use ejs-locals for all ejs templates:
app.engine("ejs",ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverload("_method"));
const ExpressErr = require("./utils/ExpressErr.js");

let listingRouter = require("./routes/listing.js");
let reviewsRouter = require("./routes/review.js");
let userRouter = require("./routes/user.js");
let otherCategory = require("./routes/otherCategory.js");



const flash = require("connect-flash");

const session = require("express-session");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");





const sessionOptions = 
    {secret:"set_your_secret",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() +7*24*60*60*1000,//TODO 7day each day 24 hrs and each hrs has 60 mins and each min 60 sec - 1000 sec
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};


app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.failure = req.flash("error");
    res.locals.nowUser = req.user;
    console.log(res.locals.success)
    next();
});


app.use("/listings",listingRouter);
app.use("/",userRouter);
app.use("/",otherCategory);
app.use("/",reviewsRouter);


// const review = require("./models/review.js");
console.log(ExpressErr);
main().then((res)=>{
    console.log("Successfully Connected to DataBase!");
}).catch((err)=>{
    console.log(err.errors);
});


async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wonderLust");
}
app.use("/api",(req,res,next)=>{
    console.log("This is middleware !!! for/here we do athentication");
    next();
});
//TODO CREATE ROUTE
app.get("/registerDemoUser",async(req,res)=>{
    let newuser = new User({
        email:"user3@gmail.com",
        username:"nagabhushana4"
    });
    let newDataDemo = await User.register(newuser,"helloworld");
    res.send(newDataDemo);
});


function validateErr(err){
    console.log(err);
    return err;
}
function castError(err){
    console.log(err);
    return err;
}
//TODO ERROR HANDILNG ROUTE
//TODO PAGE NOT FOUND   USE BOOTSRAP ALERT COMPONENT
app.all("*",(req,res,next)=>{
    console.log("err");
    next(new ExpressErr(404,"PAGE NOT FOUND!!"));
});
app.use((err, req, res, next) => {
    // if (err.name === "ValidationError") {
    //     err = validateErr(err); // Assuming validateErr transforms the error appropriately
    // } else if (err.name === "CastError") {
    //     err = castError(err); // Assuming castError transforms the error appropriately
    // }

    // // Set a default error status if one isn’t already set
    let {statusCode=500,message="Something went wrong"} = err;

    // Render the error page with the message
    res.status(statusCode).render("./listings/error.ejs", { message });
});

app.listen(port,(req,res)=>{
    console.log(`The server has been Started at localhost // - ${port}`);
});