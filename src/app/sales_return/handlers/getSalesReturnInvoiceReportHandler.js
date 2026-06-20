const salesReturnServices = require("../services/salesReturnServices");

function getSalesReturnInvoiceReportHandler(fastify) {
  const getSalesReturnInvoiceReport = salesReturnServices.getSalesReturnInvoiceReportService(fastify);
  return async (request, reply) => {
    const {body, query, logTrace } = request;
    const response = await getSalesReturnInvoiceReport({ body, query, logTrace });
    return reply.code(200).send(response);
  };
}

module.exports = getSalesReturnInvoiceReportHandler;
