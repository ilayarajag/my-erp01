const cartRepo = require("../repository/product");

function clearCartService(fastify) {
  const { clearCartItems } = cartRepo(fastify);

  return async ({ logTrace, query, body, userDetails }) => {
    const knex = fastify.knexMedical;
    const users_id = userDetails.id;
    const counter_no = body.counter_no;
    const outlet_id = body.outlet_id;
    await clearCartItems.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      logTrace
    });

    return { success: "true" };
  };
}
module.exports = clearCartService;
