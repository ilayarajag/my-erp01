const schemas = require("../schemas");
const handlers = require("../handlers");

module.exports = async fastify => {

  // Get all members
  fastify.route({
    method: "GET",
    url: "/outlet/members/:page_size/:current_page",
    preHandler: fastify.authenticate,
    schema: schemas.getOutletMembersListSchema,
    handler: handlers.getOutletMembersListHandler(fastify)
  });

  // Get member by ID
  // fastify.route({
  //   method: "GET",
  //   url: "/outlet/members/:member_id/:mobile",
  //   preHandler: fastify.authenticate,
  //   schema: schemas.getOutletMemberInfoSchema,
  //   handler: handlers.getOutletMemberInfoHandler(fastify)
  // });
   fastify.route({
    method: "GET",
    url: "/outlet/members/:member_id",
    preHandler: fastify.authenticate,
    schema: schemas.getOutletMemberInfoSchema,
    handler: handlers.getOutletMemberInfoHandler(fastify)
  });

  // Create member
  fastify.route({
    method: "POST",
    url: "/outlet/members",
    preHandler: fastify.authenticate,
    schema: schemas.postOutletMemberSchema,
    handler: handlers.postOutletMemberHandler(fastify)
  });

  // Update member
  fastify.route({
    method: "PUT",
    url: "/outlet/members/:member_id",
    preHandler: fastify.authenticate,
    schema: schemas.putOutletMemberSchema,
    handler: handlers.putOutletMemberHandler(fastify)
  });

  // Delete (soft delete recommended)
  // fastify.route({
  //   method: "DELETE",
  //   url: "/outlet/members/:member_id",
  //   preHandler: fastify.authenticate,
  //   schema: schemas.deleteOutletMemberSchema,
  //   handler: handlers.deleteOutletMemberHandler(fastify)
  // });

   fastify.route({
    method: "GET",
    url: "/outlet/list",
    preHandler: fastify.authenticate,
    schema: schemas.getOutletListSchema,
    handler: handlers.getOutletListHandler(fastify)
  });

};