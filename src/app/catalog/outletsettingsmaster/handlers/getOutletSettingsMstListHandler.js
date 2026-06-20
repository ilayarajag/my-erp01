const outletSettingsMstServices = require("../services/outletSettingsMstServices");


function getOutletSettingsMstListHandler(fastify) {
  const getOutletSettingsMstList = outletSettingsMstServices.getOutletSettingsMstListService(fastify);
  return async (request, reply) => {
    const { query, params, logTrace, userDetails } = request;
    const response = await getOutletSettingsMstList({
      query,
      params,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = getOutletSettingsMstListHandler;