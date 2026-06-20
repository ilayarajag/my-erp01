const outletMembersServices = require("../services/outletMembersServices");

function getOutletMembersListHandler(fastify) {
  const getOutletMembers = outletMembersServices.getOutletMembersListService(fastify);
  return async (request, reply) => {
    const { params, logTrace, query } = request;
    const response = await getOutletMembers({ params, logTrace, query });
    return reply.code(200).send(response);
  };
}

module.exports = getOutletMembersListHandler;
