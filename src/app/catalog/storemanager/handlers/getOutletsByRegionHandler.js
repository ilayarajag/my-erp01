const storeManagerServices = require("../services/storeManagerServices");

function getOutletsByRegionHandler(fastify) {
  const getOutletsByRegion = storeManagerServices.getOutletsByRegionService(fastify);
  return async (request, reply) => {
    const { params, logTrace, userDetails } = request;
    const response = await getOutletsByRegion({ params, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = getOutletsByRegionHandler;
