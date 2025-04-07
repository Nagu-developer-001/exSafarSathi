const express = require("express");
const router = express.Router();
const {UniqueUrl} = require("../AuthenticLogin.js");
const placeList = require("../models/wonderLust.js");
const {isLogined,listOwner} = require("../AuthenticLogin.js");




router.get("/FAQ",UniqueUrl,(req,res)=>{
    res.render("./listings/faq.ejs");
});
router.get("/help",UniqueUrl,(req,res)=>{
    res.render("./listings/help.ejs")
});
router.get("/booking",(req,res)=>{
    res.send("booking");
});
router.get("/search",async(req,res)=>{
    let {searchQuery} =  req.query;
    let pricers = searchQuery.match(/\d+/g);
    if(searchQuery){
        req.session.searchQuery = searchQuery;
        let allListing = await placeList.find({$or:[{title:{  $regex: searchQuery,$options: 'i' }}]});
        console.log(`searching for ${searchQuery}`);
        res.render("listings/index.ejs",{allListing});
    }
});

module.exports = router;