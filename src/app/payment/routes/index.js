const schemas = require("../schemas");
const handlers = require("../handlers");

module.exports = async fastify => {
 

    fastify.route({
    method: "POST",
      url: "/bill/payment/summary",
    preHandler: fastify.authenticate,
     schema: schemas.billSummarySchema,
    handler: handlers.billSummaryHandler(fastify)
  });

      fastify.route({
    method: "POST",
      url: "/bill/payment/status",
    preHandler: fastify.authenticate,
     schema: schemas.billStatusSchema,
    handler: handlers.billStatusHandler(fastify)
  });
    fastify.route({
        method: "POST",
        url: "/bill/payment/cancel",
        preHandler: fastify.authenticate,
        schema: schemas.billpaymentCancelSchema,
        handler: handlers.billpaymentCancelHandler(fastify)
    });

};