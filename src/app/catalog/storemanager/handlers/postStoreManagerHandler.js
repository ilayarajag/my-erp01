const storeManagerServices = require("../services/storeManagerServices");

function postStoreManagerHandler(fastify) {
  const postStoreManager = storeManagerServices.postStoreManagerService(fastify);
  return async (request, reply) => {
    const { body, logTrace, userDetails } = request;
    const response = await postStoreManager({ body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = postStoreManagerHandler;
