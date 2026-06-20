const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const productRepo = require("../repository/product");
const { isEmpty } = require("lodash");

function getProductInfoInfoService(fastify) {
  const { getProductInfo } = productRepo(fastify);
  return async ({ params, body, outlet_id, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    let { barcode, code } = body;
    if (isEmpty(code)) {
      code = code;
    } else {
      code = code;
    }
    let datas;
    // check packed items or not
    if (code.length == 12) {
      datas = checkPackItemOrNot(code);
     // console.log("datas", datas);

      code = datas.code;
    }
    //console.log("code", code);

    const getClearanceSales = clearanceServices(fastify);

    const clearanceItems = await getClearanceSales({
      logTrace,
      outlet_id,
      query: {
        barcode: code,
        is_clearence_flag: false
      },
      userDetails
    });
   // console.log("clearanceItems", clearanceItems);
    
  if (clearanceItems.is_clearence_flag) {
      // return clearanceItems;
      let min_warn_stock = clearanceItems.min_warn;
      let negative_stock = clearanceItems.negative_stock;
      let balance_stock = clearanceItems.balance;
      let min_stock = clearanceItems.min_stock;
      let min_stock_waring_message = "";
      let min_stock_waring_flag = false;
      if (min_warn_stock == 1) {
        if (balance_stock <= min_stock) {
          min_stock_waring_message =
            "Product reaches the Minimum Stock Level...";
          min_stock_waring_flag = true;
        }
      }
      if (negative_stock == 0 && balance_stock <= 0) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_ACCEPTABLE,
          message: "Negative Stock Not Allowed...",
          property: "",
          code: "NOT_ACCEPTABLE"
        });
      }
      return {
        is_clearence_flag: clearanceItems.is_clearence_flag,
        min_stock_waring_message,
        min_stock_waring_flag,
        prod_id: clearanceItems.prod_id,
        prod_code: clearanceItems.prod_code,
        prod_name: clearanceItems.prod_name,
        prod_uom: clearanceItems.prod_uom,
        mrp: clearanceItems.cmrp,
        original_sales_rate: clearanceItems.csrate,
        sales_rate: clearanceItems.csrate,
        discount_rate: clearanceItems.cmrp - clearanceItems.csrate,
        discount_percentage: 0,
        purchase_rate: clearanceItems.purchase_rate,
        uom_name: clearanceItems.uom_name,
        qty: datas && datas.qty !== undefined ? datas.qty : 0,
        sgst: clearanceItems.sgst,
        cgst: clearanceItems.cgst,
        cess: clearanceItems.cess,
        gst : clearanceItems.gst,
        Vattype: clearanceItems.Vattype,
        vatcalc: clearanceItems.vatcalc,
        mcid: clearanceItems.mcid,
        bcid: clearanceItems.bcid,
        negative_stock: clearanceItems.allow_neg_stk,
        rate_edit: clearanceItems.rate_edit,
        decimal1: clearanceItems.decimal1,
        Wscale: clearanceItems.Wscale,
        LPoint: clearanceItems.lpoint,
        active: clearanceItems.active,
        main_category_id: clearanceItems.main_category_id,
        brand_name: clearanceItems.brand_name,
        sub_category_id: clearanceItems.sub_category_id,
        uom_id: clearanceItems.uom_id,
        head_id: clearanceItems.head_id,
        hsn: clearanceItems.hsn,
        mpq: clearanceItems.mpq,
        gr_wt: clearanceItems.gr_wt,
        stkhold: clearanceItems.stkhold,
        ptax: clearanceItems.ptax,
        stax: clearanceItems.stax,
        min_stock: clearanceItems.min_stock,
        allow_neg_stk: clearanceItems.allow_neg_stk,
        negative_stock: clearanceItems.allow_neg_stk,
        rate_edit: clearanceItems.rate_edit,
        decimal1: clearanceItems.decimal1,
        lpoint: clearanceItems.lpoint,
        cpoint: clearanceItems.cpoint,
        batch_no: clearanceItems.batch_no,
        outlet_id: clearanceItems.outlet_id,
        category_name: clearanceItems.category_name,
        sub_category_name: clearanceItems.sub_category_name,
        uom_name: clearanceItems.uom_name,
      };
    }
    if (!clearanceItems.is_clearence_flag) {
      const response = await getProductInfo.call(knex, {
        params,
        body,
        outlet_id,
        barcode: code,
        logTrace,
        userDetails
      });
      const getOffers = getOffersServices(fastify);
      const getOfferRate = await getOffers({
        logTrace,
        outlet_id,
        query: {
          prod_id: response.prod_id,
          prod_code: response.prod_code,
          is_offer_flag: false
        },
        userDetails
      });

      let min_warn_stock = response.min_warn;
      let negative_stock = response.negative_stock;
      let balance_stock = response.balance;
      let min_stock = response.min_stock;
      let min_stock_waring_message = "";
      let min_stock_waring_flag = false;
      let sales_rate = isEmpty(response.sales_rate)
        ? 0
        : response.sales_rate;


      let mrp_rate = 0;
      let discount_rate = 0;
      let discount_percentage = 0;
      if (min_warn_stock == 1) {
        if (balance_stock <= min_stock) {
          min_stock_waring_message =
            "Product reaches the Minimum Stock Level...";
          min_stock_waring_flag = true;
        }
      }
      if (negative_stock == 0 && balance_stock <= 0) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_ACCEPTABLE,
          message: "Negative Stock Not Allowed...",
          property: "",
          code: "NOT_ACCEPTABLE"
        });
      }
      if (getOfferRate.discountInfo) {
        mrp_rate =
          response.mrp -
          response.mrp * (getOfferRate.discountInfo.amount / 100);
        sales_rate = mrp_rate;
       // console.log("dissales_rate", sales_rate);
        
        discount_rate =  response.mrp - mrp_rate;
         //console.log("dissales_rate", sales_rate);
        // discount_percentage = response.mrp * (getOfferRate.discountInfo.amount / 100);
        discount_percentage = discount_rate /  response.mrp * 100;

      }
   
      if (getOfferRate.priceOffInfo) {
        mrp_rate = response.mrp - getOfferRate.priceOffInfo.amount;
        sales_rate = mrp_rate;
         //console.log("pricesales_rate",sales_rate);
        discount_rate = response.mrp - mrp_rate;
        //console.log("pricediscount",discount_rate);
        
       discount_percentage = discount_rate / sales_rate * 100;
       //console.log("pricediscount_rate",discount_rate);
       
      // console.log("pricediscount_percentage",discount_percentage);
       
      }


      if (getOfferRate.specialOfferInfo) {
        mrp_rate = getOfferRate.specialOfferInfo.amount;
        // console.log("splmrp",mrp_rate);
        // console.log("remrp",response.mrp);
        
        sales_rate = mrp_rate;
        //console.log("splsales_rate",sales_rate);
        discount_rate = response.mrp - sales_rate;
        //console.log("spldiscount_rate",discount_rate);
        discount_percentage = discount_rate / sales_rate * 100;
       //console.log("spldiscount_percentage",discount_percentage);
       
      }
    
      // return getOfferRate;
      return {
        is_clearence_flag: false,
        min_stock_waring_message,
        min_stock_waring_flag,
        prod_id: response.prod_id,
        prod_code: response.prod_code,
        prod_name: response.prod_name,
        prod_uom: response.uom_id,
        mrp: response.mrp,
        original_sales_rate: response.sales_rate,
        sales_rate: response.sales_rate,
        discount_rate: discount_rate,
        discount_percentage: discount_percentage,
        purchase_rate: response.purchase_rate,
        uom_name: response.uom_name,
        qty: datas && datas.qty !== undefined ? datas.qty : 0,
        sgst: response.gst,
        cgst: response.gst,
        gst: response.gst,
        cess: response.cess,
        Vattype: response.type_id,
        vatcalc: response.vatcalc,
        mcid: response.mcid,
        bcid: response.bcid,
        negative_stock: response.allow_neg_stk,
        rate_edit: response.rate_edit,
        decimal1: response.decimal1,
        Wscale: response.Wscale,
        LPoint: response.lpoint,
        active: response.active,
        main_category_id: response.main_category_id,
        brand_name: response.brand_name,
        sub_category_id: response.sub_category_id,
        bcid: response.bcid,
        mcid: response.mcid,
        uom_id: response.uom_id,
        head_id: response.head_id,
        hsn: response.hsn,
        mpq: response.mpq,
        gr_wt: response.gr_wt,
        stkhold: response.stkhold,
        ptax: response.ptax,
        stax: response.stax,
        min_stock: response.min_stock,
        allow_neg_stk: response.allow_neg_stk,
        negative_stock: response.allow_neg_stk,
        rate_edit: response.rate_edit,
        decimal1: response.decimal1,
        lpoint: response.lpoint,
        cpoint: response.cpoint,
        batch_no: response.batch_no,
        outlet_id: response.outlet_id,
        category_name: response.category_name,
        sub_category_name: response.sub_category_name,
        uom_name: response.uom_name,


      };
    }
  };
}



function checkPackItemOrNot(barcode) {
  if (barcode.length == 12) {
    const code = barcode.substring(0, 6);
    const kgs = parseFloat(barcode.substring(6, 8));
    const decimal = parseFloat(
      barcode.substring(8, 9) + barcode.substring(9, 12)
    );
    const decimal_value = kgs + decimal;
    return {
      code,
      kgs,
      decimal,
      qty: decimal_value
    };
  } else {
    // Barcode doesn't match the expected format
    throw new Error("Invalid barcode format");
  }
}
function clearanceServices(fastify) {
  const { getClearanceInfo } = productRepo(fastify);
  return async ({ logTrace, query, userDetails }) => {
    const knex = fastify.knexMedical;
    const response = await getClearanceInfo.call(knex, {
      logTrace,
      barcode: query.barcode,
      userDetails
    });
    return response;
  };
}

function getOffersServices(fastify) {
  const {
    getSpecialOfferInfo,
    getDiscountInfo,
    getPriceOffInfo
  } = productRepo(fastify);
  return async ({ logTrace, outlet_id, query, userDetails }) => {
    const knex = fastify.knexMedical;
    const currentDate = getCurrentDate();

    const promise2 = await getSpecialOfferInfo.call(knex, {
      logTrace,
      prod_id: query.prod_id,
      prod_code: query.prod_code,
      gdate: currentDate,
      userDetails,
      outlet_id
    });
    const promise3 = await getDiscountInfo.call(knex, {
      logTrace,
      prod_id: query.prod_id,
      prod_code: query.prod_code,
      gdate: currentDate,
      userDetails,
      outlet_id
    });
    const promise4 = await getPriceOffInfo.call(knex, {
      logTrace,
      prod_id: query.prod_id,
      prod_code: query.prod_code,
      gdate: currentDate,
      userDetails,
      outlet_id
    });

    const [specialOfferInfo, discountInfo, priceOffInfo] = await Promise.all([
      promise2,
      promise3,
      promise4
    ]);
    // console.log("specialOfferInfo", specialOfferInfo);
    // console.log("discountInfo", discountInfo);
    // console.log("priceOffInfo", priceOffInfo);



    return {
      specialOfferInfo: specialOfferInfo,
      discountInfo: discountInfo,
      priceOffInfo: priceOffInfo
    };
  };
}
function getCurrentDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(currentDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

module.exports = {
  getProductInfoInfoService,
  clearanceServices,
  getOffersServices
};
