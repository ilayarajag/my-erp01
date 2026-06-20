const schemas = require("../schemas");
const handlers = require("../handlers");

module.exports = async fastify => {

  // 1. POST - Import Excel validation
  fastify.route({
    method: "POST",
    url: "/parent-child-conversion/excel/import",
    preHandler: fastify.authenticate,
    schema: schemas.importParentChildExcelSchema,
    handler: handlers.importParentChildExcelHandler(fastify)
  });

  // 2. POST - Create parent child conversions (bulk)
  fastify.route({
    method: "POST",
    url: "/parent-child-conversion",
    preHandler: fastify.authenticate,
    schema: schemas.postParentChildConversionSchema,
    handler: handlers.postParentChildConversionHandler(fastify)
  });

  // 3. GET - List with pagination + search
  fastify.route({
    method: "GET",
    url: "/parent-child-conversion/:page_size/:current_page",
    preHandler: fastify.authenticate,
    schema: schemas.getParentChildConversionListSchema,
    handler: handlers.getParentChildConversionListHandler(fastify)
  });

  // 4. GET - Export Excel
  fastify.route({
    method: "GET",
    url: "/parent-child-conversion/excel/export",
    preHandler: fastify.authenticate,
    schema: schemas.exportParentChildConversionExcelSchema,
    handler: handlers.exportParentChildConversionExcelHandler(fastify)
  });

  // 5. GET - Single info
  fastify.route({
    method: "GET",
    url: "/parent-child-conversion/:parent_child_conv_id",
    preHandler: fastify.authenticate,
    schema: schemas.getParentChildConversionInfoSchema,
    handler: handlers.getParentChildConversionInfoHandler(fastify)
  });

  // 6. PUT - Update
  fastify.route({
    method: "PUT",
    url: "/parent-child-conversion/:parent_child_conv_id",
    preHandler: fastify.authenticate,
    schema: schemas.putParentChildConversionSchema,
    handler: handlers.putParentChildConversionHandler(fastify)
  });

};
