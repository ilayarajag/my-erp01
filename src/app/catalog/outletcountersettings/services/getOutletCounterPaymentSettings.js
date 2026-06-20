const outletCounterSettingsRepo = require("../repository/outletCounterSettingsRepo");

function getOutletCounterPaymentSettingsService(fastify) {
  const { getOutletCounterPaymentSettings } = outletCounterSettingsRepo(fastify);
  return async ({ logTrace, query, params, body, userDetails }) => {
    const knex = fastify.knexMedical;
    const { outlet_id, pay_type_id,counter_no } = params;

    const response = await getOutletCounterPaymentSettings.call(knex, {
      pay_type_id,
      outlet_id,
      counter_no,
      logTrace,
      userDetails
    });

    return response;
  };
}
function putOutletCounterPaymentProviderService(fastify) {
  const { putOutletCounterPaymentProvider } = outletCounterSettingsRepo(fastify);
  return async ({ params, body, logTrace, userDetails }) => {
    return putOutletCounterPaymentProvider.call(fastify.knexMedical, { params, body, logTrace, userDetails });
  };
}

function putOutletCounterSettingService(fastify) {
  const { putOutletCounterSetting } = outletCounterSettingsRepo(fastify);
  return async ({ params, body, logTrace, userDetails }) => {
    return putOutletCounterSetting.call(fastify.knexMedical, { params, body, logTrace, userDetails });
  };
}

function postOutletCounterPaymentProviderService(fastify) {
  const { postOutletCounterPaymentProvider } = outletCounterSettingsRepo(fastify);
  return async ({ params, body, logTrace, userDetails }) => {
    return postOutletCounterPaymentProvider.call(fastify.knexMedical, { params, body, logTrace, userDetails });
  };
}



module.exports = {
  getOutletCounterPaymentSettingsService,
  putOutletCounterPaymentProviderService,
  putOutletCounterSettingService,
  postOutletCounterPaymentProviderService
};

