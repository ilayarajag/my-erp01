const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../../errorHandler");
const { logQuery } = require("../../../commons/helpers");
const { INAUGURAL_OFFER, OUTLETS, INAUGURAL_OFFER_LOGS } = require("../commons/constants");

function inauguralOfferRepo(fastify) {
  async function getInauguralOfferList({ query, params, logTrace }) {
    const knex = this;
    const { search, active } = query;
    const { page_size, current_page } = params;

    const query1 = knex(INAUGURAL_OFFER.NAME)
      .select([
        `${INAUGURAL_OFFER.NAME}.*`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME} as outlet_name`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID} as store_code`,

      ])
      .leftJoin(
        OUTLETS.NAME,
        `${INAUGURAL_OFFER.NAME}.${INAUGURAL_OFFER.COLUMNS.OUTLET_ID}`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`
      )
      .orderBy(`${INAUGURAL_OFFER.NAME}.${INAUGURAL_OFFER.COLUMNS.CREATED_AT}`, "desc");

    if (search && search.length >= 3) {
      query1.where(function () {
        this.where(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.SHORT_NAME}`, "ilike", `%${search}%`)
          .orWhere(`${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME}`, "ilike", `%${search}%`);
      });
    }

    if (active == 0) {
      query1.where(`${INAUGURAL_OFFER.NAME}.${INAUGURAL_OFFER.COLUMNS.IS_ACTIVE}`, false);
    }
    else if (active == 1) {
      query1.where(`${INAUGURAL_OFFER.NAME}.${INAUGURAL_OFFER.COLUMNS.IS_ACTIVE}`, true);
    }

    // if(status == 0){
    //   query1.where(`${INAUGURAL_OFFER.NAME}.${INAUGURAL_OFFER.COLUMNS.STATUS}`, false);
    // }
    // else if( status == 1){
    //   query1.where(`${INAUGURAL_OFFER.NAME}.${INAUGURAL_OFFER.COLUMNS.STATUS}`, true);
    // }

    logQuery({
      logger: fastify.log,
      query: query1,
      context: "Get Inaugural Offer List",
      logTrace
    });

    const response = await query1.paginate({
      pageSize: page_size,
      currentPage: current_page
    });

    if (response.meta.pagination.total_pages < current_page) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "Requested page is beyond the available data",
        property: "",
        code: "NOT_ACCEPTABLE"
      });
    }

    if (!response.data.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Inaugural offers not found",
        property: "",
        code: "NOT_FOUND"
      });
    }

    return response;
  }

  async function getInauguralOfferInfo({ params, logTrace }) {
    const knex = this;
    const { outlet_id } = params;

    const query = knex(INAUGURAL_OFFER.NAME)
      .select([
        `${INAUGURAL_OFFER.NAME}.*`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULL_NAME} as outlet_name`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID} as store_code`
      ])
      .leftJoin(
        OUTLETS.NAME,
        `${INAUGURAL_OFFER.NAME}.${INAUGURAL_OFFER.COLUMNS.OUTLET_ID}`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`
      )
      .where(`${INAUGURAL_OFFER.NAME}.${INAUGURAL_OFFER.COLUMNS.OUTLET_ID}`, outlet_id)
      .where(`${INAUGURAL_OFFER.NAME}.${INAUGURAL_OFFER.COLUMNS.IS_ACTIVE}`, true)
      .first();

    logQuery({
      logger: fastify.log,
      query,
      context: "Get Inaugural Offer Info",
      logTrace
    });

    const response = await query;

    if (!response) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Inaugural offer not found",
        property: "",
        code: "NOT_FOUND"
      });
    }

    return response;
  }

  async function postInauguralOffer({ body, logTrace, userDetails }) {
    const knex = this;
    const created_by = userDetails.id;

    //validate outlet_id exists
    const outlet = await knex(OUTLETS.NAME)
      .where(OUTLETS.COLUMNS.ID, body.outlet_id)
      .where(OUTLETS.COLUMNS.IS_ACTIVE, true)
      .first();

    if (!outlet) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Outlet not found",
        property: "outlet_id",
        code: "NOT_FOUND"
      });
    }

    // Check if outlet already has an inaugural offer
    const existingOffer = await knex(INAUGURAL_OFFER.NAME)
      .where(INAUGURAL_OFFER.COLUMNS.OUTLET_ID, body.outlet_id)
      .first();

    if (existingOffer) {
      throw CustomError.create({
        httpCode: StatusCodes.CONFLICT,
        message: "Inaugural offer already exists for this outlet",
        property: "",
        code: "CONFLICT"
      });
    }

    // Check if io_date is same as existing io_date
    if (body.io_date) {

      // check body.io_date future or current date 

      const ioDate = new Date(body.io_date);
      const today = new Date();
      if (ioDate < today) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_ACCEPTABLE,
          message: "IO Date must be greater than or equal to current date",
          property: "io_date",
          code: "NOT_ACCEPTABLE"
        });
      }
    }

    const query = knex(INAUGURAL_OFFER.NAME).insert({
      [INAUGURAL_OFFER.COLUMNS.OUTLET_ID]: body.outlet_id,
      [INAUGURAL_OFFER.COLUMNS.IO_DATE]: body.io_date || knex.fn.now(),
      [INAUGURAL_OFFER.COLUMNS.IO_DAYS]: body.io_days,
      [INAUGURAL_OFFER.COLUMNS.IO_PURCHASE_AMT]: body.io_purchase_amt || 0,
      [INAUGURAL_OFFER.COLUMNS.IO_DISCOUNT_AMT]: body.io_discount_amt || 0,
      [INAUGURAL_OFFER.COLUMNS.IO_BONUS_PNT]: body.io_bonus_pnt || 0,
      [INAUGURAL_OFFER.COLUMNS.IS_ACTIVE]: body.is_active || true,
      [INAUGURAL_OFFER.COLUMNS.STATUS]: false,
      [INAUGURAL_OFFER.COLUMNS.CREATED_BY]: created_by
    }).returning("*");

    logQuery({
      logger: fastify.log,
      query,
      context: "Create Inaugural Offer",
      logTrace
    });

    const response = await query;

    if (!response) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_IMPLEMENTED,
        message: "Error while creating inaugural offer",
        property: "",
        code: "NOT_IMPLEMENTED"
      });
    }

    const new_data = {
      [INAUGURAL_OFFER.NAME]: response[0]
    }

    await knex(INAUGURAL_OFFER_LOGS.NAME).insert({
      [INAUGURAL_OFFER_LOGS.COLUMNS.OPERATION_NAME]: "CREATE",
      [INAUGURAL_OFFER_LOGS.COLUMNS.OLD_DATA]: null,
      [INAUGURAL_OFFER_LOGS.COLUMNS.NEW_DATA]: JSON.stringify(new_data),
      [INAUGURAL_OFFER_LOGS.COLUMNS.USER_ID]: userDetails.id,
      [INAUGURAL_OFFER_LOGS.COLUMNS.USER_NAME]: userDetails.user_name,
      [INAUGURAL_OFFER_LOGS.COLUMNS.OUTLET_ID]: response[0].outlet_id,
    });

    return { success: true };
  }

  async function putInauguralOffer({ params, body, logTrace, userDetails }) {
    const knex = this;
    const { outlet_id } = params;
    const updated_by = userDetails.id;





    // Check if record exists
    const existingOffer = await knex(INAUGURAL_OFFER.NAME)
      .where(INAUGURAL_OFFER.COLUMNS.OUTLET_ID, outlet_id)
      .first();



    if (!existingOffer) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Inaugural offer not found",
        property: "",
        code: "NOT_FOUND"
      });
    }


    // Check if io_date is same as existing io_date
    if (body.io_date && body.io_date !== existingOffer.io_date) {

      // check body.io_date future or current date 

      const ioDate = new Date(body.io_date);
      const today = new Date();
      if (ioDate < today) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_ACCEPTABLE,
          message: "IO Date must be greater than or equal to current date",
          property: "io_date",
          code: "NOT_ACCEPTABLE"
        });
      }
    }

    const updateData = {
      [INAUGURAL_OFFER.COLUMNS.UPDATED_BY]: updated_by,
      [INAUGURAL_OFFER.COLUMNS.UPDATED_AT]: knex.fn.now()
    };

    if (body.io_date !== undefined) updateData[INAUGURAL_OFFER.COLUMNS.IO_DATE] = body.io_date;
    if (body.io_days !== undefined) updateData[INAUGURAL_OFFER.COLUMNS.IO_DAYS] = body.io_days;
    if (body.io_purchase_amt !== undefined) updateData[INAUGURAL_OFFER.COLUMNS.IO_PURCHASE_AMT] = body.io_purchase_amt;
    if (body.io_discount_amt !== undefined) updateData[INAUGURAL_OFFER.COLUMNS.IO_DISCOUNT_AMT] = body.io_discount_amt;
    if (body.io_bonus_pnt !== undefined) updateData[INAUGURAL_OFFER.COLUMNS.IO_BONUS_PNT] = body.io_bonus_pnt;
    if (body.is_active !== undefined) updateData[INAUGURAL_OFFER.COLUMNS.IS_ACTIVE] = body.is_active;

    const query = knex(INAUGURAL_OFFER.NAME)
      .where(INAUGURAL_OFFER.COLUMNS.OUTLET_ID, outlet_id)
      .update(updateData)
      .returning("*");

    logQuery({
      logger: fastify.log,
      query,
      context: "Update Inaugural Offer",
      logTrace
    });

    const response = await query;

    if (!response) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_IMPLEMENTED,
        message: "Error while updating inaugural offer",
        property: "",
        code: "NOT_IMPLEMENTED"
      });
    }

    const old_data = { [INAUGURAL_OFFER.NAME]: existingOffer };
    const update_data = { "body": body };

    await knex(INAUGURAL_OFFER_LOGS.NAME).insert({
      [INAUGURAL_OFFER_LOGS.COLUMNS.OPERATION_NAME]: "UPDATE",
      [INAUGURAL_OFFER_LOGS.COLUMNS.OLD_DATA]: JSON.stringify(old_data),
      [INAUGURAL_OFFER_LOGS.COLUMNS.NEW_DATA]: JSON.stringify(update_data),
      [INAUGURAL_OFFER_LOGS.COLUMNS.USER_ID]: userDetails.id,
      [INAUGURAL_OFFER_LOGS.COLUMNS.USER_NAME]: userDetails.user_name,
      [INAUGURAL_OFFER_LOGS.COLUMNS.OUTLET_ID]: response[0].outlet_id,
    });

    return { success: true };
  }


  return {
    getInauguralOfferList,
    getInauguralOfferInfo,
    postInauguralOffer,
    putInauguralOffer
  };
}

module.exports = inauguralOfferRepo;
