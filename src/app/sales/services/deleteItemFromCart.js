const cartRepo = require("../repository/product");
const getCartServices = require("./getCartServices");

function deleteItemFromCartService(fastify) {
  const { deleteItemFromCart } = cartRepo(fastify);
  const getCart = getCartServices.getCartServices(fastify);

  return async ({ logTrace, body, userDetails }) => {
    const { prod_id, cart_quantity, discount_amount, counter_no, barcode,outlet_id } =
      body;
    const users_id = userDetails.id;
    const knex = fastify.knexMedical;

    await deleteItemFromCart.call(knex, {
      logTrace,
      input: {
        prod_id,
        users_id,
        counter_no,
        outlet_id
      }
    });

    return getCart({
      logTrace,
      query: {
        users_id,
        counter_no,
        outlet_id
      }
    });
  };
}
module.exports = deleteItemFromCartService;
