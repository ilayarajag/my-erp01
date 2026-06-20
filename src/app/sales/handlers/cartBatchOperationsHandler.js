const addItemToCartService = require("../services/addItemToCart");
const getBatchDetailsService = require("../services/getBatchDetailsService");
function cartBatchOperationsHandler(fastify) {
  const getBatchDetails = getBatchDetailsService(fastify);
  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;

    const response = await getBatchDetails({
      body,
      params,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);

  };
}

module.exports = cartBatchOperationsHandler;
