const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const getbillnoRepo = require("../repository/getbillno");

const getFinancialYear = (date = new Date()) => {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    if (month >= 4) {
        return `${year}_${year + 1}`;
    } else {
        return `${year - 1}_${year}`;
    }
};
function getbillnoInfoInfoService(fastify) {
  const { getbillnoInfo } = getbillnoRepo(fastify);
  return async ({ body, params, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const financialYear = getFinancialYear();
    const response = await getbillnoInfo.call(knex, {
      body,
      params,
      logTrace,
      userDetails,
      financialYear
    });

    return response;
  };
}
module.exports = {
  getbillnoInfoInfoService
};
