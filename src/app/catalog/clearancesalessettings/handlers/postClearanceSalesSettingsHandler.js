const clearanceSalesServices = require('../services/clearanceSalesSettingsServices');

function postClearanceSalesSettingsHandler(fastify) {
    const postClearanceSalesSettings = clearanceSalesServices.postClearanceSalesSettingsService(fastify);

    return async (request, reply) => {
        const { body, logTrace, userDetails } = request;
        const response = await postClearanceSalesSettings({ body, logTrace, userDetails });
        return reply.code(200).send(response);
    };
}

module.exports = postClearanceSalesSettingsHandler;
