const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const codeSearchRepo = require("../repository/codeSearch");

function codeSearchServices(fastify) {
  const { getProductcodeInfo } = codeSearchRepo(fastify);
  return async ({ logTrace, body, outlet_id, userDetails }) => {
    const { prod_id, cart_quantity, counter_no, code, rate_edit, rate, } =
      body;
    const knex = fastify.knexMedical;
    const databarcode = { barcode: code };
    // console.log("databarcode",databarcode);
    const response = await getProductcodeInfo.call(knex, {
      logTrace,
      outlet_id,
      code: databarcode,
      userDetails
    });
    return response;
  };
}
module.exports = {
  codeSearchServices
};
