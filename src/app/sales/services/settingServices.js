const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const productRepo = require("../repository/product");

function settingServices(fastify) {
  const { settingInfo } = productRepo(fastify);
  return async ({ logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const response = await settingInfo.call(knex, {
      logTrace,
      userDetails
    });
    return response;
  };
}

module.exports = {
  settingServices
};
