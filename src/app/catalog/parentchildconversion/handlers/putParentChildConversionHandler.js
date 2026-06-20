const parentChildConversionServices = require("../services/parentChildConversionServices");

function putParentChildConversionHandler(fastify) {
  const putParentChildConversion = parentChildConversionServices.putParentChildConversionService(fastify);
  return async (request, reply) => {
    const { params, body, logTrace, userDetails } = request;
    const response = await putParentChildConversion({ params, body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = putParentChildConversionHandler;
