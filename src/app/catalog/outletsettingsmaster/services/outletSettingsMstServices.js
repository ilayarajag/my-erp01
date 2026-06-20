const outletSettingsMstRepo = require("../repository/outletSettingsMstRepo");

function getOutletSettingsMstListService(fastify) {
  const { getOutletSettingsMstList } = outletSettingsMstRepo(fastify);
  return async ({ query, params, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const response = await getOutletSettingsMstList.call(knex, {
      query,
      params,
      logTrace,
      userDetails
    });
    return response;
  };
}
function getOutletSettingsMstActiveListService(fastify) {
  const { getOutletSettingsMstActiveList } = outletSettingsMstRepo(fastify);
  return async ({ query, params, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const response = await getOutletSettingsMstActiveList.call(knex, {
      query,
      params,
      logTrace,
      userDetails
    });
    return response;
  };
}

function getOutletSettingsMstInfoService(fastify) {
  const { getOutletSettingsMstInfo } = outletSettingsMstRepo(fastify);
  return async ({ params, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const response = await getOutletSettingsMstInfo.call(knex, {
      params,
      logTrace,
      userDetails
    });
    return response;
  };
}

function createOutletSettingsMstService(fastify) {
  const { createOutletSettingsMst } = outletSettingsMstRepo(fastify);
  return async ({ body, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const response = await createOutletSettingsMst.call(knex, {
      body,
      logTrace,
      userDetails
    });
    return response;
  };
}

function updateOutletSettingsMstService(fastify) {
  const { updateOutletSettingsMst } = outletSettingsMstRepo(fastify);
  return async ({ params, body, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const response = await updateOutletSettingsMst.call(knex, {
      params,
      body,
      logTrace,
      userDetails
    });
    return response;
  };
}

module.exports = {
  getOutletSettingsMstListService,
  getOutletSettingsMstActiveListService,
  getOutletSettingsMstInfoService,
  createOutletSettingsMstService,
  updateOutletSettingsMstService
};
