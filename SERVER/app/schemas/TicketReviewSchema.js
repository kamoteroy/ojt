const Joi = require("joi");

const ticketReviewSchema = Joi.object({
  TicketId: Joi.number().integer().required(), // FK of TicketSchema
  TicketReviewNumber: Joi.string().allow(null),
  ReviewedBy: Joi.number().integer().required(), // PK of User
  Comments: Joi.string().allow(null),
  SatisfactoryRate: Joi.number().integer().required(),
  CreatedBy: Joi.number().integer(), // PK of User
  UpdatedBy: Joi.number().integer().allow(null), // PK of User
  DateCreated: Joi.date(),
  DateUpdated: Joi.date().allow(null),
});

module.exports = ticketReviewSchema;
