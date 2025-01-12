const express = require("express");
const router = express.Router();
const {UniqueUrl} = require("../AuthenticLogin.js");

router.get("/FAQ",UniqueUrl,(req,res)=>{
    res.render("./listings/faq.ejs");
});
router.get("/help",UniqueUrl,(req,res)=>{
    res.render("./listings/help.ejs")
})

module.exports = router;