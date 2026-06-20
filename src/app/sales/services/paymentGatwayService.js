const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const productRepo = require("../repository/product");
const getCartServices = require("./getCartServices");
const billnoServices = require("../../billno/services/billnoServices");
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

function getPaymentData(fastify) {
  const { getPaymentgateway } = productRepo(fastify);
  return async ({ logTrace,input: {
        name: member_name,
        mobile: member_mobile,
        customer_id: member_id,
       
        is_card: is_card,
         billno: billno,
        counter_no: counter_no,
        bags: bags,
        currentDate: currentDate,
        cartItems: cartItemsResult
      }, userDetails,  users_id,
      outlet_id,
      mode , }) => {
    const knex = fastify.knexMedical;
    const response = await getPaymentgateway.call(knex, {
      logTrace,input: {
        name: member_name,
        mobile: member_mobile,
        customer_id: member_id,
        users_id: users_id,
        billno: billno,
        is_card: is_card,
        counter_no: counter_no,
        bags: bags,
        currentDate: currentDate,
        cartItems: cartItemsResult
      },
      userDetails
    });
    return response;
  };
}




module.exports = {
  getPaymentData

};
