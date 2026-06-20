const paymentRepo = require("../../payment/repository/payment");
const paymentProviderRepo = require("../../payment/repository/payment-provider");
const getCartServices = require("../../sales/services/getCartServices");
const specialCouponServices = require("../../sales/services/specialCouponServices");
const billnoServices = require("../../billno/services/billnoServices");
const settingServices = require("../../sales/services/settingServices");
const loyaltypointservices = require("../../sales/services/loyaltypointservices");
const newmemberservices = require("../../sales/services/newmemberservices");
const outletinfoServices = require("../../catalog/outletmembers/services/outletMembersServices");
const paymentServices = require("../../payment/services/paymentGatwayService");

function getCurrentDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentTime() {
  const currentDate = new Date();

  const hours = currentDate.getHours();
  const minutes = String(currentDate.getMinutes()).padStart(2, "0");

  const amOrPm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;

  return `${formattedHours}:${minutes} ${amOrPm}`;
}

function getPaymentData(fastify) {
  const { getPaymentgateway, getPaymentProvider } = paymentRepo(fastify);

  const getCart = getCartServices.getCartServices(fastify);
  const getbillnoInfo = billnoServices.getbillnoInfoInfoService(fastify);
  const getoutletmemberInfo =
    outletinfoServices.getOutletMembersInfoService(fastify);

  return async ({ logTrace, query, body, userDetails }) => {
    const knex = fastify.knexMedical;

    const users_id = userDetails.id;
    const counter_no = body.counter_no;
    const outlet_id = body.outlet_id;
    const is_card = body.is_card;
    const bags = body.bags || 0;
    const customer_id = body.customer_id || null;
    const mode = body.mode || [];
    const pay_type_id = body.pay_type_id;

    const currentDate = getCurrentDate();

    const cartItems = await getCart({
      logTrace,
      query: {
        users_id,
        counter_no,
        outlet_id
      }
    });

    const getBillNo = await getbillnoInfo.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      body: {
        counter_no,
        outlet_id
      },
      logTrace,
      userDetails
    });
     var member_id = null;
    var member_name = null;
    var member_mobile = null;
 if(customer_id){
    const getMemberInfo = await getoutletmemberInfo.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      params: {
        member_id: customer_id
      },
      logTrace,
      userDetails
    });

    const memberInfo = getMemberInfo[0] || {};

     member_id = memberInfo.id;
     member_name = memberInfo.party_name;
     member_mobile = memberInfo.mobile;
  }
    if (cartItems.cart_lines.length <= 0) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "No Cart items found. add items to cart and proceed",
        property: "",
        code: "NOT_ACCEPTABLE"
      });
    }

    const billno = getBillNo.billno;

    const paymentMode = is_card === "yes" ? 1 : 10;

    let paymentMethodId = 0;
    let paymentMethod = null;
    const pay_typeDetails = await getPaymentProvider.call(knex, {
      counter_no,
      users_id,
      outlet_id,
      pay_type_id,
      logTrace
    })

    const pay_type = pay_typeDetails.provider_name;
    if (pay_type === "Pinelabs") {


      for (const payment_modes of mode) {
        if (
          (payment_modes.id === 2 || payment_modes.id === 3) &&
          Number(payment_modes.amount) > 0
        ) {

          paymentMethod = await getPaymentgateway.call(knex, {
            counter_no,
            outlet_id,
            mode,
            pay_type,
            pay_type_id,
            input: {
              name: member_name,
              mobile: member_mobile,
              customer_id: member_id,
              users_id,
              billno,
              is_card: paymentMode,
              counter_no,
              bags,
              currentDate,
              cartItems
            },
            logTrace
          });

          console.log("paymentMethod", paymentMethod);

          paymentMethodId =
            paymentMethod?.data?.PlutusTransactionReferenceID || 0;
        }
      }

      console.log("paymentMethodId", paymentMethodId);


      // const paymentStatus = await getPaymentgatewayDetails.call(knex, {
      //   reference_id: paymentMethodId,
      //   logTrace
      // });
    }
    if (pay_type === "Paytm") {

      paymentMethodId = await getPaymentgateway.call(knex, {
        counter_no,
        outlet_id,
        mode,
        pay_type,
        pay_type_id,
        input: {
          name: member_name,
          mobile: member_mobile,
          customer_id: member_id,
          users_id,
          billno,
          is_card: paymentMode,
          counter_no,
          bags,
          currentDate,
          cartItems
        },
        logTrace
      });
    }
    return {
      success: true,
      billno,
      reference_no: paymentMethodId
    };
  };
}

function getPaymentStatus(fastify) {
  const { getPaymentgatewayDetails, getPaymentProvider } = paymentRepo(fastify);

  const getCart = getCartServices.getCartServices(fastify);
  const getbillnoInfo = billnoServices.getbillnoInfoInfoService(fastify);
  const getoutletmemberInfo =
    outletinfoServices.getOutletMembersInfoService(fastify);

  return async ({ logTrace, query, body, userDetails }) => {
    const knex = fastify.knexMedical;

    const users_id = userDetails.id;
    const counter_no = body.counter_no;
    const outlet_id = body.outlet_id;
    const is_card = body.is_card;
    const bags = body.bags || 0;
    const customer_id = body.customer_id;
    const mode = body.mode || [];
    const provider_id = body.provider_id;
    const reference_id = body.reference_id;
    const currentDate = getCurrentDate();

    const cartItems = await getCart({
      logTrace,
      query: {
        users_id,
        counter_no,
        outlet_id
      }
    });


    let paymentMethodId = 0;
    let paymentMethod = null;
    var paymentStatus = null;
 const pay_typeDetails = await getPaymentProvider.call(knex, {
      counter_no,
      users_id,
      outlet_id,
       pay_type_id:provider_id,
      logTrace
    })

    const pay_type = pay_typeDetails.provider_name;
    if (pay_type === "Pinelabs") {
      paymentStatus = await getPaymentgatewayDetails.call(knex, {
        reference_id: reference_id,
        users_id,
        pay_type,
        counter_no,
        outlet_id,
       provider_id,
        logTrace
      });
    }

    if (provider_id === "Paytm") {
        paymentStatus = await getPaymentgatewayDetails.call(knex, {
        reference_id: reference_id,
        users_id,
        pay_type,
        counter_no,
        outlet_id,
       provider_id,
        logTrace
      });
    }
     return paymentStatus;
  };
}

function cancelPaymentData(fastify) {
  const { cancelPaymentgateway } = paymentRepo(fastify);

  return async ({ logTrace, query, body, userDetails }) => {
    const knex = fastify.knexMedical;

    const users_id = userDetails.id;
    const counter_no = body.counter_no;
    const outlet_id = body.outlet_id;
    const reference_id = body.reference_id;
    const amount = body.amount;
    const pay_type_id = body.pay_type_id;

    const cancelpayment = await cancelPaymentgateway.call(knex, {
      logTrace,
      reference_id,
      users_id,
      counter_no,
      outlet_id,
      amount,
      pay_type_id
    });
     return cancelpayment;
  };

}

module.exports = {
  getPaymentData,
  cancelPaymentData,
  getPaymentStatus
};