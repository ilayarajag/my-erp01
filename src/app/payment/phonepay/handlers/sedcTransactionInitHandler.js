const phonepayServices = require("../services/phonepayServices");

function sedcTransactionInitHandler(fastify) {
  const sedcTransactionInit = phonepayServices.sedcTransactionInitService(fastify);
  return async (request, reply) => {
    const { body, logTrace, userDetails } = request;
    const response = await sedcTransactionInit({ body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = sedcTransactionInitHandler;
