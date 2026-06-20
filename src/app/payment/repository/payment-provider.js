const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const { logQuery } = require("../../commons/helpers");
const axios = require("axios");
const { COUNTER_CART,OUTLET_PAYMENT_LOGS, PAYMENT_PROVIDER_DEVICE_CONFIG,
  COUNTER_SETTINGS,
  PAYMENT_PROVIDERS,
  PAY_TYPE_MASTER, } = require("../commons/constants");
const { exists } = require("fs-extra");
const { errorCodes } = require("fastify");

function paymentProviderRepo(fastify) {
async function getPaymentProvider({
  input: {
  
    users_id,
    counter_no,
    pay_type_id
  },
  logTrace,
  outlet_id
}) {

    const knex = this;
    const providerConfig = await knex(  PAYMENT_PROVIDERS
.NAME)
      .where(  PAYMENT_PROVIDERS.COLUMNS.ID, pay_type_id)
      .andWhere(  PAYMENT_PROVIDERS.COLUMNS.COUNTER_NO, counter_no)
      .andWhere(  PAYMENT_PROVIDERS.COLUMNS.OUTLET_ID, outlet_id)
      .andWhere(  PAYMENT_PROVIDERS.COLUMNS.PAY_TYPE_ID, pay_type_id)
      .first();
    if (!providerConfig) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Payment provider config not found",
        property: "provider_id",
        code: "PROVIDER_CONFIG_NOT_FOUND"
      });
    }
    return providerConfig;
}






  return {

    getPaymentProvider,
  
  };
}

module.exports = paymentProviderRepo;
