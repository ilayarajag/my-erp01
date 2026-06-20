const outletCounterSettingsRepo = require("../repository/outletCounterSettingsRepo");


function getOutletCounterSettingsService(fastify) {
  const { getOutletCounterSettings } = outletCounterSettingsRepo(fastify);
  return async ({ logTrace,params, query, body, userDetails }) => {
    const knex = fastify.knexMedical;
    const {  counter_no, outlet_id, } = params;
   
     const response = await getOutletCounterSettings.call(knex, {
      counter_no,
      outlet_id,
      logTrace,
      userDetails
    });
   
    return response;
  };

   const { getOutletCounterPaymentSettings } = outletCounterSettingsRepo(fastify);
  return async ({ logTrace, query, body, userDetails }) => {
    const knex = fastify.knexMedical;
    const {  counter_no, outlet_id,payment_id } = query;
   
     const response = await getOutletCounterPaymentSettings.call(knex, {
      counter_no,
      payment_id,
      outlet_id,
      logTrace,
      userDetails
    });
   
    return response;
  };
}

module.exports = {
  getOutletCounterSettingsService
};


 