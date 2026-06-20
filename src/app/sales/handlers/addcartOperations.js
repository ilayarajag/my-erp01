// const addItemToCartService = require("../services/addItemToCart");
const addCartService = require("../services/addCartService");
function addOperationsCartHandler(fastify) {
  const addItemToCart = addCartService(fastify);

  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;

    const response = await addItemToCart({
      body,
      params,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);

  };
}

module.exports = addOperationsCartHandler;
