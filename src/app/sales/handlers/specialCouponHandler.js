const specialCouponServices = require("../services/specialCouponServices");

function specialCouponHandler(fastify) {
  const specialCoupon = specialCouponServices.specialCouponService(fastify);
  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;
    const response = await specialCoupon({
      body,
      params,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = specialCouponHandler;
