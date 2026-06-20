const offerServices = require("../services/offerServices");

function offerCheckHandler(fastify) {
  const getOfferInfo = offerServices.getOfferInfoService(fastify);
  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;
    const response = await getOfferInfo({
      body,
      params,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = offerCheckHandler;
