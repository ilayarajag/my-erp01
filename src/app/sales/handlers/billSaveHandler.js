const billServices = require("../services/billServices");

function billSaveHandler(fastify) {
  const billSave = billServices.billSaveServices(fastify);
  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;
    const response = await billSave({
      body,
      params,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = billSaveHandler;
