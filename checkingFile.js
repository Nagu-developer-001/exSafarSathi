const placeList = require("./models/wonderLust.js");
const review = require("./models/review.js");
const mongoose = require("mongoose");


main().then((res)=>{
    console.log("Successfully Connected to DataBase!");
}).catch((err)=>{
    console.log(err.errors);
});

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wonderLust");
}

