const schemas = require("../schemas");
const handlers = require("../handlers");

module.exports = async fastify => {


  // POST - Create store manager
  fastify.route({
    method: "POST",
    url: "/store-manager",
    preHandler: fastify.authenticate,
    schema: schemas.postStoreManagerSchema,
    handler: handlers.postStoreManagerHandler(fastify)
  });

  // POST - Excel import (multipart)
  fastify.route({
    method: "POST",
    url: "/store-manager/excel/import",
    preHandler: fastify.authenticate,
    schema: schemas.importStoreManagerExcelSchema,
    handler: handlers.importStoreManagerExcelHandler(fastify)
  });

  // PUT - Update sm_name / sm_mobile only
  fastify.route({
    method: "PUT",
    url: "/store-manager/:store_code",
    preHandler: fastify.authenticate,
    schema: schemas.putStoreManagerSchema,
    handler: handlers.putStoreManagerHandler(fastify)
  });

  // GET - Outlets with store manager by region
  fastify.route({
    method: "GET",
    url: "/store-manager/region/:region_id",
    preHandler: fastify.authenticate,
    schema: schemas.getOutletsByRegionSchema,
    handler: handlers.getOutletsByRegionHandler(fastify)
  });

  // GET - Store manager details by region
  fastify.route({
    method: "GET",
    url: "/store-manager/region/:region_id/details/:page_size/:current_page",
    preHandler: fastify.authenticate,
    schema: schemas.getStoreManagersByRegionSchema,
    handler: handlers.getStoreManagersByRegionHandler(fastify)
  });

  // POST - Swap store managers between two outlets
  fastify.route({
    method: "POST",
    url: "/store-manager/swap",
    preHandler: fastify.authenticate,
    schema: schemas.swapStoreManagerSchema,
    handler: handlers.swapStoreManagerHandler(fastify)
  });

  // GET - Export store managers to Excel
  fastify.route({
    method: "GET",
    url: "/store-manager/excel/export",
    preHandler: fastify.authenticate,
    schema: schemas.exportStoreManagerExcelSchema,
    handler: handlers.exportStoreManagerExcelHandler(fastify)
  });

  // GET - List with pagination, search by name/mobile, filter by outlet_id
  // fastify.route({
  //   method: "GET",
  //   url: "/store-manager/:page_size/:current_page",
  //   preHandler: fastify.authenticate,
  //   schema: schemas.getStoreManagerListSchema,
  //   handler: handlers.getStoreManagerListHandler(fastify)
  // });

  // // GET - Single store manager by outlet_id
  // fastify.route({
  //   method: "GET",
  //   url: "/store-manager/:outlet_id",
  //   preHandler: fastify.authenticate,
  //   schema: schemas.getStoreManagerInfoSchema,
  //   handler: handlers.getStoreManagerInfoHandler(fastify)
  // });






};
