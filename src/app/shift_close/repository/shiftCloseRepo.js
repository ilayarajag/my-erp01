const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const { logQuery } = require("../../commons/helpers");
const { COUNTER_SALES, CNT_DENOMINATIONS } = require("../../sales/commons/constants");
const OUTLET_COUNTER_SHIFT_CLOSE = require("../commons/constants");


function shiftCloseRepo(fastify) {

  // GET: counter sales summary + cash close details
  async function getShiftCloseSummary({
    outlet_id,
    counter_no,
    bill_date,
    user_id,
    logTrace
  }) {
    const knex = this;

    const summaryQuery = knex(COUNTER_SALES.NAME)
      .where(COUNTER_SALES.COLUMNS.OUTLET_ID, outlet_id)
      .where(COUNTER_SALES.COLUMNS.COUNTER, counter_no)
      .where(COUNTER_SALES.COLUMNS.BILL_DATE, bill_date)
      .where(COUNTER_SALES.COLUMNS.TYPE, "S")
      .select([
        knex.raw(
          `COALESCE(SUM(${COUNTER_SALES.COLUMNS.BILLS}),0) as total_invoices`
        ),
        knex.raw(
          `COALESCE(SUM(${COUNTER_SALES.COLUMNS.CASH}),0) as total_cash`
        ),
        knex.raw(
          `COALESCE(SUM(${COUNTER_SALES.COLUMNS.CARD}),0) as total_card`
        ),
        knex.raw(
          `COALESCE(SUM(${COUNTER_SALES.COLUMNS.ONLINE}),0) as total_upi`
        ),
        knex.raw(
          `COALESCE(SUM(${COUNTER_SALES.COLUMNS.DISCOUNT}),0) as total_discount`
        ),
        knex.raw(
          `COALESCE(SUM(${COUNTER_SALES.COLUMNS.S_RET}),0) as total_return`
        ),
        knex.raw(
          `COALESCE(
          SUM(
            ${COUNTER_SALES.COLUMNS.CASH}
            +
            ${COUNTER_SALES.COLUMNS.CARD}
            +
            ${COUNTER_SALES.COLUMNS.ONLINE}
          ),
        0) as total_sales`
        )
      ]);

    logQuery({
      logger: fastify.log,
      query: summaryQuery,
      context: "Counter Sales Summary",
      logTrace
    });

    const [summary] = await summaryQuery;

    const shiftClose = await knex(OUTLET_COUNTER_SHIFT_CLOSE.NAME)
      .where(
        OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.OUTLET_ID,
        outlet_id
      )
      .where(
        OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.COUNTER_NO,
        counter_no
      )
      .where(
        OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.USER_ID,
        user_id
      )
      .where(
        OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.BILL_DATE,
        bill_date
      )
      .first();

    return {
      summary: {
        total_sales: Number(summary.total_sales || 0),
        total_invoices: Number(summary.total_invoices || 0),
        total_cash: Number(summary.total_cash || 0),
        total_card: Number(summary.total_card || 0),
        total_upi: Number(summary.total_upi || 0),
        total_discount: Number(summary.total_discount || 0),
        total_return: Number(summary.total_return || 0)
      },
      denomination: shiftClose
        ? {
          n2000: shiftClose.n2000,
          n500: shiftClose.n500,
          n200: shiftClose.n200,
          n100: shiftClose.n100,
          n50: shiftClose.n50,
          n20: shiftClose.n20,
          n10: shiftClose.n10,
          n5: shiftClose.n5,
          n2: shiftClose.n2,
          n1: shiftClose.n1,
          expected_cash: shiftClose.expected_cash,
          denomination_total: shiftClose.denomination_total,
          excess: shiftClose.excess,
          shortage: shiftClose.shortage
        }
        : null
    };
  }

  // POST: save cash close + update counter sales
  async function submitShiftClose({ body, logTrace, userDetails }) {
    const knex = this;

    const {
      outlet_id,
      counter_no,
      bill_date,
      n2000 = 0,
      n500 = 0,
      n200 = 0,
      n100 = 0,
      n50 = 0,
      n20 = 0,
      n10 = 0,
      n5 = 0,
      n2 = 0,
      n1 = 0,
      amount_to_be_deposited = 0,
      next_day_balance = 0,
      remarks = null
    } = body;

    const users_id = userDetails.id;

    // Validate negative values
    const values = [n2000, n500, n200, n100, n50, n20, n10, n5, n2, n1, amount_to_be_deposited, next_day_balance];

    if (values.some(v => Number(v) < 0)) {
      throw CustomError.create({
        httpCode: StatusCodes.BAD_REQUEST,
        message: "Negative values are not allowed",
        property: "denomination",
        code: "INVALID_INPUT"
      });
    }

    // Check counter sales exists
    const counterSales = await knex(COUNTER_SALES.NAME)
      .where(COUNTER_SALES.COLUMNS.COUNTER, counter_no)
      .where(COUNTER_SALES.COLUMNS.BILL_DATE, bill_date)
      .where(COUNTER_SALES.COLUMNS.OUTLET_ID, outlet_id)
      .where(COUNTER_SALES.COLUMNS.UID, users_id)
      .where(COUNTER_SALES.COLUMNS.TYPE, "S")
      .first();

    if (!counterSales) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "No counter sales record found",
        property: "counter_no",
        code: "NOT_FOUND"
      });
    }

    // Prevent duplicate close
    const alreadyClosed = await knex(OUTLET_COUNTER_SHIFT_CLOSE.NAME)
      .where(OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.OUTLET_ID, outlet_id)
      .where(OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.COUNTER_NO, counter_no)
      .where(OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.USER_ID, users_id)
      .where(OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.BILL_DATE, bill_date)
      .first();

    if (alreadyClosed) {
      throw CustomError.create({
        httpCode: StatusCodes.BAD_REQUEST,
        message: "Cash close already completed",
        property: "counter_no",
        code: "ALREADY_CLOSED"
      });
    }

    // Calculate denomination total
    const denom_total = (n2000 * 2000) + (n500 * 500) + (n200 * 200) + (n100 * 100) + (n50 * 50) + (n20 * 20) + (n10 * 10) + (n5 * 5) + (n2 * 2) + (n1 * 1);

    const expected_cash = Number(counterSales[COUNTER_SALES.COLUMNS.CASH] || 0);

    const excess = Math.max(0, denom_total - expected_cash);

    const shortage = Math.max(0, expected_cash - denom_total);

    if ((Number(amount_to_be_deposited) + Number(next_day_balance)) !== denom_total) {
      throw CustomError.create({
        httpCode: StatusCodes.BAD_REQUEST,
        message: "Deposit amount + next day balance must equal denomination total",
        property: "amount_to_be_deposited,next_day_balance",
        code: "INVALID_AMOUNT"
      });
    }

    await knex.transaction(async trx => {

      const insertQuery = trx(OUTLET_COUNTER_SHIFT_CLOSE.NAME)
        .insert({
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.OUTLET_ID]: outlet_id,
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.COUNTER_NO]: counter_no,
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.USER_ID]: users_id,
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.BILL_DATE]: bill_date,
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.N2000]: n2000,
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.N500]: n500,
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.N200]: n200,
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.N100]: n100,
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.N50]: n50,
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.N20]: n20,
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.N10]: n10,
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.N5]: n5,
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.N2]: n2,
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.N1]: n1,
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.EXPECTED_CASH]: expected_cash,
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.DENOMINATION_TOTAL]: denom_total,
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.EXCESS]: excess,
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.SHORTAGE]: shortage,
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.AMOUNT_TO_BE_DEPOSITED]: amount_to_be_deposited,
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.NEXT_DAY_BALANCE]: next_day_balance,
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.REMARKS]: remarks,
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.IS_CLOSED]: true,
          [OUTLET_COUNTER_SHIFT_CLOSE.COLUMNS.CREATED_BY]: users_id
        });

      logQuery({
        logger: fastify.log,
        query: insertQuery,
        context: "Shift Close Insert",
        logTrace
      });

      await insertQuery;

      const updateQuery = trx(COUNTER_SALES.NAME)
        .where(COUNTER_SALES.COLUMNS.COUNTER, counter_no)
        .where(COUNTER_SALES.COLUMNS.BILL_DATE, bill_date)
        .where(COUNTER_SALES.COLUMNS.OUTLET_ID, outlet_id)
        .where(COUNTER_SALES.COLUMNS.UID, users_id)
        .where(COUNTER_SALES.COLUMNS.TYPE, "S")
        .update({
          [COUNTER_SALES.COLUMNS.STATUS]: 1,
          [COUNTER_SALES.COLUMNS.PAID_AMOUNT]: denom_total,
          [COUNTER_SALES.COLUMNS.EXCESS]: excess,
          [COUNTER_SALES.COLUMNS.SHORTAGE]: shortage
        });

      logQuery({
        logger: fastify.log,
        query: updateQuery,
        context: "Counter Sales Update",
        logTrace
      });

      await updateQuery;
    });

    return {
      success: true,
      expected_cash,
      denomination_total: denom_total,
      excess,
      shortage,
      amount_to_be_deposited,
      next_day_balance
    };
  }

  return {
    getShiftCloseSummary,
    submitShiftClose
  };
}

module.exports = shiftCloseRepo;
