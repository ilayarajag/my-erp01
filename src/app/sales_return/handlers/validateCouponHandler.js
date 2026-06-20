

const salesReturnServices = require("../services/salesReturnServices");

function validateCouponHandler(fastify) {
  const validateCoupon = salesReturnServices.validateCouponService(fastify);
  return async (request, reply) => {
    const { body, logTrace, userDetails } = request;
    const response = await validateCoupon({ body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = validateCouponHandler;
