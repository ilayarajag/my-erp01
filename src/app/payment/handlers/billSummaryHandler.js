const paymentGatwayServices  = require("../services/paymentGatwayService");

function billSummaryHandler(fastify) {
  const billSave = paymentGatwayServices.getPaymentData(fastify);
  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;
    const response = await billSave({
      body,
      params,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = billSummaryHandler;
