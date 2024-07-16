const Joi = require("joi");

const ProductSchema = Joi.object({
  Code: Joi.string().pattern(/^[0-9]{6}$/),
  Name: Joi.string().required(),
  Description: Joi.string().required(),
  Category: Joi.string().required(),
  Price: Joi.number().required(), //.precision(2) for 2 decimal places
  CreatedBy: Joi.number().integer().allow(null),
  DateCreated: Joi.date(),
  UpdatedBy: Joi.number().integer().allow(null),
  DateUpdated: Joi.date().allow(null),
});

module.exports = ProductSchema;
