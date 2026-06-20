const salesReturnServices = require("../services/salesReturnServices");

function getSalesReturnReportHandler(fastify) {
  const getSalesReturnReport = salesReturnServices.getSalesReturnReportService(fastify);
  return async (request, reply) => {
    const { body, query, logTrace } = request;
    const response = await getSalesReturnReport({ body, query, logTrace });
    return reply.code(200).send(response);
  };
}

module.exports = getSalesReturnReportHandler;
