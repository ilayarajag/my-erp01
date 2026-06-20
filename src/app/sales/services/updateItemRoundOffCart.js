const cartRepo = require("../repository/product");
const getCartServices = require("./getCartServices");
const productServices = require("./productServices");
const codeSearchServices = require("./codesearchServices");

function updateItemRoundOffCartService(fastify) {
  const { updateQuantityOfRoundOffCart, } = cartRepo(fastify);
  const getCart = getCartServices.getCartServices(fastify);
  const getPriceInfo = productServices.getProductInfoInfoService(fastify);
  const codesearch = codeSearchServices.codeSearchServices(fastify);
  return async ({ logTrace, body, userDetails }) => {
    // const { prod_id, cart_quantity, discount_amount, counter_no, barcode, rate_edit, rate } =
    //   body;
    const { counter_no, outlet_id, round_off,mode} =
      body;

    const users_id = userDetails.id;
    const knex = fastify.knexMedical;
   // const databarcode = { code };
    //  console.log("data",databarcode);

   
    let cartInfo = await updateQuantityOfRoundOffCart.call(knex, {
      logTrace,
     // body: codeInfo,
      input: {
        users_id,
        counter_no,
        outlet_id,
        //round_off,
        mode
      }
    });
    return { success: "true" };
  };
}
module.exports = updateItemRoundOffCartService;
