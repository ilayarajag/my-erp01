const salesReturnServices = require("../services/salesReturnServices");

function createSalesReturnHandler(fastify) {
  const createSalesReturn = salesReturnServices.createSalesReturnService(fastify);
  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;
    const response = await createSalesReturn({ body,params, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = createSalesReturnHandler;
