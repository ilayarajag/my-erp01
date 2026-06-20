const salesReturnServices = require("../services/salesReturnServices");

function redeemCouponHandler(fastify) {
  const redeemCoupon = salesReturnServices.redeemCouponService(fastify);
  return async (request, reply) => {
    const { body, logTrace, userDetails } = request;
    const response = await redeemCoupon({ body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = redeemCouponHandler;
