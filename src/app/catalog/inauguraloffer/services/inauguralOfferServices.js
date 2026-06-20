const inauguralOfferRepo = require("../repository/inauguralOfferRepo");

function getInauguralOfferListService(fastify) {
  const { getInauguralOfferList } = inauguralOfferRepo(fastify);
  return async ({ query, params, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const response = await getInauguralOfferList.call(knex, {
      query,
      params,
      logTrace,
      userDetails
    });
    return response;
  };
}

function getInauguralOfferInfoService(fastify) {
  const { getInauguralOfferInfo } = inauguralOfferRepo(fastify);
  return async ({ params, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const response = await getInauguralOfferInfo.call(knex, {
      params,
      logTrace,
      userDetails
    });
    return response;
  };
}

function postInauguralOfferService(fastify) {
  const { postInauguralOffer } = inauguralOfferRepo(fastify);
  return async ({ body, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const response = await postInauguralOffer.call(knex, {
      body,
      logTrace,
      userDetails
    });
    return response;
  };
}

function putInauguralOfferService(fastify) {
  const { putInauguralOffer } = inauguralOfferRepo(fastify);
  return async ({ params, body, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const response = await putInauguralOffer.call(knex, {
      params,
      body,
      logTrace,
      userDetails
    });
    return response;
  };
}


module.exports = {
  getInauguralOfferListService,
  getInauguralOfferInfoService,
  postInauguralOfferService,
  putInauguralOfferService
};
