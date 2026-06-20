const inauguralOfferServices = require("../services/inauguralOfferServices")

function getInauguralOfferListHandler(fastify) {
    const getInauguralOfferList = inauguralOfferServices.getInauguralOfferListService(fastify);
    return async (request, reply) => {
        const { query, params, logTrace, userDetails } = request;
        const response = await getInauguralOfferList({
            query,
            params,
            logTrace,
            userDetails
        });
        return reply.code(200).send(response);
    };
}

module.exports = getInauguralOfferListHandler;