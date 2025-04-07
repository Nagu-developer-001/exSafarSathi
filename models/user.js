const { required, string } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');



const UserSchema = new Schema({
    email:{
        type:String,
        required:true
    },
    image:{
        url:String,
        filename:String,
        //default:"https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
    },
    phone:{
        type:String
    },
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);