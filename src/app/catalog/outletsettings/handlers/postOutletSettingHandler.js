const outletSettingsServices = require('../services/outletSettingsServices');

function postOutletSettingHandler(fastify) {
  const postOutletSetting = outletSettingsServices.postOutletSettingService(fastify);

  return async (request, reply) => {
    const { body, logTrace, userDetails } = request;
    const response = await postOutletSetting({ body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = postOutletSettingHandler;
