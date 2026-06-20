const getOutletCounterPaymentSettingsService = require("../services/getOutletCounterPaymentSettings");
function putOutletCounterSettingHandler(fastify) {
  const putOutletCounterSetting = getOutletCounterPaymentSettingsService.putOutletCounterSettingService(fastify);
  return async (request, reply) => {
    const { params, body, logTrace, userDetails } = request;
    const response = await putOutletCounterSetting({ params, body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = putOutletCounterSettingHandler;
