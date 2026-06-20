const storeManagerServices = require("../services/storeManagerServices");

function putStoreManagerHandler(fastify) {
  const putStoreManager = storeManagerServices.putStoreManagerService(fastify);
  return async (request, reply) => {
    const { params, body, logTrace, userDetails } = request;
    const response = await putStoreManager({ params, body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = putStoreManagerHandler;
