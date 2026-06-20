const clearCartService = require("../services/clearCart");

function clearCartHandler(fastify) {
  const clearCart = clearCartService(fastify);

  return async (request, reply) => {
    const { query, body, logTrace, userDetails } = request;
    const response = await clearCart({ query, body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = clearCartHandler;
