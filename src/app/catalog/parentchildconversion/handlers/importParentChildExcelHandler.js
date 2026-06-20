const parentChildConversionServices = require("../services/parentChildConversionServices");

function importParentChildExcelHandler(fastify) {
  const importParentChildExcel = parentChildConversionServices.importParentChildExcelService(fastify);
  return async (request, reply) => {
    const { body, logTrace } = request;
    const response = await importParentChildExcel({ body, logTrace });
    return reply.code(200).send(response);
  };
}

module.exports = importParentChildExcelHandler;
