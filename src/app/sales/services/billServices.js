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
const getCartSummaryServices = require("./getCartsummaryServices");
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

const getFinancialYear = (date = new Date()) => {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  if (month >= 4) {
    return `${year}_${year + 1}`;
  } else {
    return `${year - 1}_${year}`;
  }
};
function billSaveServices(fastify) {
  const {
    getItemsInCart,
    billSave,
    YearSaleSave,
    daySaleSave,
    CounterSaleSave,
    ItemDetailsSave,
    MemberItemSave,
    GroupSalesSave,
    HourSalesSave,
    SchemaLogSave,
    OfferLogSave,
    LoyalityPointSave,
    productmasterblncupdate,
    saveLoyaltyApplyDetailsupdate,
    getItemsLoyalityPointUpdate
  } = billRepo(fastify);
  const getCart = getCartSummaryServices.getCartsummaryServices(fastify);
  const specialCoupon = specialCouponServices.specialCouponService(fastify);
  const getbillnoInfo = billnoServices.getbillnoInfoInfoService(fastify);
  const settingInfo = settingServices.settingServices(fastify);
  const newmemberInfo = newmemberservices.newmemberservices(fastify);
  const getloyality = loyaltypointservices.loyaltypointservices(fastify);
  const getoutletmemberInfo = outletinfoServices.getOutletMembersInfoService(fastify);
  const getoutletmemberInfoUpdate = outletinfoServices.putOutletMemberService(fastify);
  // const getPaymentData = paymentServices.getPaymentData(fastify);
  return async ({ logTrace, query, body, userDetails }) => {
    const knex = fastify.knexMedical;
    const users_id = userDetails.id;
    const counter_no = body.counter_no;
    const outlet_id = body.outlet_id;
    const is_card = body.is_card;
    const name = body.name || "";
    const mobile = body.mobile || "";
    const bags = body.bags || 0;

    const is_radio = body.is_radio || 1;

    const dis_amt = body.dis_amt;
    const round_off_amt = body.round_off_amt;
    const customer_id = body.customer_id || null;
    const mode = body.mode;
    const customer_det = body.customer_det;
    const balance = body.balance || 0;
    var new_user = 1;
    const financialYear = getFinancialYear();
    const currentDate = getCurrentDate();
    const currentTime = getCurrentTime();
    const cartItems = await getCart({
      logTrace,
      // mode,
      // customer_id,
      query: {
        users_id,
        counter_no,
        outlet_id,
        mode,
        customer_id
      },
      userDetails
    });
    console.log("billSaveServicescartItems", cartItems);

    var previous_points = 0;
    var current_bill_points = 0;
    var wallet_amount = 0;

    const getBillNo = await getbillnoInfo.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      body: { counter_no: counter_no, outlet_id: outlet_id },
      logTrace,
      userDetails,
      financialYear

    });

    var member_id = null;
    var member_name = null;
    var member_mobile = null;
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

      if (previous_points == 0) {
        new_user = 1;
      } else {
        new_user = 0;
      }
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
    // for (const payment_modes of mode) {

    //   if (
    //     (payment_modes.id === 2 || payment_modes.id === 3) &&
    //     Number(payment_modes.amount) > 0
    //   ) {

    //     var paymentMethod = await getPaymentData({
    //       counter_no,
    //       outlet_id,
    //       mode,
    //       input: {
    //         name: member_name,
    //         mobile: member_mobile,
    //         customer_id: member_id,
    //         users_id: users_id,
    //         billno: billno,
    //         is_card: paymentMode,
    //         counter_no: counter_no,
    //         bags: bags,
    //         currentDate: currentDate,
    //         cartItems: cartItemsResult
    //       },
    //       logTrace
    //     });
    //  paymentMethodId = paymentMethod.data.PlutusTransactionReferenceID || 0;

    //   }

    // }
    //   console.log("dddddddddddddd",paymentMethod);



    const promise1 = await billSave.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      mode,
      balance,
      financialYear,
      input: {
        billno: billno,
        name: member_name,
        mobile: member_mobile,
        customer_id: member_id,
        users_id: users_id,
        is_card: is_card,
        counter_no: counter_no,
        bags: bags,
        currentDate: currentDate,
        cartItems: cartItemsResult,
        reference_id: paymentMethodId || 1
      },
      logTrace,
      userDetails
    });
    const promise2 = await YearSaleSave.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      input: {
        billno: billno,
        name: name,
        mobile: mobile,
        users_id: users_id,
        is_card: is_card,
        counter_no: counter_no,
        bags: bags,
        currentDate: currentDate,
        cartItems: cartItemsResult
      },
      dis_amt,
      round_off_amt,
      logTrace
    });
    const promise3 = await CounterSaleSave.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      mode,
      balance,
      financialYear,
      input: {
        billno: billno,
        name: member_name,
        mobile: member_mobile,
        customer_id: member_id,
        users_id: users_id,
        is_card: is_card,
        counter_no: counter_no,
        bags: bags,
        currentDate: currentDate,
        cartItems: cartItemsResult,
        currentDate,
        currentTime: currentTime,
      },
      logTrace,
      userDetails
    });
    const promise4 = await ItemDetailsSave.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      mode,
      balance,
      financialYear,
      input: {
        billno: billno,
        name: member_name,
        mobile: member_mobile,
        customer_id: member_id,
        users_id: users_id,
        is_card: is_card,
        counter_no: counter_no,
        bags: bags,
        currentDate: currentDate,
        cartItems: cartItemsResult,
        currentDate,
        currentTime: currentTime,
      },
      logTrace,
      userDetails
    });

    const promise5 = await MemberItemSave.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      input: {
        billno: billno,
        name: name,
        mobile: mobile,
        users_id: users_id,
        is_card: is_card,
        counter_no: counter_no,
        bags: bags,
        currentDate: currentDate,
        currentTime: currentTime,
        cartItems: cartItems
      },
      logTrace
    });

    const promise6 = await GroupSalesSave.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      mode,
      balance,
      financialYear,
      input: {
        billno: billno,
        name: member_name,
        mobile: member_mobile,
        customer_id: member_id,
        users_id: users_id,
        is_card: is_card,
        counter_no: counter_no,
        bags: bags,
        currentDate: currentDate,
        cartItems: cartItemsResult,
        reference_id: paymentMethodId || 1
      },
      logTrace,
      userDetails
    });

    const promise7 = await HourSalesSave.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      input: {
        billno: billno,
        name: name,
        mobile: mobile,
        users_id: users_id,
        is_card: is_card,
        counter_no: counter_no,
        bags: bags,
        currentDate: currentDate,
        currentTime: currentTime,
        cartItems: cartItemsResult
      },
      logTrace
    });
    const promise8 = await specialCoupon({
      logTrace,
      body: {
        total: cartItemsResult.cart_total,
        billno: billno,
        counter_no: counter_no,
        outlet_id: outlet_id,
        location: settingsResult.location
      },
      userDetails,
      outlet_id
    });
    const promise9 = await SchemaLogSave.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      input: {
        billno: billno,
        name: name,
        mobile: mobile,
        users_id: users_id,
        is_card: is_card,
        counter_no: counter_no,
        bags: bags,
        currentDate: currentDate,
        currentTime: currentTime,
        cartItems: cartItemsResult
      },
      logTrace
    });

    const promise10 = await OfferLogSave.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      input: {
        billno: billno,
        name: name,
        mobile: mobile,
        users_id: users_id,
        is_card: is_card,
        counter_no: counter_no,
        bags: bags,
        currentDate: currentDate,
        currentTime: currentTime,
        cartItems: cartItemsResult
      },
      logTrace
    });
    const promise15 = await daySaleSave.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      mode,
      balance,
      financialYear,
      input: {
        billno: billno,
        name: member_name,
        mobile: member_mobile,
        customer_id: member_id,
        users_id: users_id,
        is_card: is_card,
        counter_no: counter_no,
        bags: bags,
        currentDate: currentDate,
        cartItems: cartItemsResult,
        reference_id: paymentMethodId || 1
      },
      logTrace,
      userDetails
    });
    const Plimit = settings.plimit;
    const Mcard = settings.mcard;
    const PPoint = settings.ppoint;
    const Rpoint = settings.rpoint;
    const Ramount = settings.ramount;
    const OpOffer = settings5Result.opoffer;
    console.log("OpOffer", OpOffer);
    
    // if(OpOffer==1)
    //console.log("OpOffer", OpOffer);
    if (OpOffer == 0) {
      console.log("OpOffer", OpOffer);

      if (new_user == 1) {
        const amt = settings5Result.oppamt;
        const dis_Amt = settings5Result.opoamt;
        const bouns_point = settings5Result.opbonus;
        const ofdate = settings5Result.ofdate;
       // console.log("OpOffer", amt, dis_Amt, bouns_point, ofdate);
        const opoday = settings5Result.opoday;
        const cur_date = getCurrentDate();
        let currentDateObj = new Date(ofdate);
        currentDateObj.setDate(currentDateObj.getDate() + parseInt(opoday));

        let resultDate = currentDateObj.toISOString().substring(0, 10);

        if (cur_date <= resultDate && amt <= cartItems.cart_net_total) {
         
          const part = Math.floor(cartItems.cart_net_total / amt);
          let integerPart = Math.floor(part);
          const part_amt = dis_Amt * integerPart;
       
          if (Mcard === 1) {

              const data_loyality = [{ at_points: bouns_point, at_amt: part_amt }]

              
              console.log("data_loyalityaaaaass", data_loyality);
              current_bill_points = Math.round(data_loyality[0].at_points || data_loyality[0].at_amt || 0);
         
            console.log("current_bill_points", current_bill_points);
            const promise11 = await LoyalityPointSave.call(knex, {
              users_id,
              previous_points,
              current_bill_points,
              counter_no,
              outlet_id,
              Plimit,
              PPoint,
              Mcard,
              location: settingsResult.location,
              input: {
                billno: billno,
                name: name,
                mobile: member_mobile,
                users_id: users_id,
                is_card: is_card,
                counter_no: counter_no,
                bags: bags,
                is_radio: is_radio,
                currentDate: currentDate,
                currentTime: currentTime,
                cartItems: cartItemsResult
              },
              logTrace,
              data_loyality,

            });
            if (customer_id) {
              let total_points = Math.round(Number(previous_points) + Number(current_bill_points)) || 0;
              console.log("total_pointsupdate", total_points);
         
              
              const getMemberInfo = await getoutletmemberInfoUpdate.call(knex, {
                users_id,
                counter_no,
                outlet_id,
                body: {
                  party_name: member_name,
                  mobile: member_mobile,
                  balance_points: total_points || 0,
                },
                params: { member_id: customer_id },
                logTrace,
                userDetails
              });
              // const memberInfo = getMemberInfo[0];
              // console.log("memberInfo",memberInfo);

              //    member_id = memberInfo.id || null;
              //    member_name = memberInfo.party_name || null;
              //    member_mobile = memberInfo.mobile || null;
              //    previous_points = memberInfo.balance_points || 0;
              //    current_bill_points = memberInfo.current_bill_points || 0;
            await  getItemsLoyalityPointUpdate.call(knex, {
                logTrace,
               
                  earnpoint: current_bill_points,
                  redeempoint: 0,
                  billno: billno,
                  customer_id: customer_id,
                  counter_no: counter_no,
                  outlet_id: outlet_id,
                  users_id: users_id,
                  input: {
                    billno: billno,
                    name: name,
                    mobile: member_mobile,
                    users_id: users_id,
                    counter_no: counter_no,
                
                },
              });
           
           
           
            }
          }

        }

      }
    }
    else {
      const data_loyality = [];
      if (Mcard == 1) {
        const amt = settings5Result.oppamt;
        const dis_Amt = settings5Result.opoamt;
        const bouns_point = settings5Result.opbonus;
        const ofdate = settings5Result.ofdate;
        
        const opoday = settings5Result.opoday;
        const cur_date = getCurrentDate();
        previous_points = previous_points;
        console.log("billAmount", cartItems.cart_net_total);
        current_bill_points = Math.round(cartItems.cart_net_total / PPoint);
   
        console.log("current_bill_pointselse", current_bill_points);

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
            name: name,
            mobile: member_mobile,
            users_id: users_id,
            is_card: is_card,
            counter_no: counter_no,
            bags: bags,
            currentDate: currentDate,
            currentTime: currentTime,
            cartItems: cartItemsResult
          },
        });
        data_loyality.push(getloyalitypoint);
        console.log("data_loyalityaaaa", data_loyality);

        const promise11 = await LoyalityPointSave.call(knex, {
          users_id,
          previous_points,
          current_bill_points,
          counter_no,
          Plimit,
          PPoint,
          Mcard,
          location: settingsResult.location,
          input: {
            billno: billno,
            name: name,
            mobile: member_mobile,
            users_id: users_id,
            is_card: is_card,
            counter_no: counter_no,
            bags: bags,
            is_radio: is_radio,
            currentDate: currentDate,
            currentTime: currentTime,
            cartItems: cartItemsResult
          },
          logTrace,
          data_loyality
        });
        if (customer_id) {
          let total_points = Math.round(Number(previous_points) + Number(current_bill_points)) || 0;
     
        console.log("alreadycustomertotal_points",total_points);
        
        
          const getMemberInfo = await getoutletmemberInfoUpdate.call(knex, {
            users_id,
            counter_no,
            outlet_id,
            body: {
              party_name: member_name,
              mobile: member_mobile,
              balance_points: total_points || 0,
            },
            params: { member_id: customer_id },
            logTrace,
            userDetails
          });
          // const memberInfo = getMemberInfo[0];
          // console.log("memberInfo",memberInfo);

          //    member_id = memberInfo.id || null;
          //    member_name = memberInfo.party_name || null;
          //    member_mobile = memberInfo.mobile || null;
          //    previous_points = memberInfo.balance_points || 0;
          //    current_bill_points = memberInfo.current_bill_points || 0;
       
          await getItemsLoyalityPointUpdate.call(knex, {
            logTrace,
           
              earnpoint: current_bill_points,
              redeempoint: 0,
              billno: billno,
              customer_id: customer_id,
              counter_no: counter_no,
              outlet_id: outlet_id,
              users_id: users_id,
              input: {
                billno: billno,
                name: name,
                mobile: member_mobile,
              }
          
          });
          await saveLoyaltyApplyDetailsupdate.call(knex, {
            logTrace,
            body: {
              billno: billno,
              customer_id: customer_id,
              transaction_type: "EARN",
              bill_amount: cartItems.cart_net_total,
              earned_points: current_bill_points,
              redeemed_points: 0,
              points_balance_before: previous_points,
              points_balance_after: total_points,
            },
            input: {
              billno: billno,
              customer_id: customer_id,
              transaction_type: "EARN",
              bill_amount: cartItems.cart_net_total,
              earned_points: current_bill_points,
              redeemed_points: 0,
              points_balance_before: previous_points,
              points_balance_after: total_points,
            }
          });

        }
      }
    }



    const promise11 = await productmasterblncupdate.call(knex, {
      users_id,
      counter_no,
      outlet_id,
      input: {
        billno: billno,
        name: name,
        mobile: mobile,
        users_id: users_id,
        is_card: is_card,
        counter_no: counter_no,
        bags: bags,
        currentDate: currentDate,
        currentTime: currentTime,
        cartItems: cartItemsResult
      },
      logTrace
    });

    const [
      billResult,
      YearSaleResult,
      CounterSaleResult,
      ItemDetailsResult,
      MemberItemResult,
      GroupSalesResult,
      HourSalesResult,
      SpecialCouponResult,
      SchemaLogResult,
      OfferLogResult,
      productmasterblncupdateResult,
      daySaleResult

    ] = await Promise.all([
      promise1,
      promise2,
      promise3,
      promise4,
      promise5,
      promise6,
      promise7,
      promise8,
      promise9,
      promise10,
      promise11,
      promise15
    ]);

    return {
      success: "true",
      billno: billno,
      coupon_details: SpecialCouponResult
    };
  };
}


function bendingBillServices(fastify) {
  const {
    CartTopendingBill
  } = pendingbillRepo(fastify);

  const {
    clearCartItems
  } = billRepo(fastify);

  var getCart = getCartServices.getCartServices(fastify);

  return async ({ logTrace, query, body, userDetails }) => {
    const knex = fastify.knexMedical;
    const users_id = userDetails.id;
    const counter_no = body.counter_no;
    const bill_no = body.bill_no;
    const outlet_id = body.outlet_id;
    const customer_id = body.customer_id;
    const prod_id = '';

    const cartItems = await getCart({
      logTrace,
      query: {
        users_id,
        counter_no,
        outlet_id
      }
    });


    const [cartItemsResult] =
      await Promise.all([cartItems]);

    if (cartItemsResult.cart_lines.length <= 0) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "No Cart items found. add items to cart and proceed",
        property: "",
        code: "NOT_ACCEPTABLE"
      });
    }


    const promise1 = await CartTopendingBill.call(knex, {
      logTrace,
      users_id,
      counter_no,
      cartItemsResult,
      bill_no,
      outlet_id,
      customer_id,
      logTrace
    });
    const [
      billResult

    ] = await Promise.all([
      promise1
    ]);
    if (billResult) {
      const clearCart = await clearCartItems.call(knex, {
        prod_id, users_id, counter_no, outlet_id, logTrace
      });


    }
    return {
      success: "true"
    };
  };

}

function bendingBillretrieveServices(fastify) {
  const {
    bendingbilltoCart, getPendingBillData, getPendingBillClearData

  } = pendingbillRepo(fastify);

  return async ({ logTrace, query, body, userDetails }) => {
    const knex = fastify.knexMedical;
    const users_id = userDetails.id;
    const counter_no = body.counter_no;
    const bill_no = body.bill_no;
    const outlet_id = body.outlet_id;
    const pendingItems = await getPendingBillData.call(knex, {
      logTrace,
      users_id,
      counter_no,
      outlet_id,
      bill_no

    });


    if (pendingItems.length <= 0) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "No Cart items found. add items to cart and proceed",
        property: "",
        code: "NOT_ACCEPTABLE"
      });
    }
    const promise1 = await bendingbilltoCart.call(knex, {
      logTrace,
      users_id,
      counter_no,
      outlet_id,
      pendingItems,
      bill_no,

      logTrace
    });
    const [
      billResult

    ] = await Promise.all([
      promise1
    ]);

    if (billResult) {
      const cleardata = await getPendingBillClearData.call(knex, {
        logTrace,
        users_id,
        counter_no,
        outlet_id,
        bill_no

      });
    }
    return {
      success: "true"
    };

  };

}
function bendingBilloverallgetServices(fastify) {
  const {
    getPendingBilloverallgetData

  } = pendingbillRepo(fastify);

  return async ({ logTrace, query, body, userDetails }) => {
    const knex = fastify.knexMedical;
    const users_id = userDetails.id;
    const counter_no = body.counter_no;
    const outlet_id = body.outlet_id;
    const pendingItemsoverallget = await getPendingBilloverallgetData.call(knex, {
      logTrace,
      users_id,
      counter_no,
      outlet_id

    });


    if (pendingItemsoverallget.length <= 0) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "No Cart items found. add items to cart and proceed",
        property: "",
        code: "NOT_ACCEPTABLE"
      });
    }

    return pendingItemsoverallget;

  };

}
module.exports = { billSaveServices, bendingBillServices, bendingBillretrieveServices, bendingBilloverallgetServices };
