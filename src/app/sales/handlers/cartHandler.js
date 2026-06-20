const getCartServices = require("../services/getCartServices");

function cartHandler(fastify) {
  const getItemsInCart = getCartServices.getCartServices(fastify);
  return async (request, reply) => {
    const { body, params, query, logTrace, userDetails } = request;
    const response = await getItemsInCart({
      body,
      params,
      query,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = cartHandler;
