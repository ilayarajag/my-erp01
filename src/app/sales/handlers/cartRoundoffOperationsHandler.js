const addItemToCartService = require("../services/addItemToCart");
const updateRoundOffItemInCart = require("../services/updateItemRoundOffCart");
const deleteItemFromCartService = require("../services/deleteItemFromCart");

function cartRoundoffOperationsHandler(fastify) {
  const updateItemInCartRoundOff = updateRoundOffItemInCart(fastify);
  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;

    const response = await updateItemInCartRoundOff({
      body,
      params,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);

  };
}

module.exports = cartRoundoffOperationsHandler;
