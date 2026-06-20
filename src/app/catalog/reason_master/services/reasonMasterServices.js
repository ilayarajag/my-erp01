const reasonMasterRepo = require("../repository/reasonMasterRepo");

function postReasonMasterService(fastify) {
  const { postReasonMaster } = reasonMasterRepo(fastify);
  return async ({ body, logTrace, userDetails }) => {
    return postReasonMaster.call(fastify.knexMedical, { body, logTrace, userDetails });
  };
}

function getReasonOutletsByRegionService(fastify) {
  const { getReasonOutletsByRegion } = reasonMasterRepo(fastify);
  return async ({ params, logTrace }) => {
    return getReasonOutletsByRegion.call(fastify.knexMedical, { params, logTrace });
  };
}

function getReasonMasterListService(fastify) {
  const { getReasonMasterList } = reasonMasterRepo(fastify);
  return async ({ params, query, logTrace }) => {
    return getReasonMasterList.call(fastify.knexMedical, { params, query, logTrace });
  };
}

function getReasonMasterInfoService(fastify) {
  const { getReasonMasterInfo } = reasonMasterRepo(fastify);
  return async ({ params, logTrace }) => {
    return getReasonMasterInfo.call(fastify.knexMedical, { params, logTrace });
  };
}

function putReasonMasterService(fastify) {
  const { putReasonMaster } = reasonMasterRepo(fastify);
  return async ({ params, body, logTrace, userDetails }) => {
    return putReasonMaster.call(fastify.knexMedical, { params, body, logTrace, userDetails });
  };
}

function exportReasonMasterExcelService(fastify) {
  const { exportReasonMasterExcel } = reasonMasterRepo(fastify);
  return async ({ logTrace }) => {
    return exportReasonMasterExcel.call(fastify.knexMedical, { logTrace });
  };
}

module.exports = {
  postReasonMasterService,
  getReasonOutletsByRegionService,
  getReasonMasterListService,
  getReasonMasterInfoService,
  putReasonMasterService,
  exportReasonMasterExcelService
};
