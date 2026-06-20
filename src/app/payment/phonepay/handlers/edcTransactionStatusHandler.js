const phonepayServices = require("../services/phonepayServices");

function edcTransactionStatusHandler(fastify) {
  const edcTransactionStatus = phonepayServices.edcTransactionStatusService(fastify);
  return async (request, reply) => {
    const { params, logTrace, userDetails } = request;
    const response = await edcTransactionStatus({ params, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = edcTransactionStatusHandler;
