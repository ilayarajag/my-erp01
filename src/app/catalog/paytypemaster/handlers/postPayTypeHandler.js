const payTypesServices = require("../services/payTypesServices");

function postPayTypeHandler(fastify) {
  const postPayType = payTypesServices.postPayTypeService(fastify);

  return async (request, reply) => {
    const { params, body, logTrace, userDetails } = request;
    const response = await postPayType({ params, body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = postPayTypeHandler;
