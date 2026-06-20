const settingServices = require("../services/settingServices");

function settingHandler(fastify) {
  const settingInfo = settingServices.settingServices(fastify);
  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;
    const response = await settingInfo({
      body,
      params,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = settingHandler;
