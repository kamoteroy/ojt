const Joi = require("joi");

const loginSchema = Joi.object({
  Username: Joi.string().required(),
  Password: Joi.string().min(6).required(),
});

const registerSchema = Joi.object({
  Code: Joi.string().pattern(/^[0-9]{6}$/),
  Username: Joi.string().required(),
  Firstname: Joi.string().required(),
  Middlename: Joi.string(),
  Lastname: Joi.string().required(),
  Gender: Joi.string().required(),
  Birthdate: Joi.date().required(),
  Address: Joi.string().required(),
  ContactNumber: Joi.string().required(),
  Image: Joi.string().allow(null),
  DepartmentId: Joi.number().integer().allow(null),
  RoleId: Joi.number().integer().allow(null),
  isDeactivated: Joi.number().integer().required(),
  CreatedBy: Joi.number().integer().allow(null),
  DateCreated: Joi.date(),
  UpdatedBy: Joi.number().integer().allow(null),
  DateUpdated: Joi.date().allow(null),
});

module.exports = {
  loginSchema,
  registerSchema,
};
