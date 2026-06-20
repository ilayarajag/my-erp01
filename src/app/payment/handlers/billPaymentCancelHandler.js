const paymentGatwayServices  = require("../services/paymentGatwayService");

function billPaymentCancelHandler(fastify) {
  const paymentCancel = paymentGatwayServices.cancelPaymentData(fastify);
  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;
    const response = await paymentCancel({
      body,
      params,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = billPaymentCancelHandler;
