const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const { logQuery } = require("../../commons/helpers");
const axios = require('axios');
const { PRODUCT_MASTER, ITEM,
  OUTLET_SALES_DETAIL, OUTLET_SALES_MASTER, OUTLET_PRODUCT_MAPPING, OUTLETS } = require("../commons/constants");
// const { exists } = require("fs-extra");

function getitemRepo(fastify) {

 async function getitemInfo({ params, queryString, logTrace }) {

  const knex = this;

  const query1 = knex(ITEM.NAME)

    .select(

      `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PRODUCT_ID} as prod_id`,

      `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PRODUCT_CODE} as prod_code`,

      `${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_NAME} as prod_Name`,

      `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BARCODE} as barcode`,

      `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.MRP} as mrp`,

      `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PURCHASE_RATE} as purchase_rate`,

      `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.MIN_STOCK} as min_stock`,

      `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.SALES_RATE} as sales_rate`,

      `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BALENCE_STOCK} as balance`,

      knex.raw(`
        CASE
          WHEN ?? = 0 THEN true
          ELSE false
        END as out_of_stock
      `, [
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BALENCE_STOCK}`
      ])

    )

    .leftJoin(
      OUTLET_PRODUCT_MAPPING.NAME,
      `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PRODUCT_ID}`,
      `${ITEM.NAME}.${ITEM.COLUMNS.ID}`
    )

    .where(`${ITEM.NAME}.${ITEM.COLUMNS.IS_ACTIVE}`, true)

    .andWhere(
      `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.OUTLET_ID}`,
      params.outlet_id
    );

  // SEARCH
const { search } = queryString;
  if (search && search.length >= 3) {
    query1.andWhere(function () {
      this.where(
        `${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_CODE}`,
        "like",
        `%${search}%`
      )
        .orWhere(
          `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BARCODE}`,
          "like",
          `%${search}%`
        )
        .orWhere(
          `${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_NAME}`,
          "like",
          `%${search}%`
        );
    });
  }

  //console.log("query", query1.toString());

  logQuery({
    logger: fastify.log,
    query: query1,
    context: "Get Product Info",
    logTrace
  });

  const response = await query1

    // FIXED ORDER BY
    .orderBy(`${ITEM.NAME}.${ITEM.COLUMNS.ID}`, "DESC")

    .paginate({
      pageSize: params.page_size,
      currentPage: params.current_page
    });

  //console.log("itemSearch", response);

  if (!response.data.length) {

    throw CustomError.create({
      httpCode: StatusCodes.NOT_FOUND,
      message: "Product not found",
      property: "",
      code: "NOT_FOUND"
    });
  }

  if (response.meta.pagination.total_pages < params.current_page) {

    throw CustomError.create({
      httpCode: StatusCodes.NOT_ACCEPTABLE,
      message: "Requested page is beyond the available data",
      property: "",
      code: "NOT_ACCEPTABLE"
    });
  }

  return response;
}

  async function getbubbillInfo({ body, params, logTrace, userDetails }) {
    const knex = this;
    const billno = body.billno;
    const billdate = body.billdate;
    const counter_no = body.counter_no;
    const outlet_id = body.outlet_id;

    const query = knex(OUTLET_SALES_MASTER.NAME)
      .select()
      .where(OUTLET_SALES_MASTER.COLUMNS.BILL_NO, billno).andWhere(OUTLET_SALES_MASTER.COLUMNS.BILLDATE, billdate)
      .andWhere(OUTLET_SALES_MASTER.COLUMNS.OUTLET_ID, outlet_id)
      .andWhere(OUTLET_SALES_MASTER.COLUMNS.COUNTER, counter_no);

    logQuery({
      logger: fastify.log,
      query,
      context: "Get bill master Info",
      logTrace
    });
    const response = await query
    console.log("billMaster", response);

    if (!response) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Bill master not found",
        property: "",
        code: "NOT_FOUND"
      });
    }

    return {
      response
    };
  }

  async function billdetInfo({ body, params, logTrace, userDetails }) {
    const knex = this;
    const billno = body.billno;
    const billdate = body.billdate;
    const counter_no = body.counter_no;
    const outlet_id = body.outlet_id;

    const query = knex(OUTLET_SALES_DETAIL.NAME)
      .select()
      .where(OUTLET_SALES_DETAIL.COLUMNS.BILL_NO, billno).andWhere(OUTLET_SALES_DETAIL.COLUMNS.BILL_DATE, billdate)
      .andWhere(OUTLET_SALES_DETAIL.COLUMNS.OUTLET_ID, outlet_id)
      .andWhere(OUTLET_SALES_DETAIL.COLUMNS.COUNTER, counter_no);

    logQuery({
      logger: fastify.log,
      query,
      context: "Get Bill detail Info",
      logTrace
    });

    const response = await query
    //console.log("billDet", response);

    if (!response) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: " Bill detail not found",
        property: "",
        code: "NOT_FOUND"
      });
    }

    return {
      response
    };
  }



  return {

    getitemInfo,
    getbubbillInfo,
    billdetInfo,
  };
}


module.exports = getitemRepo;
