const reasonMasterServices = require("../services/reasonMasterServices");

function postReasonMasterHandler(fastify) {
  const postReasonMaster = reasonMasterServices.postReasonMasterService(fastify);
  return async (request, reply) => {
    const { body, logTrace, userDetails } = request;
    const response = await postReasonMaster({ body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = postReasonMasterHandler;
