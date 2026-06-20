const schemas = require("../schemas");
const handlers = require("../handlers");

module.exports = async fastify => {

  // GET - List all outlet settings with pagination
  fastify.route({
    method: "GET",
    url: "/outlet/settings/master/:page_size/:current_page",
    preHandler: fastify.authenticate,
    schema: schemas.getOutletSettingsMstListSchema,
    handler: handlers.getOutletSettingsMstListHandler(fastify)
  });

  // GET - list all outlet settings but which is web_active = true
  fastify.route({
    method: "GET",
    url: "/outlet/settings/master/active",
    preHandler: fastify.authenticate,
    schema: schemas.getOutletSettingsMstActiveListSchema,
    handler: handlers.getOutletSettingsMstActiveListHandler(fastify)
  });


  // GET - Get single outlet setting by ID
  fastify.route({
    method: "GET",
    url: "/outlet/settings/master/:s_id",
    preHandler: fastify.authenticate,
    schema: schemas.getOutletSettingMstInfoSchema,
    handler: handlers.getOutletSettingsMstInfoHandler(fastify)
  });

  // POST - Create new outlet setting
  fastify.route({
    method: "POST",
    url: "/outlet/settings/master",
    preHandler: fastify.authenticate,
    schema: schemas.postOutletSettingsMstSchema,
    handler: handlers.postOutletSettingsMstHandler(fastify)
  });

  // PUT - Update outlet setting
  fastify.route({
    method: "PUT",
    url: "/outlet/settings/master/:s_id",
    preHandler: fastify.authenticate,
    schema: schemas.putOutletSettingsMstSchema,
    handler: handlers.putOutletSettingsMstHandler(fastify)
  });
};
