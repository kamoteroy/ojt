const Joi = require("joi");

const ticketSchema = Joi.object({
  TicketNumber: Joi.string().allow(null),
  ClientId: Joi.number().integer().allow(null), // PK of Client
  Caller: Joi.string().required(),
  Concern: Joi.string().allow(null),
  ProductId: Joi.number().integer().allow(null), // PK of Product
  AnsweredBy: Joi.number().integer().allow(null), // PK of User
  Remarks: Joi.string().allow(null),
  Status: Joi.number().allow(null),
  Category: Joi.string().allow(null),
  Severity: Joi.string().allow(null),
  AssignedBy: Joi.number().integer().allow(null), // PK of User
  Solution: Joi.string().allow(null),
  DoneDate: Joi.date().allow(null),
  IsReviewed: Joi.number().integer().allow(null),
  CreatedBy: Joi.number().integer().allow(null), // PK of User
  UpdatedBy: Joi.number().integer().allow(null), // PK of User
  DateCreated: Joi.date(),
  DateUpdated: Joi.date().allow(null),
});

module.exports = ticketSchema;
