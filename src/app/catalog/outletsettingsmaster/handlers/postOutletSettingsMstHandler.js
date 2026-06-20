const outletSettingsMstServices = require("../services/outletSettingsMstServices");

function postOutletSettingsMstHandler(fastify) {
  const createOutletSettingsMst = outletSettingsMstServices.createOutletSettingsMstService(fastify);
  return async (request, reply) => {
    const { body, logTrace, userDetails } = request;
    const response = await createOutletSettingsMst({
      body,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = postOutletSettingsMstHandler;
