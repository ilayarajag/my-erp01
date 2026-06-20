// const { StatusCodes } = require("http-status-codes");
// const { CustomError } = require("../../errorHandler");
// const productRepo = require("../repository/product");
// const getOfferInfoService = require("../services/offerServices");
// const getSchemeInfoService = require("../services/schemeServices");
// const getloyalityPointService = require("./getloyalityPointService");
// const settingServices = require("./settingServices");
// const outletinfoServices = require("../../catalog/outletmembers/services/outletMembersServices");

// function getCartlistServices(fastify) {
//   const { getItemsInCart } = productRepo(fastify);

//   return async ({ logTrace, params, query, userDetails }) => {
//     const knex = fastify.knexMedical;
//     let { users_id, counter_no, outlet_id } = query;

//     if (!users_id) {
//       users_id = userDetails.id;
//     }
//     if (!counter_no) {
//       counter_no = params.counter_no;
//     }
//     if (!outlet_id) {
//       outlet_id = params.outlet_id;
//     }
//     const response = await getItemsInCart.call(knex, {
//       users_id,
//       counter_no,
//       outlet_id,
//       logTrace,
//       userDetails
//     });
//     // Extracting unique coupon codes from the cart lines
//     const couponCodesSet = new Set();
//     response.forEach(line => {
//       if (line.coupon_code) {
//         couponCodesSet.add(line.coupon_code);
//       }
//     });
//     // Converting Set to an array
//     const uniqueCouponCodes = Array.from(couponCodesSet);
//     // console.log("Unique Coupon Codes1:", uniqueCouponCodes);

//     const special_couponcode = uniqueCouponCodes[0];
//     //console.log("special_couponcode :" + special_couponcode);
//     let juice_discount = 0;
//     if (special_couponcode !== "" && special_couponcode !== undefined) {
//       const applySpecialCoupon = applySpecialCouponService(fastify);
//       const settingInfo = settingServices.settingServices(fastify);
//       const settings = await settingInfo.call(knex, {
//         users_id,
//         logTrace,
//         userDetails
//       });

//       const applyCoupon = await applySpecialCoupon({
//         logTrace,
//         query: {
//           coupon_code: special_couponcode,
//           location: settings.location,
//           users_id
//         },
//         body: response,
//         logTrace,
//         userDetails
//       });
//       juice_discount = applyCoupon;
//     }

//     const cart_sub_total = response.reduce((acc, cartLine) => {
//       return acc + parseFloat(cartLine.qty) * parseFloat(cartLine.sale_rate);
//     }, 0);
//     console.log("cart_sub_total", cart_sub_total);

//     const cart_discount = response.reduce((acc, cartLine) => {
//       return (
//         acc + parseFloat(cartLine.discount_amount) * parseFloat(cartLine.qty)
//       );
//     }, 0);
//     console.log("cart_discount", cart_discount);

//     const cart_gr_wt = response.reduce((acc, cartLine) => {
//       return acc + parseFloat(cartLine.gr_wt);
//     }, 0);
//     console.log("cart_gr_wt", cart_gr_wt);

//     const cart_gr_tot = 0;
//     const cart_sgst = response.reduce((acc, cartLine) => {
//       if (cartLine.Vattype === 1) {
//         return (
//           acc +
//           parseFloat(cartLine.sales_rate) * (parseFloat(cartLine.gst) / 100) * parseFloat(cartLine.qty)

//         );
//       }
//       return acc;
//     }, 0);
//     console.log("cart_sgst", cart_sgst);

//     const cart_cgst = response.reduce((acc, cartLine) => {
//       if (cartLine.Vattype === 1) {
//         return (
//           acc +

//           parseFloat(cartLine.sales_rate) * (parseFloat(cartLine.cgst) / 100) * parseFloat(cartLine.qty)
//         );
//       }
//       return acc;
//     }, 0);
//     console.log("cart_cgst", cart_cgst);

//     const cart_cess = response.reduce((acc, cartLine) => {
//       return (
//         acc +
//         parseFloat(cartLine.sales_rate) *
//         (parseFloat(cartLine.cess) / 100) *
//         parseFloat(cartLine.qty)
//       );
//     }, 0);
//     console.log("cart_cess", cart_cess);
//     const cart_total_quantity = response.reduce((acc, cartLine) => {
//       return acc + parseFloat(cartLine.qty);
//     }, 0);
//     console.log("cart_total_quantity", cart_total_quantity);

//     const getOffersInfo = getOfferInfoService.getOfferInfoService(fastify);
//     const getOffer = await getOffersInfo({
//       logTrace,
//       body: response,
//       logTrace,
//       userDetails
//     });

//     const getSchemeInfo = getSchemeInfoService.getSchemeInfoService(fastify);
//     const getScheme = await getSchemeInfo({
//       logTrace,
//       body: response,
//       query: {
//         total: cart_sub_total.toFixed(2)
//       },
//       logTrace,
//       userDetails
//     });
//     var getLoyalityPoint = 0;
//      if (response[0].is_apply_loyalty == true) {
       
     
//       const getLoyalityInfo = getloyalityPointService.getloyalityPointServices(fastify);
//     const getLoyality = await getLoyalityInfo({
//       logTrace,
//       body: {response,counter_no,customer_id,users_id},
//       params: {outlet_id},
//       query: {
//         total: cart_sub_total.toFixed(2)
//       },
//       logTrace,
//       userDetails
//     });
//   console.log("getLoyalityqqqqqq",getLoyality);
//  if (getLoyality?.success) {

//   getLoyalityPoint =
//     Number(getLoyality?.data?.final_total || 0);

// }
//      }
//   console.log("getLoyalityPointaaa",getLoyalityPoint);
  
//     const total_offer =
//       Number(getOffer.offamt) +
//       Number(getScheme.offamt) +
//       Number(juice_discount);
//     console.log("total_offer", total_offer);

//     const sub_total = cart_sub_total.toFixed(2);
//     console.log("sub_total", sub_total);
//  var mode_total = response[0].mode;
//      console.log("mode_totaljjjjjjjjjjjjjjjj", mode_total);
     
//     var net_total =
//       Number(sub_total) +
//       Number(cart_sgst) +
//       Number(cart_cgst) +
//       Number(cart_cess) -
//       Number(total_offer);
//     console.log("net_total", net_total);
//          if(mode_total == 1){
//         mode_total = Math.round(net_total.toFixed(2))- parseFloat(cart_discount).toFixed(2);
//        }else{
//         mode_total = net_total.toFixed(2)- parseFloat(cart_discount).toFixed(2);
//        }
//          if(response[0].is_apply_loyalty == true){
//         mode_total  = getLoyalityPoint ;
//        }
//     // const net_total =
//     //   Number(sub_total) +
//     //   Number(cart_sgst) +
//     //   Number(cart_cgst) +
//     //   Number(cart_cess) -
//     //   Number(total_offer);
//     // console.log("net_total", net_total);

//     const round_off = Math.round(net_total.toFixed(2)) - net_total.toFixed(2);
//     const total_gst = cart_sgst + cart_cgst;
//     console.log("round_off", round_off);
//     console.log("total_gst", total_gst);
//     const cartResponse = {
//       cart_sub_total: cart_sub_total.toFixed(2),
//       cart_total_discount: total_offer.toFixed(2),
//       cart_you_save: cart_discount.toFixed(2),
//       cart_total_quantity,
//       cart_total_sgst: cart_sgst.toFixed(2),
//       cart_total_cgst: cart_cgst.toFixed(2),
//       cart_total_gst: total_gst.toFixed(2),
//       cart_total_cess: cart_cess.toFixed(2),
//       cart_total: mode_total.toFixed(2),
//       cart_others: 0,
//       cart_net_total: mode_total.toFixed(2),
//       cart_round_off: round_off.toFixed(2),
//       cart_coupon_code: special_couponcode,
//       cart_coupon_offer: juice_discount.toFixed(2),
//       cart_scheme_discount: Number(getScheme.offamt).toFixed(2),
//       cart_gr_wt: cart_gr_wt,
//       cart_gr_tot: mode_total.toFixed(2),
//       cart_lines: response
//     };

//     return cartResponse;
//   };
// }
// function applySpecialCouponService(fastify) {
//   const { specialCouponIssue, specialCouponCheck } = productRepo(fastify);
//   return async ({ query, body, logTrace, userDetails }) => {
//     const knex = fastify.knexMedical;
//     const { coupon_code, location, users_id } = query;
//     console.log("query", query);

//     const currentDate = getCurrentDate();
//     let discount_amount = 0;
//     let paddedLocation = location.toString().padStart(3, "0");
//     const gloc = coupon_code.substring(0, 3);
//     const sid = coupon_code.substring(3, 6);

//     if (gloc == paddedLocation) {
//       const response = await specialCouponIssue.call(knex, {
//         logTrace,
//         coupon_code,
//         users_id,
//         currentDate,
//         userDetails
//       });
//       if (response) {
//         const response1 = await specialCouponCheck.call(knex, {
//           logTrace,
//           sid
//         });
//         if (response1.sid != "") {
//           let sname = response1.sname;
//           let prod = response1.prod;
//           let dtype = response.dtype;
//           let dper = response.dper;
//           let offer_products_array = prod.split(",");
//           let amount = 0;
//           let amount1 = 0;

//           for (let l = 0; l < offer_products_array.length; l++) {
//             let product = parseInt(offer_products_array[l]);

//             let productExists = body.some(
//               cartProduct => cartProduct.prod_id === product
//             );
//             if (productExists) {
//               let specificProduct = body.find(
//                 cartProduct => cartProduct.prod_id === product
//               );

//               let mrp = specificProduct.mrp;
//               let qty = specificProduct.qty;

//               if (dtype == 0) {
//                 amount += qty * mrp;
//               }

//               if (dtype == 2) {
//                 amount1 += qty * dper;
//               }
//             }
//           }

//           if (dtype == 1 && amount > 0) {
//             discount_amount = dper;
//           } else if (dtype == 0 && amount > 0) {
//             discount_amount = dper;
//           } else {
//             discount_amount = amount1;
//           }
//         }
//       }
//     }
//     console.log("discount_amount1:" + discount_amount);
//     return discount_amount;
//   };
// }
// function getCurrentDate() {
//   const currentDate = new Date();
//   const year = currentDate.getFullYear();
//   const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
//   const day = String(currentDate.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// }
// module.exports = {
//   getCartlistServices,
//   applySpecialCouponService
// };
const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const productRepo = require("../repository/product");
const getOfferInfoService = require("../services/offerServices");
const getSchemeInfoService = require("../services/schemeServices");
const getloyalityPointService = require("./getloyalityPointService");
const settingServices = require("./settingServices");
const getpaymentDetailsService = require("./paymentModeServices");
const getOutletCounterSettingsService = require("../../catalog/outletcountersettings/services/outletcouterSettingsService");
const getloyalitypointsDetailsService = require("./getloyalityPointDetails");
const outletinfoServices = require("../../catalog/outletmembers/services/outletMembersServices");

const { COUNTER_CART } = require("../commons/constants");
const { functions } = require("lodash");
const { isEmpty } = require("lodash");
function getCartlistServices(fastify) {
  const { getItemsInCart, getPaymentDetails } = productRepo(fastify);

  return async ({ logTrace, params, query, userDetails, }) => {
    const knex = fastify.knexMedical;
    let { users_id, counter_no, outlet_id, mode, customer_id } = query;
    if (!users_id) {
      users_id = userDetails.id;
    }
    if (!counter_no) {
      counter_no = params.counter_no;
    }
    if (!outlet_id) {
      outlet_id = params.outlet_id;
    }
    if (!mode) {
      mode = params.mode;
    }
     if (!customer_id) {
      customer_id = params.customer_id;
    }
    customer_id =38;
      var member_id =  null;
      var member_name =  null;
      var member_mobile =  null;
        if(customer_id){
            const getoutletmemberInfo = outletinfoServices.getOutletMembersInfoService(fastify);

       const getMemberInfo = await getoutletmemberInfo.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      params: { member_id: customer_id },
      logTrace,
      userDetails
    });
    const memberInfo = getMemberInfo[0];
     //console.log("mem",memberInfo);
       member_id = memberInfo.id;
       member_name = memberInfo.party_name;
       member_mobile = memberInfo.mobile;
  }
    const response = await getItemsInCart.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      logTrace,
      userDetails
    });

    // Extracting unique coupon codes from the cart lines
    const couponCodesSet = new Set();
    response.forEach(line => {
      if (line.coupon_code) {
        couponCodesSet.add(line.coupon_code);
      }
    });
    // Converting Set to an array
    const uniqueCouponCodes = Array.from(couponCodesSet);
    // console.log("Unique Coupon Codes1:", uniqueCouponCodes);

    const special_couponcode = uniqueCouponCodes[0];
    //console.log("special_couponcode :" + special_couponcode);
    let juice_discount = 0;
    if (special_couponcode !== "" && special_couponcode !== undefined) {
      const applySpecialCoupon = applySpecialCouponService(fastify);
      const settingInfo = settingServices.settingServices(fastify);
      const settings = await settingInfo.call(knex, {
        users_id,
        logTrace,
        userDetails
      });

      const applyCoupon = await applySpecialCoupon({
        logTrace,
        query: {
          coupon_code: special_couponcode,
          location: settings.location,
          users_id
        },
        body: response,
        logTrace,
        userDetails
      });
      juice_discount = applyCoupon;
    }
    const cart_sub_total = response.reduce((acc, cartLine) => {
      return acc + parseFloat(cartLine.qty) * parseFloat(cartLine.mrp);
    }, 0);
    // const cart_sub_total = response.reduce((acc, cartLine) => {
    //   const rate =
    //     // parseFloat(cartLine.sale_rate) > 0
    //     //   ? parseFloat(cartLine.sale_rate)
    //     //   : parseFloat(cartLine.mrp);
    //    parseFloat(cartLine.qty) * parseFloat(cartLine.sale_rate);
    //   return acc + parseFloat(cartLine.qty) * rate;
    // }, 0);
    console.log("cart_sub_total", cart_sub_total);

    // const cart_discount = response.reduce((acc, cartLine) => {
    //   return (
    //     acc + parseFloat(cartLine.discount_amount) * parseFloat(cartLine.qty)
    //   );
    // }, 0);
    console.log("response", response);
    const cart_discount = response.reduce((acc, cartLine) => {
      return acc + parseFloat(cartLine.discount_amount) * parseFloat(cartLine.qty);
    }, 0);
    console.log("cart_discount", cart_discount);

    const cart_gr_wt = response.reduce((acc, cartLine) => {
      return acc + parseFloat(cartLine.gr_wt);
    }, 0);
    console.log("cart_gr_wt", cart_gr_wt);

    const cart_gr_tot = 0;
    // const cart_sgst = response.reduce((acc, cartLine) => {
    //   if (cartLine.Vattype === 1) {
    //     return (
    //       acc +
    //       parseFloat(cartLine.sales_rate) * (parseFloat(cartLine.gst) / 100) * parseFloat(cartLine.qty)

    //     );
    //   }
    //   return acc;
    // }, 0);
    const cart_sgst = response.reduce((acc, cartLine) => {
      if (cartLine.sgst !== 0) {
        return acc + parseFloat(cartLine.sales_rate) * ((parseFloat(cartLine.sgst) / 100) / 2) * parseFloat(cartLine.qty);
      }
      return acc;
    }, 0);

    console.log("cart_sgst", cart_sgst);

    // const cart_cgst = response.reduce((acc, cartLine) => {
    //   if (cartLine.Vattype === 1) {
    //     return (
    //       acc +

    //       parseFloat(cartLine.sales_rate) * (parseFloat(cartLine.gst) / 100) * parseFloat(cartLine.qty)
    //     );
    //   }
    //   return acc;
    // }, 0);
    const cart_cgst = response.reduce((acc, cartLine) => {
      if (cartLine.cgst !== 0) {
        return acc + parseFloat(cartLine.sales_rate) * ((parseFloat(cartLine.cgst) / 100) / 2) * parseFloat(cartLine.qty)
      }
      return acc;
    }, 0);
    console.log("cart_cgst", cart_cgst);

    const cart_cess = response.reduce((acc, cartLine) => {
      return (
        acc +

        parseFloat(cartLine.cess)

      );
    }, 0);
    console.log("cart_cess", cart_cess);
    const cart_total_quantity = response.reduce((acc, cartLine) => {
      return acc + parseFloat(cartLine.qty);
    }, 0);
    console.log("cart_total_quantity", cart_total_quantity);
  //  let round_off = 0;
  //   round_off = response.reduce((acc, cartLine) => {
  //     return acc + parseFloat(cartLine.round_off_enabled);
  //   });


    const getOffersInfo = getOfferInfoService.getOfferInfoService(fastify);
    const getOffer = await getOffersInfo({
      logTrace,
      body: response,
      logTrace,
      userDetails
    });
   console.log("getOffersInfo", getOffer);
   
    const getSchemeInfo = getSchemeInfoService.getSchemeInfoService(fastify);
    const getScheme = await getSchemeInfo({
      logTrace,
      body: response,
      query: {
        total: cart_sub_total.toFixed(2)
      },
      logTrace,
      userDetails
    });
    console.log("scheme",getScheme);
     var getLoyalityPoint = 0;
     if (response[0].is_apply_loyalty == true) {
       
     
      const getLoyalityInfo = getloyalityPointService.getloyalityPointServices(fastify);
    const getLoyality = await getLoyalityInfo({
      logTrace,
      body: {response,counter_no,customer_id,users_id},
      params: {outlet_id},
      query: {
        total: cart_sub_total.toFixed(2)
      },
      logTrace,
      userDetails
    });
  console.log("getLoyalityqqqqqq",getLoyality);
 if (getLoyality?.success) {

  getLoyalityPoint =
    Number(getLoyality?.data?.final_total || 0);

}
     }
  console.log("getLoyalityPointaaa",getLoyalityPoint);
  
    // const getpaymentInfo = getpaymentDetailsService.getpaymentDetailsService(fastify);

    //  const getpayment = await getpaymentInfo({
    //   params,
    //   users_id,
    //   counter_no,
    //   outlet_id,
    //   mode,
    //   logTrace,
    //   userDetails
    // });
    const getpayment = await getPaymentDetails.call(knex, {
      params,
      users_id,
      counter_no,
      outlet_id,
      mode,
      logTrace,
      userDetails
    });


    //console.log("getpayment", getpayment);

    const payment_mode = !isEmpty(getpayment)
      ? (Array.isArray(getpayment)
        ? getpayment[0]?.pay_type || "Cash"
        : getpayment?.pay_type || "Cash")
      : "Cash";
    // getpayment.pay_type || "Cash";
    //  const payment_name = getpayment[0].pay_type_name || "Cash";
    //   console.log("payment_mode", payment_mode);
    const total_offer =
      Number(getOffer.offamt) +
      Number(getScheme.offamt) +
      Number(juice_discount);
    console.log("total_offer", total_offer);

    const sub_total = cart_sub_total.toFixed(2);
    console.log("sub_total", sub_total);
    var mode_total = response[0].mode;
     
    var net_total =
      Number(sub_total) +
      Number(cart_sgst) +
      Number(cart_cgst) +
      Number(cart_cess) -
      Number(total_offer);
    console.log("net_total", net_total);
         if(mode_total == 1){
        mode_total = Math.round(net_total.toFixed(2))- parseFloat(cart_discount).toFixed(2);
       }else{
        mode_total = net_total.toFixed(2)- parseFloat(cart_discount).toFixed(2);
       }
       if(response[0].is_apply_loyalty == true){
        mode_total  = getLoyalityPoint ;
       }
    const round_off = Math.round(net_total.toFixed(2)) - net_total.toFixed(2);
    const total_gst = cart_sgst + cart_cgst;
    // const total_gst = cart_sgst ;
    console.log("round_off", round_off);
    console.log("total_gst", total_gst);
    const cartResponse = {
      cart_sub_total: parseFloat(cart_sub_total).toFixed(2),
      cart_total_discount: parseFloat(cart_discount).toFixed(2),
      cart_you_save: parseFloat(cart_discount).toFixed(2),
      cart_total_quantity,
      cart_total_sgst: cart_sgst.toFixed(2),
      cart_total_cgst: cart_cgst.toFixed(2),
      cart_total_gst: total_gst.toFixed(2),
      cart_total_cess: cart_cess.toFixed(2),
      cart_total: mode_total.toFixed(2) ,
      cart_others: 0,
      cart_net_total: mode_total.toFixed(2),
      cart_round_off: round_off.toFixed(2),
      cart_coupon_code: special_couponcode,
      cart_coupon_offer: juice_discount.toFixed(2),
      cart_scheme_discount: Number(getScheme.offamt).toFixed(2),
      cart_gr_wt: cart_gr_wt,
     // cart_gr_tot: net_total.toFixed(2),
      cart_gr_tot : mode_total.toFixed(2),

      payment_mode: getpayment,
      // payment_name : payment_name,
      //cart_lines: response
    };

    return cartResponse;
  };
}
function applySpecialCouponService(fastify) {
  const { specialCouponIssue, specialCouponCheck } = productRepo(fastify);
  return async ({ query, body, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const { coupon_code, location, users_id } = query;
    console.log("query", query);

    const currentDate = getCurrentDate();
    let discount_amount = 0;
    let paddedLocation = location.toString().padStart(3, "0");
    const gloc = coupon_code.substring(0, 3);
    const sid = coupon_code.substring(3, 6);
    console.log("sid", sid, gloc, paddedLocation,);

    if (gloc == paddedLocation) {
      const response = await specialCouponIssue.call(knex, {
        logTrace,
        coupon_code,
        users_id,
        currentDate,
        userDetails
      });
      if (response) {
        const response1 = await specialCouponCheck.call(knex, {
          logTrace,
          sid
        });
        if (response1.sid != "") {
          let sname = response1.sname;
          let prod = response1.prod_id;
          let dtype = response.dtype;
          let dper = response.dper;
          let offer_products_array = prod.split(",");
          let amount = 0;
          let amount1 = 0;

          for (let l = 0; l < offer_products_array.length; l++) {
            let product = parseInt(offer_products_array[l]);

            let productExists = body.some(
              cartProduct => cartProduct.prod_id === product
            );
            if (productExists) {
              let specificProduct = body.find(
                cartProduct => cartProduct.prod_id === product
              );

              let mrp = specificProduct.mrp;
              let qty = specificProduct.qty;

              if (dtype == 0) {
                amount += qty * mrp;
              }

              if (dtype == 2) {
                amount1 += qty * dper;
              }
            }
          }

          if (dtype == 1 && amount > 0) {
            discount_amount = dper;
          } else if (dtype == 0 && amount > 0) {
            discount_amount = dper;
          } else {
            discount_amount = amount1;
          }
        }
      }
    }
    console.log("discount_amount1:" + discount_amount);
    return discount_amount;
  };
}
function getCurrentDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(currentDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function getItemsInCartlist(fastify) {
  const { getCartlist } = productRepo(fastify);

  return async ({ logTrace, params, query, userDetails }) => {
    const knex = fastify.knexMedical;
    console.log("para", params, query);

    let { users_id, counter_no, outlet_id } = query;

    if (!users_id) {
      users_id = userDetails.id;
    }
    if (!counter_no) {
      counter_no = params.counter_no;
    }
    if (!outlet_id) {
      outlet_id = params.outlet_id;
    }

    const response = await getCartlist.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      logTrace,
      userDetails
    });

    return response;
  };
}
function getPaymentMode(fastify) {
  const { getPaymentDetails } = productRepo(fastify);
  return async ({ logTrace, query }) => {
    const knex = fastify.knexMedical;
    const { users_id, counter_no, outlet_id, mode } = query;
    const response = await getPaymentDetails.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      mode,

      logTrace
    });
    return response;
  };
}
module.exports = {
  getCartlistServices,
  applySpecialCouponService,
  getItemsInCartlist
};

