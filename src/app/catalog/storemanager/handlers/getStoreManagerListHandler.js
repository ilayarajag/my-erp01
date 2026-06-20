const storeManagerServices = require("../services/storeManagerServices");

function getStoreManagerListHandler(fastify) {
  const getStoreManagerList = storeManagerServices.getStoreManagerListService(fastify);
  return async (request, reply) => {
    const { query, params, logTrace, userDetails } = request;
    const response = await getStoreManagerList({ query, params, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = getStoreManagerListHandler;
