const schemas = require("../schemas");
const handlers = require("../handlers");

module.exports = async fastify => {

   fastify.route({
    method: "POST",
    url: "/sales/return/bill/fetch",
    preHandler: fastify.authenticate,
    schema: schemas.fetchBillForReturnSchema,
    handler: handlers.fetchBillDetailsHandler(fastify)
  });

  fastify.route({
    method: "POST",
    url: "/sales/return/billwise/:company_id",
    preHandler: fastify.authenticate,
    schema: schemas.createSalesReturnSchema,
    handler: handlers.createSalesReturnHandler(fastify)
  });

  fastify.route({
    method: "POST",
    url: "/sales/return/general/product",
    preHandler: fastify.authenticate,
    schema: schemas.getGeneralReturnProductSchema,
    handler: handlers.getGeneralReturnProductHandler(fastify)
  });

  fastify.route({
    method: "POST",
    url: "/sales/return/general/:company_id",
    preHandler: fastify.authenticate,
    schema: schemas.createGeneralReturnSchema,
    handler: handlers.createGeneralReturnHandler(fastify)
  });

  fastify.route({
    method: "GET",
    url: "/sales/return/details/:sr_no",
    preHandler: fastify.authenticate,
    schema: schemas.getSalesReturnInfoSchema,
    handler: handlers.getSalesReturnInfoHandler(fastify)
  });

   fastify.route({
    method: "POST",
    url: "/sales/return/coupon/validate",
    preHandler: fastify.authenticate,
    schema: schemas.validateCouponSchema,
    handler: handlers.validateCouponHandler(fastify)
  });

  // fastify.route({
  //   method: "POST",
  //   url: "/sales/return/coupon/redeem",
  //   preHandler: fastify.authenticate,
  //   schema: schemas.redeemCouponSchema,
  //   handler: handlers.redeemCouponHandler(fastify)
  // });

 

  // REPORT APIs

  // billWise sales return report
  fastify.route({
    method: "POST",
    url: "/sales/return/billwise/report",
    preHandler: fastify.authenticate,
    schema: schemas.getSalesReturnReportSchema,
    handler: handlers.getSalesReturnReportHandler(fastify)
  });

  fastify.route({
    method: "POST",
    url: "/sales/return/billwise/invoice/report",
    preHandler: fastify.authenticate,
    schema: schemas.getSalesReturnInvoiceReportSchema,
    handler: handlers.getSalesReturnInvoiceReportHandler(fastify)
  });

  fastify.route({
    method: "POST",
    url: "/sales/return/billwise/invoice/details",
    preHandler: fastify.authenticate,
    schema: schemas.getInvoiceSalesReturnDetailsSchema,
    handler: handlers.getInvoiceSalesReturnDetailsHandler(fastify)
  });

  // get general sales return report

  fastify.route({
    method: "POST",
    url: "/sales/return/general/report",
    preHandler: fastify.authenticate,
    schema: schemas.getGeneralReturnReportSchema,
    handler: handlers.getGeneralReturnReportHandler(fastify)
  });

};
