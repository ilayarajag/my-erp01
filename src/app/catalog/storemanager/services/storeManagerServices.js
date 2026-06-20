const storeManagerRepo = require("../repository/storeManagerRepo");

function getStoreManagerListService(fastify) {
  const { getStoreManagerList } = storeManagerRepo(fastify);
  return async ({ query, params, logTrace, userDetails }) => {
    return getStoreManagerList.call(fastify.knexMedical, { query, params, logTrace, userDetails });
  };
}

function getStoreManagerInfoService(fastify) {
  const { getStoreManagerInfo } = storeManagerRepo(fastify);
  return async ({ params, logTrace, userDetails }) => {
    return getStoreManagerInfo.call(fastify.knexMedical, { params, logTrace, userDetails });
  };
}

function postStoreManagerService(fastify) {
  const { postStoreManager } = storeManagerRepo(fastify);
  return async ({ body, logTrace, userDetails }) => {
    return postStoreManager.call(fastify.knexMedical, { body, logTrace, userDetails });
  };
}

function putStoreManagerService(fastify) {
  const { putStoreManager } = storeManagerRepo(fastify);
  return async ({ params, body, logTrace, userDetails }) => {
    return putStoreManager.call(fastify.knexMedical, { params, body, logTrace, userDetails });
  };
}

function swapStoreManagerService(fastify) {
  const { swapStoreManager } = storeManagerRepo(fastify);
  return async ({ body, logTrace, userDetails }) => {
    return swapStoreManager.call(fastify.knexMedical, { body, logTrace, userDetails });
  };
}

function importStoreManagerExcelService(fastify) {
  const { importStoreManagerExcel } = storeManagerRepo(fastify);
  return async ({ body, logTrace, userDetails }) => {
    return importStoreManagerExcel.call(fastify.knexMedical, { body, logTrace, userDetails });
  };
}

function getOutletsByRegionService(fastify) {
  const { getOutletsByRegion } = storeManagerRepo(fastify);
  return async ({ params, logTrace, userDetails }) => {
    return getOutletsByRegion.call(fastify.knexMedical, { params, logTrace, userDetails });
  };
}

function getStoreManagersByRegionService(fastify) {
  const { getStoreManagersByRegion } = storeManagerRepo(fastify);
  return async ({ params, logTrace, userDetails }) => {
    return getStoreManagersByRegion.call(fastify.knexMedical, { params, logTrace, userDetails });
  };
}

function exportStoreManagerExcelService(fastify) {
  const { exportStoreManagerExcel } = storeManagerRepo(fastify);
  return async ({ logTrace }) => {
    return exportStoreManagerExcel.call(fastify.knexMedical, { logTrace });
  };
}

module.exports = {
  getStoreManagerListService,
  getStoreManagerInfoService,
  postStoreManagerService,
  putStoreManagerService,
  swapStoreManagerService,
  importStoreManagerExcelService,
  getOutletsByRegionService,
  getStoreManagersByRegionService,
  exportStoreManagerExcelService
};
