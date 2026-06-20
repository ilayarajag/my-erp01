const payTypesServices = require("../services/payTypesServices");

function getPayTypesHandler(fastify) {
  const getPayTypes = payTypesServices.getPayTypesService(fastify);
  return async (request, reply) => {
    const { params, logTrace, query } = request;
    const response = await getPayTypes({ params, logTrace, query });
    return reply.code(200).send(response);
  };
}

module.exports = getPayTypesHandler;
