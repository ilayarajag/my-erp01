const outletMembersServices = require("../services/outletMembersServices");

function putOutletMemberHandler(fastify) {
  const putOutletMember = outletMembersServices.putOutletMemberService(fastify);

  return async (request, reply) => {
    const { params, body, logTrace, userDetails } = request;
    const response = await putOutletMember({ params, body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = putOutletMemberHandler;
