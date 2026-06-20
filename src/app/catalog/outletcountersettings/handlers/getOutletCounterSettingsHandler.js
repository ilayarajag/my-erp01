const getOutletCounterSettingsService = require("../services/outletcouterSettingsService");
function getOutletCountersettingsHandler(fastify) {
  const getOutletCounterPaymentModes = getOutletCounterSettingsService.getOutletCounterSettingsService(fastify);
  return async (request, reply) => {
    const { body, params, query, logTrace, userDetails } = request;
  
    const response = await getOutletCounterPaymentModes({ query,  body,
      params,
      query,
      logTrace,
      userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = getOutletCountersettingsHandler;
