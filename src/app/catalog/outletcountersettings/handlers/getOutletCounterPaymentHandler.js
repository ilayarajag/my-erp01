const getOutletCounterPaymentSettingsService = require("../services/getOutletCounterPaymentSettings");
function getOutletCounterPaymentHandler(fastify) {
  const getOutletCounterPaymentModes = getOutletCounterPaymentSettingsService.getOutletCounterPaymentSettingsService(fastify);
  return async (request, reply) => {
    const { body, params, query, logTrace, userDetails } = request;

    const response = await getOutletCounterPaymentModes({ query,  body,
      params,
      query,
      logTrace,
      userDetails });
  
    return response;
  };
}

module.exports = getOutletCounterPaymentHandler;
