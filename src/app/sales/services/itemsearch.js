const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const itemsearchRepo = require("../repository/itemsearch");


function itemsearchservices(fastify) {
  const { getitemInfo } = itemsearchRepo(fastify);
  return async ({ body,
    params,
     queryString,

    logTrace,
    userDetails
  }) => {
    console.log("params", params, "body", body);
    const knex = fastify.knexMedical;
    const response = await getitemInfo.call(knex, {
      body,
      queryString,
      params,
      logTrace,
      userDetails
    });
    return response;
  };
}

function dubbillservices(fastify) {
  const { getbubbillInfo, billdetInfo } = itemsearchRepo(fastify);
  return async ({ body,
    params,
    logTrace,
    userDetails
  }) => {

    const knex = fastify.knexMedical;
    const promise1 = await getbubbillInfo.call(knex, {
      body,
      params,
      logTrace,
      userDetails
    });
    const promise2 = await billdetInfo.call(knex, {
      body,
      params,
      logTrace,
      userDetails
    });
    const [
      billmasterResult,
      billdetailsResult
    ] = await Promise.all([
      promise1,
      promise2

    ]);

    return {
      success: "true",
      result: { billmasterResult, billdetailsResult }
    };
  };
}




module.exports = {

  itemsearchservices, dubbillservices

};
