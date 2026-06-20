const schemas = require("../schemas");
const handlers = require("../handlers");

module.exports = async fastify => {
  fastify.route({
    method: "POST",
    url: "/product/fetch",
    preHandler: fastify.authenticate,
    schema: schemas.productFetchSchema,
    handler: handlers.productFetchHandler(fastify)
  });

  // fastify.route({
  //   method: "POST",
  //   url: "/product/offercheck",
  //   preHandler: fastify.authenticate,
  //   schema: schemas.offerCheckSchema,
  //   preHandler: fastify.authenticate,
  //   handler: handlers.offerCheckHandler(fastify)
  // });
  // fastify.route({
  //   method: "POST",
  //   url: "/product/schemecheck",
  //   preHandler: fastify.authenticate,
  //   schema: schemas.schemeCheckSchema,
  //   handler: handlers.schemeCheckHandler(fastify)
  // });
  fastify.route({
    method: "POST",
    url: "/specialcoupon/generate",
    preHandler: fastify.authenticate,
    //schema: schemas.specialCouponSchema,
    handler: handlers.specialCouponHandler(fastify)
  });
  fastify.route({
    method: "GET",
    url: "/cart/:counter_no/:outlet_id",
    preHandler: fastify.authenticate,
    schema: schemas.cartSchema,
    handler: handlers.cartHandler(fastify)
  });
   fastify.route({
    method: "GET",
    url: "/cart/summary/:counter_no/:outlet_id/:customer_id?",
    preHandler: fastify.authenticate,
    schema: schemas.cartsummarySchema,
    handler: handlers.cartsummaryHandler(fastify)
  });
   fastify.route({
    method: "GET",
    url: "/cart/list/:counter_no/:outlet_id/:customer_id?",
    preHandler: fastify.authenticate,
    schema: schemas.cartlistSchema,
    handler: handlers.cartlistHandler(fastify)
  });
  fastify.route({
    method: "POST",
    url: "/cart",
    preHandler: fastify.authenticate,
    schema: schemas.cartOperationsSchema,
    handler: handlers.cartOperations(fastify)
  });
   fastify.route({
    method: "POST",
    url: "/cart/new",
    preHandler: fastify.authenticate,
     schema: schemas.addcartOperationsSchema,
    handler: handlers.addOperationsCartHandler(fastify)
  });
  fastify.route({
    method: "POST",
    url: "/cart/update",
    preHandler: fastify.authenticate,
    schema: schemas.cartupdateOperationsSchema,
    handler: handlers.updateToCartHandler(fastify)
  });
  fastify.route({
    method: "POST",
    url: "/cart/clear",
    preHandler: fastify.authenticate,
    schema: schemas.clearCartSchema,
    handler: handlers.clearCartHandler(fastify)
  });

  fastify.route({
    method: "DELETE",
    url: "/cart/clear/:counter_no/:code/:outlet_id",
    preHandler: fastify.authenticate,
    schema: schemas.specificCartSchema,
    handler: handlers.specificclearCartHandler(fastify)
  });
  fastify.route({
    method: "POST",
    url: "/apply/specialcoupon",
    preHandler: fastify.authenticate,
    schema: schemas.insertSpecialCouponSchema,
    handler: handlers.insertSpecialCouponHandler(fastify)
  });
  fastify.route({
    method: "POST",
    url: "/bill/save",
    preHandler: fastify.authenticate,
     schema: schemas.billSaveSchema,
    handler: handlers.billSaveHandler(fastify)
  });
    fastify.route({
    method: "POST",
    url: "/bill/summary",
    preHandler: fastify.authenticate,
     schema: schemas.billSummarySchema,
    handler: handlers.billSaveHandler(fastify)
  });
  fastify.route({
    method: "GET",
    url: "/companyInfo",
    preHandler: fastify.authenticate,
    schema: schemas.companyInfoSchema,
    handler: handlers.companyInfoHandler(fastify)
  });
  fastify.route({
    method: "POST",
    url: "/loyalitypoints/:outlet_id",
    preHandler: fastify.authenticate,
     schema: schemas.getloyalitySchema,
    handler: handlers.loyalityPointsHandler(fastify)
  });
  fastify.route({
    method: "POST",
    url: "/counter/close/:counter_no/:outlet_id",
    preHandler: fastify.authenticate,
    // schema: schemas.companyInfoSchema,
    handler: handlers.countercloseHandler(fastify)
  });

  fastify.route({
    method: "POST",
    url: "/weighing/scale",
    preHandler: fastify.authenticate,
    handler: handlers.weighingHandler(fastify)
  });

  fastify.route({
    method: "POST",
    url: "/Denomination",
    preHandler: fastify.authenticate,
    handler: handlers.denominationHandler(fastify)
  });

  fastify.route({
    method: "GET",
    url: "/Setting",
    preHandler: fastify.authenticate,
    schema: schemas.getsettingSchema,
    handler: handlers.settingHandler(fastify)
  });

  fastify.route({
    method: "GET",
    url: "/item_search/:outlet_id/:page_size/:current_page",
    preHandler: fastify.authenticate,
    schema: schemas.itemSearchSchema,
    handler: handlers.itemsearchHandler.itemsearchHandlerinfo(fastify)
  });



  fastify.route({
    method: "POST",
    url: "/dubbill",
    preHandler: fastify.authenticate,
    handler: handlers.itemsearchHandler.dublicatebillHandlerinfo(fastify)
  });

  fastify.route({
    method: "POST",
    url: "/pending-bill",
    preHandler: fastify.authenticate,
    schema: schemas.pendingBillSchema,
    handler: handlers.pendingBillHandler.pendingBillHandlerinfo(fastify)
  });
  fastify.route({
    method: "POST",
    url: "/pending-bill_retrieve",
    preHandler: fastify.authenticate,
    schema: schemas.pendingbillretrieveSchema,
    handler: handlers.pendingBillHandler.pendingBillretrieveHandlerinfo(fastify)
  });
  fastify.route({
    method: "POST",
    url: "/overall-get-pending",
    preHandler: fastify.authenticate,
    schema: schemas.pendingbilloverallgetSchema,
    handler: handlers.pendingBillHandler.pendingBilloverallgetHandlerinfo(fastify)
  });
    fastify.route({
    method: "GET",
    url: "/bill/print/:counter_no/:outlet_id/:bill_no",
    preHandler: fastify.authenticate,
    schema: schemas.cartPrintsummarySchema,
    handler: handlers.cartPrintsummaryHandler(fastify)
  });

  
  fastify.route({
    method: "POST",
    url: "/reports/item/wise/sales",
    preHandler: fastify.authenticate,
    schema: schemas.itemWiseSalesSchema,
    handler: handlers.itemWiseSalesHandler(fastify)
  });

     fastify.route({
    method: "GET",
    url: "/bill/pdf/:counter_no/:outlet_id/:bill_no",
    preHandler: fastify.authenticate,
    schema: schemas.billPdfSchema,
    handler: handlers.billpdfHandler(fastify)
  });

    fastify.route({
    method: "POST",
    url: "/cart/roundoff",
    preHandler: fastify.authenticate,
    schema: schemas.cartRoundoffOperationsSchema,
    handler: handlers.cartRoundoffOperationsHandler(fastify)
  });

      fastify.route({
    method: "POST",
    url: "/batch/details",
    preHandler: fastify.authenticate,
    schema: schemas.cartBatchOperationsSchema,
    handler: handlers.cartBatchOperationsHandler(fastify)
  });

};
