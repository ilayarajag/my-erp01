const cartRepo = require("../repository/product");

function specclearCartService(fastify) {
  const { specclearCartItems } = cartRepo(fastify);

  return async ({ logTrace, query,params, body, userDetails }) => {
    const knex = fastify.knexMedical;
    const users_id = userDetails.id;
    const counter_no = params.counter_no;
    const outlet_id = params.outlet_id;
    const code = params.code;
   // const prod_id = params.prod_id;
    await specclearCartItems.call(knex, {
      users_id,
      code,
      //prod_id,
      counter_no,
      outlet_id,
      logTrace
    });

    return { success: "true" };
  };
}
module.exports = specclearCartService;
