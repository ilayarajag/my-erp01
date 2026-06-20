const salesReturnServices = require("../services/salesReturnServices");

function getSalesReturnInfoHandler(fastify) {
  const getSalesReturnInfo = salesReturnServices.getSalesReturnInfoService(fastify);
  return async (request, reply) => {
    const { params, logTrace, userDetails } = request;
    const response = await getSalesReturnInfo({ params, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = getSalesReturnInfoHandler;
