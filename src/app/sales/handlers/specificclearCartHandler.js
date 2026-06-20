const specclearCartService = require("../services/specclearCart");


function specificclearCartHandler(fastify) {
  const specclearCart = specclearCartService(fastify);

  return async (request, reply) => {
    const { query,params, body, logTrace, userDetails } = request;
    const response = await specclearCart({ query,params, body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = specificclearCartHandler;
