const outletCounterPaymentModesServices = require("../services/outletCounterPaymentModesServices");

function putOutletCounterPaymentModesHandler(fastify) {
  const putOutletCounterPaymentModes = outletCounterPaymentModesServices.putOutletCounterPaymentModesService(fastify);
  return async (request, reply) => {
    const { params, body, logTrace, userDetails } = request;
    const response = await putOutletCounterPaymentModes({ params, body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = putOutletCounterPaymentModesHandler;
