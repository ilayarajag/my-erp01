const billRepo = require("../repository/product");
const pendingbillRepo = require("../repository/pendingbill");

const getCartServices = require("./getCartServices");
const specialCouponServices = require("./specialCouponServices");
const billnoServices = require("../../billno/services/billnoServices");
const settingServices = require("./settingServices");
const loyaltypointservices = require("./loyaltypointservices");
const newmemberservices = require("./newmemberservices");
const outletinfoServices = require("../../catalog/outletmembers/services/outletMembersServices");
// const paymentServices = require("../../payment/services/paymentGatwayService");

const paymentServices = require("../../payment/services/paymentGatwayService");
const { functions } = require("lodash");

function getCurrentDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(currentDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function getCurrentTime() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(currentDate.getDate()).padStart(2, "0");
  const hours = String(currentDate.getHours()).padStart(2, "0");
  const minutes = String(currentDate.getMinutes()).padStart(2, "0");
  const amOrPm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert hours to 12-hour format
  return `${formattedHours}:${minutes} ${amOrPm}`;
}
function cartPrintSummaryServices(fastify) {
  const {
    getBillPrint,
    getCompanyInfo
  } = billRepo(fastify);
  const getCart = getCartServices.getCartServices(fastify);
  const specialCoupon = specialCouponServices.specialCouponService(fastify);
  const getbillnoInfo = billnoServices.getbillnoInfoInfoService(fastify);
  const settingInfo = settingServices.settingServices(fastify);
  const newmemberInfo = newmemberservices.newmemberservices(fastify);
  const getloyality = loyaltypointservices.loyaltypointservices(fastify);
  const getoutletmemberInfo = outletinfoServices.getOutletMembersInfoService(fastify);
  const getPaymentData = paymentServices.getPaymentData(fastify);
  return async ({ logTrace, query, params, body, userDetails }) => {
    const knex = fastify.knexMedical;
    const users_id = userDetails.id;
    const username = userDetails.user_name;
    const { outlet_id, counter_no, bill_no } = params;

    const currentDate = getCurrentDate();
    const currentTime = getCurrentTime();

    // const cartItems = await getCart({
    //   logTrace,
    //   query: {
    //     users_id,
    //     counter_no,
    //     outlet_id
    //   }
    // });
    const billInfo = await getBillPrint.call(knex, {
      counter_no, users_id, username, outlet_id, bill_no,
    });

    const companyInfo = await getCompanyInfo.call(knex, {
      logTrace,
      userDetails
    });
    console.log("cccccccc", billInfo);


    const getBillNo = await getbillnoInfo.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      body: { counter_no: counter_no, outlet_id: outlet_id },
      logTrace,
      userDetails
    });
    var member_id = null;
    var member_name = null;
    var member_mobile = null;
    var wallet_amount = null;
   var balance_point = null;
 if(billInfo[0].customer_id !== null){
       const getMemberInfo = await getoutletmemberInfo.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      params: { member_id: billInfo[0].customer_id },
      logTrace,
      userDetails
    });
    const memberInfo = getMemberInfo[0];
    console.log("mem",memberInfo);
       member_id = memberInfo.id;
       member_name = memberInfo.party_name;
       member_mobile = memberInfo.mobile;
       wallet_amount = memberInfo.wallet_amount;
       balance_point = memberInfo.balance_points;
  }
    const [getBillNoResult,] =
      await Promise.all([getBillNo,]);

    // if (cartItemsResult.cart_lines.length <= 0) {
    //   throw CustomError.create({
    //     httpCode: StatusCodes.NOT_ACCEPTABLE,
    //     message: "No Cart items found. add items to cart and proceed",
    //     property: "",
    //     code: "NOT_ACCEPTABLE"
    //   });
    // }

    let billno = getBillNoResult.billno;

    return {
      success: "true",
      shop_details: {
        shop_name: companyInfo.Fname,
        address: companyInfo.Add1,
        city:companyInfo.Add2 +" "+ companyInfo.City,
        phone: companyInfo.Phone,
        gstin: companyInfo.Tngst,
        fssai_no: companyInfo.fssai
      },
      bill_details: {
        bill_no: billInfo[0].billno,
        bill_date: billInfo[0].bill_date,
        customer_mobile: billInfo[0].customer_mobile,
        pay_mode: billInfo[0].pay_mode,
        operator_name: username,
        counter_no: counter_no,
        invoice_type: "manual",
        wallet_amount : wallet_amount,
        balance_point : balance_point
      },

      cart_lines: billInfo.map((item, index) => ({
        sno: index + 1,
        prod_name: item.prod_name,
        hsn: item.hsn,
        rate: item.rate,
        qty: item.qty,
        mrp: item.amount,
        total_amount: item.rate * item.qty,
        roff: item.roff,
        discount: item.discount,
        barcode: item.barcode,
        uom_name: item.uom_name,
        gst: item.gst || 0
      })),

      totals: {
        sub_total: billInfo.reduce(
          (sum, item) => sum + Number(item.total_amount || 0),
          0
        ),

        round_off: 0,

        total_amount: billInfo.reduce(
          (sum, item) => sum + Number(item.rate || 0),
          0
        ),

        total_qty: billInfo.reduce(
          (sum, item) => sum + Number(item.qty || 0),
          0
        ),

        total_bags: 1,

        total_sgst: billInfo.reduce(
          (sum, item) => sum + Number(item.gst || 0),
          0
        ),

        total_cgst: billInfo.reduce(
          (sum, item) => sum + Number(item.gst || 0),
          0
        ),

        total_gst: billInfo.reduce(
          (sum, item) => sum + Number(item.gst || 0),
          0
        ),
        cess: billInfo.reduce(
          (sum, item) => sum + Number(item.cess || 0),
          0
        ),
      },
      payment_details: {
        pay_mode: billInfo[0].pay_mode,
        paid_amount: billInfo[0].amount,
        balance_amount: billInfo[0].balance_amt
      },
      barcode: "aaaaaaaaaaaa",
      whatsapp_number: userDetails.number,
      thank_you_message: "thank you for shopping with us",
      billno: billno,
    };
  };

}
function getcartPrintSummaryServices(fastify) {
  const { billPdfSummary } = billRepo(fastify);

  // Main cart summary service
  const cartResponseService = cartPrintSummaryServices(fastify);

  return async ({ body, params, logTrace, userDetails }) => {
    const knex = fastify.knexMedical;

    const { outlet_id, counter_no, bill_no } = params;

    // Get JSON summary response
    const cartInfo = await cartResponseService({
      logTrace,
      params,
      body,
      userDetails,
      query: {
        users_id: userDetails.id,
        counter_no,
        outlet_id,
        bill_no
      }
    });

    // Generate HTML print response
    const response = await billPdfSummary.call(knex, {
      cartInfo,
      body,
      params,
      counter_no,
      outlet_id,
      bill_no,
      logTrace,
      userDetails
    });

    return response;
  };
}

module.exports = { cartPrintSummaryServices, getcartPrintSummaryServices };
