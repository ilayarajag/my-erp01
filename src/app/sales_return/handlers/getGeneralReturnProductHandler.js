const salesReturnServices = require("../services/salesReturnServices");

function getGeneralReturnProductHandler(fastify) {
  const getGeneralReturnProduct = salesReturnServices.getGeneralReturnProductService(fastify);
  return async (request, reply) => {
    const { body, logTrace, userDetails } = request;
    const response = await getGeneralReturnProduct({ body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = getGeneralReturnProductHandler;
