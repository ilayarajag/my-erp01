const outletMembersServices = require("../services/outletMembersServices");

function postOutletmemberHandler(fastify) {
  const postOutletMember = outletMembersServices.postOutletMemberService(fastify);

  return async (request, reply) => {
    const { params, body, logTrace, userDetails } = request;
    const response = await postOutletMember({ params, body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = postOutletmemberHandler;
