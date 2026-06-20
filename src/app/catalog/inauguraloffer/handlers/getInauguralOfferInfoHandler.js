const inauguralOfferServices = require("../services/inauguralOfferServices");

function getInauguralOfferInfoHandler(fastify) {
    const getInauguralOfferInfo = inauguralOfferServices.getInauguralOfferInfoService(fastify);
    return async (request, reply) => {
        const { params, logTrace, userDetails } = request;
        const response = await getInauguralOfferInfo({
            params,
            logTrace,
            userDetails
        });
        return reply.code(200).send(response);
    };
}

module.exports = getInauguralOfferInfoHandler;