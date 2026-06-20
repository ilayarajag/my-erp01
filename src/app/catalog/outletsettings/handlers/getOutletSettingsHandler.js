const outletSettingsServices = require('../services/outletSettingsServices');

function getOutletSettingsHandler(fastify) {
  const getOutletSettings = outletSettingsServices.getOutletSettingsService(fastify);

  return async (request, reply) => {
    const { params, query, logTrace } = request;
    const response = await getOutletSettings({ params, query, logTrace });
    return reply.code(200).send(response);
  };
}

module.exports = getOutletSettingsHandler;
