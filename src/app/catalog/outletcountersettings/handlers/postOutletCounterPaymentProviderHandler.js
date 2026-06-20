const getOutletCounterPaymentSettingsService = require("../services/getOutletCounterPaymentSettings");

function postOutletCounterPaymentProviderHandler(fastify) {
    const outletCounterPaymentProvider = getOutletCounterPaymentSettingsService.postOutletCounterPaymentProviderService(fastify);
    return async (request, reply) => {
        const { params, body, logTrace, userDetails } = request;
        const response = await outletCounterPaymentProvider({ params, body, logTrace, userDetails });
        return reply.code(200).send(response);
    };
}

module.exports = postOutletCounterPaymentProviderHandler;
