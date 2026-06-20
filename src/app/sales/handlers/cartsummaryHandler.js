// const getCartServices = require("../services/getCartServices");
const getCartsummaryServices = require("../services/getCartsummaryServices");

function cartsummaryHandler(fastify) {
  const getItemsInCart = getCartsummaryServices.getCartsummaryServices(fastify);
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

module.exports = cartsummaryHandler;
