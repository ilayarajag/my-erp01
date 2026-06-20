const deviceServices = require("../services/deviceServices");

function deleteDeviceHandler(fastify) {
  const deleteDevice = deviceServices.deleteDeviceService(fastify);

  return async (request, reply) => {
    const { params, body, logTrace, userDetails } = request;
    const response = await deleteDevice({
      params,
      body,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = deleteDeviceHandler;
