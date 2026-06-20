// const getCartServices = require("../services/getCartServices");
const cartPrintSummaryServices = require("../services/cartPrintsummaryServices");


function cartPrintsummaryHandler(fastify) {
  const getItemsInCart = cartPrintSummaryServices.getcartPrintSummaryServices(fastify);
  return async (request, reply) => {
    const { body, params, query, logTrace, userDetails } = request;
    console.log(" query", query);
    
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

module.exports = cartPrintsummaryHandler;
