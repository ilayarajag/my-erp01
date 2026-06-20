const getOutletCounterPaymentSettingsService = require("../services/getOutletCounterPaymentSettings");
function putOutletCounterPaymentProviderHandler(fastify) {
  const putOutletCounterPaymentProvider = getOutletCounterPaymentSettingsService.putOutletCounterPaymentProviderService(fastify);
  return async (request, reply) => {
    const { params, body, logTrace, userDetails } = request;
    const response = await putOutletCounterPaymentProvider({ params, body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = putOutletCounterPaymentProviderHandler;
