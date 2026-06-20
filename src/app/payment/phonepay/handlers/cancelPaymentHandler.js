const phonepayServices = require("../services/phonepayServices");

function cancelPaymentHandler(fastify) {
  const cancelPayment = phonepayServices.cancelPaymentService(fastify);
  return async (request, reply) => {
    const { params, logTrace, userDetails } = request;
    const response = await cancelPayment({ params, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = cancelPaymentHandler;
