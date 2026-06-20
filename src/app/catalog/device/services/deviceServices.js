const deviceRepo = require("../repository/deviceRepo");


function getDeviceService(fastify) {
  const { getDevice } = deviceRepo(fastify);

  return async ({ logTrace, params }) => {
    const knex = fastify.knexMedical;
    const response = await getDevice.call(knex, {
      logTrace, params
    });
    return response;
  };
}

function getDeviceInfoService(fastify) {
  const { getDeviceInfo } = deviceRepo(fastify);

  return async ({ params, logTrace }) => {
    const knex = fastify.knexMedical;
    const response = await getDeviceInfo.call(knex, {
      params,
      logTrace
    });
    return response;
  };
}

function postDeviceService(fastify) {
  const { postDevice } = deviceRepo(fastify);
  return async ({ params, body, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const promise1 = postDevice.call(knex, {
      params,
      body,
      logTrace, userDetails
    });
    const [response] = await Promise.all([promise1]);
    return response;
  };
}

function putDeviceService(fastify) {
  const { putDevice } = deviceRepo(fastify);
  return async ({ params, body, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const { device_id } = params;
    const promise1 = putDevice.call(knex, {
      device_id,
      body,
      logTrace, userDetails
    });
    const [response] = await Promise.all([promise1]);
    return response;
  };
}

function deleteDeviceService(fastify) {
  const { deleteDevice } = deviceRepo(fastify);
  return async ({ params, body, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const { device_id } = params;
    const promise1 = deleteDevice.call(knex, {
      device_id,
      body,
      logTrace,
      userDetails
    });
    const [response] = await Promise.all([promise1]);
    return response;
  };
}

function getDeviceTypeService(fastify) {
  const { getDeviceType } = deviceRepo(fastify);

  return async ({ logTrace }) => {
    const knex = fastify.knexMedical;
    const response = await getDeviceType.call(knex, {
      logTrace
    });
    return response;
  };
}

module.exports = {
  getDeviceService,
  getDeviceInfoService,
  postDeviceService,
  putDeviceService,
  deleteDeviceService,
  getDeviceTypeService
};
