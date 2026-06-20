const postReasonService = require("../services/reasonMasterServices");

function getReasonMasterInfoHandler(fastify) {
  const getReasonMasterInfo = postReasonService.getReasonMasterInfoService(fastify);

  return async (request, reply) => {
    const { params, body, logTrace } = request;
    const response = await getReasonMasterInfo({ params, body, logTrace });
    return reply.code(200).send(response);
  };
}

module.exports = getReasonMasterInfoHandler;
