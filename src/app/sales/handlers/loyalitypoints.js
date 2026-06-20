const loyaltypointservices = require("../services/loyaltypointservices");
const settingServices = require("../services/settingServices");
const billnoServices = require("../../billno/services/billnoServices");
const getCartServices = require("../services/getCartServices");
const newmemberservices = require("../services/newmemberservices");
const outletinfoServices = require("../../catalog/outletmembers/services/outletMembersServices");



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


  var currentDate = getCurrentDate();
  var currentTime = getCurrentTime();


function loyalityHandler(fastify) {
    const getloyality =  loyaltypointservices.loyaltypointservices(fastify);
    const settingInfo = settingServices.settingServices(fastify);
    const getbillnoInfo = billnoServices.getbillnoInfoInfoService(fastify);
    const getCart = getCartServices.getCartServices(fastify);
    const newmemberInfo = newmemberservices.newmemberservices(fastify);
    const getoutletmemberInfo = outletinfoServices.getOutletMembersInfoService(fastify);
  


    const knex = fastify.knexMedical;

  return async (request, reply) => {
    
    const { body, params, logTrace, userDetails } = request;
    var users_id = userDetails.id;
    const counter_no = body.counter_no;
    const outlet_id = params.outlet_id;
    const is_card = body.is_card;
    const name = body.name || "";
    const mobile = body.mobile || "";
    const bags = body.bags || 0;
   
    var current_bill_points= body.current_bill_points ||0;
    const is_radio=body.is_radio;
    const new_user=body.new_user;
    const customer_id= body.customer_id;
    let member_id = null;
    let member_name = null;
    let member_mobile = null;
    let wallet_amount = 0;
    let previous_points = 0;
    console.log("counter_no",counter_no,outlet_id);
    
    const getBillNo = await getbillnoInfo.call(knex, {
        users_id,
        userDetails,
        body: { counter_no: counter_no, outlet_id: outlet_id },
        logTrace
      });
      const cartItems = await getCart({
        logTrace,
        query: {
          users_id,
          counter_no,
          outlet_id
        }
      });


    const settings = await settingInfo.call(knex, {
        users_id,
        logTrace,
        userDetails
      });
      const  settings5= await newmemberInfo.call(knex, {
        users_id,
        logTrace,
        userDetails
      });
      current_bill_points = cartItems.cart_net_total/settings.ppoint;
 if (customer_id) {
      const getMemberInfo = await getoutletmemberInfo.call(knex, {
        users_id,
        counter_no,
        outlet_id,
        params: { member_id: customer_id },
        logTrace,
        userDetails
      });
      const memberInfo = getMemberInfo[0];
      //console.log("memberInfo",memberInfo);

      member_id = memberInfo.id || null;
      member_name = memberInfo.party_name || null;
      member_mobile = memberInfo.mobile || null;
      previous_points = memberInfo.balance_points || 0;
      wallet_amount = memberInfo.wallet_amount || 0;
    }

    let billno = getBillNo.billno;

      const Plimit=settings.plimit;
      const Mcard=settings.mcard;
      const PPoint=settings.ppoint;
      const Rpoint=settings.rpoint;
      const Ramount=settings.ramount;
       const OpOffer=settings5.opoffer;
       console.log("Plimit",Plimit,Mcard,PPoint,Rpoint,Ramount,OpOffer);
       
    const data_loyality=[];
    if(Mcard ==1){
      console.log("dddddddddddd",Mcard);
      
    const getloyalitypoint = await getloyality({
        logTrace,
        previous_points,
        current_bill_points,
        userDetails,
        Plimit,
        PPoint,
        Rpoint,
        Ramount,
          input: {
          billno: billno,
          name: member_name,
          mobile: member_mobile,
          users_id: users_id,
          is_card: is_card,
          counter_no: counter_no,
          bags: bags,
          currentDate: currentDate,
          currentTime: currentTime,
          cartItems: cartItems
        },
    });
    console.log("loyaltyResponse",getloyalitypoint);
   var loyaltyResponse = {};
    if(getloyalitypoint){
  loyaltyResponse = {
    loyalty_points_used:
        getloyalitypoint.loyalty_points_used || 0,

    redeem_amount:
        getloyalitypoint.at_amt ||
        getloyalitypoint.at_points ||
        0,

    final_total:
        cartItems.cart_net_total -
        (getloyalitypoint.at_amt || getloyalitypoint.at_points || 0)
};
console.log("loyaltyResponse",loyaltyResponse);
data_loyality.push(loyaltyResponse);
console.log("data_loyality",data_loyality);
    }else{
         loyaltyResponse = {
            loyalty_points_used:
                0,
    
            redeem_amount:
                0,
    
            final_total:
                cartItems.cart_net_total || 0
        };
        console.log("loyaltyResponse",loyaltyResponse);
        data_loyality.push(loyaltyResponse);
        console.log("data_loyality",data_loyality);
    }
return reply.code(200).send({
    success: true,
    data: loyaltyResponse
});
    }
//   }
  };
}

module.exports = loyalityHandler;


