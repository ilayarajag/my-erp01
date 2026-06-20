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
const { functions, round } = require("lodash");
const { isEmpty } = require("lodash");
function calculateCartTotals(cartLines) {
  return cartLines.reduce(
    (totals, line) => {
      const qty = Number(line.qty) || 0;
      const gstAmount = Number(line.gst_amount) || 0;

      totals.cart_sub_total += Number(line.amount) || 0;
      totals.cart_discount += Number(line.discount_amount) || 0;
      totals.cart_gr_wt += Number(line.gr_wt) || 0;
      totals.cart_sgst += gstAmount / 2;
      totals.cart_cgst += gstAmount / 2;
      totals.cart_cess += Number(line.cess_amount) || 0;
      totals.cart_total_quantity += qty;

      return totals;
    },
    {
      cart_sub_total: 0,
      cart_discount: 0,
      cart_gr_wt: 0,
      cart_sgst: 0,
      cart_cgst: 0,
      cart_cess: 0,
      cart_total_quantity: 0
    }
  );
}

async function resolveJuiceDiscount(fastify, knex, { response, users_id, logTrace, userDetails }) {
  const special_couponcode = response.find((line) => line.coupon_code)?.coupon_code;
  if (!special_couponcode) {
    return { special_couponcode: undefined, juice_discount: 0 };
  }

  const settingInfo = settingServices.settingServices(fastify);
  const settings = await settingInfo.call(knex, { users_id, logTrace, userDetails });
  const applySpecialCoupon = applySpecialCouponService(fastify);
  const juice_discount = await applySpecialCoupon({
    logTrace,
    query: {
      coupon_code: special_couponcode,
      location: settings.location,
      users_id
    },
    body: response,
    userDetails
  });

  return { special_couponcode, juice_discount: Number(juice_discount) || 0 };
}

function getCartsummaryServices(fastify) {
  const { getItemsInCart, getPaymentDetails } = productRepo(fastify);
  const getOffersInfo = getOfferInfoService.getOfferInfoService(fastify);
  const getSchemeInfo = getSchemeInfoService.getSchemeInfoService(fastify);
  const getLoyalityInfo = getloyalityPointService.getloyalityPointServices(fastify);
  const getoutletmemberInfo = outletinfoServices.getOutletMembersInfoService(fastify);

  return async ({ logTrace, params = {}, query = {}, userDetails }) => {
    const knex = fastify.knexMedical;
    let { users_id, counter_no, outlet_id, mode, customer_id } = query;

    users_id = users_id || userDetails.id;
    counter_no = counter_no || params.counter_no;
    outlet_id = outlet_id || params.outlet_id;
    mode = mode || params.mode;
    customer_id = customer_id || params.customer_id || null;

    if (customer_id) {
      await getoutletmemberInfo.call(knex, {
        users_id,
        counter_no,
        outlet_id,
        params: { member_id: customer_id },
        logTrace,
        userDetails
      });
    }

    const response = await getItemsInCart.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      logTrace,
      userDetails
    });

    const {
      cart_sub_total,
      cart_discount,
      cart_gr_wt,
      cart_sgst,
      cart_cgst,
      cart_cess,
      cart_total_quantity
    } = calculateCartTotals(response);

    const [couponResult, getOffer, getScheme, getpayment] = await Promise.all([
      resolveJuiceDiscount(fastify, knex, { response, users_id, logTrace, userDetails }),
      getOffersInfo({ logTrace, body: response, userDetails, outlet_id }),
      getSchemeInfo({
        logTrace,
        body: response,
        query: { total: cart_sub_total.toFixed(2) },
        userDetails,
        outlet_id
      }),
      getPaymentDetails.call(knex, {
        params,
        users_id,
        counter_no,
        outlet_id,
        mode,
        logTrace,
        userDetails
      })
    ]);
    const { special_couponcode, juice_discount } = couponResult;

    const cart_payment_mode = Number(response[0].mode);
    const isApplyLoyalty = response[0].is_apply_loyalty === true;
    let reedem_amount = 0;
    let earned_points = 0;

    if (isApplyLoyalty && customer_id) {
      const getLoyality = await getLoyalityInfo({
        logTrace,
        body: {
          response,
          counter_no,
          customer_id,
          users_id,
          is_apply_loyalty: true
        },
        params: { outlet_id },
        query: { total: cart_sub_total.toFixed(2) },
        userDetails
      });
      console.log("getLoyalitynew", getLoyality);

      if (getLoyality?.success) {
        reedem_amount = Number(getLoyality?.data?.redeem_amount || 0);
        earned_points = Number(getLoyality?.data?.current_bill_points || 0);
      }
    }
    console.log("reedem_amount", reedem_amount);
    console.log("earned_points", earned_points);
    const total_offer =
      Number(getOffer.offamt) +
      Number(getScheme.offamt) +
      Number(juice_discount);
    console.log("total_offer", total_offer);

    // const netBeforeDiscount =
    //   cart_sub_total +
    //   cart_sgst +
    //   cart_cgst +
    //   cart_cess -
    //   total_offer;
    const netBeforeDiscount =
      cart_sub_total -
      total_offer;

    // let netAmount = netBeforeDiscount - cart_discount;
    let netAmount = netBeforeDiscount;
    if (isApplyLoyalty && reedem_amount > 0) {
      netAmount = Math.max(0, netAmount - reedem_amount);
    }
    let net_total;
    let round_off = 0;
    if (cart_payment_mode === 1) {
      const netAmountFixed = Number(netAmount.toFixed(2));
      round_off = Math.round(netAmountFixed) - netAmountFixed;
      net_total = Math.round(netAmountFixed).toFixed(2);
    } else {
      net_total = (Math.floor(netAmount * 1000) / 1000).toFixed(3);
    }

    const total_gst = cart_sgst + cart_cgst;

    return {
      // cart_sub_total: (cart_sub_total + total_gst).toFixed(2),
      //cart_sub_total: (cart_sub_total + cart_discount).toFixed(2),
      cart_sub_total: (cart_sub_total).toFixed(2),
      cart_total_discount: total_offer,
      cart_you_save: total_offer,
      cart_total_quantity,
      cart_total_sgst: cart_sgst.toFixed(2),
      cart_total_cgst: cart_cgst.toFixed(2),
      cart_total_gst: total_gst.toFixed(2),
      cart_total_cess: cart_cess.toFixed(2),
      cart_others: 0,
      // cart_gr_tot: net_total,
      cart_gr_tot: (cart_sub_total - total_offer - reedem_amount).toFixed(2),
      cart_total: net_total,
      cart_net_total: net_total,
      cart_round_off: round_off.toFixed(2),
      cart_coupon_code: special_couponcode,
      cart_coupon_offer: juice_discount.toFixed(2),
      cart_scheme_discount: Number(getScheme.offamt),
      cart_loyalty_discount: Number(reedem_amount).toFixed(2),
      cart_offer_discount: Number(getOffer.offamt).toFixed(2),
      cart_loyalty_earned_points: earned_points,
      cart_gr_wt: cart_gr_wt,
      payment_mode: getpayment,
      cart_lines: response
    };
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

  return async ({ logTrace, params = {}, query = {}, userDetails }) => {
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
  getCartsummaryServices,
  applySpecialCouponService,
  getItemsInCartlist
};
