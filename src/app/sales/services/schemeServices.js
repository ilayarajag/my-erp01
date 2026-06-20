const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");

const productRepo = require("../repository/product");

function getSchemeInfoService(fastify) {
  const { getSchemeCount } = productRepo(fastify);
  return async ({ params, body, query, logTrace, userDetails,outlet_id }) => {
    const knex = fastify.knexMedical;
    let total = query.total;
    // total = Number(total);
    // console.log("total :" + total);
     console.log("outlet_id", outlet_id);
    const currentDate = getCurrentDate();
    let offamt = 0;
    let revised_total = total;
    const response = await getSchemeCount.call(knex, {
      body,
      gdate: currentDate,
      logTrace,
      userDetails,
      outlet_id
    });
    console.log("schemecount", response);

    if (response > 0) {
      const getSchemeDetails = getSchemeDetailsService(fastify);
      if (body.length > 0) {
        let categoryTotals = {};
        let brandTotals = {};
        // console.log("bodyscheme", body);

        body.forEach(product => {
          if (product.main_cat_id) {
            // Category-wise total
            if (!categoryTotals[product.main_cat_id]) {
              categoryTotals[product.main_cat_id] = 0;
            }
            categoryTotals[product.main_cat_id] += product.mrp * product.qty;

            // Brand-wise total
            if (!brandTotals[product.brand_id]) {
              brandTotals[product.brand_id] = 0;
            }
            brandTotals[product.brand_id] += product.mrp * product.qty;
          }
        });

        for (let j = 3; j >= 0; j--) {
          switch (j) {
            case 0:
              // Bill Value
              const billSchemeInfo = await getSchemeDetails({
                logTrace,
                query: {
                  smode: 0,
                  gdate: currentDate,
                  outlet_id: outlet_id
                },
                userDetails
              });
              console.log("billSchemeInfo", billSchemeInfo);

              for (let i = 0; i < billSchemeInfo.length; i++) {
                let pamount = billSchemeInfo[i].pamount;
                let discount = billSchemeInfo[i].dval;
                let s_mode = billSchemeInfo[i].smode;
                let discount_type = billSchemeInfo[i].dtype;
                let pid = billSchemeInfo[i].pid;

                //console.log("pamount", pamount, "discount", discount);
                if (s_mode == 0 && discount_type == 0 && pid == '') {

                  if (Number(total) > 0 && Number(total) >= Number(pamount)) {
                    console.log("total >= pamount", total, pamount);
                    let discount_amount = revised_total * (discount / 100);
                    console.log("discount_amount1111", discount_amount);
                    revised_total = revised_total - discount_amount;
                    console.log("revised_total1111", revised_total);
                    offamt = offamt + discount_amount;
                    // console.log("offamt", offamt);
                  }
                }
              }

              break;
            case 1:
              // Item Value
              const itemSchemeInfo = await getSchemeDetails({
                logTrace,
                query: {
                  smode: 1,
                  gdate: currentDate,
                  outlet_id: outlet_id
                },
                userDetails
              });
              console.log("itemSchemeInfo", itemSchemeInfo);

              for (let k = 0; k < itemSchemeInfo.length; k++) {
                let scheme_products = itemSchemeInfo[k].pid;
                let discount_type = itemSchemeInfo[k].dtype;
                let discount_value = itemSchemeInfo[k].dval;
                let pamount = itemSchemeInfo[k].pamount;
                let quantity = itemSchemeInfo[k].qty;
                let scheme_products_array = scheme_products.split(",");
                // console.log("scheme_products :" + scheme_products);
                for (let l = 0; l < scheme_products_array.length; l++) {
                  let product = parseInt(scheme_products_array[l]);
                  console.log("product", product);

                  let productExists = body.some(
                    cartProduct => cartProduct.prod_id === product
                  );


                  if (productExists) {
                    let specificProduct = body.find(
                      cartProduct => cartProduct.prod_id === product
                    );
                    let productQty = Number(specificProduct.qty);
                    let mrp = specificProduct.mrp;
                    switch (discount_type) {
                      case 0:
                        // Free
                        if (Number(productQty) > 0 && Number(productQty) >= Number(quantity)) {
                          if (Number(total) >= Number(pamount)) {
                            offamt = Number(offamt) + Number(mrp);
                            console.log("Free", offamt);
                          }
                        }
                        break;
                      case 1:
                        // Discount
                        if (Number(productQty) > 0 && Number(productQty) >= Number(quantity)) {
                          if (Number(total) > 0 && Number(total) >= Number(pamount)) {
                            offamt =
                              Number(offamt) +
                              Number(mrp * (discount_value / 100));
                            console.log("Discount", offamt);
                          }
                        }
                        break;
                      case 2:
                        // Price Off
                        if (Number(productQty) > 0 && Number(productQty) >= Number(quantity)) {
                          if (Number(total) > 0 && Number(total) >= Number(pamount)) {
                            offamt = Number(offamt) + Number(discount_value);
                            console.log("Price Off", offamt);
                          }
                        }
                        break;
                      default:
                        break;
                    }
                  }
                }
              }
              // console.log("off",offamt);

              //               for (let k = 0; k < itemSchemeInfo.length; k++) {
              //   const {
              //     pid,
              //     dtype,
              //     dval,
              //     pamount,
              //     qty
              //   } = itemSchemeInfo[k];

              //   const schemeProducts = pid.split(",");

              //   for (let l = 0; l < schemeProducts.length; l++) {
              //     const productId = parseInt(schemeProducts[l]);

              //     const specificProduct = body.find(
              //       item => Number(item.prod_id) === productId
              //     );

              //     if (!specificProduct) continue;

              //     const productQty = Number(specificProduct.qty);
              //     const mrp = Number(specificProduct.mrp);

              //     console.log("productId:", productId);
              //     console.log("productQty:", productQty);

              //     // Check minimum quantity
              //     if (productQty < Number(qty)) continue;

              //     // Check bill amount
              //     if (Number(total) < Number(pamount)) continue;

              //     switch (Number(dtype)) {
              //       case 0: // Free
              //         offamt += mrp;
              //         console.log("Free:", offamt);
              //         break;

              //       case 1: // Discount %
              //         offamt += mrp * (Number(dval) / 100);
              //         console.log("Discount:", offamt);
              //         break;

              //       case 2: // Price Off
              //         offamt += Number(dval);
              //         console.log("Price Off:", offamt);
              //         break;

              //       default:
              //         break;
              //     }
              //   }
              // }
              // for (let k = 0; k < itemSchemeInfo.length; k++) {
              //   const scheme = itemSchemeInfo[k];

              //   const products = scheme.pid.split(",");

              //   let schemeOffAmt = 0;

              //   for (const prod of products) {
              //     const productId = Number(prod);

              //     const cartItem = body.find(
              //       item => Number(item.prod_id) === productId
              //     );

              //     if (!cartItem) continue;

              //     const productQty = Number(cartItem.qty);
              //     const mrp = Number(cartItem.mrp);

              //     if (productQty < Number(scheme.qty)) continue;
              //     if (Number(total) < Number(scheme.pamount)) continue;

              //     switch (Number(scheme.dtype)) {
              //       case 0: // Free
              //         schemeOffAmt += mrp;
              //         break;

              //       case 1: // Discount %
              //         schemeOffAmt += mrp * (Number(scheme.dval) / 100);
              //         break;

              //       case 2: // Price Off
              //         schemeOffAmt += Number(scheme.dval);
              //         console.log("priceofff",schemeOffAmt);

              //         break;
              //     }
              //   }

              //   offamt += schemeOffAmt;

              //   console.log(
              //     `Scheme ${k + 1} Discount: ${schemeOffAmt}, Total OffAmt: ${offamt}`
              //   );
              // }
              break;
            case 2:
              // categroy Level
              const categorySchemeInfo = await getSchemeDetails({
                logTrace,
                query: {
                  smode: 2,
                  gdate: currentDate,
                    outlet_id : outlet_id
                },
                userDetails
              });
              let calculatedCategories = []; // To keep track of calculated category totals
              let calculatedBillTotal = []; // To keep track of calculated category totals
              for (let m = 0; m < categorySchemeInfo.length; m++) {
                let stype = categorySchemeInfo[m].stype;
                let pamount = categorySchemeInfo[m].pamount;
                let discount = categorySchemeInfo[m].dval;
                let scheme_products = categorySchemeInfo[m].pid;
                let scheme_products_array = scheme_products.split(",");

                switch (stype) {
                  case 0:
                    // Type Total

                    for (let n = 0; n < scheme_products_array.length; n++) {
                      let product = parseInt(scheme_products_array[n]);
                      let productExists = body.some(
                        cartProduct => cartProduct.prod_id === product
                      );

                      if (productExists) {
                        let specificProduct = body.find(
                          cartProduct => cartProduct.prod_id === product
                        );
                        let cat_id = specificProduct.cat_id;
                        if (!calculatedCategories.includes(cat_id)) {
                          if (categoryTotals.hasOwnProperty(cat_id)) {
                            // Get the total MRP for the specific category ID
                            let categoryTotal = categoryTotals[cat_id];
                            if (categoryTotal >= pamount) {
                              let discount_amount =
                                revised_total * (discount / 100);
                              revised_total = revised_total - discount_amount;
                              console.log("catDiscount", discount_amount);

                              // offamt = offamt + discount_amount;
                              offamt = Number(offamt) + Number(discount_amount);
                            }
                          }
                        }
                        calculatedCategories.push(cat_id);
                      }
                    }

                    break;
                  case 1:
                    // Bill Total
                    for (let n = 0; n < scheme_products_array.length; n++) {
                      let product = parseInt(scheme_products_array[n]);
                      let productExists = body.some(
                        cartProduct => cartProduct.prod_id === product
                      );

                      if (productExists) {
                        let specificProduct = body.find(
                          cartProduct => cartProduct.prod_id === product
                        );
                        let cat_id = specificProduct.cat_id;
                        if (!calculatedBillTotal.includes(cat_id)) {
                          if (Number(total) > 0 && Number(total) >= Number(pamount)) {
                            let discount_amount =
                              revised_total * (discount / 100);
                            revised_total = revised_total - discount_amount;
                            // offamt = offamt + discount_amount;
                            offamt = Number(offamt) + Number(discount_amount);
                          }
                        }
                        calculatedBillTotal.push(cat_id);
                      }
                    }

                    break;
                  default:
                    break;
                }
              }
              break;
            case 3:
              // Brand Level
              console.log("brandlevel",outlet_id);
              
              const brandSchemeInfo = await getSchemeDetails({
                logTrace,
                query: {
                  smode: 3,
                  gdate: currentDate,
                   outlet_id : outlet_id
                },
                userDetails,
                outlet_id
               
              });
              let calculatedBrands = []; // To keep track of calculated brand totals
              let calculatedBrandsTotal = []; // To keep track of calculated brand totals
              for (let o = 0; o < brandSchemeInfo.length; o++) {
                let stype = brandSchemeInfo[o].stype;
                let pamount = brandSchemeInfo[o].pamount;
                let discount = brandSchemeInfo[o].dval;
                let scheme_products = brandSchemeInfo[o].pid;
                let scheme_products_array = scheme_products.split(",");

                switch (stype) {
                  case 0:
                    // Type Total

                    for (let p = 0; p < scheme_products_array.length; p++) {
                      let product = parseInt(scheme_products_array[p]);
                      console.log("product", product);
                      let productExists = body.some(
                        cartProduct => cartProduct.prod_id === product
                      );
                      console.log("productExiststypeTotal", productExists);

                      if (productExists) {
                        let specificProduct = body.find(
                          cartProduct => cartProduct.prod_id === product
                        );
                        console.log("specificProduct", specificProduct);

                        let brand_id = specificProduct.brand_id;
                        if (!calculatedBrands.includes(brand_id)) {
                          if (brandTotals.hasOwnProperty(brand_id)) {
                            // Get the total MRP for the specific category ID
                            let brandTotal = brandTotals[brand_id];
                            console.log("brandTotaltype0", brandTotal, revised_total);

                            if (brandTotal >= pamount) {
                              let discount_amount =
                                revised_total * (discount / 100);
                              console.log("discount_amountbrand", discount_amount);

                              revised_total = revised_total - discount_amount;
                              // offamt = offamt + discount_amount;
                              offamt = Number(offamt) + Number(discount_amount);
                            }
                          }
                        }
                        calculatedBrands.push(brand_id);
                      }
                    }

                    break;
                  case 1:
                    // Bill Total
                    for (let q = 0; q < scheme_products_array.length; q++) {
                      let product = parseInt(scheme_products_array[q]);
                      let productExists = body.some(
                        cartProduct => cartProduct.prod_id === product
                      );

                      if (productExists) {
                        let specificProduct = body.find(
                          cartProduct => cartProduct.prod_id === product
                        );
                        let brand_id = specificProduct.brand_id;
                        if (!calculatedBrandsTotal.includes(brand_id)) {
                          if (Number(total) > 0 && Number(total) >= Number(pamount)) {
                            let discount_amount =
                              revised_total * (discount / 100);
                            revised_total = revised_total - discount_amount;
                            console.log("brandTotalBilltotal", discount_amount);

                            // offamt = offamt + discount_amount;
                            offamt = Number(offamt) + Number(discount_amount);
                          }
                        }
                        calculatedBrandsTotal.push(brand_id);
                      }
                    }

                    break;
                  default:
                    break;
                }
              }

              break;
            default:
              break;
          }
        }
        //console.log("offamt111", offamt);
        return { offamt: offamt.toFixed(2) };
      }
    } else {
      // console.log("offamt000", offamt);
      return {

        offamt: 0
      };
    }
  };
}

function getCurrentDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(currentDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function getSchemeDetailsService(fastify) {
  const { getSchemeDetails } = productRepo(fastify);
  return async ({ logTrace, query, userDetails }) => {
    const knex = fastify.knexMedical;
    const response = await getSchemeDetails.call(knex, {
      logTrace,
      smode: query.smode,
      gdate: query.gdate,
      outlet_id: query.outlet_id,
      userDetails
    });
    // console.log("getSchemeDetailsService", response);

    return response;
  };
}

module.exports = {
  getSchemeInfoService,
  getSchemeDetailsService
};
