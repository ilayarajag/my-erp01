const outletCounterPaymentModesServices = require("../services/outletCounterPaymentModesServices");

function postOutletCounterPaymentModesHandler(fastify) {
  const postOutletCounterPaymentModes = outletCounterPaymentModesServices.postOutletCounterPaymentModesService(fastify);
  return async (request, reply) => {
    const { body, logTrace, userDetails } = request;
    const response = await postOutletCounterPaymentModes({ body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = postOutletCounterPaymentModesHandler;
