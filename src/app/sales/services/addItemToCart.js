const cartRepo = require("../repository/product");
const getCartServices = require("./getCartServices");
const productServices = require("./productServices");
const codeSearchServices = require("./codesearchServices");
function addToCartService(fastify) {
  const { addItemToCart, getQuantityOfItemInCart, updateQuantityOfItemInCart } =
    cartRepo(fastify);
  const codesearch = codeSearchServices.codeSearchServices(fastify);
  const getCart = getCartServices.getCartServices(fastify);
  const getPriceInfo = productServices.getProductInfoInfoService(fastify);

   
    
  return async ({ logTrace, body, userDetails }) => {
    // const { prod_id, cart_quantity, discount_amount, counter_no, code, rate_edit, rate, outlet_id } =
    //   body;
       const {  cart_quantity, counter_no, code,  outlet_id } =
      body;
    const users_id = userDetails.id;
    const knex = fastify.knexMedical;
    const databarcode = {  code };
    //console.log("sssssss",databarcode);
    
   const codeInfo = await codesearch.call(knex, {
     logTrace,
     outlet_id,
     userDetails,
     body: databarcode
   });
    const priceInfo = await getPriceInfo.call(knex, {
      logTrace,
      outlet_id,
      userDetails,
      body: databarcode
    });
     const cartInfo = await getCart.call(knex, {
         logTrace,
        query: {
          users_id,
          counter_no,
          outlet_id
        }
    });
   console.log("cartInfo",cartInfo);
     console.log("cartInfo",priceInfo);
    var discount = codeInfo.discount;
    var discount_amount = priceInfo.discount_amount || 0;
    var prod_id = priceInfo.prod_id;
    var mrp = priceInfo.mrp;
    // if (rate_edit === 1) {
    //   var sales_rate = rate;


    // } else {

    //   var sales_rate = priceInfo.sales_rate;
    // }
    var sales_rate = priceInfo.sales_rate;
    const existingItemInfo = await getQuantityOfItemInCart.call(knex, {
      logTrace,
      input: { prod_id, users_id, counter_no, outlet_id , barcode:databarcode.code}
    });
    
    if (existingItemInfo) {
      await updateQuantityOfItemInCart.call(knex, {
        logTrace,
        body:cartInfo,
        input: {
          prod_id,
          users_id,
          counter_no,
          outlet_id,
          discount,
          mrp,
          sales_rate,
          barcode:databarcode.code,
          cart_quantity: Number(existingItemInfo.qty) + Number(cart_quantity)
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
     
    }
    await addItemToCart.call(knex, {
      logTrace,
       body:cartInfo,
      input: {
        prod_id,
        users_id,
        counter_no,
        cart_quantity,
    discount_amount: discount,
        mrp,
        sales_rate,
        code:databarcode.code,
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
module.exports = addToCartService;
