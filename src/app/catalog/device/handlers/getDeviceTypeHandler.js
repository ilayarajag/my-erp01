const deviceServices = require("../services/deviceServices");

function getDeviceTypeHandler(fastify) {
  const getDeviceType = deviceServices.getDeviceTypeService(fastify);
  return async (request, reply) => {
    const { body, params, logTrace } = request;
    const response = await getDeviceType({ body, params, logTrace });
    return reply.code(200).send(response);
  };
}

module.exports = getDeviceTypeHandler;
