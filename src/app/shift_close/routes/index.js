const schemas = require("../schemas");
const handlers = require("../handlers");

module.exports = async fastify => {

  // GET - Cash close summary: sales stats + existing denomination
  // ?outlet_id=1&counter_no=2&bill_date=2026-05-17
  fastify.route({
    method: "GET",
    url: "/shift/close/summary",
    preHandler: fastify.authenticate,
    schema: schemas.getShiftCloseSummarySchema,
    handler: handlers.getShiftCloseSummaryHandler(fastify)
  });

  // POST - Submit cash close: save denomination + close counter shift
  fastify.route({
    method: "POST",
    url: "/shift/close/submit",
    preHandler: fastify.authenticate,
    schema: schemas.submitShiftCloseSchema,
    handler: handlers.submitShiftCloseHandler(fastify)
  });

};
