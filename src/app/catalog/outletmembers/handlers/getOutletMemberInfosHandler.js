const outletMembersServices = require("../services/outletMembersServices");

function getOutletMemberInfoHandler(fastify) {
  const getDeviceInfo = outletMembersServices.getOutletMembersInfoInfoService(fastify);
  return async (request, reply) => {
    const { body, params, logTrace } = request;
    const response = await getDeviceInfo({ body, params, logTrace });
    return reply.code(200).send(response);
  };
}

module.exports = getOutletMemberInfoHandler;
