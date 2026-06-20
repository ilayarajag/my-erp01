const salesReturnServices = require("../services/salesReturnServices");

function getInvoiceSalesReturnDetailsHandler(fastify) {
  const getInvoiceSalesReturnDetails = salesReturnServices.getInvoiceSalesReturnDetailsService(fastify);
  return async (request, reply) => {
    const { body, query, logTrace } = request;
    const response = await getInvoiceSalesReturnDetails({ body, query, logTrace });
    return reply.code(200).send(response);
  };
}

module.exports = getInvoiceSalesReturnDetailsHandler;
