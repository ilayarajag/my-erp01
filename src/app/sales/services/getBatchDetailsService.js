const cartRepo = require("../repository/product");
const getCartServices = require("./getCartServices");
const productServices = require("./productServices");
const codeSearchServices = require("./codesearchServices");
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
function getBatchDetailsService(fastify) {
  const { getBatchDetails } = cartRepo(fastify);

  return async ({ logTrace, body, userDetails }) => {
    const { counter_no, outlet_id, prod_id } = body;

    const users_id = userDetails.id;
    const knex = fastify.knexMedical;

    const currentDate = getCurrentDate();

    const batchDetails = await getBatchDetails.call(knex, {
      logTrace,
      currentDate,
      input: {
        users_id,
        counter_no,
        outlet_id,
        prod_id
      }
    });
  console.log("batchDetails",batchDetails);
  
    return batchDetails;
  };
}
module.exports = getBatchDetailsService;
