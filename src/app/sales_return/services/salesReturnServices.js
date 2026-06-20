const salesReturnRepo = require("../repository/salesReturnRepo");

const getFinancialYear = (date = new Date()) => {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  if (month >= 4) {
    return `${year}_${year + 1}`;
  } else {
    return `${year - 1}_${year}`;
  }
};

function createSalesReturnService(fastify) {
  const { createSalesReturn } = salesReturnRepo(fastify);
  return async ({ body,params, logTrace, userDetails }) => {
    body.return_type = "BILLWISE";
    const financialYear = getFinancialYear();
    return createSalesReturn.call(fastify.knexMedical, { body, params, logTrace, userDetails, financialYear });
  };
}

function fetchBillDetailsService(fastify) {
  const { fetchBillDetails } = salesReturnRepo(fastify);
  return async ({ body, logTrace, userDetails }) => {
    return fetchBillDetails.call(fastify.knexMedical, { body, logTrace, userDetails });
  };
}

function redeemCouponService(fastify) {
  const { redeemCoupon } = salesReturnRepo(fastify);
  return async ({ body, logTrace, userDetails }) => {
    return redeemCoupon.call(fastify.knexMedical, { body, logTrace, userDetails });
  };
}

function validateCouponService(fastify) {
  const { validateCoupon } = salesReturnRepo(fastify);
  return async ({ body, logTrace, userDetails }) => {
    return validateCoupon.call(fastify.knexMedical, { body, logTrace, userDetails });
  };
}

function getGeneralReturnProductService(fastify) {
  const { getGeneralReturnProduct } = salesReturnRepo(fastify);
  return async ({ body, logTrace, userDetails }) => {
    return getGeneralReturnProduct.call(fastify.knexMedical, { body, logTrace, userDetails });
  };
}

function createGeneralReturnService(fastify) {
  const { createGeneralReturn } = salesReturnRepo(fastify);
  return async ({ body, params, logTrace, userDetails }) => {
    const financialYear = getFinancialYear();
    return createGeneralReturn.call(fastify.knexMedical, { body, params, logTrace, userDetails, financialYear });
  };
}


function getSalesReturnReportService(fastify) {
  const { getSalesReturnReport } = salesReturnRepo(fastify);
  return async ({ body, query, logTrace }) => {
    return getSalesReturnReport.call(fastify.knexMedical, { body, query, logTrace });
  };
}

function getSalesReturnInvoiceReportService(fastify) {
  const { getSalesReturnInvoiceReport } = salesReturnRepo(fastify);
  return async ({ body, query, logTrace }) => {
    return getSalesReturnInvoiceReport.call(fastify.knexMedical, { body, query, logTrace });
  };
}

function getInvoiceSalesReturnDetailsService(fastify) {
  const { getInvoiceSalesReturnDetails } = salesReturnRepo(fastify);
  return async ({ body, query, logTrace }) => {
    return getInvoiceSalesReturnDetails.call(fastify.knexMedical, { body, query, logTrace });
  };
}

function getSalesReturnInfoService(fastify) {
  const { getSalesReturnInfo } = salesReturnRepo(fastify);
  return async ({ params, logTrace, userDetails }) => {
    return getSalesReturnInfo.call(fastify.knexMedical, { params, logTrace, userDetails });
  };
}

// 
function getGeneralReturnReportService(fastify) {
  const { getGeneralReturnReport } = salesReturnRepo(fastify);
  return async ({ body, query, logTrace }) => {
    return getGeneralReturnReport.call(fastify.knexMedical, { body, query, logTrace });
  };
}



module.exports = {
  createSalesReturnService,
  fetchBillDetailsService,
  redeemCouponService,
  getGeneralReturnProductService,
  createGeneralReturnService,
  validateCouponService,
  getSalesReturnReportService,
  getSalesReturnInvoiceReportService,
  getInvoiceSalesReturnDetailsService,
  getSalesReturnInfoService,
  getGeneralReturnReportService
};
