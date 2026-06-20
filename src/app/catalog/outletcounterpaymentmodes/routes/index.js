const schemas = require("../schemas");
const handlers = require("../handlers");

module.exports = async fastify => {

  // POST - Create payment mode mappings for outlet + counter
  fastify.route({
    method: "POST",
    url: "/outlet/counter/payment-modes",
    preHandler: fastify.authenticate,
    schema: schemas.postOutletCounterPaymentModesSchema,
    handler: handlers.postOutletCounterPaymentModesHandler(fastify)
  });

  // PUT - Update a single mapping by id
  fastify.route({
    method: "PUT",
    url: "/outlet/counter/payment-modes/:outlet_counter_payment_id",
    preHandler: fastify.authenticate,
    schema: schemas.putOutletCounterPaymentModesSchema,
    handler: handlers.putOutletCounterPaymentModesHandler(fastify)
  });

  // GET - Multi-way: ?outlet_id=1 | ?counter_no=2 | ?outlet_id=1&counter_no=2
  fastify.route({
    method: "GET",
    url: "/outlet/counter/payment-modes/active",
    preHandler: fastify.authenticate,
    schema: schemas.getOutletCounterPaymentModesSchema,
    handler: handlers.getOutletCounterPaymentModesHandler(fastify)
  });

};
