const Joi = require('joi');

module.exports.validateUserData = Joi.object({
    Listing:Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        price:Joi.number().required().min(0),
        image:Joi.object({url:Joi.string()}).required(),//allow("",null),
        location:Joi.string().required(),
        country:Joi.string().required(),
    }).required(),
});

module.exports.validateUserRating = Joi.object({
    reviews:Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comment:Joi.string().required(),
    }).required(),
});