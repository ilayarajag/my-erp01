const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const productRepo = require("../repository/product");
const getCartServices = require("./getCartServices");
const billnoServices = require("../../billno/services/billnoServices");


function newmemberservices(fastify) {
  const { newmemberInfo } = productRepo(fastify);
  return async ({ logTrace, userDetails }) => {
    const knex = fastify.knexMedical;
    const response = await newmemberInfo.call(knex, {
      logTrace,
      userDetails
    });
    return response;
  };
}
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

function countercloseservices(fastify) {
  const { countercloseInfo } = productRepo(fastify);
  return async ({ logTrace, query, body, userDetails

  }) => {

    const getCart = getCartServices.getCartServices(fastify);
    const getbillnoInfo = billnoServices.getbillnoInfoInfoService(fastify);


    const users_id = userDetails.id;
    const counter_no = body.counter_no;
    const is_card = body.is_card || 0;
    const name = body.name || "";
    const mobile = body.mobile || "";
    const bags = body.bags || 0;
   const outlet_id = body.outlet_id || 0;
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
    const knex = fastify.knexMedical;

    const getBillNo = await getbillnoInfo.call(knex, {
      users_id,
      body: { counter: counter_no },
      logTrace
    });
    let billno = getBillNo.billno;

    const response = await countercloseInfo.call(knex, {
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
      },
      logTrace
    });
    return response;
  };
}

function weighingservices(fastify) {
  const { weighingInfo, getcompanyweighing, getcprtoption } = productRepo(fastify);
  return async ({ body,
    params,
    logTrace,
    userDetails }) => {
    const knex = fastify.knexMedical;

    const promise1 = await getcompanyweighing.call(knex, {
      body,
      logTrace
    });
    const promise2 = await getcprtoption.call(knex, {
      body,
      logTrace
    });
    const promise3 = await weighingInfo.call(knex, {
      body,
      params,
      logTrace,
      userDetails
    });
    const [
      getcompanyweighingsResult,
      getcprtoptionsResult,
      productmasterResult,

    ] = await Promise.all([
      promise1,
      promise2,
      promise3

    ]);

    if (getcompanyweighingsResult.WScale === 1 && getcprtoptionsResult.wread === 1 && productmasterResult.Wscale === 1) {

      return { weighingscale: true };
    }
    else {
      return { weighingscale: false };

    }
  };
}

function denominationservices(fastify) {
  const { denominationInfo } = productRepo(fastify);
  return async ({ body,
    params,
    logTrace,
    userDetails }) => {
    const knex = fastify.knexMedical;
    const response = await denominationInfo.call(knex, {
      body,
      params,
      logTrace,
      userDetails
    });
    return response;
  };
}
module.exports = {
  newmemberservices,
  countercloseservices,
  weighingservices,
  denominationservices
};
