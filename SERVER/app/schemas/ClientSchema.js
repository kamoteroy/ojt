const Joi = require("joi");

const ClientSchema = Joi.object({
  Code: Joi.string().pattern(/^[0-9]{6}$/),
  Name: Joi.string().required(),
  Address: Joi.string().required(),
  Email: Joi.string().required(),
  ContactPerson: Joi.string().required(),
  MobileNumber: Joi.string().required(),
  LandlineNumber: Joi.string().allow(null),
  DateSoftwareAcceptance: Joi.date(),
  DateBCSExpiry: Joi.date(),
  DateBCSRenewal: Joi.date(),
  CreatedBy: Joi.number().integer(),
  DateCreated: Joi.date(),
  UpdatedBy: Joi.number().integer().allow(null),
  DateUpdated: Joi.date().allow(null),
});

module.exports = ClientSchema;
