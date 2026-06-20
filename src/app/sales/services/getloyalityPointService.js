const settingServices = require("../services/settingServices");
const billnoServices = require("../../billno/services/billnoServices");
const outletinfoServices = require("../../catalog/outletmembers/services/outletMembersServices");
const loyaltypointservices = require("./loyaltypointservices");
const productRepo = require("../repository/product");
function getCurrentDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getCurrentTime() {
  const d = new Date();
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const amOrPm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes} ${amOrPm}`;
}

function getloyalityPointServices(fastify) {
  const { getItemsLoyalityCart,getLoyaltyApplyDetails } = productRepo(fastify);
  const settingInfo = settingServices.settingServices(fastify);
  const getbillnoInfo = billnoServices.getbillnoInfoInfoService(fastify);
  const getCart = (...args) => {
    const { getCartsummaryServices } = require("./getCartsummaryServices");
    return getCartsummaryServices(fastify)(...args);
  };
  const getloyality = loyaltypointservices.loyaltypointservices(fastify);
  const getoutletmemberInfo = outletinfoServices.getOutletMembersInfoService(fastify);
  const updateMemberInfo = outletinfoServices.putOutletMemberService(fastify);
 

  const knex = fastify.knexMedical;

  return async (request, reply) => {
    try {
      const { body, params, logTrace, userDetails } = request;

      const users_id = userDetails.id;
      const counter_no = body.counter_no || body.counter_id;
      const outlet_id = params.outlet_id;
      const customer_id = body.customer_id || params.customer_id;
      const is_apply_loyalty = body.is_apply_loyalty;
      // const getItemsLoyalityCartResponse = await getItemsLoyalityCart.call(knex, {
      //   logTrace,
      //   body,
      //   users_id,
      //   counter_no,
      //   outlet_id,
      //   redeem_amount
      // });
     // console.log("getItemsLoyalityCartResponse",getItemsLoyalityCartResponse);
      const settings = await settingInfo.call(knex, {
        users_id,
        logTrace,
        userDetails
      });

      const Plimit = Number(settings.plimit || 0);
      const PPoint = Number(settings.ppoint || 0);
      const Rpoint = Number(settings.rpoint || 0);
      const Ramount = Number(settings.ramount || 0);
      const Mcard = Number(settings.mcard || 0);
     
      const cartItems = await getCart({
        logTrace,
        query: {
          users_id,
          counter_no,
          outlet_id
        }
      });

      const billAmount = Number(cartItems.cart_net_total || 0);
    console.log("billAmount",billAmount);
    console.log("Plimit",Plimit);
    console.log("PPoint",PPoint);
      // Points earned on this bill: cart_net_total / ppoint when bill >= plimit
      let current_bill_points = 0;
      if (billAmount >= Plimit && PPoint > 0) {
        current_bill_points = Number((billAmount / PPoint).toFixed(2));
      }

      var previous_points = Number(0);
      let member_name = "";
      let member_mobile = "";
    
      if (customer_id) {
        const getMemberInfo = await getoutletmemberInfo.call(knex, {
          users_id,
          counter_no,
          outlet_id,
          params: { member_id: customer_id },
          logTrace,
          userDetails
        });

        const memberInfo = (Array.isArray(getMemberInfo) ? getMemberInfo[0] : getMemberInfo) || {};
        previous_points = Number(memberInfo.balance_points || 0);
        member_name = memberInfo.party_name || "";
        member_mobile = memberInfo.mobile || "";
      }
      var final_total = Number(0);
      var redeem_amount = Number(0);
      var redeem_points = Number(0);
      var final_points = Number(0);
      const total_available_points = Number(
        (previous_points + current_bill_points).toFixed(2)
      );
     // console.log("total_available_points",total_available_points);
      const shouldCalculateRedeem =
        is_apply_loyalty !== false &&
        Boolean(customer_id) &&
        Mcard === 1 &&
        billAmount >= Plimit;

      if (shouldCalculateRedeem) {
        const getBillNo = await getbillnoInfo.call(knex, {
          users_id,
          userDetails,
          body: { counter_no, outlet_id },
          logTrace
        });

        const loyaltyResult = await getloyality({
          logTrace,
          previous_points,
          current_bill_points,
          Plimit,
          PPoint,
          Rpoint,
          Ramount,
          input: {
            billno: getBillNo?.billno || 0,
            name: member_name,
            mobile: member_mobile,
            users_id,
            is_card: body.is_card || 0,
            counter_no,
            bags: body.bags || 0,
            currentDate: getCurrentDate(),
            currentTime: getCurrentTime(),
            cartItems
          }
        });

        if (loyaltyResult) {
          redeem_points = Number(loyaltyResult.at_points || 0);
          redeem_amount = Number(loyaltyResult.at_amt || 0);
        }
                let final_loyality = await getLoyaltyApplyDetails.call(knex, {
          users_id,
          counter_no,
          outlet_id,
          logTrace,
          input: {
            billno:  getBillNo?.billno || 0,
           customer_id
          }
        });
        console.log("final_loyality",final_loyality);
        if (final_loyality) {
          redeem_points = Number(final_loyality.redeemed_points || 0);
         // redeem_amount = Number(final_loyality.redeemed_points || 0);
        }
      }

      if (Number(body.points || 0) > 0) {
        redeem_points = Number(body.points);
      }
      // if (redeem_points > total_available_points) {
      //   redeem_points = total_available_points;
      // }

      // When redeeming points (at_amt is 0), 1 point = 1 rupee off the bill
      if (redeem_points > 0 && redeem_amount === 0) {
        redeem_amount = redeem_points;
      }

      redeem_amount = Math.min(redeem_amount, billAmount);
      // if (redeem_amount > 0 && redeem_points > redeem_amount) {
      //   redeem_points = redeem_amount;
      // }

       final_points = total_available_points - redeem_points;
      if (final_points < 0) {
        final_points = 0;
      }
      final_points = Number(final_points.toFixed(2));

       final_total = Number(
        Math.max(0, billAmount - redeem_amount).toFixed(2)
      );

      if (customer_id && is_apply_loyalty === true) {
        // await updateMemberInfo.call(knex, {
        //   users_id,
        //   counter_no,
        //   outlet_id,
        //   member_id: customer_id,
        //   body: { balance_points: final_points },
        //   params: { member_id: customer_id },
        //   logTrace,
        //   userDetails
        // });

      
      }
      // console.log("redeem_points",redeem_points);
      // console.log("redeem_amount",redeem_amount);
      // console.log("final_points",final_points);

        
      
      return {
        success: true,
        data: {
          previous_points,
          current_bill_points,
          earned_points: current_bill_points,
          total_available_points,
          redeem_points,
          redeem_amount,
          //loyalty_points_used: redeem_points,
          final_points,
          final_total,
          bill_amount: final_total
        }
      };
    } catch (error) {
      
      throw error;

    }
  };
}

module.exports = {
  getloyalityPointServices
};
