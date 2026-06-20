const cartRepo = require("../repository/product");
const getCartServices = require("./getCartServices");
const productServices = require("./productServices");
const codeSearchServices = require("./codesearchServices");

function updateItemInCartService(fastify) {
  const { updateQuantityOfItemInCart, deleteItemFromCart } = cartRepo(fastify);
  const getCart = getCartServices.getCartServices(fastify);
  const getPriceInfo = productServices.getProductInfoInfoService(fastify);
  const codesearch = codeSearchServices.codeSearchServices(fastify);
  return async ({ logTrace, body, userDetails }) => {
    // const { prod_id, cart_quantity, discount_amount, counter_no, barcode, rate_edit, rate } =
    //   body;
    const { cart_quantity, counter_no, code, rate_edit, outlet_id, rate } =
      body;

    const users_id = userDetails.id;
    const knex = fastify.knexMedical;
    const databarcode = { code };
    //  console.log("data",databarcode);

    const priceInfo = await getPriceInfo.call(knex, {
      logTrace,
      body: databarcode
    });

    // const mrp = priceInfo.mrp;
    var sales_rate = priceInfo.sales_rate;
    if (rate_edit === 1) {
      var sales_rate = rate;
    }
    else {

      var sales_rate = priceInfo.sales_rate;
    }

    // if (cart_quantity === 0) {
    //   await deleteItemFromCart.call(knex, {
    //     logTrace,
    //     input: {
    //       prod_id,
    //       users_id,
    //       counter_no
    //     }
    //   });

    //   return getCart({
    //     logTrace,
    //     query: {
    //       users_id,
    //       counter_no
    //     }
    //   });
    // }
    const codeInfo = await codesearch.call(knex, {
      logTrace,
      outlet_id,
      userDetails,
      body: databarcode
    });
    var discount = codeInfo.discount;
    var discount_amount = codeInfo.discount_amount;
    var prod_id = codeInfo.prod_id;
    var mrp = codeInfo.mrp;
    var sales_rate = codeInfo.sales_rate;
    await updateQuantityOfItemInCart.call(knex, {
      logTrace,
      body: codeInfo,
      input: {
        prod_id,
        users_id,
        counter_no,
        discount,
        discount_amount,
        outlet_id,
        mrp,
        sales_rate,
        barcode: databarcode.code,
        cart_quantity
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
module.exports = updateItemInCartService;
