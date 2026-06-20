const outletSettingsMstServices = require("../services/outletSettingsMstServices");


function getOutletSettingsMstActiveListHandler(fastify) {
  const getOutletSettingsMstActiveList = outletSettingsMstServices.getOutletSettingsMstActiveListService(fastify);
  return async (request, reply) => {
    const { query, logTrace, userDetails } = request;
    const response = await getOutletSettingsMstActiveList({
      query,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = getOutletSettingsMstActiveListHandler;