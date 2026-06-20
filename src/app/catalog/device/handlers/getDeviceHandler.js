const deviceServices = require("../services/deviceServices");

function getDeviceHandler(fastify) {
  const getDevice = deviceServices.getDeviceService(fastify);
  return async (request, reply) => {
    const { body, params, logTrace } = request;
    const response = await getDevice({ body, params, logTrace });
    return reply.code(200).send(response);
  };
}

module.exports = getDeviceHandler;
