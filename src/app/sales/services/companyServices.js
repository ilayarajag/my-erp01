const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const productRepo = require("../repository/product");
const settingServices = require("./settingServices");

function getCompanyInfoService(fastify) {
  const { getCompanyInfo, getCompanyGstInfo } = productRepo(fastify);
  const settingInfo = settingServices.settingServices(fastify);
  return async ({ logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const users_id = userDetails.users_id;
    const companyInfo = await getCompanyInfo.call(knex, {
      logTrace,
      userDetails
    });
    const settings = await settingInfo.call(knex, {
      users_id,
      logTrace,
      userDetails
    });
    const companyGstInfo = await getCompanyGstInfo.call(knex, {
      users_id,
      logTrace,
      userDetails
    });
    const [companyResult, settingsResult, companyGstInfoResult] =
      await Promise.all([companyInfo, settings, companyGstInfo]);
    return {
      ...companyResult,
      Phone: companyGstInfoResult.Phone,
      Tngst: companyGstInfoResult.Tngst,
      fssai: companyGstInfoResult.fssai,
      splmsg1: companyGstInfoResult.splmsg1,
      splmsg2: companyGstInfoResult.splmsg2,
      settings: settingsResult
    };
  };
}

module.exports = {
  getCompanyInfoService
};
