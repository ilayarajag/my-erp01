const storeManagerServices = require("../services/storeManagerServices");

function swapStoreManagerHandler(fastify) {
  const swapStoreManager = storeManagerServices.swapStoreManagerService(fastify);
  return async (request, reply) => {
    const { body, logTrace, userDetails } = request;
    const response = await swapStoreManager({ body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = swapStoreManagerHandler;
