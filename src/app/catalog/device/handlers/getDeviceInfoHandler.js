const deviceServices = require("../services/deviceServices");

function getDeviceInfoHandler(fastify) {
  const getDeviceInfo = deviceServices.getDeviceInfoService(fastify);
  return async (request, reply) => {
    const { body, params, logTrace } = request;
    const response = await getDeviceInfo({ body, params, logTrace });
    return reply.code(200).send(response);
  };
}

module.exports = getDeviceInfoHandler;
