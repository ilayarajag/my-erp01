const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const productRepo = require("../repository/product");

function loyaltypointservices(fastify) {
  const { loyaltyInfo } = productRepo(fastify);
  return async ({
    input: {
      billno,
      name,
      mobile,
      users_id,
      is_card,
      counter_no,
      bags,
      currentDate,
      currentTime,
      cartItems: cartItemsResult
    },
    logTrace,
    Plimit,
    PPoint,
    Rpoint,
    Ramount,
    previous_points,
    current_bill_points,
    points
  }) => {
    const knex = fastify.knexMedical;
    const response = await loyaltyInfo.call(knex, {
      input: {
        billno,
        name,
        mobile,
        users_id,
        is_card,
        counter_no,
        bags,
        currentDate,
        currentTime,
        cartItemsResult
      },
      logTrace,
      Plimit,
      PPoint,
      Rpoint,
      Ramount,
      previous_points,
      current_bill_points,
      points
    });
   // console.log("loyaltyinfo",response);
    
    return response;
  };
}

module.exports = {
  loyaltypointservices
};
