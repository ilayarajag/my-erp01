const inauguralOfferServices = require("../services/inauguralOfferServices");

function putInauguralOfferHandler(fastify) {
    const putInauguralOffer = inauguralOfferServices.putInauguralOfferService(fastify);
    return async (request, reply) => {
        const { params, body, logTrace, userDetails } = request;
        const response = await putInauguralOffer({
            params,
            body,
            logTrace,
            userDetails
        });
        return reply.code(200).send(response);
    };
}

module.exports = putInauguralOfferHandler;