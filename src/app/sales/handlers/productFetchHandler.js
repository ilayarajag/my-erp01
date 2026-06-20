const productServices = require("../services/productServices");

function productFetchHandler(fastify) {
  const getProductInfo = productServices.getProductInfoInfoService(fastify);
  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;
    const response = await getProductInfo({
      body,
      params,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = productFetchHandler;
