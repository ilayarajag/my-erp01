const outletMembersServices = require("../services/outletMembersServices");

function deleteOutletMemberHandler(fastify) {
  const deleteOutletMember = outletMembersServices.deleteOutletMemberService(fastify);

  return async (request, reply) => {
    const { params, body, logTrace, userDetails } = request;
    const response = await deleteOutletMember({
      params,
      body,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = deleteOutletMemberHandler;
