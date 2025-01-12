const mongoose = require("mongoose");
const placeList = require("../models/wonderLust.js");
const initData = require("./init.js");


main().then((res) =>{
    console.log("Successfully connected to database");
}).catch((err)=>{
    console.log(err.errors);
})


async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wonderLust")
}

const dataInitialization = async()=>{
    await placeList.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj,owner:'675c1e89dde6b1a1d524a1d0'}));
    await placeList.insertMany(initData.data);
    console.log(initData);
}
dataInitialization();