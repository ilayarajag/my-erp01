const schemas = require("../schemas");
const handlers = require("../handlers");

module.exports = async fastify => {

  // POST - SEDC Transaction Init
  // Fetches provider config, calls PhonePe BFF, inserts PENDING row in outlet_bill_payments
  fastify.route({
    method: "POST",
    url: "/phonepay/transaction/init",
    preHandler: fastify.authenticate,
    schema: schemas.sedcTransactionInitSchema,
    handler: handlers.sedcTransactionInitHandler(fastify)
  });

  // GET - EDC Transaction Status
  // Calls PhonePe BFF, updates outlet_bill_payments status (SUCCESS / FAILED / PENDING)
  fastify.route({
    method: "GET",
    url: "/phonepay/edc/transaction/status/:transactionId",
    preHandler: fastify.authenticate,
    schema: schemas.edcTransactionStatusSchema,
    handler: handlers.edcTransactionStatusHandler(fastify)
  });

  // POST - Cancel PhonePe Payment
  // Calls PhonePe BFF cancel API and updates outlet_payment_logs as cancelled
  fastify.route({
    method: "POST",
    url: "/phonepay/cancel/payment/:transactionId",
    preHandler: fastify.authenticate,
    schema: schemas.cancelPaymentSchema,
    handler: handlers.cancelPaymentHandler(fastify)
  });

};
