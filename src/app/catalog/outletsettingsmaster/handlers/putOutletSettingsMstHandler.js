const outletSettingsMstServices = require("../services/outletSettingsMstServices");

function putOutletSettingsMstHandler(fastify) {
  const updateOutletSettingsMst = outletSettingsMstServices.updateOutletSettingsMstService(fastify);
  return async (request, reply) => {
    const { params, body, logTrace, userDetails } = request;
    const response = await updateOutletSettingsMst({
      params,
      body,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = putOutletSettingsMstHandler;
