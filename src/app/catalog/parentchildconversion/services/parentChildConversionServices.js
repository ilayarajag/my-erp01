const parentChildConversionRepo = require("../repository/parentChildConversionRepo");

function importParentChildExcelService(fastify) {
  const { importParentChildExcel } = parentChildConversionRepo(fastify);
  return async ({ body, logTrace }) => {
    return importParentChildExcel.call(fastify.knexMedical, { body, logTrace });
  };
}

function postParentChildConversionService(fastify) {
  const { postParentChildConversion } = parentChildConversionRepo(fastify);
  return async ({ body, logTrace, userDetails }) => {
    return postParentChildConversion.call(fastify.knexMedical, { body, logTrace, userDetails });
  };
}

function putParentChildConversionService(fastify) {
  const { putParentChildConversion } = parentChildConversionRepo(fastify);
  return async ({ params, body, logTrace, userDetails }) => {
    return putParentChildConversion.call(fastify.knexMedical, { params, body, logTrace, userDetails });
  };
}

function getParentChildConversionListService(fastify) {
  const { getParentChildConversionList } = parentChildConversionRepo(fastify);
  return async ({ params, query, logTrace }) => {
    return getParentChildConversionList.call(fastify.knexMedical, { params, query, logTrace });
  };
}

function getParentChildConversionInfoService(fastify) {
  const { getParentChildConversionInfo } = parentChildConversionRepo(fastify);
  return async ({ params, logTrace }) => {
    return getParentChildConversionInfo.call(fastify.knexMedical, { params, logTrace });
  };
}

function exportParentChildConversionExcelService(fastify) {
  const { exportParentChildConversionExcel } = parentChildConversionRepo(fastify);
  return async ({ logTrace }) => {
    return exportParentChildConversionExcel.call(fastify.knexMedical, { logTrace });
  };
}

module.exports = {
  importParentChildExcelService,
  postParentChildConversionService,
  putParentChildConversionService,
  getParentChildConversionListService,
  getParentChildConversionInfoService,
  exportParentChildConversionExcelService
};
