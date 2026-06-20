// const offerServices = require("../services/offerServices");
const getloyalityPoints = require("../services/getloyalityPointDetails");

function loyalityPointsHandler(fastify) {
  const getLoyalityPointService = getloyalityPoints.getloyalityPointDetails(fastify);
  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;
    const response = await getLoyalityPointService.call(fastify, {
      body,
      params,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = loyalityPointsHandler;