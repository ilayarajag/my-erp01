const phonepayServices = require("../services/phonepayServices");

function dqrInitHandler(fastify) {
  const dqrInit = phonepayServices.dqrInitService(fastify);
  return async (request, reply) => {
    const { body, logTrace, userDetails } = request;
    const response = await dqrInit({ body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = dqrInitHandler;
