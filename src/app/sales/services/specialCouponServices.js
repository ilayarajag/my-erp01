const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const productRepo = require("../repository/product");
const getCartServices = require("./getCartServices");
const settingServices = require("./settingServices");
const moment = require("moment");
function specialCouponService(fastify) {
  const { specialCoupon } = productRepo(fastify);
  return async ({ params, body, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;

    const users_id = userDetails.id;
    const { total, billno, counter_no, location, outlet_id } = body;

    const currentDate = getCurrentDate();
    const getCart = getCartServices.getCartServices(fastify);
    const couponGenerate = couponGenerateServices(fastify);
    const cartResponse = getCart({
      logTrace,
      query: {
        users_id,
        counter_no,
        location,
        outlet_id
      }
    });
    const cartItems = (await cartResponse).cart_lines;

    const specialCouponresponse = await specialCoupon.call(knex, {
      body,
      outlet_id,
      logTrace
    });
    // console.log("specialCouponresponse", specialCouponresponse);

    const couponDetailsArray = [];
    for (let i = 0; i < specialCouponresponse.length; i++) {
      let sid = specialCouponresponse[i].id;
      let ctype = specialCouponresponse[i].ctype;
      let pvalue = specialCouponresponse[i].pvalue;
      let dvalue = specialCouponresponse[i].dvalue;
      let etype = specialCouponresponse[i].etype;
      let efrom = specialCouponresponse[i].efrom;
      let eto = specialCouponresponse[i].eto;
      let sname = specialCouponresponse[i].sname;
      let sdesc = specialCouponresponse[i].sdesc;
      let prod1 = specialCouponresponse[i].prod_id;
      let offer_products_array = prod1.split(",");
      let efromDate = moment(efrom, "DD-MMM-YY").toDate();
      let etoDate = moment(eto, "DD-MMM-YY").toDate();
      let formattedEfromDate = moment(efromDate).format("YYYY-MM-DD");
      let formattedEtoDate = moment(etoDate).format("YYYY-MM-DD");

      if (ctype == 0) {
        if (
          (Number(total) >= Number(pvalue) &&
            etype == 1 &&
            currentDate >= formattedEfromDate &&
            currentDate <= formattedEtoDate) ||
          etype == 0
        ) {
          const generateCoupon = await couponGenerate({
            logTrace,
            query: {
              sid,
              dvalue,
              billno,
              location,
              counter_no,
              outlet_id,
              eto,
              dtype: 0
            },
            userDetails
          });
          couponDetailsArray.push({
            sname,
            code: generateCoupon,
            validity: etoDate,
            sdesc: sdesc
          });
        }
      } else if (ctype > 0) {
        // If ctype is equal to 1, dtype is assigned the value 0.
        // If ctype is equal to 2, dtype is assigned the value 1.
        // Otherwise, dtype is assigned the value 2.
        let dtype = ctype === 1 ? 0 : ctype === 2 ? 1 : 2;
        if (
          (Number(total) >= Number(pvalue) &&
            etype == 1 &&
            currentDate >= formattedEfromDate &&
            currentDate <= formattedEtoDate) ||
          etype == 0
        ) {
          let amount = 0;
          for (let l = 0; l < offer_products_array.length; l++) {
            let product = parseInt(offer_products_array[l]);
            let productExists = cartItems.some(
              cartProduct => cartProduct.prod_id === product
            );
            if (productExists) {
              let specificProduct = cartItems.find(
                cartProduct => cartProduct.prod_id === product
              );
              let mrp = specificProduct.mrp;
              let qty = specificProduct.qty;
              amount += mrp * qty;
            }
          }

          if (amount >= pvalue) {
            let damt;
            if (ctype !== 1) {
              damt = dvalue;
            } else {
              damt = (Number(amount) * (dvalue / 100)).toFixed(2);
            }
            const generateCoupon = await couponGenerate({
              logTrace,
              query: {
                sid,
                dvalue: damt,
                billno,
                location,
                counter_no,
                outlet_id,
                eto,
                dtype
              },
              userDetails
            });
            couponDetailsArray.push({
              sname,
              code: generateCoupon,
              validity: etoDate,
              sdesc: sdesc
            });
            console.log("discount" + damt);
          }
        }
      }
    }
    return couponDetailsArray;
  };
}
function getCurrentDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(currentDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function couponGenerateServices(fastify) {
  const { insertCoupon } = productRepo(fastify);
  return async ({ logTrace, query, userDetails }) => {
    const knex = fastify.knexMedical;
    const { sid, dvalue, billno, location, counter_no, eto, dtype } = query;
    let paddedLocation = location.toString().padStart(3, "0");
    let paddedSid = sid.toString().padStart(3, "0");
    let paddedCounter_no = counter_no.toString().padStart(2, "0");
    let paddedBillno = billno.toString().padStart(5, "0");
    let code = paddedLocation + paddedSid + paddedCounter_no + paddedBillno;
    const response = await insertCoupon.call(knex, {
      logTrace,
      input: {
        code,
        eto,
        dvalue,
        flag: 0,
        dtype
      },
      userDetails
    });
    return code;
  };
}
function insertSpecialCouponService(fastify) {
  const { insertSpecialCoupon, specialCouponIssue } = productRepo(fastify);
  const settingInfo = settingServices.settingServices(fastify);
  return async ({ body, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const users_id = userDetails.id;
    const currentDate = getCurrentDate();
    const { counter_no, coupon } = body;

    let location = coupon.substring(0, 3);

    const settings = await settingInfo.call(knex, {
      users_id,
      logTrace,
      userDetails
    });
    console.log("ss", settings.location, location);

    if (settings.location != location) {
      return { success: false, message: "Invalid Coupon Code" };
    }
    const response1 = await specialCouponIssue.call(knex, {
      logTrace,
      coupon_code: coupon,
      users_id: users_id,
      currentDate,
      userDetails
    });

    if (response1) {
      const response = await insertSpecialCoupon.call(knex, {
        logTrace,
        body,
        users_id,
        userDetails
      });
      console.log("response", response);
      return response;
    } else {
      return { success: false };
    }
  };
}

module.exports = {
  specialCouponService,
  couponGenerateServices,
  insertSpecialCouponService
};
