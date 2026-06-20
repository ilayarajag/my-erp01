const reasonMasterServices = require("../services/reasonMasterServices");

function putReasonMasterHandler(fastify) {
  const putReasonMaster = reasonMasterServices.putReasonMasterService(fastify);
  return async (request, reply) => {
    const { params, body, logTrace, userDetails } = request;
    const response = await putReasonMaster({ params, body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = putReasonMasterHandler;
