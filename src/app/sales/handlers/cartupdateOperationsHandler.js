const addItemToCartService = require("../services/addItemToCart");
const updateItemInCartService = require("../services/updateItemInCart");
const deleteItemFromCartService = require("../services/deleteItemFromCart");

function updateToCartHandler(fastify) {
  const updateItemInCart = updateItemInCartService(fastify);
  const deleteItemFromCart = deleteItemFromCartService(fastify);
  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;

      const response = await updateItemInCart({
          body,
          params,
          logTrace,
          userDetails
        });
        return reply.code(200).send(response);
    
  };
}

module.exports = updateToCartHandler;
