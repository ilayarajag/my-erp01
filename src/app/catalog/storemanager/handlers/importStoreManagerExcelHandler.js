const storeManagerServices = require("../services/storeManagerServices");

function importStoreManagerExcelHandler(fastify) {
  const importStoreManagerExcel = storeManagerServices.importStoreManagerExcelService(fastify);
  return async (request, reply) => {
    const { body, logTrace, userDetails } = request;
    const response = await importStoreManagerExcel({ body, logTrace, userDetails });
    return reply.code(200).send(response);
  };
}

module.exports = importStoreManagerExcelHandler;
