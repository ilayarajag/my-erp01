const payTypesServices = require("../services/payTypesServices");

function putPayTypeHandler(fastify) {
  const putPayType = payTypesServices.putPayTypeService(fastify);

  return async (request, reply) => {
    const { params, body, logTrace, userDetails } = request;
    const response = await putPayType({ params, body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = putPayTypeHandler;
