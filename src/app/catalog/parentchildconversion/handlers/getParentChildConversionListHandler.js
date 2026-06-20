const parentChildConversionServices = require("../services/parentChildConversionServices");

function getParentChildConversionListHandler(fastify) {
  const getParentChildConversionList = parentChildConversionServices.getParentChildConversionListService(fastify);
  return async (request, reply) => {
    const { params, query, logTrace } = request;
    const response = await getParentChildConversionList({ params, query, logTrace });
    return reply.code(200).send(response);
  };
}

module.exports = getParentChildConversionListHandler;
