const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../../errorHandler");
const { logQuery } = require("../../../commons/helpers");
const { OUTLET_COUNTER_PAYMENT_MODES, OUTLETS } = require("../commons/constants");

function outletCounterPaymentModesRepo(fastify) {

  // Shared: validate outlet exists and is active
  async function validateOutlet(knex, outlet_id) {
    const outlet = await knex(OUTLETS.NAME)
      .where(OUTLETS.COLUMNS.ID, outlet_id)
      .where(OUTLETS.COLUMNS.IS_ACTIVE, true)
      .first();
    if (!outlet) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: `Outlet id ${outlet_id} not found or inactive`,
        property: "outlet_id",
        code: "NOT_FOUND"
      });
    }
    return outlet;
  }

  // 1. CREATE
  async function postOutletCounterPaymentModes({ body, logTrace, userDetails }) {
    const knex = this;
    const { outlet_id, counter_no, cash = true, card = true, upi = true, is_active = true } = body;

    // Validate outlet
    await validateOutlet(knex, outlet_id);

    // Check UNIQUE (outlet_id, counter_no)
    const existing = await knex(OUTLET_COUNTER_PAYMENT_MODES.NAME)
      .where(OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.OUTLET_ID, outlet_id)
      .where(OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.COUNTER_NO, counter_no)
      .first();

    if (existing) {
      throw CustomError.create({
        httpCode: StatusCodes.CONFLICT,
        message: `Counter ${counter_no} already mapped for outlet id ${outlet_id}`,
        property: "counter_no",
        code: "CONFLICT"
      });
    }

    const query = knex(OUTLET_COUNTER_PAYMENT_MODES.NAME)
      .insert({
        [OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.OUTLET_ID]: outlet_id,
        [OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.COUNTER_NO]: counter_no,
        [OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.CASH]: cash,
        [OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.CARD]: card,
        [OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.UPI]: upi,
        [OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.IS_ACTIVE]: is_active,
        [OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.CREATED_BY]: userDetails.id,
        [OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.UPDATED_BY]: userDetails.id,
        [OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.CREATED_AT]: new Date(),
        [OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.UPDATED_AT]: new Date()
      })
      .returning("id");

    logQuery({
      logger: fastify.log,
      query,
      context: "Post Outlet Counter Payment Modes",
      logTrace
    });

    await query;
    return { success: true };
  }

  // 2. UPDATE
  async function putOutletCounterPaymentModes({ params, body, logTrace, userDetails }) {
    const knex = this;
    const { outlet_counter_payment_id } = params;

    const existing = await knex(OUTLET_COUNTER_PAYMENT_MODES.NAME)
      .where(OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.ID, outlet_counter_payment_id)
      .first();

    if (!existing) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Record not found",
        property: "id",
        code: "NOT_FOUND"
      });
    }

    const updateData = {
      [OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.UPDATED_BY]: userDetails.id,
      [OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.UPDATED_AT]: new Date()
    };

    // Validate outlet if changing
    if (body.outlet_id) {
      await validateOutlet(knex, body.outlet_id);
      updateData[OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.OUTLET_ID] = body.outlet_id;
    }

    if (body.counter_no) {
      updateData[OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.COUNTER_NO] = body.counter_no;
    }

    if (typeof body.cash === "boolean") {
      updateData[OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.CASH] = body.cash;
    }
    if (typeof body.card === "boolean") {
      updateData[OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.CARD] = body.card;
    }
    if (typeof body.upi === "boolean") {
      updateData[OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.UPI] = body.upi;
    }
    if (typeof body.is_active === "boolean") {
      updateData[OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.IS_ACTIVE] = body.is_active;
    }



    // UNIQUE check: (outlet_id, counter_no) excluding self
    const checkOutletId = updateData[OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.OUTLET_ID] ?? existing[OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.OUTLET_ID];
    const checkCounterNo = updateData[OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.COUNTER_NO] ?? existing[OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.COUNTER_NO];

    if (body.outlet_id || body.counter_no) {
      const duplicate = await knex(OUTLET_COUNTER_PAYMENT_MODES.NAME)
        .where(OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.OUTLET_ID, checkOutletId)
        .where(OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.COUNTER_NO, checkCounterNo)
        .whereNot(OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.ID, outlet_counter_payment_id)
        .first();

      if (duplicate) {
        throw CustomError.create({
          httpCode: StatusCodes.CONFLICT,
          message: `Counter ${checkCounterNo} already mapped for outlet id ${checkOutletId}`,
          property: "counter_no",
          code: "CONFLICT"
        });
      }
    }

    const query = knex(OUTLET_COUNTER_PAYMENT_MODES.NAME)
      .where(OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.ID, outlet_counter_payment_id)
      .update(updateData);

    logQuery({
      logger: fastify.log,
      query,
      context: "Put Outlet Counter Payment Modes",
      logTrace
    });

    await query;
    return { success: true };
  }

  async function getOutletCounterPaymentModes({ query: queryString, logTrace }) {
   
    //  await outletCounterPaymentSettings()
    const knex = this;
    const { outlet_id, counter_no } = queryString;

    if (!outlet_id) {
      throw CustomError.create({
        httpCode: StatusCodes.BAD_REQUEST,
        message: "Missing required parameter: outlet_id",
        code: "BAD_REQUEST"
      });
    }

    const query = knex(OUTLET_COUNTER_PAYMENT_MODES.NAME)
      .select([
        `${OUTLET_COUNTER_PAYMENT_MODES.NAME}.${OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.ID} as id`,
        `${OUTLET_COUNTER_PAYMENT_MODES.NAME}.${OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.OUTLET_ID} as outlet_id`,
        `${OUTLET_COUNTER_PAYMENT_MODES.NAME}.${OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.COUNTER_NO} as counter_no`,
        `${OUTLET_COUNTER_PAYMENT_MODES.NAME}.${OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.CASH} as cash`,
        `${OUTLET_COUNTER_PAYMENT_MODES.NAME}.${OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.CARD} as card`,
        `${OUTLET_COUNTER_PAYMENT_MODES.NAME}.${OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.UPI} as upi`,
        `${OUTLET_COUNTER_PAYMENT_MODES.NAME}.${OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.IS_ACTIVE} as is_active`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME} as outlet_name`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID} as store_code`
      ])
      .join(
        OUTLETS.NAME,
        `${OUTLET_COUNTER_PAYMENT_MODES.NAME}.${OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.OUTLET_ID}`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`
      )
      .orderBy(`${OUTLET_COUNTER_PAYMENT_MODES.NAME}.${OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.COUNTER_NO}`, "asc");

    if (outlet_id) {
      query.where(`${OUTLET_COUNTER_PAYMENT_MODES.NAME}.${OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.OUTLET_ID}`, Number(outlet_id));
    }
    if (counter_no) {
      query.where(`${OUTLET_COUNTER_PAYMENT_MODES.NAME}.${OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.COUNTER_NO}`, Number(counter_no));
      query.where(`${OUTLET_COUNTER_PAYMENT_MODES.NAME}.${OUTLET_COUNTER_PAYMENT_MODES.COLUMNS.IS_ACTIVE}`, true);
    }

    logQuery({
      logger: fastify.log,
      query,
      context: "Get Outlet Counter Payment Modes",
      logTrace
    });

    const data = await query;

    if (!data.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "No payment modes found",
        code: "NOT_FOUND"
      });
    }

    return data;
  }

  return {
    postOutletCounterPaymentModes,
    putOutletCounterPaymentModes,
    getOutletCounterPaymentModes
  };
}

module.exports = outletCounterPaymentModesRepo;
