const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../../errorHandler");
const { logQuery } = require("../../../commons/helpers");
const { OUTLET_MEMBERS, PAY_TYPE_MASTER } = require("../commons/constants");


function payTypesRepo(fastify) {

  async function getPayTypesList({ logTrace, queryString }) {
    const knex = this;

    const { status, search } = queryString;

    const query = knex(PAY_TYPE_MASTER.NAME).select([
      PAY_TYPE_MASTER.COLUMNS.ID,
      PAY_TYPE_MASTER.COLUMNS.PAY_TYPE_NAME,
      PAY_TYPE_MASTER.COLUMNS.PAY_TYPE_KEY,
      PAY_TYPE_MASTER.COLUMNS.IS_ACTIVE,
      PAY_TYPE_MASTER.COLUMNS.CREATED_AT
    ]);

    //  Status filter
    if (Number(status) === 1) {
      query.where(PAY_TYPE_MASTER.COLUMNS.IS_ACTIVE, true);
    }

    if (Number(status) === 2) {
      query.where(PAY_TYPE_MASTER.COLUMNS.IS_ACTIVE, false);
    }

    //  Search
    if (search && search.length >= 2) {
      query.where(function () {
        this.where(
          PAY_TYPE_MASTER.COLUMNS.PAY_TYPE_NAME,
          "ilike",
          `%${search}%`
        ).orWhere(
          PAY_TYPE_MASTER.COLUMNS.PAY_TYPE_KEY,
          "ilike",
          `%${search}%`
        );
      });
    }

    //  Order
    query.orderBy(PAY_TYPE_MASTER.COLUMNS.ID, "asc");

    logQuery({
      logger: fastify.log,
      query,
      context: "Get Pay Types List",
      logTrace
    });

    const data = await query;

    //  No data check
    if (!data.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Pay Types not found",
        code: "NOT_FOUND"
      });
    }

    return data;
  }


  async function postPayType({ body, logTrace, userDetails }) {
    const knex = this;

    // Normalize key (VERY IMPORTANT)
    const payTypeKey = body.pay_type_key.toUpperCase().trim();

    //  Check duplicate pay_type_key
    const exists = await knex(PAY_TYPE_MASTER.NAME)
      .where(PAY_TYPE_MASTER.COLUMNS.PAY_TYPE_KEY, payTypeKey)
      .first();

    if (exists) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "Pay Type Key already exists",
        property: "pay_type_key",
        code: "NOT_ACCEPTABLE"
      });
    }

    //  Insert Pay Type
    const [inserted] = await knex(PAY_TYPE_MASTER.NAME)
      .insert({
        [PAY_TYPE_MASTER.COLUMNS.PAY_TYPE_NAME]: body.pay_type_name,
        [PAY_TYPE_MASTER.COLUMNS.PAY_TYPE_KEY]: payTypeKey,
        [PAY_TYPE_MASTER.COLUMNS.IS_ACTIVE]: body.is_active ?? true,
        [PAY_TYPE_MASTER.COLUMNS.CREATED_BY]: userDetails.id
      })
      .returning(["id"]);

    const insertedId = inserted?.id;

    if (!insertedId) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_IMPLEMENTED,
        message: "Error while creating Pay Type",
        code: "NOT_IMPLEMENTED"
      });
    }

    return {
      success: true,
      insert_id: insertedId
    };
  }

  async function putPayType({ pay_type_id, body, logTrace, userDetails }) {
    const knex = this;

    //  Check pay type exists
    const exists = await knex(PAY_TYPE_MASTER.NAME)
      .where(PAY_TYPE_MASTER.COLUMNS.ID, pay_type_id)
      .first();

    if (!exists) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "Pay Type not found to update",
        code: "NOT_ACCEPTABLE"
      });
    }

    //  Prevent key update (VERY IMPORTANT)
    if (body.pay_type_key) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_ACCEPTABLE,
        message: "Pay Type Key cannot be updated",
        property: "pay_type_key",
        code: "NOT_ACCEPTABLE"
      });
    }

    //  Prepare update payload (only allowed fields)
    const updatePayload = {
      ...(body.pay_type_name && {
        [PAY_TYPE_MASTER.COLUMNS.PAY_TYPE_NAME]: body.pay_type_name
      }),

      ...(body.is_active !== undefined && {
        [PAY_TYPE_MASTER.COLUMNS.IS_ACTIVE]: body.is_active
      }),

      //  System fields
      [PAY_TYPE_MASTER.COLUMNS.UPDATED_BY]: userDetails.id,
      [PAY_TYPE_MASTER.COLUMNS.UPDATED_AT]: knex.fn.now()
    };

    //  Prevent empty update
    if (Object.keys(updatePayload).length === 2) {
      // only updated_by & updated_at present
      throw CustomError.create({
        httpCode: StatusCodes.BAD_REQUEST,
        message: "No valid fields provided for update",
        code: "BAD_REQUEST"
      });
    }

    const updated = await knex(PAY_TYPE_MASTER.NAME)
      .where(PAY_TYPE_MASTER.COLUMNS.ID, pay_type_id)
      .update(updatePayload);

    if (!updated) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_IMPLEMENTED,
        message: "Error while updating Pay Type",
        code: "NOT_IMPLEMENTED"
      });
    }

    return { success: true };
  }

async function deletePayType({ pay_type_id, logTrace, userDetails }) {
  const knex = this;

  // 🔹 Check pay type exists
  const exists = await knex(PAY_TYPE_MASTER.NAME)
    .where(PAY_TYPE_MASTER.COLUMNS.ID, pay_type_id)
    .first();

  if (!exists) {
    throw CustomError.create({
      httpCode: StatusCodes.NOT_ACCEPTABLE,
      message: "Pay Type not found to delete",
      code: "NOT_ACCEPTABLE"
    });
  }

  //  Hard delete 
  const query = knex(PAY_TYPE_MASTER.NAME)
    .where(PAY_TYPE_MASTER.COLUMNS.ID, pay_type_id)
    .del();

  logQuery({
    logger: fastify.log,
    query,
    context: "DELETE PAY TYPE",
    logTrace
  });

  const response = await query;

  if (!response) {
    throw CustomError.create({
      httpCode: StatusCodes.NOT_IMPLEMENTED,
      message: "Error while deleting Pay Type",
      code: "NOT_IMPLEMENTED"
    });
  }

  return { success: true };
}

  return {
    getPayTypesList,
    postPayType,
    putPayType,
    deletePayType
  };
}

module.exports = payTypesRepo;
