const outletCounterPaymentModesRepo = require("../repository/outletCounterPaymentModesRepo");

function postOutletCounterPaymentModesService(fastify) {
  const { postOutletCounterPaymentModes } = outletCounterPaymentModesRepo(fastify);
  return async ({ body, logTrace, userDetails }) => {
    return postOutletCounterPaymentModes.call(fastify.knexMedical, { body, logTrace, userDetails });
  };
}

function putOutletCounterPaymentModesService(fastify) {
  const { putOutletCounterPaymentModes } = outletCounterPaymentModesRepo(fastify);
  return async ({ params, body, logTrace, userDetails }) => {
    return putOutletCounterPaymentModes.call(fastify.knexMedical, { params, body, logTrace, userDetails });
  };
}

function getOutletCounterPaymentModesService(fastify) {
  const { getOutletCounterPaymentModes } = outletCounterPaymentModesRepo(fastify);
  return async ({ query, logTrace }) => {
    return getOutletCounterPaymentModes.call(fastify.knexMedical, { query, logTrace });
  };
}

module.exports = {
  postOutletCounterPaymentModesService,
  putOutletCounterPaymentModesService,
  getOutletCounterPaymentModesService
};
