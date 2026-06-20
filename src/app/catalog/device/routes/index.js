const schemas = require("../schemas");
const handlers = require("../handlers");

module.exports = async fastify => {
  fastify.route({
    method: "GET",
    url: "/device/:outlet_id/:counter_no",
    preHandler: fastify.authenticate,
    schema: schemas.getDeviceSchema,
    handler: handlers.getDeviceHandler(fastify)
  });

  fastify.route({
    method: "GET",
    url: "/device/:device_id",
    preHandler: fastify.authenticate,
    schema: schemas.getDeviceInfoSchema,
    handler: handlers.getDeviceInfoHandler(fastify)
  });

  fastify.route({
    method: "POST",
    url: "/device",
    preHandler: fastify.authenticate,
    schema: schemas.postDeviceSchema,
    handler: handlers.postDeviceHandler(fastify)
  });

  fastify.route({
    method: "PUT",
    url: "/device/:device_id",
    preHandler: fastify.authenticate,
    schema: schemas.putDeviceSchema,
    handler: handlers.putDeviceHandler(fastify)
  });

  fastify.route({
    method: "DELETE",
    url: "/device/:device_id",
    preHandler: fastify.authenticate,
    schema: schemas.deleteDeviceSchema,
    handler: handlers.deleteDeviceHandler(fastify)
  });



  fastify.route({
    method: "GET",
    url: "/device/type",
    preHandler: fastify.authenticate,
    schema: schemas.getDeviceTypeSchema,
    handler: handlers.getDeviceTypeHandler(fastify)
  });

  // fastify.route({
  //   method: "GET",
  //   url: "/Head/:page_size/:current_page",
  //   preHandler: fastify.authenticate,
  //   schema: schemas.getHeadPaginateSchema,
  //   handler: handlers.getHeadPaginateHandler(fastify)
  // });
};
