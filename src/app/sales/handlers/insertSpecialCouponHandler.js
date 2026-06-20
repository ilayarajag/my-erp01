const specialCouponServices = require("../services/specialCouponServices");

function insertSpecialCouponHandler(fastify) {
  const insertSpecialCoupon =
    specialCouponServices.insertSpecialCouponService(fastify);
  return async (request, reply) => {
    const { body, params, logTrace, userDetails } = request;
    const response = await insertSpecialCoupon({
      body,
      params,
      logTrace,
      userDetails
    });
    return reply.code(200).send(response);
  };
}

module.exports = insertSpecialCouponHandler;
