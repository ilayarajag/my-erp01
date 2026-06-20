const salesReturnServices = require("../services/salesReturnServices");

function createGeneralReturnHandler(fastify) {
  const createGeneralReturn = salesReturnServices.createGeneralReturnService(fastify);
  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;
    const response = await createGeneralReturn({ body, params, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = createGeneralReturnHandler;
