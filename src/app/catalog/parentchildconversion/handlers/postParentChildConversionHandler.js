const parentChildConversionServices = require("../services/parentChildConversionServices");

function postParentChildConversionHandler(fastify) {
  const postParentChildConversion = parentChildConversionServices.postParentChildConversionService(fastify);
  return async (request, reply) => {
    const { body, logTrace, userDetails } = request;
    const response = await postParentChildConversion({ body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = postParentChildConversionHandler;
