const companyServices = require("../services/companyServices");

function companyInfoHandler(fastify) {
  const getCompanyInfo = companyServices.getCompanyInfoService(fastify);
  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;
    const response = await getCompanyInfo({
      body,
      params,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = companyInfoHandler;
