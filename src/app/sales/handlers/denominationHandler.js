const newmemberservices = require("../services/newmemberservices");

function denominationHandler(fastify) {
  const denominationInfo = newmemberservices.denominationservices(fastify);
  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;
    const response = await denominationInfo({
      body,
      params,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = denominationHandler;
