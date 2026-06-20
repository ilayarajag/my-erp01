const outletCounterPaymentModesServices = require("../services/outletCounterPaymentModesServices");

function getOutletCounterPaymentModesHandler(fastify) {
  const getOutletCounterPaymentModes = outletCounterPaymentModesServices.getOutletCounterPaymentModesService(fastify);
  return async (request, reply) => {
    const { query, logTrace } = request;
    const response = await getOutletCounterPaymentModes({ query, logTrace });
    return reply.code(200).send(response);
  };
}

module.exports = getOutletCounterPaymentModesHandler;
