const newmemberservices = require("../services/newmemberservices");

function weighingHandler(fastify) {
  const weighingInfo = newmemberservices.weighingservices(fastify);
  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;
    const response = await weighingInfo({
      body,
      params,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = weighingHandler;
