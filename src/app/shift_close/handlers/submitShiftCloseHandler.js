const shiftCloseServices = require("../services/shiftCloseServices");

function submitShiftCloseHandler(fastify) {
  const submitShiftClose = shiftCloseServices.submitShiftCloseService(fastify);
  return async (request, reply) => {
    const { body, logTrace, userDetails } = request;
    const response = await submitShiftClose({ body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = submitShiftCloseHandler;
