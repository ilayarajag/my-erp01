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
function billSummaryServices(fastify) {
  const {
    billSave,
    YearSaleSave,
    CounterSaleSave,
    ItemDetailsSave,
    MemberItemSave,
    GroupSalesSave,
    HourSalesSave,
    SchemaLogSave,
    OfferLogSave,
    LoyalityPointSave,
    productmasterblncupdate
  } = billRepo(fastify);
  const getCart = getCartServices.getCartServices(fastify);
  const specialCoupon = specialCouponServices.specialCouponService(fastify);
  const getbillnoInfo = billnoServices.getbillnoInfoInfoService(fastify);
  const settingInfo = settingServices.settingServices(fastify);
  const newmemberInfo = newmemberservices.newmemberservices(fastify);
  const getloyality = loyaltypointservices.loyaltypointservices(fastify);
  const getoutletmemberInfo = outletinfoServices.getOutletMembersInfoService(fastify);
const getPaymentData = paymentServices.getPaymentData(fastify);
  return async ({ logTrace, query, body, userDetails }) => {
    const knex = fastify.knexMedical;
    const users_id = userDetails.id;
    const counter_no = body.counter_no;
    const outlet_id = body.outlet_id;
    const is_card = body.is_card;
    const name = body.name || "";
    const mobile = body.mobile || "";
    const bags = body.bags || 0;
    const previous_points = body.previous_points || 0;
    const current_bill_points = body.current_bill_points || 0;
    const is_radio = body.is_radio;
    const new_user = body.new_user;
    const dis_amt = body.dis_amt;
    const round_off_amt = body.round_off_amt;
    const customer_id = body.customer_id || null;
    const mode = body.mode;
    const customer_det = body.customer_det;

    const currentDate = getCurrentDate();
    const currentTime = getCurrentTime();
 console.log("iscard",is_card);
 
    const cartItems = await getCart({
      logTrace,
      query: {
        users_id,
        counter_no,
        outlet_id
      }
    });
 console.log("cartItems",cartItems);
 
 
    const getBillNo = await getbillnoInfo.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      body: { counter_no: counter_no, outlet_id: outlet_id },
      logTrace,
      userDetails
    });
     var member_id =  null;
      var member_name =  null;
      var member_mobile =  null;
    if(customer_id){
       const getMemberInfo = await getoutletmemberInfo.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      params: { member_id: customer_id },
      logTrace,
      userDetails
    });
    const memberInfo = getMemberInfo[0];
    console.log("mem",memberInfo);
       member_id = memberInfo.id;
       member_name = memberInfo.party_name;
       member_mobile = memberInfo.mobile;
  }
    const settings = await settingInfo.call(knex, {
      users_id,
      logTrace,
      userDetails
    });
    const settings5 = await newmemberInfo.call(knex, {
      users_id,
      logTrace,
      userDetails
    });
   
    const [cartItemsResult, getBillNoResult, settingsResult, settings5Result] =
      await Promise.all([cartItems, getBillNo, settings, settings5]);

    if (cartItemsResult.cart_lines.length <= 0) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "No Cart items found. add items to cart and proceed",
        property: "",
        code: "NOT_ACCEPTABLE"
      });
    }

    let billno = getBillNoResult.billno;
    const paymentMode = is_card === "yes" ? 1 : 10;
     var paymentMethodId = 1;
for (const payment_modes of mode) {

  if (
    (payment_modes.id === 2 || payment_modes.id === 3) &&
    Number(payment_modes.amount) > 0
  ) {
   
    var paymentMethod = await getPaymentData({
      counter_no,
      outlet_id,
      mode,
      input: {
        name: member_name,
        mobile: member_mobile,
        customer_id: member_id,
        users_id: users_id,
        billno: billno,
        is_card: paymentMode,
        counter_no: counter_no,
        bags: bags,
        currentDate: currentDate,
        cartItems: cartItemsResult
      },
      logTrace
    });
 paymentMethodId = paymentMethod.data.PlutusTransactionReferenceID || 0;
  
  }
   
}
  console.log("dddddddddddddd",paymentMethod);


    return {
      success: "true",
      billno: billno,
      coupon_details: SpecialCouponResult
    };
  };
}

module.exports = { billSummaryServices,  };
