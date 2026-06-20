const outletMembersServices = require("../services/outletMembersServices");

function getOutletListHandler(fastify) {
  const getOutletMembers = outletMembersServices.getOutletListService(fastify);
  return async (request, reply) => {
    const { params, logTrace, query ,userDetails} = request;
    const response = await getOutletMembers({ params, logTrace, query,userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = getOutletListHandler;
