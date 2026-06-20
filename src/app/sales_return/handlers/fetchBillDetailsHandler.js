const salesReturnServices = require("../services/salesReturnServices");

function fetchBillDetailsHandler(fastify) {
  const fetchBillDetails = salesReturnServices.fetchBillDetailsService(fastify);
  return async (request, reply) => {
    const { body, logTrace, userDetails } = request;
    const response = await fetchBillDetails({  body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = fetchBillDetailsHandler;
