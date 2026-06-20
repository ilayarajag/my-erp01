const reasonMasterServices = require("../services/reasonMasterServices");

function getReasonMasterListHandler(fastify) {
  const getReasonMasterList = reasonMasterServices.getReasonMasterListService(fastify);
  return async (request, reply) => {
    const { params, query, logTrace } = request;
    const response = await getReasonMasterList({ params, query, logTrace });
    return reply.code(200).send(response);
  };
}

module.exports = getReasonMasterListHandler;
