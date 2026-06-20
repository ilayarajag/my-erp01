const schemas = require("../schemas");
const handlers = require("../handlers");

module.exports = async fastify => {
  fastify.route({
    method: "POST",
    url: "/bill/no",
    preHandler: fastify.authenticate,
    schema: schemas.billnoFetchSchema,
    handler: handlers.billnoFetchHandler(fastify)
  });


};
