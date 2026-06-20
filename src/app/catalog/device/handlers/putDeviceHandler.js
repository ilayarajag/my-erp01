const deviceServices = require("../services/deviceServices");

function putDeviceHandler(fastify) {
  const putDevice = deviceServices.putDeviceService(fastify);

  return async (request, reply) => {
    console.log("put device handler called")
    const { params, body, logTrace, userDetails } = request;
    const response = await putDevice({ params, body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = putDeviceHandler;
