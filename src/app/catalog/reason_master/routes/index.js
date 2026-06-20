const schemas = require("../schemas");
const handlers = require("../handlers");

module.exports = async fastify => {

  // 1. POST - Create reason master
  fastify.route({
    method: "POST",
    url: "/reason-master",
    preHandler: fastify.authenticate,
    schema: schemas.postReasonMasterSchema,
    handler: handlers.postReasonMasterHandler(fastify)
  });

  // 2. GET - Active outlets by region for mapping
  fastify.route({
    method: "GET",
    url: "/reason-master/outlets/region",
    preHandler: fastify.authenticate,
    schema: schemas.getReasonOutletsByRegionSchema,
    handler: handlers.getReasonOutletsByRegionHandler(fastify)
  });

  // 3. GET - List with pagination + filters (search, active, store_code, outlet_name)
  fastify.route({
    method: "GET",
    url: "/reason-master/:page_size/:current_page",
    preHandler: fastify.authenticate,
    schema: schemas.getReasonMasterListSchema,
    handler: handlers.getReasonMasterListHandler(fastify)
  });

  fastify.route({
    method: "GET",
    url: "/reason-master/:reason_id",
    preHandler: fastify.authenticate,
    schema: schemas.getReasonMasterInfoSchema,
    handler: handlers.getReasonMasterInfoHandler(fastify)
  });


  // 4. PUT - Update reason master
  fastify.route({
    method: "PUT",
    url: "/reason-master/:reason_id",
    preHandler: fastify.authenticate,
    schema: schemas.putReasonMasterSchema,
    handler: handlers.putReasonMasterHandler(fastify)
  });

  // 5. GET - Export to Excel
  fastify.route({
    method: "GET",
    url: "/reason-master/excel/export",
    preHandler: fastify.authenticate,
    schema: schemas.exportReasonMasterExcelSchema,
    handler: handlers.exportReasonMasterExcelHandler(fastify)
  });

};
