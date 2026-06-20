const getCartServices = require("../services/getCartServices");

function cartlistHandler(fastify) {
  const getItemsInCartlist = getCartServices.getItemsInCartlist(fastify);

  return async (request, reply) => {
    const { body, params, query, logTrace, userDetails } = request;

    const response = await getItemsInCartlist({
      body,
      params,
      query,
      logTrace,
      userDetails
    });

    return reply.code(200).send(response);
  };
}

module.exports = cartlistHandler;