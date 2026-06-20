
const salesReturnServices = require("../services/salesReturnServices");

function getGeneralReturnReportHandler(fastify) {
  const getGeneralReturnReport = salesReturnServices.getGeneralReturnReportService(fastify);
  return async (request, reply) => {
    const { body, logTrace, userDetails } = request;
    const response = await getGeneralReturnReport({ body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = getGeneralReturnReportHandler;
