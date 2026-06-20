const payTypesServices = require("../services/payTypesServices");

function deletePayTypeHandler(fastify) {
  const deletePayType = payTypesServices.deletePayTypeService(fastify);

  return async (request, reply) => {
    const { params, body, logTrace, userDetails } = request;
    const response = await deletePayType({
      params,
      body,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = deletePayTypeHandler;
