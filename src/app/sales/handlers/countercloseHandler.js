const newmemberservices = require("../services/newmemberservices");

function counterHandler(fastify) {
  const getcountercloseInfo = newmemberservices.countercloseservices(fastify);
  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;
    const response = await getcountercloseInfo({
      body,
      params,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = counterHandler;
