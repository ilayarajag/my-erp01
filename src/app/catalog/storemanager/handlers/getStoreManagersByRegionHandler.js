const storeManagerServices = require("../services/storeManagerServices");

function getStoreManagersByRegionHandler(fastify) {
  const getStoreManagersByRegion = storeManagerServices.getStoreManagersByRegionService(fastify);
  return async (request, reply) => {
    const { params, logTrace, userDetails } = request;
    const response = await getStoreManagersByRegion({ params, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = getStoreManagersByRegionHandler;
