const schemas = require("../schemas");
const handlers = require("../handlers");

module.exports = async fastify => {

  // Get all members
  fastify.route({
    method: "GET",
    url: "/pay/type",
    preHandler: fastify.authenticate,
    schema: schemas.getPayTypesSchema,
    handler: handlers.getPayTypesHandler(fastify)
  });

  // // Get member by ID
  // fastify.route({
  //   method: "GET",
  //   url: "/pay/type/:pay_type_id",
  //   preHandler: fastify.authenticate,
  //   schema: schemas.getOutletMemberInfoSchema,
  //   handler: handlers.getOutletMemberInfoHandler(fastify)
  // });

 // ✅ Create Pay Type
fastify.route({
  method: "POST",
  url: "/pay/type",
  preHandler: fastify.authenticate,
  schema: schemas.postPayTypeSchema,
  handler: handlers.postPayTypeHandler(fastify)
});

//  Update Pay Type
fastify.route({
  method: "PUT",
  url: "/pay/type/:pay_type_id",
  preHandler: fastify.authenticate,
  schema: schemas.putPayTypeSchema,
  handler: handlers.putPayTypeHandler(fastify)
});

//  Delete Pay Type (Soft delete → is_active = false)
fastify.route({
  method: "DELETE",
  url: "/pay/type/:pay_type_id",
  preHandler: fastify.authenticate,
  schema: schemas.deletePayTypeSchema,
  handler: handlers.deletePayTypeHandler(fastify)
});

};