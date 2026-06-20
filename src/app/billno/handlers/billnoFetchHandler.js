const billServices = require("../services/billnoServices");

function billnoFetchHandler(fastify) {
  const getbillnoInfo = billServices.getbillnoInfoInfoService(fastify);
  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;
    const response = await getbillnoInfo({
      body, params, logTrace, userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = billnoFetchHandler;
