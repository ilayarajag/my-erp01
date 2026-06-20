const schemas = require("../schemas");
const handlers = require("../handlers");

module.exports = async fastify => {
  // GET - List all inaugural offers with pagination
  fastify.route({
    method: "GET",
    url: "/inaugural-offer/:page_size/:current_page",
    preHandler: fastify.authenticate,
    schema: schemas.getInauguralOfferListSchema,
    handler: handlers.getInauguralOfferListHandler(fastify)
  }); 

  // GET - Get single inaugural offer by ID
  fastify.route({
    method: "GET",
    url: "/inaugural-offer/:outlet_id",
    preHandler: fastify.authenticate,
    schema: schemas.getInauguralOfferInfoSchema,
    handler: handlers.getInauguralOfferInfoHandler(fastify)
  });

  // POST - Create new inaugural offer
  fastify.route({
    method: "POST",
    url: "/inaugural-offer",
    preHandler: fastify.authenticate,
    schema: schemas.postInauguralOfferSchema,
    handler: handlers.postInauguralOfferHandler(fastify)
  });

  // PUT - Update inaugural offer
  fastify.route({
    method: "PUT",
    url: "/inaugural-offer/:outlet_id",
    preHandler: fastify.authenticate,
    schema: schemas.putInauguralOfferSchema,
    handler: handlers.putInauguralOfferHandler(fastify)
  });


};
