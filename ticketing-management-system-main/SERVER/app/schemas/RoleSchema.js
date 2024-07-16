const Joi = require("joi");

const RoleSchema = Joi.object({
  Name: Joi.string().required(),
  Description: Joi.string().required(),
  CreatedBy: Joi.number().allow(null),
  UpdatedBy: Joi.number().allow(null),
});

module.exports = RoleSchema;
