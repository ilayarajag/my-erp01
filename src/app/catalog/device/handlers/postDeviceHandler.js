const deviceServices = require("../services/deviceServices");

function postDeviceHandler(fastify) {
  const postDevice = deviceServices.postDeviceService(fastify);

  return async (request, reply) => {
    const { params, body, logTrace, userDetails } = request;
    const response = await postDevice({ params, body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = postDeviceHandler;
