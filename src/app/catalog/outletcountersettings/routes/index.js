const schemas = require("../schemas");
const handlers = require("../handlers");

module.exports = async fastify => {

  fastify.route({
    method: "GET",
    url: "/outlet/counter/provider/:outlet_id/:counter_no/:pay_type_id",
    preHandler: fastify.authenticate,
    schema: schemas.getOutletCounterPaymentSettingSchema,
    handler: handlers.getOutletCounterPaymentHandler(fastify)
  });

  fastify.route({
    method: "GET",
    url: "/outlet/counter/setting/:outlet_id",
    preHandler: fastify.authenticate,
    schema: schemas.getOutletCounterPaymentModesSchema,
    handler: handlers.getOutletCountersettingsHandler(fastify)
  });

  fastify.route({
    method: "PUT",
    url: "/outlet/counter/setting/update/:outlet_id/:pay_type_id",
    preHandler: fastify.authenticate,
    schema: schemas.putOutletCounterSettingSchema,
    handler: handlers.putOutletCounterSettingHandler(fastify)
  });

  fastify.route({
    method: "PUT",
    url: "/outlet/counter/payment/provider/:outlet_id/:provider_id",
    preHandler: fastify.authenticate,
    schema: schemas.putOutletCounterPaymentProviderSchema,
    handler: handlers.putOutletCounterPaymentProviderHandler(fastify)
  });

  fastify.route({
    method: "POST",
    url: "/outlet/counter/payment/provider/:outlet_id",
    preHandler: fastify.authenticate,
    schema: schemas.postOutletCounterPaymentProviderSchema,
    handler: handlers.postOutletCounterPaymentProviderHandler(fastify)
  });

};
