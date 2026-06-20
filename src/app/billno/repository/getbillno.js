const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const { logQuery } = require("../../commons/helpers");
const { COMPANY } = require("../commons/constants");
const { OUTLET_SALES_MASTER, OUT_BILL_MASTER } = require("../../sales/commons/constants");


function getbillnoRepo(fastify) {
  async function getbillnoInfo({ body, params, logTrace, userDetails, financialYear }) {
    const knex = this;

    // 🔹 Step 1: Fetch Company Settings
    const query = knex(COMPANY.NAME)
      .select(
        COMPANY.COLUMNS.BILL_SEQUENCE,
        COMPANY.COLUMNS.BILL_NO_TYPE
      );

    logQuery({
      logger: fastify.log,
      query,
      context: "Get Company Bill No Info",
      logTrace
    });

    const response = await query;

    if (!response.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Company Bill No not found",
        code: "NOT_FOUND"
      });
    }

    const billSequence = response[0][COMPANY.COLUMNS.BILL_SEQUENCE]; // 0 or 1
    const billNoType = response[0][COMPANY.COLUMNS.BILL_NO_TYPE]; // 1 or others


    const counter = body.counter_no;
    const outlet_id = userDetails.outlet_id || body.outlet_id;;
    // console.log("out",userDetails);
    // 🔹 Base Query
    let billQuery = knex(OUT_BILL_MASTER.NAME).select(
      knex.raw(`
      COALESCE(MAX(${OUT_BILL_MASTER.COLUMNS.BILL_NO}::INT) + 1, 1) AS billno
    `)
    );

    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();

    // Case  A : Counter-wise Sequence (BillNoType = 1)
    if (billNoType == 1) {

      // A1. continous sequence (BillSequence = 0)
      if (billSequence == 0) {

        // fetch and filter by counter only (no date filter)
        billQuery = billQuery
          .where(OUT_BILL_MASTER.COLUMNS.COUNTER, counter)
          .andWhere(OUT_BILL_MASTER.COLUMNS.FINANCIAL_YEAR, financialYear)
          .andWhere(OUT_BILL_MASTER.COLUMNS.LOC_ID, outlet_id);

      }
      // A2. Date-wise Reset sequence (BillSequence = 1)
      else if (billSequence == 1) {

        billQuery = billQuery.where(OUT_BILL_MASTER.COLUMNS.COUNTER, counter)
          .where(OUT_BILL_MASTER.COLUMNS.LOC_ID, outlet_id)
          .andWhereRaw(
            `EXTRACT(YEAR FROM ${OUT_BILL_MASTER.COLUMNS.BILL_DATE}) = ?`,
            [year]
          )
          .andWhereRaw(
            `EXTRACT(MONTH FROM ${OUT_BILL_MASTER.COLUMNS.BILL_DATE}) = ?`,
            [month]
          )
          .andWhereRaw(
            `EXTRACT(DAY FROM ${OUT_BILL_MASTER.COLUMNS.BILL_DATE}) = ?`,
            [day]
          );
      }
    }

    // Case B: Outlet-wise Sequence (BillNoType ≠ 1 or BillNoType = others)
    else {

      // B1. Continuous sequence (BillSequence = 0)
      if (billSequence == 0) {
        // fetch without any filter
        billQuery = billQuery
          .where(OUT_BILL_MASTER.COLUMNS.FINANCIAL_YEAR, financialYear)
          .andWhere(OUT_BILL_MASTER.COLUMNS.LOC_ID, outlet_id);
      }
      // B2. Date-wise Reset sequence (BillSequence = 1)
      if (billSequence == 1) {
        billQuery = billQuery
          .andWhereRaw(
            `EXTRACT(YEAR FROM ${OUT_BILL_MASTER.COLUMNS.BILL_DATE}) = ?`,
            [year]
          )
          .andWhereRaw(
            `EXTRACT(MONTH FROM ${OUT_BILL_MASTER.COLUMNS.BILL_DATE}) = ?`,
            [month]
          )
          .andWhereRaw(
            `EXTRACT(DAY FROM ${OUT_BILL_MASTER.COLUMNS.BILL_DATE}) = ?`,
            [day]
          );
      }
    }

    //  Log Query
    logQuery({
      logger: fastify.log,
      query: billQuery,
      context: "Generate Bill Number",
      logTrace
    });
    const bill_no = await billQuery;

    return bill_no[0];
  }

  return {
    getbillnoInfo,
  };

}

module.exports = getbillnoRepo;

