const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");

const productRepo = require("../repository/product");



function getCurrentDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(currentDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function getpaymentDetailsService(fastify) {
  const { getPaymentDetails } = productRepo(fastify);
  return async ({ logTrace, outlet_id,mode,counter_no, query, userDetails }) => {
    const knex = fastify.knexMedical;
   
    const response = await getPaymentDetails.call(knex, {
      logTrace,
      outlet_id,
      counter_no,
      mode,
      userDetails
    });
    return response;
  };
}

module.exports = {
  getpaymentDetailsService
};
