const reasonMasterServices = require("../services/reasonMasterServices");

function getReasonOutletsByRegionHandler(fastify) {
  const getReasonOutletsByRegion = reasonMasterServices.getReasonOutletsByRegionService(fastify);
  return async (request, reply) => {
    const { params, logTrace } = request;
    const response = await getReasonOutletsByRegion({ params, logTrace });
    return reply.code(200).send(response);
  };
}

module.exports = getReasonOutletsByRegionHandler;
