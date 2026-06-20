const inauguralOfferServices = require("../services/inauguralOfferServices");

function postInauguralOfferHandler(fastify) {
    const postInauguralOffer = inauguralOfferServices.postInauguralOfferService(fastify);
    return async (request, reply) => {
        const { body, logTrace, userDetails } = request;
        const response = await postInauguralOffer({
            body,
            logTrace,
            userDetails
        });
        return reply.code(200).send(response);
    };
}

module.exports = postInauguralOfferHandler;