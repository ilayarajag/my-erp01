const adminServices = require("../../../accounts/admin/services/adminServices");

function putAdminUserHandler(fastify) {
  const putAdminUser = adminServices.putAdminUserService(fastify);

  return async (request, reply) => {
    const { params, body, logTrace, userDetails } = request;
    const response = await putAdminUser({
      params,
      body,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = putAdminUserHandler;
