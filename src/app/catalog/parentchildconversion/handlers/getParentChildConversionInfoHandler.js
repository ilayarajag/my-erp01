const parentChildConversionServices = require("../services/parentChildConversionServices");

function getParentChildConversionInfoHandler(fastify) {
  const getParentChildConversionInfo = parentChildConversionServices.getParentChildConversionInfoService(fastify);
  return async (request, reply) => {
    const { params, logTrace } = request;
    const response = await getParentChildConversionInfo({ params, logTrace });
    return reply.code(200).send(response);
  };
}

module.exports = getParentChildConversionInfoHandler;
