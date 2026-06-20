const cartRepo = require("../repository/product");
const codeSearchServices = require("./codesearchServices");
const productServices = require("./productServices");
const isMissingCartQuantity = (qty) =>
  qty == null || qty === "" || qty === "null" || qty === "undefined";

function addCartService(fastify) {
  const {
    addItemToCart,
    getQuantityOfItemInCart,
    updateQuantityOfItemInCart
  } = cartRepo(fastify);
  const codesearch = codeSearchServices.codeSearchServices(fastify);
 const getPriceInfo = productServices.getProductInfoInfoService(fastify);

  return async ({ logTrace, body, userDetails }) => {
    const { counter_no, code, outlet_id, customer_id } = body;
    const users_id = userDetails.id;
    const knex = fastify.knexMedical;
     let discount_amount = 0;
    let discount = 0;
    let batchNo = 0;
    const codeInfo = await getPriceInfo.call(knex, {
      logTrace,
      outlet_id,
      userDetails,
      body: { code }
    });
   //console.log("codeInfo",codeInfo);
    const {
      discount_percentage,
      discount_rate,
      prod_id,
      sales_rate,
      uom_name
    } = codeInfo;
   //console.log("codeInfo",codeInfo);
   batchNo = codeInfo.batch_no ? codeInfo.batch_no : 0;
    const mrp =
      body.mrp !== undefined && body.mrp !== null && body.mrp !== ""
        ? body.mrp
        : codeInfo.mrp;
         console.log("mrp",mrp);
 
        let defaultQuantity =
          uom_name === "Kgs"
            ? Math.min(
                isMissingCartQuantity(body.cart_quantity)
                  ? 0
                  : Number(body.cart_quantity),
                50
              )
            : 1;

        const existingItemInfo = await getQuantityOfItemInCart.call(knex, {
          logTrace,
          input: { prod_id, users_id, counter_no, outlet_id, barcode: code }
        });

        const cartInput = {
          prod_id,
          users_id,
          counter_no,
          outlet_id,
          discount:(discount_percentage ),
          discount_amount: discount_rate ,
          mrp,
          sales_rate,
          uom_name,
          barcode: code
        };

        if (existingItemInfo) {
          let updatedQty;
          if (uom_name === "Kgs") {
            // For Kgs, only sum the body.cart_quantity to existing,
            // don't use default quantity logic
            const bodyQty = isMissingCartQuantity(body.cart_quantity)
              ? 0
              : Number(body.cart_quantity);
            updatedQty = Number(existingItemInfo.qty) + bodyQty;
          } else {
            const incrementQty = Number(body.cart_quantity) || defaultQuantity || 1;
            updatedQty = isMissingCartQuantity(body.cart_quantity)
              ? Number(existingItemInfo.qty) + incrementQty
              : incrementQty;
          }
          cartInput.cart_quantity = updatedQty;

          await updateQuantityOfItemInCart.call(knex, {
            logTrace,
            body: codeInfo,
            input: cartInput
          });
    } else {
       if(batchNo !== 0){
         defaultQuantity = 0;
       }
      await addItemToCart.call(knex, {
        logTrace,
        body: codeInfo,
        input: {
          ...cartInput,
          cart_quantity: defaultQuantity,
          code,
          customer_id
        }
      });
    }

    return { success: "true" };
  };
}

module.exports = addCartService;
