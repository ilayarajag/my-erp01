const shiftCloseServices = require("../services/shiftCloseServices");

function getShiftCloseSummaryHandler(fastify) {
  const getShiftCloseSummary = shiftCloseServices.getShiftCloseSummaryService(fastify);
  return async (request, reply) => {
    const { query, logTrace, userDetails } = request;
    const response = await getShiftCloseSummary({ query, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = getShiftCloseSummaryHandler;
