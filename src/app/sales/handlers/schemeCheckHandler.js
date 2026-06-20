const schemeServices = require("../services/schemeServices");

function schemeCheckHandler(fastify) {
  const getSchemeInfo = schemeServices.getSchemeInfoService(fastify);
  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;
    const response = await getSchemeInfo({
      body,
      params,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = schemeCheckHandler;
