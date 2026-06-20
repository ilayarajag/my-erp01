const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const { logQuery } = require("../../commons/helpers");
const axios = require("axios");
const {
  PRODUCT_MASTER,
  //COUNTERCART,
  SPLCOUPONISSUE,
  OUTLET_SALES_MASTER,
  OUTLET_SALES_DETAIL,
  YEAR_SALES,
  COUNTER_SALES,
  SPL_COUPON_DETAIL,
  CARD_TRANSACTION,
  CARD_LEDGER,
  CARD_MASTER,
  ITEM_DETAILS,
  MEMBER_ITEM,
  GROUP_SALES,
  HOUR_SALES,
  SCHEME_LOG,
  OFFER_LOG,
  COMP_NAME,
  OUTLET_PRODUCT_MAPPING,
  ITEM,
  UNITS,
  BARCODE_LIST,
  CLEARANCE_SALE,
  PRICEOFF,
  SPL_COUPON,
  COUNTER_CART,
  SPL_COUPON_ISSUE,
  SETTING,
  OFFER_MASTER_LOGS,
  OFFER_MASTER,
  SCHEMES,
  CNT_DENOMINATIONS,
  CPRTOPTION,
  COMPANY_BANK_DETAILS,
  COMPANY_LOGS,
  COMPANY,
  OFFER_DETAIL,
  ITEM_SETTING,
  MAIN_CATEGORY,
  SUB_CATEGORY,
  PAYTYPE_MASTER,
  COUNTER_CART_TEMP,
  OUTLET_MEMBERS,
  SETTING3,
  REDEEM_RANGE,
  PENDINGBILL,
  HEADS,
  OUT_BILL_MASTER,
  OUT_BILL_DETAIL,
  TYPEDESIGN,
  MERCHANT_CATEGORY,
  COUNTER_SETTINGS,
  OUTLETS,
  PAY_TYPE_MASTER,
  PAYMENT_PROVIDERS,
  SALES,
  OUTLET_PURCHASE_BATCH_DETAILS,
  OUTLET_PURCHASE_MASTER,
  OUTLET_PURCHASE_DETAILS,
  LOYALTY_APPLY_DETAILS


} = require("../commons/constants");
const { exists } = require("fs-extra");
const { errorCodes } = require("fastify");
const { map, sum } = require("lodash");
const outletmemberservice = require("../../catalog/outletmembers/services/outletMembersServices");
// putOutletMemberService
function productRepo(fastify) {
  async function getProductInfo({ barcode, outlet_id, params, body, logTrace, userDetails }) {
    const knex = this;
    //console.log("userDetails",barcode, outlet_id);

    const query = knex(ITEM.NAME)
      .distinct()
      .select([
        `${ITEM.NAME}.${ITEM.COLUMNS.ID} AS prod_id`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PRODUCT_CODE} AS prod_code`,
        `${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_NAME} AS prod_name`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BARCODE} AS barcode`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.GST} AS gst`,
        `${ITEM.NAME}.${ITEM.COLUMNS.MAIN_CATEGORY_ID} AS main_category_id`,
        `${HEADS.NAME}.${HEADS.COLUMNS.CATEGORY_NAME} AS brand_name`,
        `${ITEM.NAME}.${ITEM.COLUMNS.SUB_CATEGORY_ID} AS sub_category_id`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BCID} AS bcid`,
        `${ITEM.NAME}.${ITEM.COLUMNS.MCID} AS mcid`,
        `${ITEM.NAME}.${ITEM.COLUMNS.UOM_ID} AS uom_id`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.MRP} AS mrp`,
        `${ITEM.NAME}.${ITEM.COLUMNS.HEAD_ID} AS head_id`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PRODUCT_ID} AS prod_id`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.HSN} AS hsn`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.SALES_RATE} AS sales_rate`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PURCHASE_RATE} AS purchase_rate`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.GST} AS gst`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.CESS} AS cess`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.IS_ACTIVE} AS active`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.MBQ} AS mpq`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.GR_WT} AS gr_wt`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.DIS} AS discount`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.DIS} AS discount_amount`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.STKHOLD} AS stkhold`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PTAX} AS ptax`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.STAX} AS stax`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.MIN_STOCK}`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.MRP} AS mrp`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.ALLOW_NEG_STK} AS allow_neg_stk`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.NEGATIVE_STOCK} AS negative_stock`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.RATE_EDIT} AS rate_edit`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.DECIMAL1} AS decimal1`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.ACTIVE} AS active`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.LPOINT} AS lpoint`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.CPOINT} AS cpoint`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.IS_ACTIVE} AS active`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BATCH_NO} AS batch_no`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.OUTLET_ID} AS outlet_id`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.IS_ACTIVE} AS is_active`,
        `${MAIN_CATEGORY.NAME}.${MAIN_CATEGORY.COLUMNS.CATEGORY_NAME}
          AS category_name`,
        `${SUB_CATEGORY.NAME}.${SUB_CATEGORY.COLUMNS.SUBCATEGORY_NAME} AS sub_category_name`,
        `${UNITS.NAME}.${UNITS.COLUMNS.UNITS_SHORT_NAME} AS uom_name`,
      ])
      .leftJoin(
        UNITS.NAME,
        `${UNITS.NAME}.${UNITS.COLUMNS.ID}`,
        `${ITEM.NAME}.${ITEM.COLUMNS.UOM_ID}`
      )


      .leftJoin(
        OUTLET_PRODUCT_MAPPING.NAME,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PRODUCT_ID}`,
        `${ITEM.NAME}.${ITEM.COLUMNS.ID}`
      )

      .leftJoin(
        MAIN_CATEGORY.NAME,
        `${MAIN_CATEGORY.NAME}.${MAIN_CATEGORY.COLUMNS.ID}`,
        `${ITEM.NAME}.${ITEM.COLUMNS.MAIN_CATEGORY_ID}`
      )

      .leftJoin(
        SUB_CATEGORY.NAME,
        `${SUB_CATEGORY.NAME}.${SUB_CATEGORY.COLUMNS.ID}`,
        `${ITEM.NAME}.${ITEM.COLUMNS.SUB_CATEGORY_ID}`
      )
      .leftJoin(
        HEADS.NAME,
        `${HEADS.NAME}.${HEADS.COLUMNS.ID}`,
        `${ITEM.NAME}.${ITEM.COLUMNS.HEAD_ID}`
      )


      .where(function () {
        this.where(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE}`, barcode)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE1}`, barcode)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE2}`, barcode)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE3}`, barcode)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE4}`, barcode)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_CODE}`, barcode)
          .orWhere(`${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BARCODE}`, barcode)
          .orWhere(`${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PRODUCT_CODE}`, barcode)
      })
      .andWhere(`${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.OUTLET_ID}`, outlet_id)
      .andWhere(`${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.SALES_RATE}`, '>', 0)


      .andWhere(`${ITEM.NAME}.${ITEM.COLUMNS.IS_ACTIVE}`, true);
    logQuery({
      logger: fastify.log,
      query,
      context: "Get Product Info",
      logTrace
    });
    //console.log("query", query.toString());

    const response = await query;

    //console.log("productinfo", response);

    if (!response.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Product not found or not mapped from the outlet ",
        property: "",
        code: "NOT_FOUND"
      });
    }
    return response[0];
  }

  async function getClearanceInfo({ barcode, logTrace, userDetails }) {
    const knex = this;
    // const query = knex(CLEARANCE_SALE.NAME)
    //   .select([
    //     `${CLEARANCE_SALE.NAME}.${CLEARANCE_SALE.COLUMNS.MRP} as cmrp`,
    //     `${CLEARANCE_SALE.NAME}.${CLEARANCE_SALE.COLUMNS.SRATE} as csrate`,
    //     `${CLEARANCE_SALE.NAME}.${CLEARANCE_SALE.COLUMNS.CQTY} as cqty`,
    //     `${CLEARANCE_SALE.NAME}.${CLEARANCE_SALE.COLUMNS.UQTY} as uqty`,
    //     `${ITEM.NAME}.${ITEM.COLUMNS.ID} as prod_id`,
    //     `${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_CODE} as prod_code`,
    //     `${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_NAME} as prod_name`,
    //     `${ITEM.NAME}.${ITEM.COLUMNS.BARCODE} as barcode`,
    //     `${ITEM.NAME}.${ITEM.COLUMNS.MAIN_CATEGORY_ID} as main_category_id`,
    //     `${ITEM.NAME}.${ITEM.COLUMNS.SUB_CATEGORY_ID} as sub_category_id`,
    //     `${ITEM.NAME}.${ITEM.COLUMNS.UOM_ID} as uom_id`,
    //    `c.${UNITS.COLUMNS.UNITS_SHORT_NAME} as uom_name`,
    //   ])
    //   .leftJoin(`${ITEM.NAME}`, `${CLEARANCE_SALE.NAME}.${CLEARANCE_SALE.COLUMNS.PROD_ID}`, `${ITEM.NAME}.${ITEM.COLUMNS.ID}`)
    //   .leftJoin(`${UNITS.NAME} as c`, `${UNITS.NAME}.${UNITS.COLUMNS.ID}`, `${ITEM.NAME}.${ITEM.COLUMNS.UOM_ID}`)
    //   .where(`${CLEARANCE_SALE.NAME}.barcode`, barcode);

    const query = knex(CLEARANCE_SALE.NAME)
      .select([
        `${CLEARANCE_SALE.NAME}.${CLEARANCE_SALE.COLUMNS.MRP} as cmrp`,
        `${CLEARANCE_SALE.NAME}.${CLEARANCE_SALE.COLUMNS.SRATE} as csrate`,
        `${CLEARANCE_SALE.NAME}.${CLEARANCE_SALE.COLUMNS.CQTY} as cqty`,
        `${CLEARANCE_SALE.NAME}.${CLEARANCE_SALE.COLUMNS.UQTY} as uqty`,
         `${ITEM.NAME}.${ITEM.COLUMNS.ID} AS prod_id`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PRODUCT_CODE} AS prod_code`,
        `${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_NAME} AS prod_name`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BARCODE} AS barcode`,
         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.GST} AS gst`,
        `${ITEM.NAME}.${ITEM.COLUMNS.MAIN_CATEGORY_ID} AS main_category_id`,
        `${HEADS.NAME}.${HEADS.COLUMNS.CATEGORY_NAME} AS brand_name`,
        `${ITEM.NAME}.${ITEM.COLUMNS.SUB_CATEGORY_ID} AS sub_category_id`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BCID} AS bcid`,
        `${ITEM.NAME}.${ITEM.COLUMNS.MCID} AS mcid`,
        `${ITEM.NAME}.${ITEM.COLUMNS.UOM_ID} AS uom_id`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.MRP} AS mrp`,
        `${ITEM.NAME}.${ITEM.COLUMNS.HEAD_ID} AS head_id`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PRODUCT_ID} AS prod_id`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.HSN} AS hsn`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.SALES_RATE} AS sales_rate`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PURCHASE_RATE} AS purchase_rate`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.GST} AS gst`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.CESS} AS cess`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.IS_ACTIVE} AS active`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.MBQ} AS mpq`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.GR_WT} AS gr_wt`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.DIS} AS discount`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.DIS} AS discount_amount`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.STKHOLD} AS stkhold`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PTAX} AS ptax`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.STAX} AS stax`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.MIN_STOCK}`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.MRP} AS mrp`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.ALLOW_NEG_STK} AS allow_neg_stk`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.NEGATIVE_STOCK} AS negative_stock`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.RATE_EDIT} AS rate_edit`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.DECIMAL1} AS decimal1`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.ACTIVE} AS active`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.LPOINT} AS lpoint`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.CPOINT} AS cpoint`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.IS_ACTIVE} AS active`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BATCH_NO} AS batch_no`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.OUTLET_ID} AS outlet_id`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.IS_ACTIVE} AS is_active`,
        `${MAIN_CATEGORY.NAME}.${MAIN_CATEGORY.COLUMNS.CATEGORY_NAME}
          AS category_name`,
        `${SUB_CATEGORY.NAME}.${SUB_CATEGORY.COLUMNS.SUBCATEGORY_NAME} AS sub_category_name`,
        `${UNITS.NAME}.${UNITS.COLUMNS.UNITS_SHORT_NAME} AS uom_name`,
      ])

      .leftJoin(
        ITEM.NAME,
        `${ITEM.NAME}.${ITEM.COLUMNS.ID}`,
        `${CLEARANCE_SALE.NAME}.${CLEARANCE_SALE.COLUMNS.PROD_ID}`
      )
      .leftJoin(
        UNITS.NAME,
        `${UNITS.NAME}.${UNITS.COLUMNS.ID}`,
        `${ITEM.NAME}.${ITEM.COLUMNS.UOM_ID}`
      )


      .leftJoin(
        OUTLET_PRODUCT_MAPPING.NAME,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PRODUCT_ID}`,
        `${ITEM.NAME}.${ITEM.COLUMNS.ID}`
      )

      .leftJoin(
        MAIN_CATEGORY.NAME,
        `${MAIN_CATEGORY.NAME}.${MAIN_CATEGORY.COLUMNS.ID}`,
        `${ITEM.NAME}.${ITEM.COLUMNS.MAIN_CATEGORY_ID}`
      )

      .leftJoin(
        SUB_CATEGORY.NAME,
        `${SUB_CATEGORY.NAME}.${SUB_CATEGORY.COLUMNS.ID}`,
        `${ITEM.NAME}.${ITEM.COLUMNS.SUB_CATEGORY_ID}`
      )
      .leftJoin(
        HEADS.NAME,
        `${HEADS.NAME}.${HEADS.COLUMNS.ID}`,
        `${ITEM.NAME}.${ITEM.COLUMNS.HEAD_ID}`
      )
      .where(`${CLEARANCE_SALE.NAME}.${CLEARANCE_SALE.COLUMNS.BARCODE}`, barcode);
    logQuery({
      logger: fastify.log,
      query,
      context: "Get Clearance Info",
      logTrace
    });
    const response = await query;
    //console.log("clear", response);

    if (!response.length) {
      //console.log("response", response);

      return {
        cmrp: 0,
        csrate: 0,
        cqty: 0,
        uqty: 0,
        is_clearence_flag: false
      };
    } else {
      let cqty = response[0].cqty;
      let uqty = response[0].uqty;
      let diffqty = cqty - uqty;
      //console.log("difff", cqty, uqty);

      if (diffqty > 0) {
        await knex(CLEARANCE_SALE.NAME)
  .where(
    `${CLEARANCE_SALE.NAME}.${CLEARANCE_SALE.COLUMNS.BARCODE}`,
    barcode
  )
  .whereRaw(`${CLEARANCE_SALE.COLUMNS.CQTY} > ${CLEARANCE_SALE.COLUMNS.UQTY}`)
  .increment(CLEARANCE_SALE.COLUMNS.UQTY, 1);
        return {
          ...response[0],
          is_clearence_flag: true
        };
      } else {
        return {
          cmrp: 0,
          csrate: 0,
          cqty: 0,
          uqty: 0,
          is_clearence_flag: false
        };
      }
    }
  }
  async function getOfferInfo({ prod_id, gdate, logTrace, userDetails }) {
    const knex = this;

    // console.log("offferinfo");

    const query = knex(OFFER_MASTER.NAME)
      .select([
        `${OFFER_MASTER.NAME}.otype`,
        `${OFFER_MASTER.NAME}.obuy`,
        `${OFFER_MASTER.NAME}.oget`,
        `${OFFER_MASTER.NAME}.obuyid`,
        `${OFFER_MASTER.NAME}.ogetid`,
        `${OFFER_MASTER.NAME}.dis`,
        `${OFFER_MASTER.NAME}.poff`,
        `${OFFER_MASTER.NAME}.omode`
      ])
      .where(`${OFFER_MASTER.NAME}.active`, 1)
      .andWhereRaw('?::date BETWEEN ??::date AND ??::date', [
        gdate,
        `${OFFER_MASTER.NAME}.pfrom`,
        `${OFFER_MASTER.NAME}.pto`
      ])

      .andWhere(`${OFFER_MASTER.NAME}.obuyid`, prod_id);
    logQuery({
      logger: fastify.log,
      query,
      context: "Get Offer Info",
      logTrace
    });

    const response = await query;
    //console.log("responseinofferinfo", response);
    if (response.length > 0) {
      return response[0];
    }
  }
  async function getSpecialOfferInfo({
    prod_id,
    prod_code,
    gdate,
    logTrace,
    userDetails,
    outlet_id
  }) {
    const knex = this;
    console.log("gdatespecialofferinfo", gdate, prod_code, prod_id, outlet_id);

    const query = knex(PRICEOFF.NAME)
      .select(`${PRICEOFF.NAME}.prod_code`, `${PRICEOFF.NAME}.amount`, `${PRICEOFF.NAME}.pname`)
      .where(`${PRICEOFF.NAME}.prod_code`, prod_code)
      .andWhere(`${PRICEOFF.NAME}.etype`, 2)
      .andWhere(`${PRICEOFF.NAME}.pactive`, 1)
      .andWhere(`${PRICEOFF.NAME}.amount`, ">", 0)
      .andWhere(`${PRICEOFF.NAME}.outlet`, outlet_id)
      // .andWhereRaw('??::text LIKE ?', [
      //   `${PRICEOFF.NAME}.pid`,
      //   '%1%'
      // ])
      // .andWhere(`${PRICEOFF.NAME}.pid`, "like", "%1%")
      .andWhereRaw('?::date BETWEEN ??::date AND ??::date', [
        gdate,
        `${PRICEOFF.NAME}.pfrom`,
        `${PRICEOFF.NAME}.pto`
      ]);
    //console.log("splquery", query.toString());
    const response = await query;


    // console.log("splpriceoff", response);
    if (response.length > 0) {
      return response[0];
    }
  }
  async function getPriceOffInfo({
    prod_id,
    prod_code,
    gdate,
    logTrace,
    userDetails,
    outlet_id
  }) {
    const knex = this;
    const query = knex(PRICEOFF.NAME)
      .select(`${PRICEOFF.NAME}.prod_code`, `${PRICEOFF.NAME}.amount`, `${PRICEOFF.NAME}.pname`)
      .where(`${PRICEOFF.NAME}.prod_code`, prod_code)
      .andWhere(`${PRICEOFF.NAME}.etype`, 1)
      .andWhere(`${PRICEOFF.NAME}.pactive`, 1)
      .andWhere(`${PRICEOFF.NAME}.amount`, ">", 0)
      .andWhere(`${PRICEOFF.NAME}.outlet`, outlet_id)
      // .andWhereRaw('??::text LIKE ?', [
      //   `${PRICEOFF.NAME}.pid`,
      //   '%1%'
      // ])
      // .andWhere(`${PRICEOFF.NAME}.pid`, "like", "%1%")
      .andWhereRaw('?::date BETWEEN ??::date AND ??::date', [
        gdate,
        `${PRICEOFF.NAME}.pfrom`,
        `${PRICEOFF.NAME}.pto`
      ]);


    const response = await query;
    //console.log("getPriceOffinfo", response);

    if (response.length > 0) {
      return response[0];
    }
  }
  async function getDiscountInfo({
    prod_id,
    prod_code,
    gdate,
    logTrace,
    userDetails,
    outlet_id
  }) {
    const knex = this;
    // console.log("Discountinfo", prod_code, gdate);
    const query = knex(PRICEOFF.NAME)
      .select(
        `${PRICEOFF.NAME}.prod_code`,
        `${PRICEOFF.NAME}.amount`,
        `${PRICEOFF.NAME}.pname`
      )
      .where(`${PRICEOFF.NAME}.prod_code`, prod_code)
      .andWhere(`${PRICEOFF.NAME}.etype`, 0)
      .andWhere(`${PRICEOFF.NAME}.pactive`, 1)
      .andWhere(`${PRICEOFF.NAME}.amount`, ">", 0)
      .andWhere(`${PRICEOFF.NAME}.outlet`, outlet_id)
      // .andWhereRaw('??::text LIKE ?', [
      //   `${PRICEOFF.NAME}.pid`,
      //   '%2%'
      // ])
      // .andWhereRaw('? between ?? and ??', [
      //   gdate,
      //   `${PRICEOFF.NAME}.pfrom`,
      //   `${PRICEOFF.NAME}.pto`
      // ])
      .andWhereRaw('?::date BETWEEN ??::date AND ??::date', [
        gdate,
        `${PRICEOFF.NAME}.pfrom`,
        `${PRICEOFF.NAME}.pto`
      ]);
    // console.log("query", query.toString());

    const response = await query;
    // console.log("getDiscountres", response);

    if (response.length > 0) {
      return response[0];
    }
  }
  async function getOfferInfo({ body, gdate, logTrace, userDetails }) {
    const knex = this;
    const query = knex(PRICEOFF.NAME)
      .select(`${PRICEOFF.NAME}.prod_code`, `${PRICEOFF.NAME}.amount`, `${PRICEOFF.NAME}.pname`, `${PRICEOFF.NAME}.pname`)
      .where(`${PRICEOFF.NAME}.prod_code`, body.prod_code)
      .andWhere(`${PRICEOFF.NAME}.etype`, 0)
      .andWhere(`${PRICEOFF.NAME}.pactive`, 1)
      .andWhere(`${PRICEOFF.NAME}.amount`, ">", 0)
      // .andWhereRaw('??::text LIKE ?', [
      //   `${PRICEOFF.NAME}.pid`,
      //   '%1%'
      // ])
      //.andWhere(`${PRICEOFF.NAME}.pid`, "like", "%1%")
      .andWhereRaw('? >= ??', [
        gdate,
        `${PRICEOFF.NAME}.pfrom`
      ]);

    const response = await query;
    if (response.length > 0) {
      return true;
    } else {
      return false;
    }
  }
  async function getOfferCount({ gdate, logTrace, userDetails, outlet_id }) {
    const knex = this;
    console.log("offfercount");

    const query = knex(OFFER_MASTER.NAME)
      .count(`${OFFER_MASTER.NAME}.oid as a`)
      .where(`${OFFER_MASTER.NAME}.active`, true)
      .andWhere(`${OFFER_MASTER.NAME}.outletid`, outlet_id)
      // .andWhere(knex.raw(`'${gdate}' between ${OFFER_MASTER.NAME}.pfrom and ${OFFER_MASTER.NAME}.pto`));
      // .andWhereRaw('??::text LIKE ?', [
      //   `${OFFER_MASTER.NAME}.pid`,
      //   '%1%'
      // ])
      .andWhereRaw('?::date BETWEEN ??::date AND ??::date', [
        gdate,
        `${OFFER_MASTER.NAME}.pfrom`,
        `${OFFER_MASTER.NAME}.pto`
      ]);
    //console.log("query", query.toString());

    const [{ a }] = await query;
   // console.log("getOfferCount", a);

    return a;
  }
  async function getOfferDetails({
    prod_id,
    prod_code,
    qty,
    mrp,
    gdate,
    logTrace,
    userDetails,
    outlet_id
  }) {
    const knex = this;
    const query = knex(OFFER_MASTER.NAME)
      .select(
        `${OFFER_MASTER.NAME}.otype`,
        `${OFFER_MASTER.NAME}.obuy`,
        `${OFFER_MASTER.NAME}.oget`,
        `${OFFER_MASTER.NAME}.obuyid`,
        `${OFFER_MASTER.NAME}.ogetid`,
        `${OFFER_MASTER.NAME}.dis`,
        `${OFFER_MASTER.NAME}.poff`,
        `${OFFER_MASTER.NAME}.omode`,
        `${OFFER_MASTER.NAME}.comp`,
        `${OFFER_MASTER.NAME}.shop`
      )
      .where(`${OFFER_MASTER.NAME}.active`, true)
      .andWhere(`${OFFER_MASTER.NAME}.outletid`, outlet_id)

      // .andWhereRaw(
      //   "(',' || ?? || ',') LIKE ?",
      //   [`${OFFER_MASTER.NAME}.pid`, `%,${prod_id},%`]
      // )
      .andWhereRaw('?::date BETWEEN ??::date AND ??::date', [
        gdate,
        `${OFFER_MASTER.NAME}.pfrom`,
        `${OFFER_MASTER.NAME}.pto`
      ])
      .andWhere(`${OFFER_MASTER.NAME}.obuyid`, prod_id);
    //console.log("query", query.toString());

    const response = await query;
    //console.log("offerDet111", response);

    if (!response.length > 0) {
      return {};
    }
    return {
      prod_id,
      prod_code,
      qty,
      mrp,
      ...response[0]
    };
  }
  async function getSchemeDetails({ smode, gdate, logTrace, userDetails, outlet_id }) {
    const knex = this;
    const query = knex(SCHEMES.NAME)
      .select(`${SCHEMES.NAME}.pamount`, `${SCHEMES.NAME}.dval`, `${SCHEMES.NAME}.dtype`, `${SCHEMES.NAME}.smode`, `${SCHEMES.NAME}.pid`, `${SCHEMES.NAME}.stype`, `${SCHEMES.NAME}.sname`, `${SCHEMES.NAME}.qty`)
      .where(`${SCHEMES.NAME}.smode`, smode)
      .andWhere(`${SCHEMES.NAME}.active`, 1)
        .andWhere(`${SCHEMES.NAME}.outlet_id`, outlet_id)
      // .andWhere(knex.raw(`'${gdate}' between ${SCHEMES.NAME}.fdate and ${SCHEMES.NAME}.tdate`))
      .andWhereRaw('?::date BETWEEN ??::date AND ??::date', [
        gdate,
        `${SCHEMES.NAME}.fdate`,
        `${SCHEMES.NAME}.tdate`
      ])
      .orderBy(`${SCHEMES.NAME}.pamount`);
   // console.log("SchemeQury", query.toString());

    const response = await query;
    //console.log("getschemeDet", response);

    if (response.length > 0) {
      return response;
    } else {
      return [];
    }
  }
  async function getSchemeCount({ gdate, logTrace, userDetails, outlet_id }) {
    const knex = this;
    const query = knex(SCHEMES.NAME)
      .count(`${SCHEMES.NAME}.sid as a`)
      .where(`${SCHEMES.NAME}.active`, 1)
      .andWhere(`${SCHEMES.NAME}.outlet_id`, outlet_id)
      //.andWhere(knex.raw(`'${gdate}' between ${SCHEMES.NAME}.fdate and ${SCHEMES.NAME}.tdate`));
      .andWhereRaw('?::date BETWEEN ??::date AND ??::date', [
        gdate,
        `${SCHEMES.NAME}.fdate`,
        `${SCHEMES.NAME}.tdate`
      ]);
    const [{ a }] = await query;
   // console.log("scheme", a);

    return a;
  }
  // async function getItemsInCart({ counter_no, users_id, outlet_id, logTrace }) {
  //   const knex = this;
  //   console.log("user_id", users_id);
  //   console.log("counter_no", counter_no);
  //   console.log("outlet_id", outlet_id);

  //  const query = knex(COUNTER_CART.NAME)
  // .select('*')
  // .where(`${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.USERS_ID}`, users_id)
  // .andWhere(`${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.OUTLET_ID}`, outlet_id)
  // .andWhere(`${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.COUNTER_NO}`, counter_no);
  //   logQuery({
  //     logger: fastify.log,
  //     query,
  //     context: "Get Product Info",
  //     logTrace
  //   });
  //   const response = await query;
  //   // console.log("joinResult", response);

  //   if (!response.length) {
  //     throw CustomError.create({
  //       httpCode: StatusCodes.NOT_FOUND,
  //       message: "Cart is empty",
  //       property: "",
  //       code: "NOT_FOUND"
  //     });
  //   }
  //   return response;
  // }
  async function getItemsInCart({ counter_no, users_id, outlet_id, logTrace }) {
    const knex = this;
    //console.log("getItemsInCart", counter_no, users_id, outlet_id, logTrace);

    const query = knex(COUNTER_CART.NAME)
      .distinctOn(`${ITEM.NAME}.${ITEM.COLUMNS.ID}`)
      .select(
        `${ITEM.NAME}.${ITEM.COLUMNS.ID} AS prod_id`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PRODUCT_CODE} AS prod_code`,
        `${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_NAME} AS prod_name`,
        `${ITEM.NAME}.${ITEM.COLUMNS.UOM_ID} AS prod_uom`,
        `${ITEM.NAME}.${ITEM.COLUMNS.SHORT_NAME} AS prod_short`,
        `${ITEM.NAME}.${ITEM.COLUMNS.PRO_DESCRIPTION} AS prod_long`,
        `${ITEM.NAME}.${ITEM.COLUMNS.REGIONAL_NAME} AS region`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.GST} AS cgst`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.GST} AS gst`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.GST} AS sgst`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.MRP} AS pmrp`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BALENCE_STOCK} AS balance`,
        `${ITEM.NAME}.${ITEM.COLUMNS.IS_ACTIVE} as pactive`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.MIN_STOCK}`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.OPENING_STOCK} as opening_stock`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.ALLOW_NEG_STK}`,
        `${ITEM.NAME}.${ITEM.COLUMNS.MAIN_CATEGORY_ID} AS main_cat_id`,
        `${ITEM.NAME}.${ITEM.COLUMNS.SUB_CATEGORY_ID} AS sub_cat_id`,
        `${ITEM.NAME}.${ITEM.COLUMNS.MCID} as mcid`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.SALES_RATE} as sale_rate`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PURCHASE_RATE} as purchase_rate`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.DIS} as discount_percent`,
        `${ITEM.NAME}.${ITEM.COLUMNS.HEAD_ID} as brand_id`,
        `${HEADS.NAME}.${HEADS.COLUMNS.CATEGORY_NAME} as brand_name`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BCID} as bcid`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.NEGATIVE_STOCK}`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.RATE_EDIT}`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.DECIMAL1}`,
        // `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.SALES_RATE} as sales_rate`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.CESS}`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.GR_WT}`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.DIS} as product_discount_percent`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.SUPPLIER_ID} as suppid`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PRODLOC} as prodloc`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.OUTLET_ID} as outlet_id`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BARCODE} as barcode`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BARCODE1} as barcode1`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BARCODE2} as barcode2`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BARCODE3} as barcode3`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.ASUPP} as asupp`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.JUICE} as juice`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.ORDERDAY} as orderday`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.MIN_STK_PERIOD} as minstkperiod`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BATCH_NO} as batchno`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.WSCALE} as wscale`,
        `${ITEM.NAME}.${ITEM.COLUMNS.FIXED_MARGIN} as pmargin`,
        `${ITEM.NAME}.${ITEM.COLUMNS.SMARGIN} as smargin`,
        `${ITEM.NAME}.${ITEM.COLUMNS.MERCHANT_CATEGORY_ID} as merchant_category_id`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.MIN_STOCK} as min_stock`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BRAND_COMPANY_ID} as brand_company_id`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PARENT_CODE} as parent_code`,
        `${ITEM_SETTING.NAME}.${ITEM_SETTING.COLUMNS.LOC_ID} as loc`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.QTY}`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.HSN} as hsn`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.MRP}`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.IS_APPLY_LOYALTY}`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.AMOUNT}`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.GST_AMOUNT}`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.CESS_AMOUNT}`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.DISCOUNT_PERCENTAGE} as discount_percentage`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.DISCOUNT_AMOUNT} as discount_amount`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.SALE_RATE} as sales_rate`,
        knex.raw(`
          (
            ${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.QTY} *
            COALESCE(${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.DISCOUNT_AMOUNT}, 0)
          ) as line_discount_amount
        `),
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.BARCODE}`,
        // `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.REFERENCE_ID}`,
        // `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.TRANSACTION_STATUS} as transaction_status`,
        //`${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.COUPON_CODE}`,
        //  `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.ROUND_OFF_ENABLE} as round_off_enabled`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.MODE} as mode`,
        `${UNITS.NAME}.${UNITS.COLUMNS.UNITS_SHORT_NAME} AS uom_name`,
        `${TYPEDESIGN.NAME}.${TYPEDESIGN.COLUMNS.TYPE_NAME} AS brand_company_name`,
        `${MAIN_CATEGORY.NAME}.${MAIN_CATEGORY.COLUMNS.CATEGORY_NAME} AS main_category_name`,
        `${SUB_CATEGORY.NAME}.${SUB_CATEGORY.COLUMNS.SUBCATEGORY_NAME} AS sub_category_name`,

      )

      .leftJoin(
        ITEM.NAME,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.PROD_ID}`,
        `${ITEM.NAME}.${ITEM.COLUMNS.ID}`
      )
      .leftJoin(OUTLET_PRODUCT_MAPPING.NAME, function () {
        this.on(
          `${ITEM.NAME}.${ITEM.COLUMNS.ID}`,
          '=',
          `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PRODUCT_ID}`
        ).andOn(
          `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.OUTLET_ID}`,
          '=',
          knex.raw('?', [outlet_id])
        );
      })

      .leftJoin(
        ITEM_DETAILS.NAME,
        `${ITEM.NAME}.${ITEM.COLUMNS.ID}`,
        `${ITEM_DETAILS.NAME}.${ITEM_DETAILS.COLUMNS.PROD_ID}`
      )

      .leftJoin(
        ITEM_SETTING.NAME,
        `${ITEM.NAME}.${ITEM.COLUMNS.ID}`,
        `${ITEM_SETTING.NAME}.${ITEM_SETTING.COLUMNS.PROD_ID}`
      )

      .leftJoin(
        BARCODE_LIST.NAME,
        `${ITEM.NAME}.${ITEM.COLUMNS.ID}`,
        `${BARCODE_LIST.NAME}.${BARCODE_LIST.COLUMNS.PROD_ID}`
      )

      .leftJoin(
        UNITS.NAME,
        `${ITEM.NAME}.${ITEM.COLUMNS.UOM_ID}`,
        `${UNITS.NAME}.${UNITS.COLUMNS.ID}`
      )

      .leftJoin(
        MAIN_CATEGORY.NAME,
        `${MAIN_CATEGORY.NAME}.${MAIN_CATEGORY.COLUMNS.ID}`,
        `${ITEM.NAME}.${ITEM.COLUMNS.MAIN_CATEGORY_ID}`
      )

      .leftJoin(
        SUB_CATEGORY.NAME,
        `${SUB_CATEGORY.NAME}.${SUB_CATEGORY.COLUMNS.ID}`,
        `${ITEM.NAME}.${ITEM.COLUMNS.SUB_CATEGORY_ID}`
      )
      .leftJoin(
        HEADS.NAME,
        `${HEADS.NAME}.${HEADS.COLUMNS.ID}`,
        `${ITEM.NAME}.${ITEM.COLUMNS.HEAD_ID}`
      )
      .leftJoin(
        `${MERCHANT_CATEGORY.NAME} `,
        `${ITEM.NAME}.${ITEM.COLUMNS.MERCHANT_CATEGORY_ID}`,
        `${MERCHANT_CATEGORY.NAME}.${MERCHANT_CATEGORY.COLUMNS.ID}`
      )
      .leftJoin(
        `${TYPEDESIGN.NAME} as ${TYPEDESIGN.NAME}`,
        `${ITEM.NAME}.${ITEM.COLUMNS.TYPEDESIGN_ID}`,
        `${TYPEDESIGN.NAME}.${TYPEDESIGN.COLUMNS.ID}`
      )

      .where({
        // [`${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.USERS_ID}`]: users_id,
        [`${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.OUTLET_ID}`]: outlet_id,
        [`${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.COUNTER_NO}`]: counter_no,
      })
      .andWhere(`${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.QTY}`, '>', 0)
      .whereNotNull(`${ITEM.NAME}.${ITEM.COLUMNS.ID}`);
    logQuery({
      logger: fastify.log,
      query,
      context: "Get Product Info",
      logTrace
    });

    //console.log("query", query.toString());

    const response = await query;
    //console.log("getCartresponse", response);

    if (!response.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Cart is empty",
        property: "",
        code: "NOT_FOUND"
      });
    }

    return response;
  }
  // async function getQuantityOfItemInCart({
  //   logTrace,
  //   input: { prod_id, users_id, counter_no, outlet_id, barcode }
  // }) {
  //   const knex = this;
  //   console.log("getQuantity", prod_id, users_id, counter_no, outlet_id, barcode);
  //       const input = code;
  //   const isNumeric = /^\d+$/.test(input);
  //   // console.log(" isNumeric", isNumeric);
  //  console.log("input", input);

  //   const query1 = knex(ITEM.NAME)
  //     .select([
  //       `${ITEM.NAME}.*`,
  //       `${UNITS.NAME}.${UNITS.COLUMNS.UNITS_SHORT_NAME} AS uom_name`,
  //     ])
  //     .leftJoin(
  //       BARCODE_LIST.NAME,
  //       `${ITEM.NAME}.id`,
  //       `${BARCODE_LIST.NAME}.prod_id`
  //     )
  //     .leftJoin(
  //       UNITS.NAME,
  //       `${UNITS.NAME}.id`,
  //       `${ITEM.NAME}.uom_id`
  //     )
  //     .where(function () {
  //       this.where(`${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_CODE}`, input)
  //         .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE1}`, input)
  //         .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE2}`, input)
  //         .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE}`, input);
  //     })

  //     .andWhere(`${ITEM.NAME}.is_active`, true);

  //   logQuery({
  //     logger: fastify.log,
  //     query: query1,
  //     context: "Get Product Info",
  //     logTrace
  //   });
  //   const responses = await query1;
  //   const barcodes = response[0].barcode || response[0].barcode1 || response[0].barcode2 || response[0].barcode3 || response[0].pro_code;
  //   console.log("barcodes", barcodes);

  //   if (!response.length) {
  //     throw CustomError.create({
  //       httpCode: StatusCodes.NOT_FOUND,
  //       message: "Product not found",
  //       property: "",
  //       code: "NOT_FOUND"
  //     });
  //   }
  //   const query = knex(COUNTER_CART.NAME)
  //     .select(COUNTER_CART.COLUMNS.QTY)
  //     .where(COUNTER_CART.COLUMNS.PROD_ID, prod_id)
  //     .andWhere(COUNTER_CART.COLUMNS.BARCODE, barcodes)
  //     .andWhere(COUNTER_CART.COLUMNS.USERS_ID, users_id)
  //     .andWhere(COUNTER_CART.COLUMNS.OUTLET_ID, outlet_id)
  //     .andWhere(COUNTER_CART.COLUMNS.COUNTER_NO, counter_no);
  //   logQuery({
  //     logger: fastify.log,
  //     query,
  //     context: "Get Quantity of Item In Cart",
  //     logTrace
  //   });
  //   const response = await query;
  //   console.log("already", response);

  //   return response[0];
  // }
  async function getQuantityOfItemInCart({
    logTrace,
    input: { prod_id, users_id, counter_no, outlet_id, barcode }
  }) {
    const knex = this;

    //console.log("getQuantity", prod_id, users_id, counter_no, outlet_id, barcode);

    const input = barcode;
    const isNumeric = /^\d+$/.test(input);
    console.log("input11", input);
    if (
      input === "0" ||
      input === 0 ||
      input === null ||
      input === undefined ||
      input === "" ||
      (typeof input === "number" && isNaN(input)) ||
      input === "00" ||
      input === "000"
    ) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Invalid product code",
        property: "",
        code: "NOT_FOUND"
      });
    }
    const query1 = knex(ITEM.NAME)
      .select([
        `${ITEM.NAME}.*`,
        `${UNITS.NAME}.${UNITS.COLUMNS.UNITS_SHORT_NAME} AS uom_name`,
      ])
      .leftJoin(
        BARCODE_LIST.NAME,
        `${ITEM.NAME}.id`,
        `${BARCODE_LIST.NAME}.prod_id`
      )
      .leftJoin(
        UNITS.NAME,
        `${UNITS.NAME}.id`,
        `${ITEM.NAME}.uom_id`
      )
      .where(function () {
        this.where(`${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_CODE}`, input)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE1}`, input)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE2}`, input)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE}`, input);
      })
      .andWhere(`${ITEM.NAME}.is_active`, true);

    const responses = await query1;
    if (!responses.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Product not found",
        property: "",
        code: "NOT_FOUND"
      });
    }

    const product = responses[0];
    //console.log("product111", product);
    const barcodes = [
      product.barcode,
      product.barcode1,
      product.barcode2,
      product.barcode3,
      product.pro_code
    ].find(
      code => code !== null && code !== undefined && code !== '' && code !== 0
    );
    console.log("barcodes", barcodes);


    const query = knex(COUNTER_CART.NAME)
      .select(
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.QTY}`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.DISCOUNT_PERCENTAGE}`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.DISCOUNT_AMOUNT}`
      )
      .where(COUNTER_CART.COLUMNS.PROD_ID, prod_id)
      .andWhere(COUNTER_CART.COLUMNS.OUTLET_ID, outlet_id)
      .andWhere(COUNTER_CART.COLUMNS.COUNTER_NO, counter_no)
      .andWhere(function () {
        this.where(COUNTER_CART.COLUMNS.BARCODE, barcodes)
          .orWhere(COUNTER_CART.COLUMNS.PRODUCT_CODE, barcodes);
      });
    const response = await query;
    logQuery({
      logger: fastify.log,
      query,
      context: "Get Quantity of Item In Cart",
      logTrace
    })
   // console.log("already", response);

    return response[0];
  }
  async function updateQuantityOfItemInCart({
    logTrace,
    body,
    input: {
      prod_id,
      users_id,
      counter_no,
      discount,
      discount_amount,
      cart_quantity,
      mrp,
      sales_rate,
      barcode,
      outlet_id,
      uom_name
    }
  }) {
   // console.log("updateQuantityOfItemInCart", discount, discount_amount, cart_quantity, mrp, sales_rate, barcode, outlet_id, uom_name);

    const knex = this;
    const input = barcode;
    const isNumeric = /^\d+$/.test(input);
    console.log("input11", input);
    if (
      input === "0" ||
      input === 0 ||
      input === null ||
      input === undefined ||
      input === "" ||
      (typeof input === "number" && isNaN(input)) ||
      input === "00" ||
      input === "000"
    ) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Invalid product code",
        property: "",
        code: "NOT_FOUND"
      });
    }
    const query1 = knex(ITEM.NAME)
      .select([
        `${ITEM.NAME}.*`,
        `${UNITS.NAME}.${UNITS.COLUMNS.UNITS_SHORT_NAME} AS uom_name`,
      ])
      .leftJoin(
        BARCODE_LIST.NAME,
        `${ITEM.NAME}.id`,
        `${BARCODE_LIST.NAME}.prod_id`
      )
      .leftJoin(
        UNITS.NAME,
        `${UNITS.NAME}.id`,
        `${ITEM.NAME}.uom_id`
      )
      .where(function () {
        this.where(`${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_CODE}`, input)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE1}`, input)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE2}`, input)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE}`, input);
      })
      .andWhere(`${ITEM.NAME}.is_active`, true);

    const responses = await query1;
    if (!responses.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Product not found",
        property: "",
        code: "NOT_FOUND"
      });
    }

    const product = responses[0];
    //console.log("product111", product);
    const resolvedBarcode = [
      product.barcode,
      product.barcode1,
      product.barcode2,
      product.barcode3,
      product.pro_code
    ].find(
      code => code !== null && code !== undefined && code !== '' && code !== 0
    );

    // const resolvedBarcode = body.barcode || barcode;
    let salesRate = Number(sales_rate) || 0;
    let quantity = parseFloat(cart_quantity) || 0;
    //console.log("quantity", quantity);

    const gst = Number(body.gst) || 0;
    const cess = Number(body.cess) || 0;
    const discountPercent =
      (Number(discount)) || 0;
    // const calculatedDiscountAmount = (salesRate * discountPercent) / 100 * quantity;
    const calculatedDiscountAmount = (discount * quantity);
    //console.log("calculatedDiscountAmount", calculatedDiscountAmount);

    let amount = salesRate * quantity;
    if (discount_amount !== 0) {
      salesRate = mrp - discount_amount;
      amount = salesRate * quantity;
    }
    const gstAmount = (amount * gst) / 100;
    const cessAmount = cess ? (amount * cess) / 100 : 0;
    //console.log("uom_name", uom_name);
   // console.log("quantity", quantity);
    if (uom_name == "Kgs" && quantity > 50) {
      //console.log("quantity is greater than 50");
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Quantity cannot be greater than 50",
        property: "",
        code: "NOT_FOUND"
      });
    }
    if (uom_name !== "Kgs" && !Number.isInteger(Number(quantity))) {
     // console.log("Non-Kgs UOMs do not support fractional quantity:", quantity);

      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Fractional quantity is not allowed for this unit of measure",
        property: "",
        code: "INVALID_QUANTITY"
      });
    }
    // console.log("discount", discount);
    // console.log("discount_amount", discount_amount);

    // console.log("discount * quantity", discount * quantity);
    const query = knex(COUNTER_CART.NAME)
      .update({
        [COUNTER_CART.COLUMNS.PROD_ID]: prod_id,
        [COUNTER_CART.COLUMNS.USERS_ID]: users_id,
        [COUNTER_CART.COLUMNS.COUNTER_NO]: counter_no,
        [COUNTER_CART.COLUMNS.OUTLET_ID]: outlet_id,
        [COUNTER_CART.COLUMNS.QTY]: quantity,
        [COUNTER_CART.COLUMNS.DISCOUNT_PERCENTAGE]: discount,
        [COUNTER_CART.COLUMNS.DISCOUNT_AMOUNT]: discount_amount * quantity,
        // [COUNTER_CART.COLUMNS.DISCOUNT_PERCENTAGE]: discount * quantity,
        // [COUNTER_CART.COLUMNS.DISCOUNT_AMOUNT]: discount_amount,
        [COUNTER_CART.COLUMNS.MRP]: mrp,
        [COUNTER_CART.COLUMNS.SALE_RATE]: salesRate,
        [COUNTER_CART.COLUMNS.PRODUCT_CODE]: body.prod_code,
        [COUNTER_CART.COLUMNS.PRODUCT_NAME]: body.prod_name,
        [COUNTER_CART.COLUMNS.BARCODE]: resolvedBarcode,
        [COUNTER_CART.COLUMNS.PRODUCT_RATE]: body.sales_rate,
        [COUNTER_CART.COLUMNS.PRODUCTS_OFFER]: body.discount,
        [COUNTER_CART.COLUMNS.MINIMUM_SALES_QTY]: body.min_stock,
        [COUNTER_CART.COLUMNS.MAXIMUM_SALES_QTY]: 0,
        [COUNTER_CART.COLUMNS.STOCK_STATUS]: 0,
        [COUNTER_CART.COLUMNS.PACKING_WEIGHT]: body.gr_wt,
        [COUNTER_CART.COLUMNS.HSN]: body.hsn,
        [COUNTER_CART.COLUMNS.GST]: body.gst,
        [COUNTER_CART.COLUMNS.IGST]: body.gst,
        [COUNTER_CART.COLUMNS.CESS]: body.cess,
        [COUNTER_CART.COLUMNS.AMOUNT]: amount,
        [COUNTER_CART.COLUMNS.GST_AMOUNT]: gstAmount,
        [COUNTER_CART.COLUMNS.IGST_AMOUNT]: 0,
        [COUNTER_CART.COLUMNS.CESS_AMOUNT]: cessAmount,
        [COUNTER_CART.COLUMNS.BRAND_ID]: body.head_id,
        [COUNTER_CART.COLUMNS.BRAND_NAME]: body.brand_name,
        [COUNTER_CART.COLUMNS.GROUP_NAME]: body.brand_name,
        [COUNTER_CART.COLUMNS.UNITS_ID]: body.uom_id,
        [COUNTER_CART.COLUMNS.MAIN_CATEGORY_ID]: body.main_category_id,
        [COUNTER_CART.COLUMNS.SUB_CATEGORY_ID]: body.sub_category_id,
        [COUNTER_CART.COLUMNS.UNITS_NAME]: body.uom_name,
        [COUNTER_CART.COLUMNS.CATEGORY_NAME]: body.category_name,
        [COUNTER_CART.COLUMNS.SUBCATEGORY_NAME]: body.sub_category_name,
        [COUNTER_CART.COLUMNS.PRODUCTS_ACTIVE]: body.is_active ?? body.active,
        [COUNTER_CART.COLUMNS.UPDATED_AT]: new Date().toISOString(),
        [COUNTER_CART.COLUMNS.UPDATED_BY]: users_id
      })
      .where(COUNTER_CART.COLUMNS.PROD_ID, prod_id)
      .andWhere(COUNTER_CART.COLUMNS.OUTLET_ID, outlet_id)
      .andWhere(COUNTER_CART.COLUMNS.COUNTER_NO, counter_no)
      .andWhere(function () {
        this.where(COUNTER_CART.COLUMNS.BARCODE, body.prod_code)
          .orWhere(COUNTER_CART.COLUMNS.PRODUCT_CODE, body.prod_code);
      });

    const query2 = knex(OUTLET_PURCHASE_BATCH_DETAILS.NAME)
      .update({
        [OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.STATUS]: 1,
        [OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.PRODUCT_CODE]: body.prod_code
      })
      .where(OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.PRODUCT_ID, prod_id)
      .andWhere(OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.MRP, mrp);

    await query2;
    logQuery({
      logger: fastify.log,
      query,
      context: "Update Quantity of Item In Cart",
      logTrace
    });
    await query;

    return { success: true };
  }

  async function addItemToCart({
    logTrace,
    body,
    input: {
      prod_id,
      users_id,
      counter_no,
      cart_quantity,
      discount_amount,
      discount,
      mrp,
      sales_rate,
      code,
      outlet_id,
      customer_id
    }
  }) {
    const knex = this;
    const input = code;
    const isNumeric = /^\d+$/.test(input);
    console.log("input11", input);
    if (
      input === "0" ||
      input === 0 ||
      input === null ||
      input === undefined ||
      input === "" ||
      (typeof input === "number" && isNaN(input)) ||
      input === "00" ||
      input === "000"
    ) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Invalid product code",
        property: "",
        code: "NOT_FOUND"
      });
    }
    const query1 = knex(ITEM.NAME)
      .select([
        `${ITEM.NAME}.*`,
        `${UNITS.NAME}.${UNITS.COLUMNS.UNITS_SHORT_NAME} AS uom_name`,
      ])
      .leftJoin(
        BARCODE_LIST.NAME,
        `${ITEM.NAME}.id`,
        `${BARCODE_LIST.NAME}.prod_id`
      )
      .leftJoin(
        UNITS.NAME,
        `${UNITS.NAME}.id`,
        `${ITEM.NAME}.uom_id`
      )
      .where(function () {
        this.where(`${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_CODE}`, input)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE1}`, input)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE2}`, input)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE}`, input);
      })
      .andWhere(`${ITEM.NAME}.is_active`, true);

    const responses = await query1;
    if (!responses.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Product not found",
        property: "",
        code: "NOT_FOUND"
      });
    }

    const product = responses[0];
    //console.log("product111", product);
   // console.log("cart_quantity", cart_quantity);
    const barcodes = [
      product.barcode,
      product.barcode1,
      product.barcode2,
      product.barcode3,
      product.pro_code
    ].find(
      code => code !== null && code !== undefined && code !== '' && code !== 0
    );
    // console.log("barcode", barcodes);

    let salesRate = Number(sales_rate) || 0;
    let quantity = parseFloat(cart_quantity) || 0;
    quantity = Math.floor(quantity * 1000) / 1000;
    const gst = Number(body.gst) || 0;
    const cess = Number(body.cess) || 0;
    const discountPercent = Number(discount_amount ?? body.discount) || 0;
    const calculatedDiscountAmount = (salesRate * discountPercent) / 100;
    if (discount_amount !== 0) {
      salesRate = mrp - discount_amount;
      //amount = salesRate * quantity;
    }
    const amount = salesRate * quantity;
    const gstAmount = (amount * gst) / 100;
    const cessAmount = cess ? (amount * cess) / 100 : 0;
    //console.log("discount", discount);
    //console.log("discount_amount", discount_amount);
    const query = knex(COUNTER_CART.NAME).insert({
      [COUNTER_CART.COLUMNS.PROD_ID]: prod_id,
      [COUNTER_CART.COLUMNS.USERS_ID]: users_id,
      [COUNTER_CART.COLUMNS.COUNTER_NO]: counter_no,
      [COUNTER_CART.COLUMNS.OUTLET_ID]: outlet_id,
      [COUNTER_CART.COLUMNS.CUSTOMER_ID]: customer_id || 0,
      [COUNTER_CART.COLUMNS.QTY]: quantity,
      [COUNTER_CART.COLUMNS.DISCOUNT_PERCENTAGE]: discount,
      [COUNTER_CART.COLUMNS.DISCOUNT_AMOUNT]: discount_amount * quantity,
      [COUNTER_CART.COLUMNS.MRP]: mrp,
      [COUNTER_CART.COLUMNS.SALE_RATE]: salesRate,
      [COUNTER_CART.COLUMNS.PRODUCT_CODE]: body.prod_code,
      [COUNTER_CART.COLUMNS.PRODUCT_NAME]: body.prod_name,
      [COUNTER_CART.COLUMNS.BARCODE]: barcodes,
      [COUNTER_CART.COLUMNS.PRODUCT_RATE]: body.sales_rate,
      [COUNTER_CART.COLUMNS.PRODUCTS_OFFER]: body.discount,
      [COUNTER_CART.COLUMNS.MINIMUM_SALES_QTY]: body.min_stock,
      [COUNTER_CART.COLUMNS.MAXIMUM_SALES_QTY]: 0,
      [COUNTER_CART.COLUMNS.STOCK_STATUS]: 0,
      [COUNTER_CART.COLUMNS.PACKING_WEIGHT]: body.gr_wt,
      [COUNTER_CART.COLUMNS.HSN]: body.hsn,
      [COUNTER_CART.COLUMNS.GST]: body.gst,
      [COUNTER_CART.COLUMNS.IGST]: body.gst,
      [COUNTER_CART.COLUMNS.CESS]: body.cess,
      [COUNTER_CART.COLUMNS.AMOUNT]: amount,
      [COUNTER_CART.COLUMNS.GST_AMOUNT]: gstAmount,
      [COUNTER_CART.COLUMNS.IGST_AMOUNT]: 0,
      [COUNTER_CART.COLUMNS.CESS_AMOUNT]: cessAmount,
      [COUNTER_CART.COLUMNS.BRAND_ID]: body.head_id,
      [COUNTER_CART.COLUMNS.BRAND_NAME]: body.brand_name,
      [COUNTER_CART.COLUMNS.GROUP_NAME]: body.brand_name,
      [COUNTER_CART.COLUMNS.UNITS_ID]: body.uom_id,
      [COUNTER_CART.COLUMNS.MAIN_CATEGORY_ID]: body.main_category_id,
      [COUNTER_CART.COLUMNS.SUB_CATEGORY_ID]: body.sub_category_id,
      [COUNTER_CART.COLUMNS.UNITS_NAME]: body.uom_name,
      [COUNTER_CART.COLUMNS.CATEGORY_NAME]: body.category_name,
      [COUNTER_CART.COLUMNS.SUBCATEGORY_NAME]: body.sub_category_name,
      [COUNTER_CART.COLUMNS.PRODUCTS_ACTIVE]: body.is_active ?? body.active,
      [COUNTER_CART.COLUMNS.CREATED_AT]: new Date().toISOString(),
      [COUNTER_CART.COLUMNS.CREATED_BY]: users_id
    });
    await query;
    return { success: true };
  }
  async function deleteItemFromCart({
    logTrace,
    input: { prod_id, users_id, counter_no, outlet_id }
  }) {
    const knex = this;
    const query = knex(COUNTER_CART.NAME)
      .delete()
      .where(COUNTER_CART.COLUMNS.PROD_ID, prod_id)
      .where(COUNTER_CART.COLUMNS.USERS_ID, users_id)
      .where(COUNTER_CART.COLUMNS.OUTLET_ID, outlet_id)
      .where(COUNTER_CART.COLUMNS.COUNTER_NO, counter_no);
    logQuery({
      logger: fastify.log,
      query,
      context: "Delete Item From Cart",
      logTrace
    });
    const response = await query;

    if (response === 0) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "product_id not found in Cart",
        property: "",
        code: "NOT_FOUND"
      });
    }
    return { success: true };
  }
  async function clearCartItems({ prod_id, users_id, counter_no, outlet_id, logTrace }) {
    const knex = this;
    const query = knex(COUNTER_CART.NAME)
      .where(COUNTER_CART.COLUMNS.COUNTER_NO, counter_no)
      .andWhere(COUNTER_CART.COLUMNS.OUTLET_ID, outlet_id)
      .del();
    await knex(OUTLET_PURCHASE_BATCH_DETAILS.NAME)
      .update({
        [OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.STATUS]: null,
      })
      .where(OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.STATUS, 1);


    logQuery({
      logger: fastify.log,
      query,
      context: "Delete Cart Items Using users id and counter no",
      logTrace
    });

    const response = await query;
    return response;
  }
  async function specialCoupon({ prod_id, users_id, counter_no, outlet_id, logTrace }) {
    const knex = this;
    console.log("outletid", outlet_id);

    const query = knex(SPL_COUPON.NAME)
      .select("*")
      .where(SPL_COUPON.COLUMNS.ACTIVE, 1)
      .andWhere(SPL_COUPON.COLUMNS.OUTLET_ID, outlet_id)
      .andWhere(SPL_COUPON.COLUMNS.PVALUE, ">", 0)
      .orderBy(SPL_COUPON.COLUMNS.SID);
    logQuery({
      logger: fastify.log,
      query,
      context: "Get Special Coupons",
      logTrace
    });

    const response = await query;
    //console.log("splcoupon", response);

    return response;
  }
  async function insertCoupon({
    logTrace,
    input: { code, eto, dvalue, flag, dtype }
  }) {
    const knex = this;
    const query = knex(SPL_COUPON_ISSUE.NAME).insert({
      [SPL_COUPON_ISSUE.COLUMNS.CODE]: code,
      [SPL_COUPON_ISSUE.COLUMNS.EDATE]: eto,
      [SPL_COUPON_ISSUE.COLUMNS.DPER]: dvalue,
      [SPL_COUPON_ISSUE.COLUMNS.FLAG]: flag,
      [SPL_COUPON_ISSUE.COLUMNS.DTYPE]: dtype,

    });
    logQuery({
      logger: fastify.log,
      query,
      context: "Generating Coupon ",
      logTrace
    });
    await query;
    return { success: true };
  }
  async function insertSpecialCoupon({ logTrace, body, users_id }) {
    const knex = this;
    console.log("coupon", body);

    const query = knex(COUNTER_CART.NAME)
      .update({
        [COUNTER_CART.COLUMNS.COUPON_CODE]: body.coupon
      })
      .where(COUNTER_CART.COLUMNS.USERS_ID, users_id)
      .where(COUNTER_CART.COLUMNS.COUNTER_NO, body.counter_no);
    logQuery({
      logger: fastify.log,
      query,
      context: "Update Coupon In Cart",
      logTrace
    });
    const response = await query;
    if (!response) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Coupon not applied",
        property: "",
        code: "NOT_FOUND"
      });
    }
    return { success: true };
  }
  async function specialCouponIssue({ coupon_code, currentDate }) {
    const knex = this;
    const query = knex(SPL_COUPON_ISSUE.NAME)
      .select("*")
      .where(SPL_COUPON_ISSUE.COLUMNS.CODE, coupon_code)
      .andWhere(SPL_COUPON_ISSUE.COLUMNS.FLAG, 0)
      .andWhere(SPL_COUPON_ISSUE.COLUMNS.EDATE, ">=", currentDate);
    const response = await query;
    return response[0];
  }
  async function specialCouponCheck({ sid }) {
    const knex = this;
    const query = knex(SPL_COUPON.NAME)
      .select(SPL_COUPON.COLUMNS.SNAME, SPL_COUPON.COLUMNS.PROD)
      .where(SPL_COUPON.COLUMNS.SID, sid);

    const response = await query;
    // console.log("splcoupon", response);

    return response[0];
  }
  //   async function billSave({
  //     logTrace,
  //     outlet_id,
  //     mode,
  //     input: {
  //       billno,
  //       name,
  //       mobile,
  //       customer_id,
  //       users_id,
  //       is_card,
  //       counter_no,
  //       bags,
  //       currentDate,
  //       cartItems,

  //     }
  //   }) {

  //     const knex = this;
  //     let bcash = 0;
  //     let bcard = 0;
  //     let online = 0;
  //     let creditcard = "N";
  //     if (is_card == 0) {
  //       bcash = cartItems.cart_net_total;
  //        creditcard = "Y";
  //     } else if (is_card == 1) {
  //       bcard = cartItems.cart_net_total;
  //        creditcard = "N";
  //     } else {
  //        creditcard = "U";
  //     }
  //      if (Array.isArray(mode) && mode.length > 0) {

  //   mode.forEach((item) => {

  //     // Cash
  //     if (item.id == 1) {
  //       bcash += Number(item.amount || 0);
  //     }

  //     // Online / UPI
  //     else if (item.id == 2) {
  //       online += Number(item.amount || 0);
  //     }

  //     // Card
  //     else if (item.id == 3) {
  //       bcard += Number(item.amount || 0);
  //     }

  //   });
  // }
  // const modeTotal = mode.reduce((sum, item) => {
  //   return sum + Number(item.amount || 0);
  // }, 0);

  // const cartNetTotal = Number(cartItems.cart_net_total);

  // if (modeTotal !== cartNetTotal) {
  //   throw CustomError.create({
  //     httpCode: 400,
  //     message: "Payment amount mismatch",
  //     property: "mode",
  //     code: "INVALID_AMOUNT"
  //   });
  // }

  //     const query_insert = await knex(`${OUTLET_SALES_MASTER.NAME}`).insert({
  //       [OUTLET_SALES_MASTER.COLUMNS.BNO]: billno,
  //       [OUTLET_SALES_MASTER.COLUMNS.CID]: 1,
  //       [OUTLET_SALES_MASTER.COLUMNS.BILL_NO]: billno,
  //       [OUTLET_SALES_MASTER.COLUMNS.BILL_DATE]: new Date(),
  //       [OUTLET_SALES_MASTER.COLUMNS.PARTY_NAME]: name,
  //       [OUTLET_SALES_MASTER.COLUMNS.CUSTOMER_ID]: customer_id,
  //       [OUTLET_SALES_MASTER.COLUMNS.AMOUNT]: cartItems.cart_net_total,
  //       [OUTLET_SALES_MASTER.COLUMNS.DISCOUNT]: cartItems.cart_total_discount,
  //       [OUTLET_SALES_MASTER.COLUMNS.CREDIT_CARD]: creditcard,
  //       [OUTLET_SALES_MASTER.COLUMNS.COUNTER]: counter_no,
  //       [OUTLET_SALES_MASTER.COLUMNS.ROUND_OFF]: cartItems.cart_round_off,
  //       [OUTLET_SALES_MASTER.COLUMNS.BILLDATE]: currentDate,
  //       [OUTLET_SALES_MASTER.COLUMNS.STAX]: cartItems.cart_total_gst,
  //         [OUTLET_SALES_MASTER.COLUMNS.GST]: cartItems.cart_total_gst,
  //       [OUTLET_SALES_MASTER.COLUMNS.BAGS]: bags,
  //       [OUTLET_SALES_MASTER.COLUMNS.VAT1]: cartItems.cart_total_gst,
  //       [OUTLET_SALES_MASTER.COLUMNS.ROFF]: cartItems.cart_round_off,
  //       [OUTLET_SALES_MASTER.COLUMNS.B_AMT]: cartItems.cart_net_total,
  //       [OUTLET_SALES_MASTER.COLUMNS.B_DIS]: cartItems.cart_total_discount,
  //       [OUTLET_SALES_MASTER.COLUMNS.B_CASH]: bcash,
  //       [OUTLET_SALES_MASTER.COLUMNS.B_CARD]: bcard,
  //       [OUTLET_SALES_MASTER.COLUMNS.ONLINE]: online,
  //       [OUTLET_SALES_MASTER.COLUMNS.V_FLAG]: 0,
  //       [OUTLET_SALES_MASTER.COLUMNS.P_MODE]: knex.raw('?::jsonb', [JSON.stringify(mode)]),
  //       [OUTLET_SALES_MASTER.COLUMNS.SCHEME_AMOUNT]: cartItems.cart_scheme_discount,
  //       [OUTLET_SALES_MASTER.COLUMNS.SCHEME_DISCOUNT]: cartItems.cart_scheme_discount,
  //       [OUTLET_SALES_MASTER.COLUMNS.TOTAL_ITEMS]: cartItems.cart_total_quantity,
  //       [OUTLET_SALES_MASTER.COLUMNS.GR_WT]: cartItems.cart_gr_wt,
  //       [OUTLET_SALES_MASTER.COLUMNS.GR_TOT]: cartItems.cart_net_total,
  //       [OUTLET_SALES_MASTER.COLUMNS.OUTLET_ID]: outlet_id,
  //       [OUTLET_SALES_MASTER.COLUMNS.REFERENCE_ID]: cartItems.cart_lines[0].reference_id || 1,
  //       [OUTLET_SALES_MASTER.COLUMNS.TRANSACTION_STATUS]: cartItems.cart_lines[0].transaction_status
  //     });

  //     const response = await query_insert;
  //     if (!response) {
  //       throw CustomError.create({
  //         httpCode: StatusCodes.NOT_IMPLEMENTED,
  //         message: "Error while placing the orders",
  //         property: "",
  //         code: "NOT_IMPLEMENTED"
  //       });
  //     }


  //     const cart_lines = cartItems.cart_lines.map((orderline, index) => ({
  //       [OUTLET_SALES_DETAIL.COLUMNS.BNO]: billno,
  //       [OUTLET_SALES_DETAIL.COLUMNS.CID]: 1,
  //       [OUTLET_SALES_DETAIL.COLUMNS.BILL_NO]: billno,
  //       [OUTLET_SALES_DETAIL.COLUMNS.COUNTER]: counter_no,
  //       [OUTLET_SALES_DETAIL.COLUMNS.BILLDATE]: new Date(),
  //       [OUTLET_SALES_DETAIL.COLUMNS.SR_ID]: index + 1,
  //       [OUTLET_SALES_DETAIL.COLUMNS.PROD_ID]: orderline.prod_id,
  //       [OUTLET_SALES_DETAIL.COLUMNS.PROD_QTY]: orderline.qty,
  //       [OUTLET_SALES_DETAIL.COLUMNS.PROD_RATE]: orderline.sales_rate,
  //       [OUTLET_SALES_DETAIL.COLUMNS.PURCHASE_RATE]: orderline.purchase_rate,
  //       [OUTLET_SALES_DETAIL.COLUMNS.BILL_DATE]: currentDate,
  //       [OUTLET_SALES_DETAIL.COLUMNS.VAT]: Number(orderline.sgst + orderline.cgst),
  //       [OUTLET_SALES_DETAIL.COLUMNS.MRP]: orderline.mrp,
  //       [OUTLET_SALES_DETAIL.COLUMNS.SGST]: orderline.sgst,
  //       [OUTLET_SALES_DETAIL.COLUMNS.CGST]: orderline.cgst,
  //       [OUTLET_SALES_DETAIL.COLUMNS.CESS]: orderline.cess,
  //       [OUTLET_SALES_DETAIL.COLUMNS.DISCOUNT]: orderline.dis,
  //       [OUTLET_SALES_DETAIL.COLUMNS.FQTY]: 0,
  //       [OUTLET_SALES_DETAIL.COLUMNS.POFF]: 0,
  //       [OUTLET_SALES_DETAIL.COLUMNS.CBAR]: 0,
  //       [OUTLET_SALES_DETAIL.COLUMNS.BARCODE]: orderline.barcode,
  //       [OUTLET_SALES_DETAIL.COLUMNS.OUTLET_ID]: outlet_id
  //     }));
  //     // console.log("cartline", cart_lines);
  //     try {
  //       const insertedOrderLines = await knex(`${OUTLET_SALES_DETAIL.NAME}`).insert(
  //         cart_lines
  //       );
  //     } catch (err) {
  //       console.log(err);
  //     }

  // //  const query_update = await knex(`${PENDINGBILL.NAME}`)
  // //         .where(`${PENDINGBILL.COLUMNS.COUNTER_NO}`, counter_no)
  // //         .andWhere(`${PENDINGBILL.COLUMNS.USERS_ID}`, users_id)
  // //         .andWhere(`${PENDINGBILL.COLUMNS.OUTLET_ID}`, outlet_id)
  // //         .andWhere(`${PENDINGBILL.COLUMNS.STATUS}`, 1)
  // //         .andWhere(`${PENDINGBILL.COLUMNS.BILL_NO}`, originalBillNo)
  // //         .update({
  // //           [PENDINGBILL.COLUMNS.STATUS]: 0,
  // //         });
  // //       await query_update;


  //     return { success: true };
  //   }

  async function billSave({
    logTrace,
    outlet_id,
    mode,
    balance,
    userDetails,
    financialYear,
    input: {
      billno,
      name,
      mobile,
      customer_id,
      users_id,
      is_card,
      counter_no,
      bags,

      currentDate,
      cartItems,

    }
  }) {
    // console.log("cartItems", mobile);

    const knex = this;
    let bcash = 0;
    let bcard = 0;
    let online = 0;
    let creditcard = "N";
    if (is_card == 0) {
      bcash = cartItems.cart_net_total;
      creditcard = "Y";
    } else if (is_card == 1) {
      bcard = cartItems.cart_net_total;
      creditcard = "N";
    } else {
      creditcard = "U";
    }
    //     if (Array.isArray(mode) && mode.length > 0) {

    //       mode.forEach((item) => {

    //         // Cash
    //         if (item.id == 1) {
    //           bcash += Number(item.amount || 0);
    //         }

    //         // Online / UPI
    //         else if (item.id == 2) {
    //           online += Number(item.amount || 0);
    //         }

    //         // Card
    //         else if (item.id == 3) {
    //           bcard += Number(item.amount || 0);
    //         }

    //       });
    //     }
    //     let modeTotal = mode.reduce((sum, item) => {
    //       return sum + Number(item.amount || 0);
    //     }, 0);
    //     //modeTotal = Number(modeTotal.toFixed(2)) - Number(balance || 0);
    //     modeTotal = Number((
    //       Number(modeTotal) - Number(balance || 0)
    //     ).toFixed(2));
    //     console.log("modeTotal", modeTotal);
    // var cartNetTotal = Number(cartItems.cart_total);
    //    if (id == 1) {
    //   cartNetTotal = Math.round(
    //     Number(cartItems.cart_net_total)
    //   );
    // }

    //     console.log("billTotal", cartNetTotal);

    //     if (modeTotal !== cartNetTotal) {
    //       console.log("billTotal", cartNetTotal, modeTotal);
    //       throw CustomError.create({
    //         httpCode: 400,
    //         message: "Payment amount mismatch",
    //         property: "mode",
    //         code: "INVALID_AMOUNT"
    //       });
    //     }
    // let bcash = 0;
    // let bcard = 0;
    // let online = 0;

    if (Array.isArray(mode) && mode.length > 0) {

      mode.forEach((item) => {

        const amount = Number(item.amount || 0);

        // Cash
        if (item.id == 1) {
          bcash += amount;
        }

        // Online / UPI
        else if (item.id == 2) {
          online += amount;
        }

        // Card
        else if (item.id == 3) {
          bcard += amount;
        }

      });
    }

    // console.log("Cash Amount", bcash);
    // console.log("Online Amount", online);
    // console.log("Card Amount", bcard);

    const hasCashMode = mode?.some(item => item.id == 1);

    let modeTotal = mode.reduce((sum, item) => {
      return sum + Number(item.amount || 0);
    }, 0);

    modeTotal = Number(
      (Number(modeTotal) - Number(balance || 0)).toFixed(2)
    );

    // console.log("modeTotal", modeTotal);

    let cartNetTotal = Number(cartItems.cart_total);

    // Round only for cash payment
    // if (hasCashMode) {
    //   cartNetTotal = Math.round(
    //     Number(cartItems.cart_net_total)
    //   );
    // }

    //console.log("billTotal", cartNetTotal);

    const modeTotalFixed = Number(modeTotal.toFixed(2));
    const cartNetTotalFixed = Number(cartNetTotal.toFixed(2));
    console.log("cartNetTotalFixed", cartNetTotalFixed);

    if (cartNetTotalFixed == 0) {
      throw CustomError.create({
        httpCode: 400,
        message: "Purchase amount cannot be zero buy something",
        property: "mode",
        code: "INVALID_AMOUNT"
      });
    }
    if (modeTotalFixed !== cartNetTotalFixed) {

      // console.log(
      //   "Payment mismatch",
      //   "Bill:",
      //   cartNetTotalFixed,
      //   "Paid:",
      //   modeTotalFixed
      // );

      throw CustomError.create({
        httpCode: 400,
        message: "Payment amount mismatch Bill:" + cartNetTotalFixed + " Paid:" + modeTotalFixed,
        property: "mode",
        code: "INVALID_AMOUNT"
      });
    }
    // Correct mode so that each item's id starts from 1 (POS id: 1), even if source id is 0 or 1
    // No changes needed; leave as is to preserve the "amount" field inside each item.
    // const correctedMode = mode.map((item, index) => ({
    //   ...item,
    //   id: index + 1
    // }));
    let financial_year = outlet_id + "_" + counter_no + "_" + billno + "_" + financialYear;
    let username = userDetails.user_name;
    let mobileNo = userDetails.user_mobile;
    let locname = userDetails.outlet_name;
    //console.log("floc", userDetails);
    const query_insert = await knex(`${OUT_BILL_MASTER.NAME}`).insert({
      [OUT_BILL_MASTER.COLUMNS.BNO]: billno,
      [OUT_BILL_MASTER.COLUMNS.CID]: 1,
      [OUT_BILL_MASTER.COLUMNS.BILL_NO]: billno,
      [OUT_BILL_MASTER.COLUMNS.BILL_DATE]: new Date(),
      [OUT_BILL_MASTER.COLUMNS.PARTY_NAME]: name,
      [OUT_BILL_MASTER.COLUMNS.CUSTOMER_ID]: customer_id,
      [OUT_BILL_MASTER.COLUMNS.MOBILENO]: mobileNo,
      [OUT_BILL_MASTER.COLUMNS.UID]: users_id,
      [OUT_BILL_MASTER.COLUMNS.LOCNAME]: locname,
      [OUT_BILL_MASTER.COLUMNS.USERNAME]: username,
      [OUT_BILL_MASTER.COLUMNS.AMOUNT]: cartItems.cart_net_total,
      [OUT_BILL_MASTER.COLUMNS.DISCOUNT]: cartItems.cart_total_discount,
      [OUT_BILL_MASTER.COLUMNS.EARNPOINT]: cartItems.cart_loyalty_earned_points || 0,
      [OUT_BILL_MASTER.COLUMNS.REDEEMPOINT]: cartItems.cart_loyalty_discount || 0,
      [OUT_BILL_MASTER.COLUMNS.CREDIT_CARD]: creditcard,
      [OUT_BILL_MASTER.COLUMNS.OFF_AMT]: cartItems.cart_offer_discount || 0,
      [OUT_BILL_MASTER.COLUMNS.COUNTER]: counter_no,
      [OUT_BILL_MASTER.COLUMNS.ROUND_OFF]: cartItems.cart_round_off,
      [OUT_BILL_MASTER.COLUMNS.BILLDATE]: currentDate,
      [OUT_BILL_MASTER.COLUMNS.STAX]: cartItems.cart_total_gst,
      [OUT_BILL_MASTER.COLUMNS.GST]: cartItems.cart_total_gst,
      [OUT_BILL_MASTER.COLUMNS.BAGS]: bags,
      [OUT_BILL_MASTER.COLUMNS.VAT1]: cartItems.cart_total_gst,
      [OUT_BILL_MASTER.COLUMNS.ROFF]: cartItems.cart_round_off,
      [OUT_BILL_MASTER.COLUMNS.BAMT]: cartItems.cart_net_total,
      [OUT_BILL_MASTER.COLUMNS.BDIS]: cartItems.cart_total_discount,
      [OUT_BILL_MASTER.COLUMNS.BCASH]: bcash,
      [OUT_BILL_MASTER.COLUMNS.BCARD]: bcard,
      [OUT_BILL_MASTER.COLUMNS.ONLINE]: online,
      [OUT_BILL_MASTER.COLUMNS.BUPI]: online,
      [OUT_BILL_MASTER.COLUMNS.VFLAG]: 0,
      [OUT_BILL_MASTER.COLUMNS.BALANCE_AMT]: balance,
      [OUT_BILL_MASTER.COLUMNS.PAY_MODE]: JSON.stringify(mode),
      [OUT_BILL_MASTER.COLUMNS.CUSTOMER_MOBILE]: mobile,
      [OUT_BILL_MASTER.COLUMNS.SCH_AMT]: cartItems.cart_scheme_discount,
      [OUT_BILL_MASTER.COLUMNS.SCH_DIS]: cartItems.cart_scheme_discount,
      [OUT_BILL_MASTER.COLUMNS.TOT_ITEM]: cartItems.cart_total_quantity,
      [OUT_BILL_MASTER.COLUMNS.GR_WT]: cartItems.cart_gr_wt,
      [OUT_BILL_MASTER.COLUMNS.GR_TOT]: cartItems.cart_net_total,
      [OUT_BILL_MASTER.COLUMNS.LOC_ID]: outlet_id,
      [OUT_BILL_MASTER.COLUMNS.BILL_REF_NO]: financial_year,
      [OUT_BILL_MASTER.COLUMNS.REFERENCE_ID]: cartItems.cart_lines[0].reference_id || 1,
      [OUT_BILL_MASTER.COLUMNS.TRANSACTION_STATUS]: cartItems.cart_lines[0].transaction_status,
      [OUT_BILL_MASTER.COLUMNS.FINANCIAL_YEAR]: financialYear,
      [OUT_BILL_MASTER.COLUMNS.SUB_TOTAL_AMT]: cartItems.cart_sub_total,
    });

    const response = await query_insert;
    if (!response) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_IMPLEMENTED,
        message: "Error while placing the orders",
        property: "",
        code: "NOT_IMPLEMENTED"
      });
    }


    const cart_lines = cartItems.cart_lines.map((orderline, index) => ({
      [OUT_BILL_DETAIL.COLUMNS.BNO]: billno,
      [OUT_BILL_DETAIL.COLUMNS.CID]: 1,
      [OUT_BILL_DETAIL.COLUMNS.BILL_NO]: billno,
      [OUT_BILL_DETAIL.COLUMNS.COUNTER]: counter_no,
      [OUT_BILL_DETAIL.COLUMNS.BILLDATE]: new Date(),
      [OUT_BILL_DETAIL.COLUMNS.SR_ID]: index + 1,
      [OUT_BILL_DETAIL.COLUMNS.PROD_ID]: orderline.prod_id,
      [OUT_BILL_DETAIL.COLUMNS.PROD_QTY]: orderline.qty,
      [OUT_BILL_DETAIL.COLUMNS.PROD_RATE]: orderline.sales_rate,
      [OUT_BILL_DETAIL.COLUMNS.PURCHASE_RATE]: orderline.purchase_rate,
      [OUT_BILL_DETAIL.COLUMNS.BILL_DATE]: currentDate,
      [OUT_BILL_DETAIL.COLUMNS.VAT]: Number(orderline.sgst) || 0,
      [OUT_BILL_DETAIL.COLUMNS.MRP]: orderline.mrp,
      [OUT_BILL_DETAIL.COLUMNS.SGST]: orderline.sgst / 2 || 0,
      [OUT_BILL_DETAIL.COLUMNS.CGST]: orderline.cgst / 2 || 0,
      [OUT_BILL_DETAIL.COLUMNS.CESS]: orderline.cess || 0,
      [OUT_BILL_DETAIL.COLUMNS.DIS]: orderline.discount_percent || 0,
      [OUT_BILL_DETAIL.COLUMNS.FQTY]: 0,
      [OUT_BILL_DETAIL.COLUMNS.POFF]: 0,
      [OUT_BILL_DETAIL.COLUMNS.CBAR]: 0,
      [OUT_BILL_DETAIL.COLUMNS.BARCODE]: orderline.barcode,
      [OUT_BILL_DETAIL.COLUMNS.LOC_ID]: outlet_id,
      [OUT_BILL_DETAIL.COLUMNS.BARCODE]: orderline.barcode,
      [OUT_BILL_DETAIL.COLUMNS.LOCNAME]: locname,
      [OUT_BILL_DETAIL.COLUMNS.PRODCODE]: orderline.prod_code,
      [OUT_BILL_DETAIL.COLUMNS.PRODNAME]: orderline.prod_name,
      [OUT_BILL_DETAIL.COLUMNS.SUBCTGID]: orderline.sub_cat_id,
      [OUT_BILL_DETAIL.COLUMNS.SUBCTGINAME]: orderline.sub_category_name,
      [OUT_BILL_DETAIL.COLUMNS.MAINCTGID]: orderline.main_cat_id,
      [OUT_BILL_DETAIL.COLUMNS.MAINCTGINAME]: orderline.main_category_name,
      [OUT_BILL_DETAIL.COLUMNS.MERCHANDCTGNAME]: orderline.main_category_name,
      [OUT_BILL_DETAIL.COLUMNS.BRANDCOMPID]: orderline.brand_company_id,
      [OUT_BILL_DETAIL.COLUMNS.MERCHANDCTGID]: orderline.merchant_category_id,
      [OUT_BILL_DETAIL.COLUMNS.BRANDCOMPNAME]: orderline.brand_company_name,
      [OUT_BILL_DETAIL.COLUMNS.BRANDID]: orderline.brand_id,
      [OUT_BILL_DETAIL.COLUMNS.BRANDNAME]: orderline.brand_name,
      [OUT_BILL_DETAIL.COLUMNS.UOMID]: orderline.prod_uom,
      [OUT_BILL_DETAIL.COLUMNS.UOMNAME]: orderline.uom_name,
      [OUT_BILL_DETAIL.COLUMNS.HSN]: orderline.hsn || 0,
      [OUT_BILL_DETAIL.COLUMNS.GST]: Number(orderline.sgst) || 0,
      [OUT_BILL_DETAIL.COLUMNS.BILL_REF_NO]: financial_year,
      [OUT_BILL_DETAIL.COLUMNS.FINANCIAL_YEAR]: financialYear,
      [OUT_BILL_DETAIL.COLUMNS.DIS_AMT]: orderline.discount_amount || 0,


    }));
    // console.log("cartline", cart_lines);
    try {
      const insertedOrderLines = await knex(`${OUT_BILL_DETAIL.NAME}`).insert(
        cart_lines
      );
    } catch (err) {
      console.log(err);
    }
    for (const orderline of cartItems.cart_lines) {

      await knex(OUTLET_PURCHASE_BATCH_DETAILS.NAME)
        .update({
          [OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.STATUS]: null,

          [OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.PRODUCT_CODE]:
            orderline.prod_code,
        })
        .where(
          OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.PRODUCT_ID,
          orderline.prod_id
        )
        .andWhere(
          OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.MRP,
          orderline.mrp
        );

    }
    return { success: true };
  }
  async function YearSaleSave({
    logTrace,
    dis_amt,
    round_off_amt,
    input: {
      billno,
      name,
      mobile,
      users_id,
      is_card,
      counter_no,
      outlet_id,
      bags,
      currentDate,
      cartItems
    }
  }) {
    const knex = this;
    let counteramount = 0;
    let countercard = 0;
    // let cashamount = 0;
    // let cashcard = 0;
    let otheramt = 0

    if (is_card == 0) {
      countercard = cartItems.cart_net_total;
      otheramt = 0;
      counteramount = 0
      // cashcard = cartItems.cart_net_total;
      // cashamount = cartItems.cart_net_total;
    } else if (is_card == 1) {
      counteramount = cartItems.cart_net_total;
      countercard = 0;
      otheramt = 0;

    }
    else {
      otheramt = parseFloat(cartItems.cart_net_total);
      counteramount = 0;
      countercard = 0
    }
    const query = knex(YEAR_SALES.NAME).where(
      YEAR_SALES.COLUMNS.ENTRY_DATE,
      currentDate
    );
    const exists_response = await query;

    if (exists_response.length > 0) {
      if (counteramount > 0) {

        counteramount += exists_response[0].CounterAmount;
      }
      if (countercard > 0) {

        countercard += exists_response[0].CounterCard;
      }
      if (otheramt > 0) {

        otheramt += parseFloat(exists_response[0].otheramt);
      }
      // cashamount += exists_response[0].CashAmount;
      // cashcard += exists_response[0].CashCard;
      const query_update = await knex(`${YEAR_SALES.NAME}`)
        .where(`${YEAR_SALES.COLUMNS.ENTRY_DATE}`, currentDate)
        .update({
          [YEAR_SALES.COLUMNS.COUNTER_AMOUNT]: counteramount,
          [YEAR_SALES.COLUMNS.COUNTER_CARD]: countercard,
          [YEAR_SALES.COLUMNS.CASH_AMOUNT]: 0,
          [YEAR_SALES.COLUMNS.CASH_CARD]: 0,
          [YEAR_SALES.COLUMNS.CREDIT_AMOUNT]: 0,
          [YEAR_SALES.COLUMNS.CREDIT_CARD]: 0,
          [YEAR_SALES.COLUMNS.ORDER_AMOUNT]: 0,
          [YEAR_SALES.COLUMNS.ORDER_CARD]: 0,
          [YEAR_SALES.COLUMNS.PURCHASE_CASH]: 0,
          [YEAR_SALES.COLUMNS.PURCHASE_CREDIT]: 0,
          [YEAR_SALES.COLUMNS.WASTE_AMOUNT]: 0,
          [YEAR_SALES.COLUMNS.COUNT_RET]: 0,
          [YEAR_SALES.COLUMNS.CASH_RET]: 0,
          [YEAR_SALES.COLUMNS.CREDIT_RET]: 0,
          [YEAR_SALES.COLUMNS.PCASH_RET]: 0,
          [YEAR_SALES.COLUMNS.PCREDIT_RET]: 0,
          [YEAR_SALES.COLUMNS.ORDER_RET]: 0,
          [YEAR_SALES.COLUMNS.LOCAL_CASH]: 0,
          [YEAR_SALES.COLUMNS.LOCAL_CARD]: 0,
          [YEAR_SALES.COLUMNS.S_ROUND_OFF]: round_off_amt,
          [YEAR_SALES.COLUMNS.S_DISCOUNT]: dis_amt,
          [YEAR_SALES.COLUMNS.BRANCH_AMOUNT]: 0,
          [YEAR_SALES.COLUMNS.P_DISCOUNT]: 0,
          [YEAR_SALES.COLUMNS.P_ROUND_OFF]: 0,
          [YEAR_SALES.COLUMNS.S_VAT]: 0,
          [YEAR_SALES.COLUMNS.P_VAT]: 0,
          [YEAR_SALES.COLUMNS.CASH_GIFT_CARD]: 0,
          [YEAR_SALES.COLUMNS.CID]: 1,
          [YEAR_SALES.COLUMNS.OTHER_AMOUNT]: otheramt,
          [YEAR_SALES.COLUMNS.OFF_AMOUNT]: 0,
          [YEAR_SALES.COLUMNS.S_ROUND_OFF_1]: 0,
          [YEAR_SALES.COLUMNS.S_DISCOUNT_1]: 0,
          [YEAR_SALES.COLUMNS.OFF_AMOUNT_1]: 0,
          [YEAR_SALES.COLUMNS.STATUS]: 0,
          [YEAR_SALES.COLUMNS.ONLINE]: 0,
          [YEAR_SALES.COLUMNS.CB_AMT]: 0
        });
      await query_update;
    } else {
      const query_insert = await knex(`${YEAR_SALES.NAME}`).insert({
        [YEAR_SALES.COLUMNS.ENTRY_DATE]: currentDate,
        [YEAR_SALES.COLUMNS.COUNTER_AMOUNT]: counteramount,
        [YEAR_SALES.COLUMNS.COUNTER_CARD]: countercard,
        [YEAR_SALES.COLUMNS.CASH_AMOUNT]: 0,
        [YEAR_SALES.COLUMNS.CASH_CARD]: 0,
        [YEAR_SALES.COLUMNS.CREDIT_AMOUNT]: 0,
        [YEAR_SALES.COLUMNS.CREDIT_CARD]: 0,
        [YEAR_SALES.COLUMNS.ORDER_AMOUNT]: 0,
        [YEAR_SALES.COLUMNS.ORDER_CARD]: 0,
        [YEAR_SALES.COLUMNS.PURCHASE_CASH]: 0,
        [YEAR_SALES.COLUMNS.PURCHASE_CREDIT]: 0,
        [YEAR_SALES.COLUMNS.WASTE_AMOUNT]: 0,
        [YEAR_SALES.COLUMNS.COUNT_RET]: 0,
        [YEAR_SALES.COLUMNS.CASH_RET]: 0,
        [YEAR_SALES.COLUMNS.CREDIT_RET]: 0,
        [YEAR_SALES.COLUMNS.PCASH_RET]: 0,
        [YEAR_SALES.COLUMNS.PCREDIT_RET]: 0,
        [YEAR_SALES.COLUMNS.ORDER_RET]: 0,
        [YEAR_SALES.COLUMNS.LOCAL_CASH]: 0,
        [YEAR_SALES.COLUMNS.LOCAL_CARD]: 0,
        [YEAR_SALES.COLUMNS.S_ROUND_OFF]: round_off_amt,
        [YEAR_SALES.COLUMNS.S_DISCOUNT]: dis_amt,
        [YEAR_SALES.COLUMNS.BRANCH_AMOUNT]: 0,
        [YEAR_SALES.COLUMNS.P_DISCOUNT]: 0,
        [YEAR_SALES.COLUMNS.P_ROUND_OFF]: 0,
        [YEAR_SALES.COLUMNS.S_VAT]: 0,
        [YEAR_SALES.COLUMNS.P_VAT]: 0,
        [YEAR_SALES.COLUMNS.CASH_GIFT_CARD]: 0,
        [YEAR_SALES.COLUMNS.CID]: 1,
        [YEAR_SALES.COLUMNS.OTHER_AMOUNT]: otheramt,
        [YEAR_SALES.COLUMNS.OFF_AMOUNT]: 0,
        [YEAR_SALES.COLUMNS.S_ROUND_OFF_1]: 0,
        [YEAR_SALES.COLUMNS.S_DISCOUNT_1]: 0,
        [YEAR_SALES.COLUMNS.OFF_AMOUNT_1]: 0,
        [YEAR_SALES.COLUMNS.STATUS]: 0,
        [YEAR_SALES.COLUMNS.ONLINE]: 0,
        [YEAR_SALES.COLUMNS.CB_AMT]: 0
      });
      await query_insert;
    }

    return { success: true };
  }
  async function CounterSaleSave({
    logTrace,
    outlet_id,
    mode,
    balance,
    userDetails,
    financialYear,
    input: {
      billno,
      name,
      mobile,
      customer_id,
      users_id,
      is_card,
      counter_no,
      bags,
      currentDate,
      cartItems,

      currentTime,
    }
  }) {
    const knex = this;
    let bcash = 0;
    let bcard = 0;
    let online = 0;
    let creditcard = "N";
    let otheramount = 0;
    let bills = 1;
    if (is_card == 0) {
      bcash = cartItems.cart_net_total;
      creditcard = "Y";
    } else if (is_card == 1) {
      bcard = cartItems.cart_net_total;
      creditcard = "N";
    } else {
      creditcard = "U";
    }
    if (Array.isArray(mode) && mode.length > 0) {

      mode.forEach((item) => {

        const amount = Number(item.amount || 0);

        // Cash
        if (item.id == 1) {
          bcash += amount;
        }

        // Online / UPI
        else if (item.id == 2) {
          online += amount;
        }

        // Card
        else if (item.id == 3) {
          bcard += amount;
        }

      });
    }

    // console.log("Cash Amount", bcash);
    // console.log("Online Amount", online);
    // console.log("Card Amount", bcard);

    const hasCashMode = mode?.some(item => item.id == 1);

    let modeTotal = mode.reduce((sum, item) => {
      return sum + Number(item.amount || 0);
    }, 0);

    modeTotal = Number(
      (Number(modeTotal) - Number(balance || 0)).toFixed(2)
    );

    // console.log("modeTotal", modeTotal);

    let cartNetTotal = Number(cartItems.cart_total);

    // Round only for cash payment
    // if (hasCashMode) {
    //   cartNetTotal = Math.round(
    //     Number(cartItems.cart_net_total)
    //   );
    // }

    //console.log("billTotal", cartNetTotal);

    const modeTotalFixed = Number(modeTotal.toFixed(2));
    const cartNetTotalFixed = Number(cartNetTotal.toFixed(2));



    let username = userDetails.user_name;
    let mobileNo = userDetails.user_mobile;
    let locname = userDetails.outlet_name;
    //console.log("floc", currentDate);

    const query = knex(COUNTER_SALES.NAME)
      .where(COUNTER_SALES.COLUMNS.COUNTER, counter_no)
      .andWhere(COUNTER_SALES.COLUMNS.BILLDATE, currentDate)
      .andWhere(COUNTER_SALES.COLUMNS.UID, users_id)
      .andWhere(COUNTER_SALES.COLUMNS.OUTLET_ID, outlet_id)
      .andWhere(COUNTER_SALES.COLUMNS.TYPE, "S")
      .andWhere(COUNTER_SALES.COLUMNS.STATUS, 0);
    const exists_response = await query;

    if (exists_response.length > 0) {

      const query_update = await knex(`${COUNTER_SALES.NAME}`)
        .where(`${COUNTER_SALES.COLUMNS.COUNTER}`, counter_no)
        .where(COUNTER_SALES.COLUMNS.BILLDATE, currentDate)
        .where(COUNTER_SALES.COLUMNS.UID, users_id)
        .where(COUNTER_SALES.COLUMNS.TYPE, "S")
        .where(COUNTER_SALES.COLUMNS.STATUS, 0)
        .where(COUNTER_SALES.COLUMNS.OUTLET_ID, outlet_id)
        .update({
          [COUNTER_SALES.COLUMNS.BILL_DATE]: currentDate,
          [COUNTER_SALES.COLUMNS.CASH]: knex.raw('cash + ?', [bcash]),
          [COUNTER_SALES.COLUMNS.CARD]: knex.raw('card + ?', [bcard]),
          [COUNTER_SALES.COLUMNS.BILLS]: knex.raw('bills + ?', [bills]),
          [COUNTER_SALES.COLUMNS.ONLINE]: knex.raw('online + ?', [online]),
          [COUNTER_SALES.COLUMNS.END_TIME]: currentTime,
          [COUNTER_SALES.COLUMNS.END_BILL]: billno,
          [COUNTER_SALES.COLUMNS.DISCOUNT]: cartItems.cart_total_discount,
          [COUNTER_SALES.COLUMNS.ROUND_OFF]: cartItems.cart_round_off,
          [COUNTER_SALES.COLUMNS.PAID_AMOUNT]: 0,
          [COUNTER_SALES.COLUMNS.EXCESS]: 0,
          [COUNTER_SALES.COLUMNS.SHORTAGE]: 0,
          [COUNTER_SALES.COLUMNS.STATUS]: 0,
          [COUNTER_SALES.COLUMNS.TYPE]: "S",
          [COUNTER_SALES.COLUMNS.ADJUST]: 0,
          [COUNTER_SALES.COLUMNS.BAGS]: knex.raw('bags + ?', [bags]),
          [COUNTER_SALES.COLUMNS.CARD_BILL]: 0,
          [COUNTER_SALES.COLUMNS.TISSUE]: 0,
          [COUNTER_SALES.COLUMNS.T_RECEIVED]: 0,
          [COUNTER_SALES.COLUMNS.COUPON]: 0,
          [COUNTER_SALES.COLUMNS.CBILL]: 0,
          [COUNTER_SALES.COLUMNS.CASH_CARD]: 0,
          [COUNTER_SALES.COLUMNS.S_RET]: 0,
          [COUNTER_SALES.COLUMNS.COUPON_COUNT]: 0,
          [COUNTER_SALES.COLUMNS.J_BILL]: 0,
          [COUNTER_SALES.COLUMNS.J_AMOUNT]: 0,
          [COUNTER_SALES.COLUMNS.O_BILL]: 0,
          [COUNTER_SALES.COLUMNS.O_AMOUNT]: knex.raw('oamt + ?', [otheramount]),
          [COUNTER_SALES.COLUMNS.EDIT_STATUS]: 1,

          [COUNTER_SALES.COLUMNS.ON_BILL]: 0,
          [COUNTER_SALES.COLUMNS.CREDIT_REMIT]: 0,
          [COUNTER_SALES.COLUMNS.U_REMIT]: 0,
          [COUNTER_SALES.COLUMNS.OUTLET_ID]: outlet_id
        });
      await query_update;
    } else {
      const query_insert = await knex(`${COUNTER_SALES.NAME}`).insert({
        [COUNTER_SALES.COLUMNS.COUNTER]: counter_no,
        [COUNTER_SALES.COLUMNS.UID]: users_id,
        [COUNTER_SALES.COLUMNS.COUNTER_USER_NAME]: username,
        [COUNTER_SALES.COLUMNS.USER_MOBILE]: mobileNo,
        [COUNTER_SALES.COLUMNS.BAGS]: bags,
        [COUNTER_SALES.COLUMNS.BILLDATE]: currentDate,
        [COUNTER_SALES.COLUMNS.BILL_DATE]: currentDate,
        [COUNTER_SALES.COLUMNS.CASH]: bcash,
        [COUNTER_SALES.COLUMNS.CARD]: bcard,
        [COUNTER_SALES.COLUMNS.BILLS]: bills,
        [COUNTER_SALES.COLUMNS.ONLINE]: online,
        [COUNTER_SALES.COLUMNS.START_TIME]: currentTime,
        [COUNTER_SALES.COLUMNS.START_BILL]: billno,
        [COUNTER_SALES.COLUMNS.END_TIME]: currentTime,
        [COUNTER_SALES.COLUMNS.END_BILL]: billno,
        [COUNTER_SALES.COLUMNS.DISCOUNT]: cartItems.cart_total_discount,
        [COUNTER_SALES.COLUMNS.ROUND_OFF]: cartItems.cart_round_off,
        [COUNTER_SALES.COLUMNS.PAID_AMOUNT]: 0,
        [COUNTER_SALES.COLUMNS.EXCESS]: 0,
        [COUNTER_SALES.COLUMNS.SHORTAGE]: 0,
        [COUNTER_SALES.COLUMNS.STATUS]: 0,
        [COUNTER_SALES.COLUMNS.TYPE]: "S",
        [COUNTER_SALES.COLUMNS.ADJUST]: 0,
        [COUNTER_SALES.COLUMNS.BAGS]: bags,
        [COUNTER_SALES.COLUMNS.CARD_BILL]: 0,
        [COUNTER_SALES.COLUMNS.TISSUE]: 0,
        [COUNTER_SALES.COLUMNS.T_RECEIVED]: 0,
        [COUNTER_SALES.COLUMNS.COUPON]: 0,
        [COUNTER_SALES.COLUMNS.CBILL]: 0,
        [COUNTER_SALES.COLUMNS.CASH_CARD]: 0,
        [COUNTER_SALES.COLUMNS.S_RET]: 0,
        [COUNTER_SALES.COLUMNS.COUPON_COUNT]: 0,
        [COUNTER_SALES.COLUMNS.J_BILL]: 0,
        [COUNTER_SALES.COLUMNS.J_AMOUNT]: 0,
        [COUNTER_SALES.COLUMNS.O_BILL]: 0,
        [COUNTER_SALES.COLUMNS.O_AMOUNT]: otheramount,
        [COUNTER_SALES.COLUMNS.EDIT_STATUS]: 1,

        [COUNTER_SALES.COLUMNS.ON_BILL]: 0,
        [COUNTER_SALES.COLUMNS.CREDIT_REMIT]: 0,
        [COUNTER_SALES.COLUMNS.U_REMIT]: 0,
        [COUNTER_SALES.COLUMNS.OUTLET_ID]: outlet_id
      });
      await query_insert;
    }

    return { success: true };
  }

  async function ItemDetailsSave({
    logTrace,
    outlet_id,
    mode,
    balance,
    userDetails,
    financialYear,
    input: {
      billno,
      name,
      mobile,
      customer_id,
      users_id,
      is_card,
      counter_no,
      bags,
      currentDate,
      cartItems,

      currentTime,
    }
  }) {
    const knex = this;
    let bcash = 0;
    let bcard = 0;
    let online = 0;
    let creditcard = "N";
    let otheramount = 0;
    let bills = 1;
    if (is_card == 0) {
      bcash = cartItems.cart_net_total;
      creditcard = "Y";
    } else if (is_card == 1) {
      bcard = cartItems.cart_net_total;
      creditcard = "N";
    } else {
      creditcard = "U";
    }
    if (Array.isArray(mode) && mode.length > 0) {

      mode.forEach((item) => {

        // Cash
        if (item.id == 1) {
          bcash += Number(item.amount || 0);
        }

        // Online / UPI
        else if (item.id == 2) {
          online += Number(item.amount || 0);
        }

        // Card
        else if (item.id == 3) {
          bcard += Number(item.amount || 0);
        }

      });
    }
    let modeTotal = mode.reduce((sum, item) => {
      return sum + Number(item.amount || 0);
    }, 0);
    modeTotal = Number(modeTotal.toFixed(2)) - Number(balance || 0);
    //console.log("modeTotal", modeTotal);
    //console.log("currentDate",currentDate);


    const cartNetTotal = Number(cartItems.cart_net_total);

    let username = userDetails.user_name;
    let mobileNo = userDetails.user_mobile;
    let locname = userDetails.outlet_name;

    //console.log("cartItems", cartItems);
    // console.log("currentDate", currentDate);

    const deatails = cartItems.cart_lines.map(async orderline => {
      let query1 = knex(ITEM_DETAILS.NAME)
        .where(ITEM_DETAILS.COLUMNS.PROD_ID, orderline.prod_id)
        .andWhere(ITEM_DETAILS.COLUMNS.ENTRY_DATE, currentDate)
        .andWhere(ITEM_DETAILS.COLUMNS.OUTLET_ID, outlet_id)
        .andWhere(ITEM_DETAILS.COLUMNS.CID, 1);

      const exists_response = await query1;
      // console.log("exists_response", exists_response);
      // console.log("orderline", orderline);

      var pvalue = orderline.pur_rate * orderline.qty || 0;
      // console.log("pvalue", pvalue);

      if (orderline.dis > 0) {
        var svalue = orderline.mrp - (orderline.mrp * orderline.dis) / 100;
      } else {
        var svalue = (
          parseFloat(orderline.qty) * parseFloat(orderline.sales_rate)
        ).toFixed(2);
      }

      if (exists_response.length === 0) {
        await knex(ITEM_DETAILS.NAME).insert({
          [ITEM_DETAILS.COLUMNS.CID]: 1,
          [ITEM_DETAILS.COLUMNS.ENTRY_DATE]: currentDate,
          [ITEM_DETAILS.COLUMNS.PROD_ID]: orderline.prod_id,
          [ITEM_DETAILS.COLUMNS.CASH_QTY]: orderline.qty,
          [ITEM_DETAILS.COLUMNS.OUTLET_ID]: outlet_id,
          [ITEM_DETAILS.COLUMNS.CREDIT_QTY]: 0,
          [ITEM_DETAILS.COLUMNS.ORDER_QTY]: 0,
          [ITEM_DETAILS.COLUMNS.CASH_PURCHASE_QTY]: 0,
          [ITEM_DETAILS.COLUMNS.CREDIT_PURCHASE_QTY]: 0,
          [ITEM_DETAILS.COLUMNS.WASTE_QTY]: 0,
          [ITEM_DETAILS.COLUMNS.PHY_QTY]: 0,
          [ITEM_DETAILS.COLUMNS.PARENT_CODE]: orderline.parent_code || 0,
          [ITEM_DETAILS.COLUMNS.P_VALUE]: pvalue,
          [ITEM_DETAILS.COLUMNS.S_VALUE]: svalue,
          [ITEM_DETAILS.COLUMNS.W_VALUE]: 0,
          [ITEM_DETAILS.COLUMNS.PRET_CASH]: 0,
          [ITEM_DETAILS.COLUMNS.PRET_CREDIT]: 0,
          [ITEM_DETAILS.COLUMNS.S_RET_CASH]: 0,
          [ITEM_DETAILS.COLUMNS.S_RET_CREDIT]: 0,
          [ITEM_DETAILS.COLUMNS.S_RET_ORDER]: 0,
          [ITEM_DETAILS.COLUMNS.ISS_QTY]: 0,
          [ITEM_DETAILS.COLUMNS.STK_RET]: 0,
          [ITEM_DETAILS.COLUMNS.STK_IN]: 0,
          [ITEM_DETAILS.COLUMNS.EXP_QTY]: 0,
          [ITEM_DETAILS.COLUMNS.LP_TIME]: "",
          [ITEM_DETAILS.COLUMNS.LS_TIME]: "",
          [ITEM_DETAILS.COLUMNS.FP_TIME]: "",
          [ITEM_DETAILS.COLUMNS.FS_TIME]: "",
          [ITEM_DETAILS.COLUMNS.STATUS]: 1,
          [ITEM_DETAILS.COLUMNS.R_VALUE]: 0,
          [ITEM_DETAILS.COLUMNS.SUPP_ID]: orderline.suppid,
          [ITEM_DETAILS.COLUMNS.S_QTY]: 0
        });
      } else {
        const FStime = exists_response[0].FStime;
        if (FStime === "") {
          await knex(ITEM_DETAILS.NAME)
            .where(ITEM_DETAILS.COLUMNS.PROD_ID, orderline.prod_id)
            .andWhere(ITEM_DETAILS.COLUMNS.ENTRY_DATE, currentDate)
            .andWhere(ITEM_DETAILS.COLUMNS.OUTLET_ID, outlet_id)
            .andWhere(ITEM_DETAILS.COLUMNS.CID, 1)
            .update({
              // fstime: new Date(dt).toLocaleString('en-US', { hour12: true }),
              fstime: "",
              status: 1
            });
        } else {
          await knex(ITEM_DETAILS.NAME)
            .where(ITEM_DETAILS.COLUMNS.PROD_ID, orderline.prod_id)
            .andWhere(ITEM_DETAILS.COLUMNS.ENTRY_DATE, currentDate)
            .andWhere(ITEM_DETAILS.COLUMNS.OUTLET_ID, outlet_id)
            .andWhere(ITEM_DETAILS.COLUMNS.CID, 1)
            .update({
              cashqty: knex.raw(`cashqty + ${orderline.qty}`),
              pvalue: knex.raw(`pvalue + ${pvalue}`),
              svalue: knex.raw(`svalue + ${svalue}`),
              // LStime: new Date(dt).toLocaleString('en-US', { hour12: true }),
              lstime: "",
              status: 1,
              suppid: orderline.suppid,
              // Sqty: knex.raw(`Sqty + ${parseFloat(grid.TextMatrix[i][35])}`),
              sqty: knex.raw(`sqty + ${0.0}`)
            });
        }
      }
    });

    return { success: true };
  }
  async function MemberItemSave({
    logTrace,
    input: {
      billno,
      name,
      mobile,
      users_id,
      is_card,
      counter_no,
      bags,
      currentDate,
      cartItems
    }
  }) {
    const knex = this;
    const deatails = cartItems.cart_lines.map(async orderline => {
      const gdate = new Date();
      const lblmobile1 = mobile; //elseware
      // console.log("lblmobile1", lblmobile1);
      // console.log("orderline", orderline.prod_id);

      let query1 = await knex(MEMBER_ITEM.NAME)
        .where(MEMBER_ITEM.COLUMNS.CARD_NO, lblmobile1.trim())
        .andWhere(MEMBER_ITEM.COLUMNS.PROD_ID, parseInt(orderline.prod_id))
        .andWhere(
          MEMBER_ITEM.COLUMNS.ENTRY_DATE,
          gdate.toISOString().slice(0, 10)
        )
        .first();

      const exists_response = await query1;
      //exists_response.length==0

      if (!exists_response) {
        await knex(MEMBER_ITEM.NAME).insert({
          entrydate: gdate.toISOString().slice(0, 10),
          cardno: lblmobile1.trim(),
          prod_id: parseInt(orderline.prod_id),
          qty: parseInt(orderline.qty)
        });
      } else {
        await knex(MEMBER_ITEM.NAME)
          .where(MEMBER_ITEM.COLUMNS.CARD_NO, lblmobile1.trim())
          .andWhere(MEMBER_ITEM.COLUMNS.PROD_ID, parseInt(orderline.prod_id))
          .andWhere(
            MEMBER_ITEM.COLUMNS.ENTRY_DATE,
            gdate.toISOString().slice(0, 10)
          )
          .increment(MEMBER_ITEM.COLUMNS.QTY, parseInt(orderline.qty));
      }
    });

    return { success: true };
  }

  async function HourSalesSave({
    logTrace,
    input: {
      billno,
      name,
      mobile,
      users_id,
      is_card,
      counter_no,
      bags,
      currentDate,
      cartItems
    }
  }) {
    const knex = this;

    const deatails = cartItems.cart_lines.map(async orderline => {
      const dpdate = new Date();
      const dpdateFormatted = formatDate(dpdate);
      const hours = String(dpdate.getHours()).padStart(2, "0"); // Format dpdate
      const h1 = parseInt(hours); // Assuming h1 is defined elsewhere
      // const groupid = parseFloat(orderline.parent_code);
      // const cid = parseFloat(orderline.cid);
      const cid = 1;
      const groupid = 1;
      const r = calculateR(orderline.qty, orderline.mrp);

      let query1 = await knex(HOUR_SALES.NAME)
        .where(HOUR_SALES.COLUMNS.ENTRY_DATE, dpdateFormatted)
        .where(HOUR_SALES.COLUMNS.HOUR_NO, h1)
        .where(HOUR_SALES.COLUMNS.GROUP_ID, groupid)
        .where(HOUR_SALES.COLUMNS.CID, cid);

      const exists_response = await query1;

      if (exists_response.length === 0) {
        await knex(HOUR_SALES.NAME).insert({
          cid: cid,
          entry_date: dpdateFormatted,
          hour_no: h1,
          groupid: groupid || 0,
          amount: r
        });
      } else {
        await knex(HOUR_SALES.NAME)
          .where(HOUR_SALES.COLUMNS.ENTRY_DATE, dpdateFormatted)
          .where(HOUR_SALES.COLUMNS.HOUR_NO, h1)
          .where(HOUR_SALES.COLUMNS.GROUP_ID, groupid || 0)
          .where(HOUR_SALES.COLUMNS.CID, cid)
          .update({
            amount: knex.raw(`amount + ${r}`)
          });
      }
      function formatDate(date) {
        const options = { year: "2-digit", month: "short", day: "2-digit" };
        return new Date(date)
          .toLocaleDateString("en-US", options)
          .replace(",", "");
      }

      function calculateR(val1, val2) {
        return parseFloat(val1) * parseFloat(val2);
      }
    });

    return { success: true };
  }

  // async function GroupSalesSave({
  //   logTrace,
  //   outlet_id,
  //   mode,
  //   balance,
  //   userDetails,
  //   financialYear,
  //   input: {
  //     billno,
  //     name,
  //     mobile,
  //     customer_id,
  //     users_id,
  //     is_card,
  //     counter_no,
  //     bags,
  //     currentDate,
  //     cartItems,
  //     currentTime,
  //   }
  // }) {
  //    const knex = this;
  //   let bcash = 0;
  //   let bcard = 0;
  //   let online = 0;
  //   let creditcard = "N";
  //   if (is_card == 0) {
  //     bcash = cartItems.cart_net_total;
  //     creditcard = "Y";
  //   } else if (is_card == 1) {
  //     bcard = cartItems.cart_net_total;
  //     creditcard = "N";
  //   } else {
  //     creditcard = "U";
  //   }
  //   if (Array.isArray(mode) && mode.length > 0) {

  //     mode.forEach((item) => {

  //       // Cash
  //       if (item.id == 1) {
  //         bcash += Number(item.amount || 0);
  //       }

  //       // Online / UPI
  //       else if (item.id == 2) {
  //         online += Number(item.amount || 0);
  //       }

  //       // Card
  //       else if (item.id == 3) {
  //         bcard += Number(item.amount || 0);
  //       }

  //     });
  //   }
  //   let modeTotal = mode.reduce((sum, item) => {
  //     return sum + Number(item.amount || 0);
  //   }, 0);
  //   modeTotal = Number(modeTotal.toFixed(2)) - Number(balance || 0);
  //   console.log("modeTotal", modeTotal);


  //   const cartNetTotal = Number(cartItems.cart_net_total);

  //   console.log("groupcartItems",cartItems);

  //   // let financial_year = outlet_id + "_" + counter_no + "_" + billno + "_" + financialYear;
  //   let username = userDetails.user_name;
  //   let mobileNo = userDetails.user_mobile;
  //   let locname = userDetails.outlet_name;
  //   const deatails = cartItems.cart_lines.map(async orderline => {
  //     const dpdate = new Date();
  //     const dpdateFormatted = formatDate(dpdate); // Format dpdate
  //      const parentCode = parseFloat(orderline.parent_code) || 1;
  //     const cid = parseFloat(orderline.main_cat_id);
  //    console.log("cid",cid,currentDate);



  //     const total_amt = calculateR(orderline.qty, orderline.mrp);
  //   console.log("total_amt",total_amt);

  //     let query1 = await knex(GROUP_SALES.NAME)
  //       .where(GROUP_SALES.COLUMNS.ENTRY_DATE, currentDate)
  //       .andWhere(GROUP_SALES.COLUMNS.PARENT_CODE, parentCode)
  //        .andWhere(GROUP_SALES.COLUMNS.OUTLET_ID, outlet_id)
  //       .andWhere(GROUP_SALES.COLUMNS.CID, cid);

  //     const exists_response = await query1;
  // console.log("groupexists_response",exists_response);

  //     if (exists_response.length === 0) {
  //       await knex(GROUP_SALES.NAME).insert({
  //         cid: cid,
  //         entry_date: currentDate,
  //         parent_code: parentCode,
  //         cashamount: bcash,
  //         creditamount: bcard,
  //         orderamount: total_amt,
  //         purchasecash:bcash,
  //         purchasecredit: bcard,
  //         status: 1,
  //         online: online,
  //         category_name: orderline.main_category_name,
  //         outlet_id: outlet_id,
  //         total_amt: total_amt
  //       });
  //     } else {
  //       await knex(GROUP_SALES.NAME)
  //          .where(GROUP_SALES.COLUMNS.ENTRY_DATE, currentDate)
  //       .andWhere(GROUP_SALES.COLUMNS.PARENT_CODE, parentCode)
  //        .andWhere(GROUP_SALES.COLUMNS.OUTLET_ID, outlet_id)
  //       .andWhere(GROUP_SALES.COLUMNS.CID, cid)
  //         .update({
  //          cashamount: knex.raw(`cashamount + ${bcash}`),
  //         creditamount: knex.raw(`creditamount + ${bcard}`),
  //         orderamount: knex.raw(`orderamount + ${total_amt}`),
  //         purchasecash: knex.raw(`purchasecash + ${bcash}`),
  //         purchasecredit: knex.raw(`purchasecredit + ${bcard}`),
  //         status: 1,
  //         online: knex.raw(`online + ${online}`),
  //         cash : knex.raw(`cash + ${bcash}`),
  //         card : knex.raw(`card + ${bcard}`),
  //         category_name: orderline.main_category_name,
  //         outlet_id: outlet_id,
  //         total_amt:  knex.raw(`total_amt + ${total_amt}`),
  //         });
  //     }
  //     function formatDate(date) {
  //       const options = { year: "2-digit", month: "short", day: "2-digit" };
  //       return new Date(date)
  //         .toLocaleDateString("en-US", options)
  //         .replace(",", "");
  //     }

  //     function calculateR(val1, val2) {
  //       return parseFloat(val1) * parseFloat(val2);
  //     }
  //   });

  //   return { success: true };
  // }
  async function GroupSalesSave({
    logTrace,
    outlet_id,
    mode,
    balance,
    userDetails,
    financialYear,
    input: {
      billno,
      name,
      mobile,
      customer_id,
      users_id,
      is_card,
      counter_no,
      bags,
      currentDate,
      cartItems,
      currentTime,
    }
  }) {

    const knex = this;

    let bcash = 0;
    let bcard = 0;
    let online = 0;
    let creditcard = "N";

    // Payment Type Calculation
    if (is_card == 0) {
      bcash = Number(cartItems.cart_net_total || 0);
      creditcard = "Y";
    }
    else if (is_card == 1) {
      bcard = Number(cartItems.cart_net_total || 0);
      creditcard = "N";
    }
    else {
      creditcard = "U";
    }

    // Multiple Payment Modes
    if (Array.isArray(mode) && mode.length > 0) {

      mode.forEach((item) => {

        // Cash
        if (item.id == 1) {
          bcash += Number(item.amount || 0);
        }

        // Online / UPI
        else if (item.id == 2) {
          online += Number(item.amount || 0);
        }

        // Card
        else if (item.id == 3) {
          bcard += Number(item.amount || 0);
        }

      });
    }

    let modeTotal = mode.reduce((sum, item) => {
      return sum + Number(item.amount || 0);
    }, 0);

    modeTotal = Number(modeTotal.toFixed(2)) - Number(balance || 0);

    const cartNetTotal = Number(cartItems.cart_net_total || 0);
    let username = userDetails.user_name;
    let mobileNo = userDetails.user_mobile;
    let locname = userDetails.outlet_name;

    const groupedData = {};

    cartItems.cart_lines.forEach((item) => {

      const cid = parseFloat(item.main_cat_id || 0);

      if (!groupedData[cid]) {

        groupedData[cid] = {
          cid: cid,
          parent_code: parseFloat(item.parent_code) || 1,
          category_name: item.main_category_name,
          total_qty: 0,
          total_amt: 0,
          purchase_total: 0
        };
      }

      const qty = parseFloat(item.qty || 0);

      const mrp = parseFloat(item.mrp || 0);

      const purchaseRate = parseFloat(item.purchase_rate || 0);
      // Sales Amount
      groupedData[cid].total_qty += qty;
      groupedData[cid].total_amt += (qty * mrp);
      // Purchase Amount
      groupedData[cid].purchase_total += (qty * purchaseRate);

    });
    for (const key in groupedData) {
      const item = groupedData[key];
      let query1 = await knex(GROUP_SALES.NAME)
        .where(GROUP_SALES.COLUMNS.ENTRY_DATE, currentDate)
        .andWhere(GROUP_SALES.COLUMNS.PARENT_CODE, item.parent_code)
        .andWhere(GROUP_SALES.COLUMNS.OUTLET_ID, outlet_id)
        .andWhere(GROUP_SALES.COLUMNS.CID, item.cid);

      const exists_response = await query1;
      if (exists_response.length === 0) {

        await knex(GROUP_SALES.NAME).insert({
          [GROUP_SALES.COLUMNS.CID]: item.cid,
          [GROUP_SALES.COLUMNS.ENTRY_DATE]: currentDate,
          [GROUP_SALES.COLUMNS.PARENT_CODE]: item.parent_code,
          [GROUP_SALES.COLUMNS.CASH_AMOUNT]: item.total_amt,
          [GROUP_SALES.COLUMNS.CREDIT_AMOUNT]: modeTotal,
          [GROUP_SALES.COLUMNS.ORDER_AMOUNT]: item.total_qty,
          [GROUP_SALES.COLUMNS.PURCHASE_CASH]: item.purchase_total,
          [GROUP_SALES.COLUMNS.PURCHASE_CREDIT]: item.purchase_total,
          [GROUP_SALES.COLUMNS.STATUS]: 1,
          [GROUP_SALES.COLUMNS.ONLINE]: online,
          [GROUP_SALES.COLUMNS.CATEGORY_NAME]: item.category_name,
          [GROUP_SALES.COLUMNS.OUTLET_ID]: outlet_id,
          [GROUP_SALES.COLUMNS.FINANCIAL_YEAR]: financialYear,
          [GROUP_SALES.COLUMNS.TOTAL_AMT]: item.total_amt

        });
      }
      else {

        await knex(GROUP_SALES.NAME)
          .where(GROUP_SALES.COLUMNS.ENTRY_DATE, currentDate)
          .andWhere(GROUP_SALES.COLUMNS.PARENT_CODE, item.parent_code)
          .andWhere(GROUP_SALES.COLUMNS.OUTLET_ID, outlet_id)
          .andWhere(GROUP_SALES.COLUMNS.CID, item.cid)
          .update({
            [GROUP_SALES.COLUMNS.CASH_AMOUNT]: knex.raw(`cashamount + ${item.total_amt}`),
            [GROUP_SALES.COLUMNS.CREDIT_AMOUNT]: knex.raw(`creditamount + ${modeTotal}`),
            [GROUP_SALES.COLUMNS.ORDER_AMOUNT]: knex.raw(`orderamount + ${item.total_qty}`),
            [GROUP_SALES.COLUMNS.PURCHASE_CASH]: knex.raw(`purchasecash + ${item.purchase_total}`),
            [GROUP_SALES.COLUMNS.PURCHASE_CREDIT]: knex.raw(`purchasecredit + ${item.purchase_total}`),
            [GROUP_SALES.COLUMNS.STATUS]: 1,
            [GROUP_SALES.COLUMNS.ONLINE]: knex.raw(`online + ${online}`),
            [GROUP_SALES.COLUMNS.CATEGORY_NAME]: item.category_name,
            [GROUP_SALES.COLUMNS.TOTAL_AMT]: knex.raw(`total_amt + ${item.total_amt}`)

          });

      }
    }
    return {
      success: true,
    };
  }
  async function SchemaLogSave({
    logTrace,
    input: {
      billno,
      name,
      mobile,
      users_id,
      is_card,
      counter_no,
      bags,
      currentDate,
      cartItems
    }
  }) {
    const knex = this;

    const gdate = new Date();
    const txtbill = billno;
    const uid = users_id;
    const intcounter = counter_no;
    const stype = 1;
    const soval = 1;

    const deatails = cartItems.cart_lines.map(async orderline => {
      // await knex(SCHEME_LOG.NAME).insert({
      //   Edate: gdate.toLocaleDateString("en-US", {
      //     day: "2-digit",
      //     month: "short",
      //     year: "2-digit"
      //   }),
      //   Cnt: intcounter,
      //   Bno: Number(txtbill),
      //   uid: uid,
      //   sname: stype,
      //   pid: orderline.prod_id,
      //   oval: Number(soval),
      //   qty: Number(orderline.qty),
      //   rate: Number(orderline.sales_rate),
      //   status: 0
      // });
      await knex(SCHEME_LOG.NAME).insert({
        [SCHEME_LOG.COLUMNS.EDATE]: gdate.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "2-digit"
        }),
        [SCHEME_LOG.COLUMNS.CNT]: intcounter,
        [SCHEME_LOG.COLUMNS.BNO]: Number(txtbill),
        [SCHEME_LOG.COLUMNS.UID]: uid,
        [SCHEME_LOG.COLUMNS.SNAME]: stype,
        [SCHEME_LOG.COLUMNS.PID]: orderline.id,
        [SCHEME_LOG.COLUMNS.OVAL]: Number(soval),
        [SCHEME_LOG.COLUMNS.QTY]: Number(orderline.qty),
        [SCHEME_LOG.COLUMNS.RATE]: Number(orderline.sales_rate),
        [SCHEME_LOG.COLUMNS.STATUS]: 0

      });
    });

    return { success: true };
  }

  async function OfferLogSave({
    logTrace,
    input: {
      billno,
      name,
      mobile,
      users_id,
      is_card,
      counter_no,
      bags,
      currentDate,
      cartItems
    }
  }) {
    const knex = this;

    const gdate = new Date();

    const deatails = cartItems.cart_lines.map(async orderline => {
      const oftype = 1;
      const ocomp = 1;
      const oshop = 1;
      const amt =
        oftype < 2
          ? orderline.qty * orderline.sales_rate
          : orderline.qty * ocomp;
      const ca = oftype < 2 ? amt * (ocomp / 100) : orderline.qty * ocomp;
      const sa = oftype < 2 ? amt * (oshop / 100) : orderline.qty * oshop;

      // await knex("offer_detail").insert({
      //   edate: gdate.toLocaleDateString("en-US", {
      //     day: "2-digit",
      //     month: "short",
      //     year: "2-digit"
      //   }),
      //   cnt: counter_no,
      //   bno: Number(billno),
      //   pid: orderline.prod_id,
      //   oqty: orderline.qty,
      //   prate: orderline.sales_rate
      // });

      await knex(OFFER_DETAIL.NAME).insert({
        [OFFER_DETAIL.COLUMNS.EDATE]: gdate.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "2-digit"
        }),
        [OFFER_DETAIL.COLUMNS.CNT]: counter_no,
        [OFFER_DETAIL.COLUMNS.BNO]: Number(billno),
        [OFFER_DETAIL.COLUMNS.PID]: orderline.id,
        [OFFER_DETAIL.COLUMNS.OQTY]: orderline.qty,
        [OFFER_DETAIL.COLUMNS.PRATE]: orderline.sales_rate
      });
      const offerLogExists = knex(OFFER_LOG.NAME)
        .where({
          edate: gdate.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "2-digit"
          }),
          pid: 1,
          prodid: orderline.id,
          otype: 1,
          omode: 0
        })
        .first();

      if (!offerLogExists) {
        // await knex(OFFER_LOG.NAME).insert({
        //   Edate: gdate.toLocaleDateString("en-US", {
        //     day: "2-digit",
        //     month: "short",
        //     year: "2-digit"
        //   }),
        //   Pid: 1,
        //   otype: 1,
        //   omode: 0,
        //   prodid: orderline.prod_id,
        //   Qty: orderline.qty,
        //   Rate: orderline.sales_rate,
        //   Comp: ca,
        //   Shop: sa,
        //   oval: 0,
        //   prate: 0,
        //   status: 1
        // });
        await knex(OFFER_LOG.NAME).insert({
          [OFFER_LOG.COLUMNS.EDATE]: gdate.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "2-digit"
          }),
          [OFFER_LOG.COLUMNS.PID]: 1,
          [OFFER_LOG.COLUMNS.OTYPE]: 1,
          [OFFER_LOG.COLUMNS.OMODE]: 0,
          [OFFER_LOG.COLUMNS.PRODID]: orderline.prod_id,
          [OFFER_LOG.COLUMNS.QTY]: orderline.qty,
          [OFFER_LOG.COLUMNS.RATE]: orderline.sales_rate,
          [OFFER_LOG.COLUMNS.COMP]: ca,
          [OFFER_LOG.COLUMNS.SHOP]: sa,
          [OFFER_LOG.COLUMNS.OVAL]: 0,
          [OFFER_LOG.COLUMNS.PRATE]: 0,
          [OFFER_LOG.COLUMNS.STATUS]: 1
        });
      } else {
        await knex(OFFER_LOG.NAME)
          .where({
            edate: gdate.toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "2-digit"
            }),
            pid: 1,
            prodid: orderline.prod_id,
            otype: 1,
            omode: 0
          })
          .update({
            qty: knex.raw(`qty + ${orderline.qty}`),
            rate: knex.raw(`rate + ${orderline.sales_rate}`),
            comp: knex.raw(`comp + ${ca}`),
            shop: knex.raw(`shop + ${sa}`),
            status: 1
          });
      }
    });

    return { success: true };
  }

  async function settingInfo({ body, params, logTrace, userDetails }) {
    const knex = this;

    const query = knex(SETTING.NAME).select(SETTING.NAME + ".*");
    logQuery({
      logger: fastify.log,
      query,
      context: "Get Settings Info",
      logTrace
    });
    const response = await query;

    return response[0];
  }
  async function newmemberInfo({ body, params, logTrace, userDetails }) {
    const knex = this;

    // const query = knex("Setting5").select("Setting5.*");
    const query = knex(SETTING.NAME).select(SETTING.NAME + ".*");
    logQuery({
      logger: fastify.log,
      query,
      context: "Get Settings Info",
      logTrace
    });
    const response = await query;
    //console.log("newMemberinfo", response);

    return response[0];
  }

  async function getCompanyInfo({ body, params, logTrace, userDetails }) {
    const knex = this;

    const query = knex(COMPANY.NAME)
      .select(
        `${COMPANY.NAME}. ${COMPANY.COLUMNS.ID} AS Cid`,
        `${COMPANY.NAME}. ${COMPANY.COLUMNS.SHORTNAME} AS SName`,
        `${COMPANY.NAME}. ${COMPANY.COLUMNS.FULLNAME} AS Fname`,
        `${COMPANY.NAME}. ${COMPANY.COLUMNS.ADD1} AS Add1`,
        `${COMPANY.NAME}. ${COMPANY.COLUMNS.ADD2} AS Add2`,
        `${COMPANY.NAME}. ${COMPANY.COLUMNS.CITY} AS City`,
        `${COMPANY.NAME}. ${COMPANY.COLUMNS.PHONE} AS Phone`,
        `${COMPANY.NAME}. ${COMPANY.COLUMNS.GSTIN} AS Tngst`,
        `${COMPANY.NAME}. ${COMPANY.COLUMNS.FSSAI} AS fssai`,
        // `${COMPANY.NAME}. ${COMPANY.COLUMNS.SPLMSG} AS splmsg1`,
        // `${COMPANY.NAME}. ${COMPANY.COLUMNS.SPLMSG2} AS splmsg2`
      )
      .leftJoin(
        COMPANY_BANK_DETAILS.NAME,
        `${COMPANY.NAME}.id`,
        `${COMPANY_BANK_DETAILS.NAME}.company_id`
      );
    const response = await query;
    if (!response.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Company Info not found",
        property: "",
        code: "NOT_FOUND"
      });
    }
    return response[0];
  }
  async function getCompanyGstInfo({ body, params, logTrace, userDetails }) {
    const knex = this;

    // const query = knex("Company_MasterM").select("Company_MasterM.*");
    const query = knex(COMPANY.NAME)
      .select(
        `${COMPANY.NAME}. ${COMPANY.COLUMNS.ID} AS Cid`,
        `${COMPANY.NAME}. ${COMPANY.COLUMNS.SHORTNAME} AS SName`,
        `${COMPANY.NAME}. ${COMPANY.COLUMNS.FULLNAME} AS Fname`,
        `${COMPANY.NAME}. ${COMPANY.COLUMNS.ADD1} AS Add1`,
        `${COMPANY.NAME}. ${COMPANY.COLUMNS.ADD2} AS Add2`,
        `${COMPANY.NAME}. ${COMPANY.COLUMNS.CITY} AS City`,
        `${COMPANY.NAME}. ${COMPANY.COLUMNS.PHONE} AS Phone`,
        `${COMPANY.NAME}. ${COMPANY.COLUMNS.GSTIN} AS Tngst`,
        `${COMPANY.NAME}. ${COMPANY.COLUMNS.FSSAI} AS fssai`,
        // `${COMPANY.NAME}. ${COMPANY.COLUMNS.SPLMSG} AS splmsg1`,
        // `${COMPANY.NAME}. ${COMPANY.COLUMNS.SPLMSG2} AS splmsg2`
      )
      .leftJoin(
        COMPANY_BANK_DETAILS.NAME,
        `${COMPANY.NAME}.id`,
        `${COMPANY_BANK_DETAILS.NAME}.company_id`
      );
    logQuery({
      logger: fastify.log,
      query,
      context: "Get Settings Info",
      logTrace
    });
    const response = await query;
    return response[0];
  }

  async function LoyalityPointSave({
    previous_points,
    current_bill_points,
    Plimit,
    PPoint,
    Mcard,
    location,
    input: {
      billno,
      name,
      mobile,
      users_id,
      is_card,
      counter_no,
      bags,
      is_radio,
      currentDate,
      currentTime,
      cartItems
    },
    logTrace,
    data_loyality
  }) {
    const knex = this;

    console.log("data_loyalityrepo", data_loyality);
    console.log('is_radio', is_radio);
    console.log('previous_points', previous_points,
      current_bill_points);

    switch (is_radio) {
      case 1: {
        if (cartItems.cart_net_total >= Plimit) {
          const total_points = parseFloat(previous_points) + parseFloat(current_bill_points);
          if (data_loyality[0].at_amt > 0) {
            var dec_points = data_loyality[0].at_amt;
          }
          if (data_loyality[0].at_points > 0) {
            var dec_points = data_loyality[0].at_points;

          }

          const points = parseFloat(total_points.toFixed(3));
          console.log("pointfinal1", points);
          console.log("mobile1", mobile);

          const axiosUpdate = await axios({
            method: "POST",
            url: "http://api1.kovaipazhamudir.com/api/MembershipPointsUpdate",
            headers: {
              "Content-Type": "application/json"
            },
            data: {
              mobile: mobile,
              point: points || 0,
              Amount: cartItems.cart_net_total || 0, //bill amt
              flag: "0",
              LPDate: currentDate
            }

          });
          console.log("createDate", axiosUpdate.data);


          // const response1 = await axios.post(
          //   "http://api1.kovaipazhamudir.com/api/MemberEntryInsert",
          //   {
          //     clientid: 100,
          //     locid: location,
          //     BillNo: billno,
          //     Counter: counter_no,
          //     Uid: users_id,
          //     CardNo: mobile,
          //     // Amount:  0,
          //     Point: data_loyality[0].at_points || 0,
          //     RAmount: data_loyality[0].at_amt || 0,
          //     bal: points || 0,
          //     Amount: cartItems.cart_net_total,
          //     Point: parseFloat(dec_points) || 0,
          //     RAmount: parseFloat(dec_points),
          //     bal: (cartItems.cart_net_total) - (dec_points),
          //     ploc: location,
          //     uflag: 1,
          //     Entrydate: currentDate
          //   }
          // );
          // console.log("response1loyalty", response1.data);

          break;
        }
      }

      case 2: {
        break;
      }
      case 3: {
        if (cartItems.cart_net_total >= Plimit) {
          const total_points = current_bill_points;
          console.log("total_points", total_points);
          console.log("mobile3", mobile);
          // const points = total_points - data_loyality[0].at_points || 0;

          const response = await axios.post(
            "https://api1.kovaipazhamudir.com/api/MembershipPointsUpdate",
            {
              mobile: mobile,
              point: total_points || 0,
              Amount: cartItems.cart_net_total, //bill amt
              flag: "0",
              LPDate: currentDate
            }
          );

          break;
        }
      }
      default:
        break;
    }

    return { success: true };
  }

  async function loyaltyInfo({
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
    userDetails,
    points
  }) {
    const knex = this;
    console.log("");

    const query = knex("setting3").select("setting3.*");
    // const query = knex(SETTING3.NAME)
    //   .select(SETTING3.NAME + ".*");
    logQuery({
      logger: fastify.log,
      query,
      context: "Get Settings3 Info",
      logTrace
    });
    const response = await query;
    //console.log("settins3", response);

    const rtype = response[0].rtype;
    console.log("Ramount", Ramount);

    switch (rtype) {
      case 0: {
        if (cartItemsResult.cart_net_total >= Ramount) {
          const total_points = parseFloat(previous_points) + parseFloat(current_bill_points);
          // const total_points = previous_points + current_bill_points;
          if (Rpoint <= total_points) {
            return { at_points: Rpoint, at_amt: 0 };
          } else {
            return { at_points: 0, at_amt: Ramount };
          }
        }

        break;
      }
      case 1: {
        if (cartItemsResult.cart_net_total > Ramount) {
          // console.log(cartItemsResult.cart_net_total, 'j');
          const total_points = parseFloat(previous_points);

          // const total_points = previous_points + current_bill_points;
          // console.log(previous_points, 'previous_points');
          console.log('netamountbigcurrent_bill_points', current_bill_points);
          //console.log(total_points, 'total_points');
          let amtpercentage = (cartItemsResult.cart_net_total * Rpoint) / 100;
          const redeemPoints = Math.min(total_points, points);

          amtpercentage = redeemPoints / Ramount; // 50 points = 
          const total_points_percentage = total_points;
          //console.log(total_points_percentage, 'total_points_percentage');
          console.log('amtpercentage', amtpercentage);
          if (amtpercentage > total_points_percentage) {
            return { at_points: total_points_percentage, at_amt: 0 };
          } else {
            return { at_points: 0, at_amt: amtpercentage };
          }
        }
        //console.log(at_points, at_amt);
        break;
      }
      //       case 1: {
      //   if (cartItemsResult.cart_net_total > Ramount) {

      //     const total_points =
      //       parseFloat(previous_points) + parseFloat(current_bill_points);

      //     const redeemPoints = Math.min(total_points, points);

      //     const redeemAmount = redeemPoints / Ramount; // 50 points = ₹5
      //    console.log("redeemPoints", redeemPoints);
      //    console.log("redeemAmount", redeemAmount);


      //     return {
      //       at_points: redeemPoints,
      //       at_amt: redeemAmount
      //     };
      //   }

      //   break;
      // }
      case 2: {
        // const query = knex("redeem_range").select("redeem_range.*");
        const query = knex(REDEEM_RANGE.NAME)
          .select(REDEEM_RANGE.NAME + ".*");

        logQuery({
          logger: fastify.log,
          query,
          context: "Get Redeem_Range Info",
          logTrace
        });
        const response = await query;
        console.log("redeem", response);

        if (response.length > 0) {
          function checkAmountInRange(response, amount) {
            for (let i = 0; i < response.length; i++) {
              const range = response[i];
              if (amount >= range.pfrom && amount <= range.pto) {
                const dis_amt = range.pamt;
                const total_points = previous_points + current_bill_points;
                const total_points_percentage = total_points;

                if (dis_amt > total_points_percentage) {
                  return { at_points: total_points_percentage, at_amt: 0 };
                } else {
                  return { at_points: 0, at_amt: dis_amt };
                }
              }
            }
            return false;
          }
          const isAmountInRange = checkAmountInRange(
            response,
            cartItemsResult.cart_net_total
          );
        }

        break;
      }

      case 3: {
        const total_points = previous_points + current_bill_points;
        if (total_points > Rpoint) {
          return { at_points: Rpoint, at_amt: 0 };
        }
        break;
      }

      default:
        break;
    }
  }

  async function countercloseInfo({
    logTrace,
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
      outlet_id
    }
  }) {
    const knex = this;
    const query_update = await knex(`${COUNTER_SALES.NAME}`)
      .where(`${COUNTER_SALES.COLUMNS.COUNTER}`, counter_no)
      .where(COUNTER_SALES.COLUMNS.BILL_DATE, currentDate)
      .where(COUNTER_SALES.COLUMNS.UID, users_id)
      .where(COUNTER_SALES.COLUMNS.TYPE, "S")
      .where(COUNTER_SALES.COLUMNS.STATUS, 0)
      .where(COUNTER_SALES.COLUMNS.OUTLET_ID, outlet_id)
      .update({
        [COUNTER_SALES.COLUMNS.STATUS]: 1
      });
    await query_update;
    return { success: true };
  }

  async function weighingInfo({ body, params, logTrace, userDetails }) {
    const knex = this;
    const product_id = body.prod_id;
    const query = knex(ITEM.NAME)
      .select(`${ITEM.NAME}.*`)
      .where(`${ITEM.NAME}.id`, product_id);
    logQuery({
      logger: fastify.log,
      query,
      context: "Get product_master Info",
      logTrace
    });
    const response = await query;
    return response[0];
  }
  async function getcompanyweighing({ body, params, logTrace, userDetails }) {
    const knex = this;
    // const query = knex("Company_master").select("Company_master.*");
    const query = knex(COMPANY.NAME)
      .select(`${COMPANY.NAME}.*`);



    logQuery({
      logger: fastify.log,
      query,
      context: "Get Company_master Info",
      logTrace
    });
    const response = await query;
    //console.log("res", response);

    return response[0];
  }
  async function getcprtoption({ body, params, logTrace, userDetails }) {
    const knex = this;
    const counter = body.counter_no;
    const query = knex(CPRTOPTION.NAME)
      .select(`${CPRTOPTION.NAME}.*`)
      .where(`${CPRTOPTION.COLUMNS.COUNTER}`, counter);

    logQuery({
      logger: fastify.log,
      query,
      context: "Get cprtoption Info",
      logTrace
    });
    const response = await query;
    return response[0];
  }

  async function denominationInfo({ body, params, logTrace, userDetails }) {
    const knex = this;
    const users_id = userDetails.id;
    const e_date = body.e_date;
    const e_time = body.e_time;
    const counter_no = body.counter_no;
    const query = knex(COUNTER_SALES.NAME)
      .select(`${COUNTER_SALES.NAME}.*`)
      .where(`${COUNTER_SALES.COLUMNS.COUNTER}`, counter_no)
      .andWhere(`${COUNTER_SALES.COLUMNS.BILL_DATE}`, e_date);

    logQuery({
      logger: fastify.log,
      query,
      context: "Get countersales Info",
      logTrace
    });
    const response = await query;
    if (response[0]) {
      const start_bill = response[0].start_bill;
      const end_bill = response[0].end_bill;
      await knex(CNT_DENOMINATIONS.NAME).insert({
        [CNT_DENOMINATIONS.COLUMNS.CNT]: counter_no,
        [CNT_DENOMINATIONS.COLUMNS.UID]: users_id,
        [CNT_DENOMINATIONS.COLUMNS.EDATE]: e_date,
        [CNT_DENOMINATIONS.COLUMNS.ETIME]: e_time,
        [CNT_DENOMINATIONS.COLUMNS.SBILL]: start_bill,
        [CNT_DENOMINATIONS.COLUMNS.EBILL]: end_bill,
        [CNT_DENOMINATIONS.COLUMNS.TYPE]: body.type,
        [CNT_DENOMINATIONS.COLUMNS.N2000]: body.N2000,
        [CNT_DENOMINATIONS.COLUMNS.N500]: body.N500,
        [CNT_DENOMINATIONS.COLUMNS.N200]: body.N200,
        [CNT_DENOMINATIONS.COLUMNS.N100]: body.N100,
        [CNT_DENOMINATIONS.COLUMNS.N50]: body.N50,
        [CNT_DENOMINATIONS.COLUMNS.N20]: body.N20,
        [CNT_DENOMINATIONS.COLUMNS.N10]: body.N10,
        [CNT_DENOMINATIONS.COLUMNS.N5]: body.N5,
        [CNT_DENOMINATIONS.COLUMNS.N1]: body.N1,
        [CNT_DENOMINATIONS.COLUMNS.COIN]: body.coin
      });
      logQuery({
        logger: fastify.log,
        query,
        context: "Denomination Insert",
        logTrace
      });
      return { success: true };
    } else {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "counter sales not found",
        property: "",
        code: "NOT_FOUND"
      });
    }
  }


  //   async function productmasterblncupdate({
  //     logTrace,
  //     input: {
  //       billno,
  //       name,
  //       mobile,
  //       users_id,
  //       is_card,
  //       counter_no,
  //       bags,
  //       currentDate,
  //       cartItems
  //     },
  //      users_id,
  //       counter_no,
  //       outlet_id,
  //   }) {
  //     const knex = this;
  //     const deatails = cartItems.cart_lines.map(async orderline => {
  //       const qty = orderline.qty;
  //       const prod_id = orderline.prod_id;

  //       let query1 = await knex(ITEM.NAME)
  //         .where(ITEM.COLUMNS.ID, prod_id);

  //       const exists_response = await query1;
  //       if (exists_response.length > 0) {
  //         const blnc = exists_response[0].balance;
  //         const stck = blnc - qty;
  //         await knex(ITEM.NAME)
  //           .where(ITEM.COLUMNS.ID, prod_id)
  //           .update({
  //             [ITEM.COLUMNS.BALANCE]: stck
  //           });

  //       }
  //       else {

  //         throw CustomError.create({
  //           httpCode: StatusCodes.NOT_FOUND,
  //           message: "Product not found",
  //           property: "",
  //           code: "NOT_FOUND"
  //         });

  //       }
  //       for (const orderline of cartItems.cart_lines) {
  //   const condition = {
  //     [COUNTER_CART.COLUMNS.USERS_ID]: users_id,
  //     [COUNTER_CART.COLUMNS.COUNTER_NO]: counter_no,
  //     [COUNTER_CART.COLUMNS.OUTLET_ID]: outlet_id,
  //   };

  //   if (orderline.barcode && orderline.barcode.trim() !== "") {
  //     condition[COUNTER_CART.COLUMNS.BARCODE] = orderline.barcode;
  //   } else if (orderline.barcode1 && orderline.barcode1.trim() !== "") {
  //     condition[COUNTER_CART.COLUMNS.BARCODE] = orderline.barcode1;
  //   }else if (orderline.barcode2 && orderline.barcode2.trim() !== "") {
  //     condition[COUNTER_CART.COLUMNS.BARCODE] = orderline.barcode2;
  //   }
  //   else if (orderline.barcode3 && orderline.barcode3.trim() !== "") {
  //     condition[COUNTER_CART.COLUMNS.BARCODE] = orderline.barcode3;
  //   }
  //    else if (orderline.barcode4 && orderline.barcode4.trim() !== "") {
  //     condition[COUNTER_CART.COLUMNS.BARCODE] = orderline.barcode4;
  //   }
  //    else {
  //     condition[COUNTER_CART.COLUMNS.PRODUCTS_CODE] = orderline.prod_code;
  //   }

  //   await knex(COUNTER_CART.NAME)
  //     .where(condition)
  //     .del();
  // }


  //     });

  //     return { success: true };
  //   }
  async function productmasterblncupdate({
    logTrace,
    input: { cartItems },
    users_id,
    counter_no,
    outlet_id,
  }) {
    const knex = this;

    await knex.transaction(async trx => {
      for (const orderline of cartItems.cart_lines) {
        const qty = orderline.qty;
        const prod_id = orderline.prod_id;

        const product = await trx(OUTLET_PRODUCT_MAPPING.NAME)
          .where({
            [OUTLET_PRODUCT_MAPPING.COLUMNS.OUTLET_ID]: outlet_id,
            [OUTLET_PRODUCT_MAPPING.COLUMNS.PRODUCT_ID]: prod_id
          })
          .first();

        if (!product) {
          throw CustomError.create({
            httpCode: StatusCodes.NOT_FOUND,
            message: "Product not found",
            code: "NOT_FOUND"
          });
        }

        // const newStock = product.balance - qty;
        const newStock = product[OUTLET_PRODUCT_MAPPING.COLUMNS.BALENCE_STOCK] - qty;
        // await trx(ITEM.NAME)
        //   .where(ITEM.COLUMNS.ID, prod_id)
        //   .update({
        //     [ITEM.COLUMNS.BALANCE]: newStock
        //   });
        await trx(OUTLET_PRODUCT_MAPPING.NAME)
          .where(OUTLET_PRODUCT_MAPPING.COLUMNS.PRODUCT_ID, prod_id)
          .andWhere(OUTLET_PRODUCT_MAPPING.COLUMNS.OUTLET_ID, outlet_id)
          .update({
            [OUTLET_PRODUCT_MAPPING.COLUMNS.BALENCE_STOCK]: newStock
          });
      }

      for (const orderline of cartItems.cart_lines) {
        const condition = {
          //  [COUNTER_CART.COLUMNS.USERS_ID]: users_id,
          [COUNTER_CART.COLUMNS.COUNTER_NO]: counter_no,
          [COUNTER_CART.COLUMNS.OUTLET_ID]: outlet_id,
        };

        if (orderline.barcode?.trim()) {
          condition[COUNTER_CART.COLUMNS.BARCODE] = orderline.barcode;
        } else if (orderline.barcode1?.trim()) {
          condition[COUNTER_CART.COLUMNS.BARCODE] = orderline.barcode1;
        } else if (orderline.barcode2?.trim()) {
          condition[COUNTER_CART.COLUMNS.BARCODE] = orderline.barcode2;
        } else if (orderline.barcode3?.trim()) {
          condition[COUNTER_CART.COLUMNS.BARCODE] = orderline.barcode3;
        } else if (orderline.barcode4?.trim()) {
          condition[COUNTER_CART.COLUMNS.BARCODE] = orderline.barcode4;
        } else if (orderline.prod_code) {
          condition[COUNTER_CART.COLUMNS.PRODUCTS_CODE] = orderline.prod_code;
        } else {
          continue; // skip invalid row
        }

        await trx(COUNTER_CART.NAME)
          .where(condition)
          .del();
      }

    });

    return { success: true };
  }
  async function specclearCartItems({ code, users_id, counter_no, outlet_id, logTrace }) {
    const knex = this;


    // console.log("code ", code, counter_no, outlet_id);

    const query = knex(COUNTER_CART.NAME)
      .where({
        // [COUNTER_CART.COLUMNS.USERS_ID]: users_id,
        [COUNTER_CART.COLUMNS.COUNTER_NO]: counter_no,
        [COUNTER_CART.COLUMNS.OUTLET_ID]: outlet_id,
      })
      .andWhere(function () {
        this.where(COUNTER_CART.COLUMNS.BARCODE, code)
          .orWhere(COUNTER_CART.COLUMNS.PRODUCT_CODE, code);
      })
      .del();
    await knex(OUTLET_PURCHASE_BATCH_DETAILS.NAME)
      .update({
        [OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.STATUS]: null,
      })
      .where(OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.PRODUCT_CODE, code);

    logQuery({
      logger: fastify.log,
      query,
      context: "Delete Cart Items Using users id and counter no and product id",
      logTrace
    });

    const response = await query;
    return response;
  }
  //   async function getCartlist({ queryString, body, outlet_id, counter_no, users_id, params, customer_det, logTrace }) {
  //     const knex = this;
  //     //const { outlet_id, counter_no } = params;


  //     const query = knex
  //       .select([
  //         `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.PRODUCTS_CODE} as code`,
  //          `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.PROD_ID} as prod_id`,
  //         `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.QTY} as quantity`,

  //         knex.raw(`
  //       (
  //         ${COUNTER_CART.COLUMNS.QTY} *
  //         COALESCE(${COUNTER_CART.COLUMNS.DISCOUNT_AMOUNT}, 0)
  //       ) as discount_amount
  //     `),

  //         `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.MRP} as mrp`,
  //         `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.GST} as gst`,
  //         `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.CESS} as cess`,
  //         `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.SALES_RATE} as sales_rate`,
  //         `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.PRODUCTS_NAME} as prod_name`,
  //         `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.UNITS_NAME} as uom_name`,

  //         knex.raw(`
  //   ROUND(
  //     (
  //       ${COUNTER_CART.COLUMNS.QTY} *
  //       ${COUNTER_CART.COLUMNS.MRP}
  //     )::numeric,
  //     2
  //   ) as sub_total
  // `),

  //         knex.raw(`
  //   ROUND(
  //     (
  //       ${COUNTER_CART.COLUMNS.QTY} *
  //       ${COUNTER_CART.COLUMNS.MRP}
  //     )::numeric,
  //     2
  //   ) AS total
  // `)
  //       ])
  //       .from(`${COUNTER_CART.NAME} as ${COUNTER_CART.NAME}`)
  //       .where(
  //         `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.COUNTER_NO}`,
  //         counter_no
  //       )
  //       .andWhere(
  //         `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.OUTLET_ID}`,
  //         outlet_id
  //       )
  //       .orderBy(
  //         `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.ID}`,
  //         "asc"
  //       );
  //     logQuery({
  //       logger: fastify.log,
  //       query,
  //       context: "Get Outlet",
  //       logTrace
  //     });
  //     //console.log("query",query.toString());

  //     const response = await query;
  //     console.log("CartListres", response);
  //     let result;

  //     if (response.length === 0) {
  //       result = {
  //         cart_lines: [],
  //         cart_qty: 0,
  //         cart_gst: 0,
  //         cart_discount: 0,
  //         cart_sub_total: 0,
  //         cart_total: 0
  //       };
  //     }
  //       let query1 = knex(`${OUTLET_PURCHASE_MASTER.NAME} as opm`)
  //       .select(
  //         `opbd.${OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.BATCH_NO} as batch_no`,
  //         `opbd.${OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.PRODUCT_ID}  as prod_id`,
  //         `opbd.${OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.MRP} as mrp`,
  //       )
  //       .leftJoin(
  //         `${OUTLET_PURCHASE_DETAILS.NAME} as opd`,
  //         `opm.${OUTLET_PURCHASE_MASTER.COLUMNS.ID}`,
  //         `opd.${OUTLET_PURCHASE_DETAILS.COLUMNS.OUTLET_PURCHASE_MST_ID}`
  //       )
  //       .leftJoin(
  //         `${OUTLET_PURCHASE_BATCH_DETAILS.NAME} as opbd`,
  //         `opd.${OUTLET_PURCHASE_DETAILS.COLUMNS.OUTLET_PURCHASE_MST_ID}`,
  //         `opbd.${OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.OUTLET_PURCHASE_MASTER_ID}`
  //       )
  //       .where(
  //         `opm.${OUTLET_PURCHASE_MASTER.COLUMNS.OUTLET_ID}`,
  //         outlet_id
  //       )
  //       .andWhere(
  //         `opbd.${OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.PRODUCT_ID}`,
  //         prod_id
  //       )
  //       .andWhere(OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.EXPIRY_DATE, ">=", currentDate);
  //     logQuery({
  //       logger: fastify.log,
  //       query,
  //       context: "Get Quantity of Item In Cart Batch Details",
  //       logTrace
  //     });
  //     const response1 = await query1;
  //     let cart_response = [];
  //     cart_response = map(response, (cartLine) => {
  //       return {
  //         code: cartLine.code,
  //         quantity: Number(cartLine.quantity) === 0 ? "" : parseFloat(cartLine.quantity).toFixed(3),
  //         discount_amount: cartLine.discount_amount,
  //         // mrp: cartLine.mrp,
  //         gst: cartLine.gst,
  //         cess: cartLine.cess,
  //         //sales_rate: cartLine.sales_rate,
  //         sales_rate: cartLine.mrp - cartLine.discount_amount,
  //         prod_name: cartLine.prod_name,
  //         uom_name: cartLine.uom_name,
  //         sub_total: cartLine.sub_total,
  //         total: cartLine.mrp  * cartLine.quantity - cartLine.discount_amount,
  //        mrp: response1,
  //       };
  //     })
  //     const cart_qty = response.reduce(
  //       (sum, item) => sum + parseFloat(item.quantity),
  //       0
  //     );

  //     const cart_discount = response.reduce(
  //       (sum, item) => sum + Number(item.discount_amount),
  //       0
  //     );

  //     const cart_sub_total = response.reduce(
  //       (sum, item) => sum + Number(item.sub_total),
  //       0
  //     );

  //     const calc_gst = response.reduce((sum, item) => {
  //       const subTotal = Number(item.sub_total);
  //       const gstPercent = Number(item.gst);

  //       return sum + (subTotal * gstPercent) / 100;
  //     }, 0);

  //     const cart_cess = response.reduce(
  //       (sum, item) => sum + Number(item.cess),
  //       0
  //     );

  //     const cart_total =
  //       cart_sub_total + calc_gst + cart_cess - cart_discount;

  //     //console.log("calc_gst", calc_gst); // 1.8
  //     let customerDetails = null;
  //     if (customer_det) {
  //       let customerDet = customer_det || null;
  //       customerDetails = {
  //         customer_name: customerDet[0].party_name || "",
  //         address: customerDet[0].address || "",
  //         mobile: customerDet[0].mobile || "",
  //         points: customerDet[0].balance_points || 0,
  //         amount: customerDet[0].wallet_amount || 0,
  //       };
  //     }
  //     console.log("customerDetails", customerDetails);

  //     return {
  //       cart_lines: cart_response,
  //       cart_qty: cart_qty.toFixed(3),
  //       cart_gst: calc_gst.toFixed(3),
  //       cart_cess: cart_cess.toFixed(3),
  //       cart_discount: cart_discount.toFixed(3),
  //       cart_sub_total: cart_sub_total.toFixed(3),
  //       cart_total: cart_total.toFixed(3),
  //       customer_det: customerDetails
  //     };

  //   }
  async function getCartlist({
    queryString,
    body,
    outlet_id,
    counter_no,
    users_id,
    params,
    logTrace,
    currentDate
  }) {

    const knex = this;

    // ---------------- CART QUERY ----------------

    const query = knex
      .select([
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.PRODUCT_CODE} as code`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.CUSTOMER_ID} as customer_id`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.PROD_ID} as prod_id`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.QTY} as quantity`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.DISCOUNT_AMOUNT} as discount_amount`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.MRP} as mrp`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.GST_AMOUNT} as gst_amount`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.GST} as gst`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.CESS} as cess`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.SALE_RATE} as sales_rate`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.PRODUCT_NAME} as prod_name`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.UNITS_NAME} as uom_name`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.AMOUNT} as sub_total`,
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.AMOUNT} as total`
      ])
      .from(`${COUNTER_CART.NAME} as ${COUNTER_CART.NAME}`)
      .where(
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.COUNTER_NO}`,
        counter_no
      )
      .andWhere(
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.OUTLET_ID}`,
        outlet_id
      )
      .orderBy(
        `${COUNTER_CART.NAME}.${COUNTER_CART.COLUMNS.ID}`,
        "asc"
      );

    const response = await query;
    console.log("response", response);

    if (response.length === 0) {
      return {
        cart_lines: [],
        cart_qty: 0,
        cart_gst: 0,
        cart_discount: 0,
        cart_sub_total: 0,
        cart_total: 0
      };
    }
    let customer_id = response[0].customer_id || null;
    customer_det = null;
    if (customer_id) {


      const queryres = knex(OUTLET_MEMBERS.NAME)
        .select(
          `${OUTLET_MEMBERS.NAME}.*`,
        ).where(`${OUTLET_MEMBERS.NAME}.${OUTLET_MEMBERS.COLUMNS.ID}`, customer_id);

      customer_det = await queryres;
      console.log("cus_response", customer_det);
    }


    const productIds = response.map(item => item.prod_id);
    console.log(productIds);

    const batchQuery = knex(`${OUTLET_PURCHASE_BATCH_DETAILS.NAME} as opbd`)
      .select([
        `opbd.${OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.BATCH_NO} as batch_no`,
        `opbd.${OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.PRODUCT_ID} as prod_id`,
        `opbd.${OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.MRP} as mrp`,
        `opbd.${OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.STATUS} as status`
      ])
      .whereIn(
        `opbd.${OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.PRODUCT_ID}`,
        productIds
      )
      .andWhere(
        `opbd.${OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.EXPIRY_DATE}`,
        ">=",
        currentDate
      )
      .orWhere(
        `opbd.${OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.STATUS}`,
        1
      );

    const batchResponse = await batchQuery;
    console.log("batchResponse", batchResponse);

    // if(batchResponse.length === 0){
    //   return {
    //     cart_lines: [],
    //     cart_qty: 0,
    //     cart_gst: 0,
    //     cart_discount: 0,
    //     cart_sub_total: 0,
    //     cart_total: 0
    //   };
    // }
    // const cart_response = map(response, (cartLine) => {

    //   const batchDetails = batchResponse.filter(
    //     batch => Number(batch.prod_id) === Number(cartLine.prod_id)
    //   );

    //   const finalMrp =
    //     batchDetails.length > 0
    //       ? batchDetails
    //       : [{
    //         mrp: Number(cartLine.mrp),
    //         batch_no: "",
    //         prod_id: Number(cartLine.prod_id),
    //       }];

    //   // ── Single vs multi MRP ──────────────────────────────────────
    //   const isMultiBatch = finalMrp.length > 1;
    //   const baseMrp = Number(finalMrp[0].mrp); // used for calculations

    //   //console.log("finalMrp", baseMrp, isMultiBatch);

    //   return {
    //     code: cartLine.code,
    //     prod_id: cartLine.prod_id,
    //     quantity:
    //       Number(cartLine.quantity) === 0
    //         ? ""
    //         : parseFloat(cartLine.quantity).toFixed(3),
    //     discount_amount: Number(cartLine.discount_amount),
    //     gst: Number(cartLine.gst).toFixed(2),
    //     cess: Number(cartLine.cess).toFixed(2),
    //     sales_rate: baseMrp - Number(cartLine.discount_amount),
    //     prod_name: cartLine.prod_name,
    //     uom_name: cartLine.uom_name,
    //     sub_total: Number(cartLine.sub_total),
    //     total:
    //       baseMrp * Number(cartLine.quantity) - Number(cartLine.discount_amount),

    //     // ── Key change: number when single, array when multi ──────
    //     mrp: isMultiBatch
    //       ? finalMrp                  // [{ mrp, batch_no, prod_id }, ...]
    //       : baseMrp,                  // 100  (plain number)
    //   };
    // });
    const cart_response = map(response, (cartLine) => {

      const batchDetails = batchResponse.filter(
        batch => Number(batch.prod_id) === Number(cartLine.prod_id)
      );

      // Check active batch
      const activeBatch = batchDetails.find(
        batch => Number(batch.status) === 1
      );

      let finalMrp;

      if (activeBatch) {

        // status = 1 → normal MRP only
        finalMrp = Number(activeBatch.mrp);

      } else if (batchDetails.length > 1) {

        // multiple batch array
        finalMrp = batchDetails;

      } else {

        // default single MRP
        finalMrp = Number(cartLine.mrp);

      }

      // base mrp for calculations
      const baseMrp = Array.isArray(finalMrp)
        ? Number(finalMrp[0].mrp)
        : Number(finalMrp);
      var cart_discount = cartLine.discount_amount;
      console.log("cart_discount", cart_discount);
      var sale_rate = cartLine.mrp - cartLine.discount_amount;
      return {
        code: cartLine.code,
        prod_id: cartLine.prod_id,

        quantity:
          Number(cartLine.quantity) === 0
            ? ""
            : parseFloat(cartLine.quantity).toFixed(3),

        discount_amount: cart_discount,

        gst: Number(cartLine.gst).toFixed(2),

        cess: Number(cartLine.cess).toFixed(2),

        // sales_rate:  baseMrp * Number(cartLine.quantity) -
        //   Number(cart_discount) || 0,
        // sales_rate:  baseMrp ,
        sales_rate: cartLine.sales_rate,
        prod_name: cartLine.prod_name,

        uom_name: cartLine.uom_name,

        sub_total: Number(cartLine.sub_total),
        // total: Math.max(
        //   (Number(cartLine.sales_rate) * Number(cartLine.quantity)) - Number(cart_discount || 0),
        //   0
        // ),
        total: Math.max(
          (Number(cartLine.sales_rate) * Number(cartLine.quantity))
        ),
        // total: (Number(cartLine.sales_rate) * Number(cartLine.quantity)) - Number(cart_discount) + Number(cartLine.gst_amount) + Number(cartLine.cess) || 0,

        mrp: finalMrp,
      };
    });
    // ---------------- TOTALS ----------------

    const cart_qty = response.reduce(
      (sum, item) => sum + Number(item.quantity),
      0
    );

    // const cart_discount = response.reduce(
    //   (sum, item) => sum + Number(item.discount_amount),
    //   0
    // );
    const cart_discount = response.reduce((sum, item) => {

      const mrp = Number(item.mrp || 0);
      const qty = Number(item.qty || 1);
      const discountPercent = Number(item.discount_amount || 0);

      const discount = discountPercent;

      return sum + discount;

    }, 0);
    console.log("cart_discount", cart_discount);


    const cart_sub_total = response.reduce(
      (sum, item) => sum + Number(item.sub_total),
      0
    );

    const calc_gst = response.reduce((sum, item) => {

      const subTotal = Number(item.sub_total).toFixed(2);
      const gstPercent = Number(item.gst).toFixed(2);

      return sum + (subTotal * gstPercent) / 100;

    }, 0);
    console.log("calc_gst", calc_gst);

    const cart_cess = response.reduce(
      (sum, item) => sum + Number(item.cess),
      0
    );

    // const cart_total =
    //   cart_sub_total +
    //   calc_gst +
    //   cart_cess -
    //   cart_discount;
    // const cart_total =
    //   Math.max(
    //     cart_sub_total - cart_discount,
    //     0
    //   );
    const cart_total =
      Math.max(
        cart_sub_total,
        0
      );

    // ---------------- CUSTOMER ----------------

    let customerDetails = null;

    if (customer_det) {

      let customerDet = customer_det || [];

      customerDetails = {
        customer_name: customerDet[0]?.party_name || "",
        address: customerDet[0]?.address || "",
        mobile: customerDet[0]?.mobile || "",
        points: customerDet[0]?.balance_points || 0,
        amount: customerDet[0]?.wallet_amount || 0
      };
    }

    // ---------------- RETURN ----------------

    return {
      cart_lines: cart_response,
      cart_qty: cart_qty.toFixed(3),
      cart_gst: calc_gst.toFixed(3),
      cart_cess: cart_cess.toFixed(3),
      cart_discount: cart_discount.toFixed(3),
      cart_sub_total: cart_total.toFixed(3),
      // cart_sub_total: cart_sub_total.toFixed(3),
      cart_total: cart_total.toFixed(3),
      customer_det: customerDetails
    };
  }
  async function getPaymentDetails({ mode, outlet_id, counter_no, logTrace, userDetails }) {

    const knex = this;
    const query = knex(COUNTER_SETTINGS.NAME)
      .select([
        `${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.ID} as pay_type_id`,
        `${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.OUTLET_ID} as outlet_id`,
        `${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.COUNTER_NO} as counter_no`,
        `${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.PAY_TYPE_ID} as pay_type_id`,
        //`${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.IS_ACTIVE} as is_active`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULLNAME} as outlet_name`,
        //`${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID} as store_code`
        `${PAY_TYPE_MASTER.NAME}.${PAY_TYPE_MASTER.COLUMNS.PAY_TYPE_NAME} as pay_type`
      ])
      .join(
        OUTLETS.NAME,
        `${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.OUTLET_ID}`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`
      )
      .join(
        PAY_TYPE_MASTER.NAME,
        `${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.PAY_TYPE_ID}`,
        `${PAY_TYPE_MASTER.NAME}.${PAY_TYPE_MASTER.COLUMNS.ID}`
      )
      .orderBy(`${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.ID}`, "asc");

    if (outlet_id) {
      query.where(`${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.OUTLET_ID}`, Number(outlet_id))
      query.where(`${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.IS_ACTIVE}`, true);
    }
    if (counter_no) {
      query.where(`${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.COUNTER_NO}`, Number(counter_no))
      query.where(`${COUNTER_SETTINGS.NAME}.${COUNTER_SETTINGS.COLUMNS.IS_ACTIVE}`, true);

    }




    const query1 = knex(PAYMENT_PROVIDERS.NAME)
      .select([
        `${PAYMENT_PROVIDERS.NAME}.${PAYMENT_PROVIDERS.COLUMNS.ID} as provider_id`,
        `${PAYMENT_PROVIDERS.NAME}.${PAYMENT_PROVIDERS.COLUMNS.OUTLET_ID} as outlet_id`,

        `${PAYMENT_PROVIDERS.NAME}.${PAYMENT_PROVIDERS.COLUMNS.PAY_TYPE_ID} as pay_type_id`,
        `${PAYMENT_PROVIDERS.NAME}.${PAYMENT_PROVIDERS.COLUMNS.PROVIDER_NAME} as provider_name`,
      ])
      .join(
        OUTLETS.NAME,
        `${PAYMENT_PROVIDERS.NAME}.${PAYMENT_PROVIDERS.COLUMNS.OUTLET_ID}`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`
      )
      .andWhere(`${PAYMENT_PROVIDERS.NAME}.${PAYMENT_PROVIDERS.COLUMNS.COUNTER_NO}`, counter_no)
      .andWhere(`${PAYMENT_PROVIDERS.NAME}.${PAYMENT_PROVIDERS.COLUMNS.OUTLET_ID}`, outlet_id)
      // .andWhere(`${PAYMENT_PROVIDERS.NAME}.${PAYMENT_PROVIDERS.COLUMNS.PAY_TYPE_ID}`, pay_type_id)
      .andWhere(`${PAYMENT_PROVIDERS.NAME}.${PAYMENT_PROVIDERS.COLUMNS.IS_ACTIVE}`, true)
      .orderBy(`${PAYMENT_PROVIDERS.NAME}.${PAYMENT_PROVIDERS.COLUMNS.ID}`, "asc");

    logQuery({
      logger: fastify.log,
      query: query1,
      context: "Get Outlet Counter Payment Modes",
      logTrace
    });




    const response = await query;
    if (!response.length) {
      return [];
    }

    const response1 = await query1;

    if (!response1.length) {
      return [];
    }

    const finalResponse = response.map((item) => {
      return {
        ...item,
        provider: response1
          .filter(
            (provider) =>
              provider.pay_type_id === item.pay_type_id
          )
          .map((provider) => ({
            provider_id: provider.provider_id,
            provider_name: provider.provider_name
          }))
      };
    });
    // console.log(finalResponse);

    return finalResponse;
  }
  // async function getPaymentgateway({
  //   input: {
  //     amount,
  //     billno,
  //     name,
  //     mobile,
  //     users_id,
  //     is_card,
  //     counter_no,
  //     bags,
  //     is_radio,
  //     currentDate,
  //     currentTime,
  //     cartItems
  //   },
  //   logTrace
  // }) {

  //   try {
  //        // console.log("cartItems",cartItems);


  //     const transactionNumber = `B${String(billno).padStart(4, "0")}`;
  //    console.log("transactionNumber", transactionNumber);
  //     const amount = cartItems.cart_net_total;
  // console.log("aaaaaaaaaammm",amount);

  //     const payload = {
  //       TransactionNumber: transactionNumber,
  //       SequenceNumber: 1,
  //       AllowedPaymentMode: "10", // 10 = UPI
  //       MerchantStorePosCode: process.env.MERCHANT_STORE_POS_CODE || "1001",
  //       Amount: String(amount),
  //       UserID: name || "",
  //       MerchantID: Number(process.env.MERCHANT_ID),
  //       SecurityToken: process.env.SECURITY_TOKEN,
  //       IMEI: process.env.IMEI || "ME1002278",
  //       AutoCancelDurationInMinutes: 5
  //     };

  //     console.log("PHONEPE REQUEST", payload);

  //     const response = await axios.post(
  //       "https://phonepe_bff_stage.bluekode.com/v1/pinelab/UploadBilledTransaction",
  //       payload,
  //       {
  //         headers: {
  //           "Content-Type": "application/json"
  //         }
  //       }
  //     );

  //     console.log("PHONEPE RESPONSE", response.data);

  //     return {
  //       success: true,
  //       data: response.data
  //     };

  //   } catch (error) {

  //     console.log(
  //       "PHONEPE ERROR",
  //       error.response?.data || error.message
  //     );

  //     return {
  //       success: false,
  //       message: error.response?.data || error.message
  //     };
  //   }
  // }
  async function getPaymentgateway({
    input: {
      amount,
      billno,
      name,
      mobile,
      users_id,
      is_card,
      counter_no,
      bags,
      is_radio,
      currentDate,
      currentTime,
      cartItems
    },
    logTrace
  }) {

    try {

      const transactionNumber =
        `B${String(billno).padStart(4, "0")}`;

      const finalAmount =
        cartItems?.cart_net_total || amount;

      const payload = {
        TransactionNumber: transactionNumber,
        SequenceNumber: 1,
        AllowedPaymentMode: is_card, // 10 = UPI ,1- card   
        MerchantStorePosCode:
          process.env.MERCHANT_STORE_POS_CODE || "1221258278",
        Amount: String(finalAmount),
        UserID: name || "USER",
        MerchantID:
          Number(process.env.MERCHANT_ID),
        SecurityToken:
          process.env.SECURITY_TOKEN,
        IMEI:
          process.env.IMEI || "ME1002278",
        AutoCancelDurationInMinutes: 5
      };

      console.log("PHONEPE REQUEST", payload);

      const response = await axios.post(
        "https://phonepe_bff_stage.bluekode.com/v1/pinelab/UploadBilledTransaction",
        payload,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      console.log(
        "PHONEPE RESPONSE",
        response.data
      );

      return {
        success: true,
        data: response.data
      };

    } catch (error) {

      console.log(
        "PHONEPE ERROR",
        error.response?.data || error.message
      );

      return {
        success: false,
        message:
          error.response?.data || error.message
      };
    }
  }

  async function getBillPrint({ counter_no, users_id, username, outlet_id, bill_no, logTrace }) {
    const knex = this;

    const query = knex(OUT_BILL_MASTER.NAME)
      .select(
        `${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.BILL_NO} AS billno`,
        `${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.BILL_DATE} AS bill_date`,
        `${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.PARTY_NAME} AS username`,
        // `${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.AMOUNT} AS amount`,
        `${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.COUNTER} AS counter_no`,
        `${OUT_BILL_DETAIL.NAME}.${OUT_BILL_DETAIL.COLUMNS.PRODNAME} AS prod_name`,
        `${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.LOCNAME} AS locname`,
        `${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.MOBILENO} AS mobile_no`,
        `${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.BALANCE_AMT} AS balance_amt`,
        `${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.ROFF} AS roff`,
        `${OUT_BILL_DETAIL.NAME}.${OUT_BILL_DETAIL.COLUMNS.PROD_QTY} AS prod_id`,
        `${OUT_BILL_DETAIL.NAME}.${OUT_BILL_DETAIL.COLUMNS.PROD_RATE} AS prod_amount`,
        `${OUT_BILL_DETAIL.NAME}.${OUT_BILL_DETAIL.COLUMNS.MRP} AS mrp`,
        `${OUT_BILL_DETAIL.NAME}.${OUT_BILL_DETAIL.COLUMNS.PROD_RATE} AS amount`,
        `${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.PAY_MODE} AS pay_mode`,
        `${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.BCASH} AS bcash`,
        `${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.ROUND_OFF} AS round_off`,
        `${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.AMOUNT} AS paid_amount`,
        `${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.SCH_AMT} AS sch_discount`,
        `${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.REDEEMPOINT} AS redeempoint`,
        `${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.EARNPOINT} AS earnpoint`,
        `${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.OFF_AMT} AS offer_discount`,
        `${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.CUSTOMER_MOBILE} AS customer_mobile`,
        `${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.PAY_MODE} AS pay_mode`,
        `${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.CUSTOMER_ID} AS customer_id`,
        `${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.EARNPOINT} AS earnpoint`,
        `${OUT_BILL_DETAIL.NAME}.${OUT_BILL_DETAIL.COLUMNS.PROD_QTY} AS qty`,
        `${OUT_BILL_DETAIL.NAME}.${OUT_BILL_DETAIL.COLUMNS.UOMNAME} AS uom_name`,
        `${OUT_BILL_DETAIL.NAME}.${OUT_BILL_DETAIL.COLUMNS.BARCODE} AS barcode`,
        `${OUT_BILL_DETAIL.NAME}.${OUT_BILL_DETAIL.COLUMNS.DIS_AMT} AS discount`,
        `${OUT_BILL_DETAIL.NAME}.${OUT_BILL_DETAIL.COLUMNS.PROD_RATE} AS rate`,
        `${OUT_BILL_DETAIL.NAME}.${OUT_BILL_DETAIL.COLUMNS.CESS} AS cess`,
        `${OUT_BILL_DETAIL.NAME}.${OUT_BILL_DETAIL.COLUMNS.HSN} AS hsn`,
        `${OUT_BILL_DETAIL.NAME}.${OUT_BILL_DETAIL.COLUMNS.GST} AS gst`,




      )

      .leftJoin(
        OUT_BILL_DETAIL.NAME,
        `${OUT_BILL_DETAIL.NAME}.${OUT_BILL_DETAIL.COLUMNS.BILL_NO}`,
        `${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.BILL_NO}`
      )
      .where({
        // [`${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.UID}`]: users_id,
        [`${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.BILL_NO}`]: bill_no,
        [`${OUT_BILL_DETAIL.NAME}.${OUT_BILL_DETAIL.COLUMNS.BILL_NO}`]: bill_no,
        [`${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.LOC_ID}`]: outlet_id,
        [`${OUT_BILL_DETAIL.NAME}.${OUT_BILL_DETAIL.COLUMNS.LOC_ID}`]: outlet_id,
        [`${OUT_BILL_MASTER.NAME}.${OUT_BILL_MASTER.COLUMNS.COUNTER}`]: counter_no,
        [`${OUT_BILL_DETAIL.NAME}.${OUT_BILL_DETAIL.COLUMNS.COUNTER}`]: counter_no
      });
    logQuery({
      logger: fastify.log,
      query,
      context: "Get Product Info",
      logTrace
    });
    console.log("query", query.toString());

    const response = await query;
    console.log("billprint", response);


    if (!response.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Cart is empty",
        property: "",
        code: "NOT_FOUND"
      });
    }
    return response;
  }
  // async function getCartPrintSummary({
  //   cartInfo,
  //   params,
  //   userDetails,
  //   logTrace,
  //   counter_no,
  //   outlet_id,
  //   bill_no
  // }) {
  //   console.log("cartinfo",cartInfo);

  //   return `
  //  <!doctype html>
  // <html lang="en">
  //   <head>
  //     <meta charset="UTF-8" />
  //     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  //     <title>${cartInfo.shop_details.shop_name} - Tax Invoice</title>
  //     <style>
  //       @import url("https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap");

  //       * {
  //         margin: 0;
  //         padding: 0;
  //         box-sizing: border-box;
  //       }

  //       body {
  //         background: #d8d8d8;
  //         display: flex;
  //         justify-content: center;
  //         align-items: flex-start;
  //         padding: 24px;
  //         min-height: 100vh;
  //       }

  //       /* 3-inch thermal = 80mm = 302px @ 96dpi */
  //       .receipt {
  //         width: 302px;
  //         background: #fff;
  //         font-family: "Google Sans Flex", sans-serif;
  //         font-size: 10.5px;
  //         line-height: 1.45;
  //         color: #000;
  //         padding: 14px 10px 18px;
  //         box-shadow: 2px 4px 18px rgba(0, 0, 0, 0.22);
  //       }

  //       /* ── Header ── */
  //       .header {
  //         text-align: center;
  //         margin-bottom: 4px;
  //       }
  //       .store-name {
  //         font-size: 15px;
  //         font-weight: 700;
  //         letter-spacing: 1px;
  //         line-height: 1.25;
  //         margin-bottom: 3px;
  //       }
  //       .store-info {
  //         font-size: 10.5px;
  //         line-height: 1.55;
  //       }

  //       .invoice-title {
  //         text-align: center;
  //         font-size: 11px;
  //         font-weight: 700;
  //         letter-spacing: 2px;
  //         margin: 5px 0;
  //       }

  //       /* ── Dividers ── */
  //       .div-dash {
  //         border: none;
  //         border-top: 1.2px dashed #555;
  //         margin: 4px 0;
  //       }

  //       /* ── Meta rows ── */
  //       .meta-row {
  //         display: flex;
  //         justify-content: space-between;
  //         font-size: 10.5px;
  //         line-height: 1.7;
  //       }

  //       /* ── Items ── */
  //       /* Column headers */
  //       .th-row {
  //         display: flex;
  //         align-items: baseline;
  //         border-bottom: 1.2px dashed #555;
  //         padding-bottom: 3px;
  //         margin-bottom: 1px;
  //         font-size: 10.5px;
  //       }
  //       .th-sno {
  //         width: 18px;
  //         flex-shrink: 0;
  //       }
  //       .th-item {
  //         flex: 1;
  //         padding-left: 6px;
  //       }
  //       .th-mrp {
  //         width: 60px;
  //         flex-shrink: 0;
  //         text-align: right;
  //       }
  //       .th-rate {
  //         width: 60px;
  //         flex-shrink: 0;
  //         text-align: right;
  //       }
  //       .th-qty {
  //         width: 45px;
  //         flex-shrink: 0;
  //         text-align: right;
  //       }
  //       .th-amt {
  //         width: 60px;
  //         flex-shrink: 0;
  //         text-align: right;
  //       }

  //       /* Item block */
  //       .item-block {
  //         margin: 3px 0;
  //       }
  //       .item-block:last-child {
  //         border-bottom: 1.2px dashed #555;
  //         padding-bottom: 4px;
  //         margin-bottom: 2px;
  //       }

  //       /* Row A: sno + full-width name */
  //       .item-row-a {
  //         display: flex;
  //         align-items: baseline;
  //       }
  //       .item-sno {
  //         width: 18px;
  //         flex-shrink: 0;
  //       }
  //       .item-name {
  //         flex: 1;
  //         font-weight: 400;
  //       }

  //       /* Row B: mrp / rate / qty / amt — indented */
  //       .item-row-b {
  //         display: flex;
  //         align-items: baseline;
  //         padding-left: 4px;
  //         margin-top: 0px;
  //         font-size: 10.5px;
  //       }
  //       .item-mrp {
  //         width: 60px;
  //         flex-shrink: 0;
  //         text-align: right;
  //       }
  //       .item-rate {
  //         width: 60px;
  //         flex-shrink: 0;
  //         text-align: right;
  //       }
  //       .item-qty {
  //         width: 45px;
  //         flex-shrink: 0;
  //         text-align: right;
  //       }
  //       .item-amt {
  //         width: 60px;
  //         flex-shrink: 0;
  //         text-align: right;
  //       }
  //       .item-spacer {
  //         flex: 1;
  //       }

  //       /* Row C: HSN + GST */
  //       .item-row-c {
  //         padding-left: 18px;
  //         font-size: 10px;
  //         color: #222;
  //         margin-bottom: 1px;
  //       }

  //       /* ── Subtotals ── */
  //       .subtotals {
  //         border-top: 1.2px dashed #555;
  //         padding-top: 6px;
  //       }
  //       .subtotals {
  //         font-size: 10.5px;
  //       }
  //       .sub-row {
  //         display: flex;
  //         justify-content: flex-end;
  //         padding: 1px 0;
  //       }
  //       .sub-row .lbl {
  //         text-align: right;
  //         padding-right: 8px;
  //         min-width: 90px;
  //       }
  //       .sub-row .val {
  //         text-align: right;
  //         width: 54px;
  //       }

  //       /* ── Counter + Total row ── */
  //       .counter-total {
  //         display: flex;
  //         justify-content: space-between;
  //         align-items: baseline;
  //         padding: 3px 0;
  //         font-size: 10.5px;
  //       }
  //       .counter-total .grand {
  //         font-weight: 700;
  //         font-size: 14px;
  //       }

  //       /* ── Footer rows ── */
  //       .footer-rows {
  //         font-size: 10.5px;
  //         line-height: 1.7;
  //         margin-top: 3px;
  //       }
  //       .f-row {
  //         display: flex;
  //         justify-content: space-between;
  //       }

  //       /* ── Savings section ── */
  //       .savings {
  //         font-size: 10.5px;
  //         margin: 4px 0;
  //       }
  //       .save-row {
  //         display: flex;
  //         justify-content: space-between;
  //         font-weight: 700;
  //         font-size: 12.5px;
  //         line-height: 1.7;
  //       }

  //       /* ── Membership ── */
  //       .membership {
  //         font-size: 10.5px;
  //         margin: 4px 0;
  //         line-height: 1.65;
  //       }
  //       .membership .mem-title {
  //         text-decoration: underline;
  //         font-size: 10.5px;
  //         margin-bottom: 1px;
  //       }

  //       /* ── GST details table ── */
  //       .gst-section {
  //         margin: 4px 0;
  //       }
  //       .gst-title {
  //         text-decoration: underline;
  //         font-size: 10.5px;
  //         margin-bottom: 3px;
  //       }
  //       .gst-table {
  //         width: 100%;
  //         font-size: 10px;
  //         border-collapse: collapse;
  //       }
  //       .gst-table th {
  //         text-align: right;
  //         font-weight: 700;
  //         border-bottom: 1px dashed #555;
  //         padding: 1px 0 2px;
  //       }
  //       .gst-table th:first-child {
  //         text-align: left;
  //         width: 20px;
  //       }
  //       .gst-table td {
  //         text-align: right;
  //         padding: 1px 0;
  //         border-bottom: 1px dashed #555;
  //       }
  //       .gst-table td:first-child {
  //         text-align: left;
  //       }

  //       /* ── Pay section ── */
  //       .pay-section {
  //         font-size: 10.5px;
  //         line-height: 1.7;
  //         margin-top: 3px;
  //       }
  //       .pay-row {
  //         display: flex;
  //         justify-content: space-between;
  //       }

  //       /* ── Messages ── */
  //       .messages {
  //         text-align: center;
  //         font-size: 10.5px;
  //         margin: 6px 0 4px;
  //         line-height: 1.65;
  //       }
  //       .messages .thankyou {
  //         font-weight: 700;
  //         font-size: 11px;
  //       }

  //       /* ── Barcode ── */
  //       .barcode-wrap {
  //         text-align: center;
  //         margin-top: 8px;
  //       }
  //       .barcode-wrap canvas {
  //         display: block;
  //         margin: 0 auto;
  //       }
  //       .barcode-num {
  //         font-size: 11px;
  //         font-weight: 700;
  //         letter-spacing: 1.5px;
  //         margin-top: 4px;
  //       }

  //       /* ── Print ── */
  //       @media print {
  //         @page {
  //           size: 80mm auto;
  //           margin: 0;
  //         }
  //         body {
  //           background: none;
  //           padding: 0;
  //         }
  //         .receipt {
  //           box-shadow: none;
  //           width: 80mm;
  //         }
  //       }
  //     </style>
  //   </head>
  //   <body>
  //     <div class="receipt">
  //       <!-- Header -->
  //       <div class="header">
  //         <div class="store-name">${cartInfo.shop_details.shop_name}</div>
  //         <div class="store-info">
  //           Address : ${cartInfo.shop_details.address},<br />
  //           City  :${cartInfo.shop_details.city}<br />
  //           Phone : ${cartInfo.shop_details.phone}<br />
  //           GSTIN : ${cartInfo.shop_details.gstin}<br />
  //           FSSAI No : ${cartInfo.shop_details.fssai_no}
  //         </div>
  //       </div>

  //       <div class="invoice-title">*&nbsp; TAX INVOICE &nbsp;*</div>
  //       <hr class="div-dash" />

  //       <!-- Bill meta -->
  //       <div class="meta-row">
  //         <span>Bill No : ${cartInfo.bill_details.bill_no}</span>
  //         <span>Date : ${cartInfo.bill_details.bill_date}</span>
  //       </div>
  //       <div class="meta-row">
  //         <span>Operator : ${cartInfo.bill_details.operator}</span>
  //       </div>
  //       <hr class="div-dash" />

  //       <!-- Column headers -->
  //       <div class="th-row">
  //         <span class="th-sno">Sno</span>
  //         <span class="th-item">Item/HSN</span>
  //         <span class="th-mrp">MRP</span>
  //         <span class="th-rate">Rate</span>
  //         <span class="th-qty">Qty</span>
  //         <span class="th-amt">Amt</span>
  //       </div>

  //       <!-- Item 1 -->
  //       <div class="item-block">
  //         <div class="item-row-a">
  //           <span class="item-sno">1</span>
  //           <span class="item-name">${cartInfo.cart_lines.prod_name}</span>
  //         </div>
  //         <div class="item-row-b">
  //           <span class="item-spacer"></span>
  //           <span class="item-mrp">${cartInfo.cart_lines.mrp}</span>
  //           <span class="item-rate">${cartInfo.cart_lines.rate}</span>
  //           <span class="item-qty">${cartInfo.cart_lines.qty}</span>
  //           <span class="item-amt">${cartInfo.cart_lines.mrp}</span>
  //         </div>
  //         <div class="item-row-c">HSN :${cartInfo.cart_lines.hsn} &nbsp;&nbsp; GST : ${cartInfo.cart_lines.gst} %</div>
  //       </div>

  //       // <!-- Item 2 -->
  //       // <div class="item-block">
  //       //   <div class="item-row-a">
  //       //     <span class="item-sno">2</span>
  //       //     <span class="item-name">AMUL SPRAY (200g)</span>
  //       //   </div>
  //       //   <div class="item-row-b">
  //       //     <span class="item-spacer"></span>
  //       //     <span class="item-mrp">99.00</span>
  //       //     <span class="item-rate">97.02</span>
  //       //     <span class="item-qty">1.000</span>
  //       //     <span class="item-amt">97.02</span>
  //       //   </div>
  //       //   <div class="item-row-c">HSN : 04012000&nbsp;&nbsp; GST : 5.00 %</div>
  //       // </div>

  //       // <!-- Item 3 -->
  //       // <div class="item-block">
  //       //   <div class="item-row-a">
  //       //     <span class="item-sno">3</span>
  //       //     <span class="item-name">Kpn Sugar 1Kg</span>
  //       //   </div>
  //       //   <div class="item-row-b">
  //       //     <span class="item-spacer"></span>
  //       //     <span class="item-mrp">-</span>
  //       //     <span class="item-rate">50.00</span>
  //       //     <span class="item-qty">1.000</span>
  //       //     <span class="item-amt">50.00</span>
  //       //   </div>
  //       //   <div class="item-row-c">HSN : 17019100&nbsp;&nbsp; GST : 5.00 %</div>
  //       // </div>

  //       <!-- Subtotals -->
  //       <div class="subtotals">
  //         <div class="sub-row">
  //           <span class="lbl">Sub Total</span>
  //           <span class="val">${cartInfo.totals.sub_total}</span>
  //         </div>
  //         <div class="sub-row">
  //           <span class="lbl">Discount</span>
  //           <span class="val">${cartInfo.totals.discount}</span>
  //         </div>
  //         <div class="sub-row">
  //           <span class="lbl">Roundoff</span>
  //           <span class="val">${cartInfo.totals.roundoff}</span>
  //         </div>
  //       </div>

  //       <hr class="div-dash" />

  //       <!-- Counter + Total -->
  //       <div class="counter-total">
  //         <span>Counter :${counter_no}</span>
  //         <span>Total:</span>
  //         <span class="grand">332.00</span>
  //       </div>

  //       <hr class="div-dash" />

  //       <!-- Footer -->
  //       <div class="footer-rows">
  //         <div class="f-row">
  //           <span>Tot.Bags : 1</span>
  //           <span>Tot.Qty : 3.000</span>
  //         </div>
  //         <div>
  //           Nos&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : 3.000
  //         </div>
  //         <div>
  //           Kgs&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: 4.120
  //         </div>
  //       </div>

  //       <hr class="div-dash" />

  //       <!-- Savings -->
  //       <div class="savings">
  //         <div class="save-row">
  //           <span>You Save</span><span>:</span><span>11.98</span>
  //         </div>
  //         <div class="save-row">
  //           <span>Addl.Dis</span><span>:</span><span>5.00</span>
  //         </div>
  //         <div class="save-row">
  //           <span>Total Save</span><span>:</span><span>16.98</span>
  //         </div>
  //       </div>

  //       <hr class="div-dash" />

  //       <!-- Membership Points -->
  //       <div class="membership">
  //         <div class="mem-title">Membership Points</div>
  //         <div>Card No : 9952448684</div>
  //         <div
  //           class="f-row"
  //           style="display: flex; justify-content: space-between"
  //         >
  //           <span>This Bill : 2.87</span>
  //           <span>Total Point : 2.98</span>
  //         </div>
  //       </div>

  //       <hr class="div-dash" />

  //       <!-- GST Details -->
  //       <div class="gst-section">
  //         <div class="gst-title">GST Details</div>
  //         <table class="gst-table">
  //           <thead>
  //             <tr>
  //               <th>%</th>
  //               <th>Value</th>
  //               <th>SGST</th>
  //               <th>CGST</th>
  //               <th>Cess</th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //             <tr>
  //               <td>5</td>
  //               <td>320.97</td>
  //               <td>8.02</td>
  //               <td>8.02</td>
  //               <td>0.00</td>
  //             </tr>
  //           </tbody>
  //         </table>
  //       </div>

  //       <!-- Pay section -->
  //       <div class="pay-section">
  //         <div>Pay Mode : CASH</div>
  //         <div class="pay-row">
  //           <span>Paid : 400.00</span>
  //           <span>Bal : 68.00</span>
  //         </div>
  //       </div>

  //       <!-- Messages -->
  //       <div class="messages">
  //         <div>9224670000 whatsapp order</div>
  //         <div class="thankyou">Thank you ! visit again !</div>
  //       </div>

  //       <!-- Barcode -->
  //       <div class="barcode-wrap">
  //         <canvas id="barcode"></canvas>
  //         <div class="barcode-num">18052601117293</div>
  //       </div>
  //     </div>

  //     <script>
  //       (function () {
  //         const canvas = document.getElementById("barcode");
  //         const ctx = canvas.getContext("2d");
  //         const U = 1.5,
  //           H = 26;
  //         const num = "18052601117293";

  //         const EAN_R = {
  //           0: [3, 2, 1, 1],
  //           1: [2, 2, 2, 1],
  //           2: [2, 1, 2, 2],
  //           3: [1, 4, 1, 1],
  //           4: [1, 1, 3, 2],
  //           5: [1, 2, 3, 1],
  //           6: [1, 1, 1, 4],
  //           7: [1, 3, 1, 2],
  //           8: [1, 2, 1, 3],
  //           9: [3, 1, 1, 2]
  //         };

  //         const totalUnits = 7 + 3 + num.length * 7 + 5 + 7;
  //         canvas.width = Math.ceil(totalUnits * U);
  //         canvas.height = H;

  //         ctx.fillStyle = "#fff";
  //         ctx.fillRect(0, 0, canvas.width, H);

  //         let x = 0;
  //         function bar(w, dark) {
  //           if (dark) {
  //             ctx.fillStyle = "#000";
  //             ctx.fillRect(x, 0, w * U, H);
  //           }
  //           x += w * U;
  //         }

  //         bar(7, false);
  //         bar(1, true);
  //         bar(1, false);
  //         bar(1, true);
  //         num.split("").forEach(ch => {
  //           (EAN_R[ch] || [2, 2, 2, 1]).forEach((w, i) => bar(w, i % 2 === 0));
  //         });
  //         bar(1, true);
  //         bar(1, false);
  //         bar(1, true);
  //         bar(2, false);
  //         bar(1, true);
  //         bar(7, false);
  //       })();
  //     </script>
  //   </body>
  // </html>

  //   `;
  // }
  async function getCartPrintSummary({
    cartInfo,
    counter_no
  }) {

    let shop_det = cartInfo.shop_details;
    let bill_det = cartInfo.bill_details;
    let cart_det = cartInfo.cart_lines;
    let customer_det = cartInfo.totals;
    let payment_det = cartInfo.payment_details;
    let balance_amount = Number(payment_det?.balance_amount || 0).toFixed(2);
    let cart_total_discount = cartInfo.cart_total_discount;
    console.log("payment_det111", payment_det);

    function formatBillDate(bill_date) {
      const date = new Date(bill_date);

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = String(date.getFullYear()).slice(-2);

      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");

      const ampm = hours >= 12 ? "PM" : "AM";

      hours = hours % 12 || 12;

      return `${day}-${month}-${year} ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
    }
    let pay_mode = bill_det.pay_mode;

    const paymentModes = bill_det.pay_mode || [];
    console.log("paymentModes111", paymentModes);


    const payments = paymentModes
      .filter((item) => Number(item.amount) > 0)
      .map((item) => {
        return {
          mode:
            item.id === 1
              ? "Cash"
              : item.id === 2
                ? "Online"
                : "Card",

          amount: Number(item.amount).toFixed(2)
        };
      });

    console.log("payments111", payments);
    let mode = payments[0].mode;
    let pay_amount = Number(payments?.[0]?.amount || 0).toFixed(2);

    let bill_date = formatBillDate(bill_det.bill_date);

    var wallet_amount = bill_det.wallet_amount;
    var balance_point = bill_det.balance_point;
    var earn_point = bill_det.earn_point || 0;
    //console.log("ball", wallet_amount, balance_point);
    const d = new Date(bill_det.bill_date);

    const date =
      String(d.getDate()).padStart(2, '0') +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getFullYear()).slice(-2);

    let bar_code = date + "0" + counter_no + "000" + bill_det.bill_no;
    console.log(bar_code);

    //console.log("bill", bill_date);

    // console.log("sh", shop_det);
    // console.log("bill", bill_det);
    // console.log("cart", cart_det.prod_name);

    // console.log("total_sgst", total_sgst);
    // console.log("pay", payment_det);
    let prod_name = '';
    let mrp = '';
    let qty = '';
    let rate = '';
    let total_amount = '';
    let hsn = '';
    let gst = '';
    let uom_name = '';
    let tot_rate = 0;
    let roff = 0;
    let discount = 0;
    let scheme_discount = 0;
    let loyality_discount = 0;
    let offer_discount = 0;
    let carts_det = [];
    // console.log("cart_det", cart_det);

    for (let i = 0; i < cart_det.length; i++) {

      const item = {
        prod_name: cart_det[i].prod_name,
        mrp: cart_det[i].mrp,
        qty: cart_det[i].qty,
        rate: cart_det[i].rate,
        total_amount: cart_det[i].total_amount || 0,
        hsn: cart_det[i].hsn,
        gst: cart_det[i].gst,
        uom_name: cart_det[i].uom_name,
        tot_rate:
          Number(cart_det[i].rate || 0) *
          Number(cart_det[i].qty || 0),

        roff: cart_det[i].roff || 0,
        discount: cart_det[i].discount || 0,
        scheme_discount: cart_det[i].scheme_discount || 0,
        loyality_discount: cart_det[i].loyality_discount || 0,
        offer_discount: cart_det[i].offer_discount || 0
      };

      carts_det.push(item);
    }

    // console.log("carts_det", carts_det);
    const productName = cart_det.map(item => item.prod_name);
    mrp = cart_det.map(item => item.mrp);
    qty = cart_det.map(item => item.qty);
    rate = cart_det.map(item => item.rate);
    total_amount = cart_det.map(item => item.total_amount);
    hsn = cart_det.map(item => item.hsn);
    gst = cart_det.map(item => item.gst);
    tot_rate = cart_det.map(item => item.tot_rate);
    roff = cart_det.map(item => item.roff);
    discount = cart_det.map(item => item.discount);
    scheme_discount = cart_det.map(item => item.scheme_discount);
    loyality_discount = cart_det.map(item => item.redeempoint);
    offer_discount = cart_det.map(item => item.offer_discount);
    // console.log("beforecalctot_Gstamt", total_amount, gst);
    console.log("loyality_discount", loyality_discount);

    // const tot_gstamt = cart_det
    //   .reduce(
    //     (sum, item) => sum + Number(item.total_amount || 0) * Number(item.qty || 0) * Number((parseFloat(item.gst || 0) / 100) / 2),
    //     0
    //   )
    //   .toFixed(2);

    const tot_gstamt = cart_det.reduce((sum, item) => {

      const amount =
        (Number(item.rate || 0) * Number(item.qty || 0)) -
        Number(item.discount || 0);
      const gstPercent = Number(item.gst || 0);

      const gstAmount = gstPercent > 0
        ? (amount * gstPercent) / (100 + gstPercent)
        : 0;

      return sum + gstAmount;

    }, 0).toFixed(2);


    //console.log("tot_Gstamt", tot_gstamt);
    let total_sgst = (
      Number(tot_gstamt || 0) / 2
    ).toFixed(2);
    //console.log("total_sgst", total_sgst);
    var sch_discount = Number(scheme_discount[0] || 0).toFixed(2);
    var loyality_discount_amt = Number(loyality_discount[0] || 0).toFixed(2);
    var offer_discount_amt = Number(offer_discount[0] || 0).toFixed(2);
    var tot_amt = cart_det.reduce((sum, item) => sum + Number(item.total_amount || 0), 0).toFixed(2);
    var sub_total_amt = Number(tot_amt || 0).toFixed(2);
    console.log("loyality_discount_amt", loyality_discount_amt);

    // var dis_amt = cart_det.reduce((sum, item) => sum + Number(item.discount || 0), 0).toFixed(2);
    var dis_amt = cart_det.reduce((sum, item) => sum + Number(item.discount || 0), 0).toFixed(2);
    // console.log("dis_amt", dis_amt);

    var tot_gst_ = cart_det.reduce((sum, item) => sum + Number(item.total_amount || 0) * Number(item.qty || 0) * Number((parseFloat(item.gst || 0) / 100) / 2), 0);
    // console.log("tot_amt", tot_amt);

    tot_amt = (Number(tot_amt || 0) - Number(dis_amt || 0)).toFixed(2);
    const tot_qty = cart_det.reduce((sum, item) => sum + Number(item.qty || 0), 0).toFixed(3);
    const nos_qty = cart_det.reduce((sum, item) => {
      if (item.uom_name === "Kgs") return sum;
      return sum + Number(item.qty || 0);
    }, 0);
    const kgs_qty = cart_det.reduce((sum, item) => {
      if (item.uom_name !== "Kgs") return sum;
      return sum + Number(item.qty || 0);
    }, 0);
    var sub_tot_amt = Number(tot_amt || 0) + Number(tot_gstamt || 0) + Number(dis_amt || 0);
    var final_gr_total = Number(tot_amt || 0) + Number(tot_gstamt || 0);
    var prod_dis_amt = (Number(dis_amt || 0) - Number(sch_discount - offer_discount_amt || 0)).toFixed(2);
    // console.log("dis_amt", dis_amt);
    // console.log("sch_discount", sch_discount);

    // console.log("prod_dis_amt", prod_dis_amt);
    // console.log("tot_amt11", tot_amt);
    let tot_amt_gst = (
      Number(tot_amt || 0)).toFixed(2);
    // console.log("finalamt", tot_amt_gst);
    let round_off_tot = (
      Math.floor(tot_amt_gst)
    ).toFixed(2);

    // console.log("sub_tot_amt", sub_tot_amt);

    // console.log("tot_qty", tot_qty);
    let totalQty = 0;
    let prod_total = 0;

    cart_det.forEach(item => {
      item.total_amount = Number(item.rate) * Number(item.qty);

      totalQty += Number(item.qty);
      prod_total += item.total_amount;
      // console.log("prodTotal", prod_total);

    });
    var sub_tot_rate =
      prod_total.toFixed(2);
    console.log("sub_tot_rate", sub_tot_rate);

    return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${shop_det.shop_name} - Tax Invoice</title>
      <style>
      @import url("https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap");

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        background: #d8d8d8;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 24px;
        min-height: 100vh;
      }

      /* 3-inch thermal = 80mm = 302px @ 96dpi */
      .receipt {
        width: 302px;
        background: #fff;
        font-family: "Google Sans Flex", sans-serif;
        font-size: 10.5px;
        line-height: 1.45;
        color: #000;
        padding: 14px 10px 18px;
        box-shadow: 2px 4px 18px rgba(0, 0, 0, 0.22);
      }

      /* ── Header ── */
      .header {
        text-align: center;
        margin-bottom: 4px;
      }
      .store-name {
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 1px;
        line-height: 1.25;
        margin-bottom: 3px;
      }
      .store-info {
        font-size: 10.5px;
        line-height: 1.55;
      }

      .invoice-title {
        text-align: center;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 2px;
        margin: 5px 0;
      }

      /* ── Dividers ── */
      .div-dash {
        border: none;
        border-top: 1.2px dashed #555;
        margin: 4px 0;
      }

      /* ── Meta rows ── */
      .meta-row {
        display: flex;
        justify-content: space-between;
        font-size: 10.5px;
        line-height: 1.7;
      }

      /* ── Items ── */
      /* Column headers */
      .th-row {
        display: flex;
        align-items: baseline;
        border-bottom: 1.2px dashed #555;
        padding-bottom: 3px;
        margin-bottom: 1px;
        font-size: 10.5px;
      }
      .th-sno {
        width: 18px;
        flex-shrink: 0;
      }
      .th-item {
        flex: 1;
        padding-left: 6px;
      }
      .th-mrp {
        width: 50px;
        flex-shrink: 0;
        text-align: right;
      }
      .th-rate {
        width: 50px;
        flex-shrink: 0;
        text-align: right;
      }
      .th-qty {
        width: 45px;
        flex-shrink: 0;
        text-align: right;
      }
      .th-amt {
        width: 40px;
        flex-shrink: 0;
        text-align: right;
      }

      /* Item block */
      .item-block {
        margin: 3px 0;
      }
      .item-block:last-child {
        border-bottom: 1.2px dashed #555;
        padding-bottom: 4px;
        margin-bottom: 2px;
      }

      /* Row A: sno + full-width name */
      .item-row-a {
        display: flex;
        align-items: baseline;
      }
      .item-sno {
        width: 18px;
        flex-shrink: 0;
      }
      .item-name {
        flex: 1;
        font-weight: 400;
      }

      /* Row B: mrp / rate / qty / amt — indented */
      .item-row-b {
        display: flex;
        align-items: baseline;
        padding-left: 4px;
        margin-top: 0px;
        font-size: 10.5px;
      }
      .item-mrp {
        width: 60px;
        flex-shrink: 0;
        text-align: right;
      }
      .item-rate {
        width: 60px;
        flex-shrink: 0;
        text-align: right;
      }
      .item-qty {
        width: 45px;
        flex-shrink: 0;
        text-align: right;
      }
      .item-amt {
        width: 60px;
        flex-shrink: 0;
        text-align: right;
      }
      .item-spacer {
        flex: 1;
      }

      /* Row C: HSN + GST */
      .item-row-c {
        padding-left: 18px;
        font-size: 10px;
        color: #222;
        margin-bottom: 1px;
      }

      /* ── Subtotals ── */
      .subtotals {
        border-top: 1.2px dashed #555;
        padding-top: 6px;
      }
      .subtotals {
        font-size: 10.5px;
      }
      .sub-row {
        display: flex;
        justify-content: flex-end;
        padding: 1px 0;
      }
      .sub-row .lbl {
        text-align: right;
        padding-right: 8px;
        min-width: 90px;
      }
      .sub-row .val {
        text-align: right;
        width: 54px;
      }

      /* ── Counter + Total row ── */
      .counter-total {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        padding: 3px 0;
        font-size: 10.5px;
      }
      .counter-total .grand {
        font-weight: 700;
        font-size: 14px;
      }

      /* ── Footer rows ── */
      .footer-rows {
        font-size: 10.5px;
        line-height: 1.7;
        margin-top: 3px;
      }
      .f-row {
        display: flex;
        justify-content: space-between;
      }

      /* ── Savings section ── */
      .savings {
        font-size: 10.5px;
        margin: 4px 0;
      }
      .save-row {
        display: flex;
        justify-content: space-between;
        font-weight: 700;
        font-size: 12.5px;
        line-height: 1.7;
      }

      /* ── Membership ── */
      .membership {
        font-size: 10.5px;
        margin: 4px 0;
        line-height: 1.65;
      }
      .membership .mem-title {
        text-decoration: underline;
        font-size: 10.5px;
        margin-bottom: 1px;
      }

      /* ── GST details table ── */
      .gst-section {
        margin: 4px 0;
      }
      .gst-title {
        text-decoration: underline;
        font-size: 10.5px;
        margin-bottom: 3px;
      }
      .gst-table {
        width: 100%;
        font-size: 10px;
        border-collapse: collapse;
      }
      .gst-table th {
        text-align: right;
        font-weight: 700;
        border-bottom: 1px dashed #555;
        padding: 1px 0 2px;
      }
      .gst-table th:first-child {
        text-align: left;
        width: 20px;
      }
      .gst-table td {
        text-align: right;
        padding: 1px 0;
        border-bottom: 1px dashed #555;
      }
      .gst-table td:first-child {
        text-align: left;
      }

      /* ── Pay section ── */
      .pay-section {
        font-size: 10.5px;
        line-height: 1.7;
        margin-top: 3px;
      }
      .pay-row {
        display: flex;
        justify-content: space-between;
      }

      /* ── Messages ── */
      .messages {
        text-align: center;
        font-size: 10.5px;
        margin: 6px 0 4px;
        line-height: 1.65;
      }
      .messages .thankyou {
        font-weight: 700;
        font-size: 11px;
      }

      /* ── Barcode ── */
      .barcode-wrap {
        text-align: center;
        margin-top: 8px;
      }
      .barcode-wrap canvas {
        display: block;
        margin: 0 auto;
      }
      .barcode-num {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.5px;
        margin-top: 4px;
      }

      /* ── Print ── */
      @media print {
        @page {
          size: 80mm auto;
          margin: 0;
        }
        body {
          background: none;
          padding: 0;
        }
        .receipt {
          box-shadow: none;
          width: 80mm;
        }
      }
    </style>
  </head>
  <body>
    <div class="receipt">
      <!-- Header -->
      <div class="header">
        <div class="store-name">${shop_det.shop_name}</div>
        <div class="store-info">
          ${shop_det.address}<br />
          ${shop_det.city}<br />
          Phone : ${shop_det.phone}<br />
          GSTIN : ${shop_det.gstin}<br />
          FSSAI No : ${shop_det.fssai_no}
        </div>
      </div>
 
      <div class="invoice-title">*&nbsp; TAX INVOICE &nbsp;*</div>
      <hr class="div-dash" />

      <!-- Bill meta -->
      <div class="meta-row">
        <span>Bill No : ${bill_det.bill_no}</span>
        <span>Date : ${bill_date}&nbsp; </span>
      </div>
      <div class="meta-row">
        <span>Operator : ${bill_det.operator_name}</span>
      </div>
      <hr class="div-dash" />
 
      <!-- Column headers -->
      <div class="th-row">
        <span class="th-sno">Sno</span>
        <span class="th-item">Item/HSN</span>
        <span class="th-mrp">MRP</span>
        <span class="th-rate">Rate</span>
        <span class="th-qty">Qty</span>
        <span class="th-amt">Amt</span>
      </div>

   

      ${cart_det.map((item, index) => {

      // const tot_rate =
      //   Number(item.rate || 0) * Number(item.qty || 0) - Number(item.discount || 0).toFixed(2);
      const tot_rate = parseFloat(
        (Number(item.rate || 0) * Number(item.qty || 0)).toFixed(2)
      );
      console.log("outputtot_rate", tot_rate, item.rate, item.qty);

      return `
    <div class="item-block">

      <div class="item-row-a">
        <span class="item-sno">${index + 1}</span>
        <span class="item-name">${item.prod_name}</span>
      </div>

      <div class="item-row-b">
        <span class="item-spacer"></span>

        <span class="item-mrp">
          ${Number(item.mrp || 0).toFixed(2)}
        </span>

        <span class="item-rate">
          ${Number(item.rate || 0).toFixed(2)}
        </span>

        <span class="item-qty">
          ${item.qty || 0}
        </span>
   

        <span class="item-amt">
          ${tot_rate.toFixed(2)}
        </span>
      </div>

      <div class="item-row-c">
        HSN : ${item.hsn || "-"}
        &nbsp;&nbsp;
        GST : ${Number(item.gst || 0).toFixed(2)} %
      </div>

    </div>
  `;
    }).join("")}

     
      ${(() => {
        // Calculate subtotal as the sum of total rate for all items
        // const sub_total = cart_det.reduce((sum, item) => {
        //   return sum + (Number(item.rate || 0) * Number(item.qty || 0) - Number(item.discount || 0));
        // }, 0);
        // const sub_total = cart_det.reduce((sum, item) => {
        //   return sum + (Number(item.rate || 0) * Number(item.qty || 0).toFixed(2));
        // }, 0);
        const sub_total = cart_det.reduce((sum, item) => {
          const amount = parseFloat(
            (Number(item.rate || 0) * Number(item.qty || 0)).toFixed(2)
          );
          return sum + amount;
        }, 0);

        return `
          <!-- Subtotals -->
          <div class="subtotals">
            <div class="sub-row">
              <span class="lbl">Sub Total</span>
              <span class="val">${sub_total.toFixed(2)}</span>
            </div>
          `;
      })()
      }

            ${(parseFloat(sch_discount || 0) + parseFloat(loyality_discount_amt) + parseFloat(offer_discount_amt || 0)) !== 0
        ? `
                <div class="sub-row">
                  <span class="lbl">Discount</span>
                  <span class="val">${(parseFloat(sch_discount || 0) + parseFloat(loyality_discount_amt) + parseFloat(offer_discount_amt || 0)).toFixed(2)}</span>
                </div>
                `
        : ""
      }
            ${parseFloat(carts_det[0].roff || 0) !== 0
        ? `
                <div class="sub-row">
                  <span class="lbl">Roundoff</span>
                  <span class="val">${carts_det[0].roff}</span>
                </div>
                `
        : ""
      }
      </div>
 

      <hr class="div-dash" />

      <!-- Counter + Total -->
      <div class="counter-total">
        <span>Counter :${counter_no}</span>

        <span>Total:</span>
        <span>
         ${(() => {
        // Calculate subtotal as the sum of total rate for all items
        const sub_total = cart_det.reduce((sum, item) => {
          const amount = parseFloat(
            (Number(item.rate || 0) * Number(item.qty || 0)).toFixed(2)
          );
          return sum + amount;
        }, 0);

        const total_discount =
          parseFloat(sch_discount || 0) +
          parseFloat(loyality_discount_amt || 0) +
          parseFloat(offer_discount_amt || 0);

        let roundoff = parseFloat(
          (carts_det && carts_det.length > 0 && carts_det[0].roff !== undefined)
            ? carts_det[0].roff
            : 0
        );

        // If roundoff is negative, subtract; if positive, add (or appropriate calculation)
        // Typically, roundoff can be positive or negative, so apply as:
        // Total = subtotal - total_discount +/- roundoff
        // We'll subtract if roundoff is positive, add if negative
        // So, in effect: Total = (subtotal - total_discount) - roundoff

        return (sub_total - total_discount + roundoff).toFixed(2);
      })()}
 
        
        </span>
   
   
   
      </div>
 

      <hr class="div-dash" />

      <!-- Footer -->
      <div class="footer-rows">
        <div class="f-row">
         
          <span>Tot.Qty : ${tot_qty}</span>  <span>Tot.item : ${cart_det.length}</span> 
        </div>
      ${nos_qty ? `
<div>
  Nos&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${Number(nos_qty).toFixed(3)}
</div>` : ''}

${kgs_qty ? `
<div>
  Kgs&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${Number(kgs_qty).toFixed(3)}
</div>` : ''}
 

      <hr class="div-dash" />

      <!-- Savings -->
      <div class="savings">
        ${(() => {
        const total_save = cart_det.reduce((sum, item) => {
          return sum + ((Number(item.mrp || 0) - Number(item.rate || 0)) * (Number(item.qty || 1)));
        }, 0);
        if (total_save > 0) {
          return `
            <div class="save-row">
              <span>You Save</span><span>:</span><span>${total_save.toFixed(2)}</span>
            </div>
          `;
        }
        return '';
      })()}
 

        ${((sch_discount && Number(sch_discount) !== 0) ||
        (loyality_discount_amt && Number(loyality_discount_amt) !== 0))
        ? (() => {
          const addl_discount = (parseFloat(sch_discount || 0) + parseFloat(loyality_discount_amt || 0) + parseFloat(offer_discount_amt || 0));
          const total_save_amt = addl_discount + cart_det.reduce((sum, item) => {
            return sum + ((Number(item.mrp || 0) - Number(item.rate || 0)) * (Number(item.qty || 1)));
          }, 0);
          return `
                <div class="save-row">
                  <span>Addl.Dis</span><span>:</span><span>${addl_discount.toFixed(2)}</span>
                </div>
                <div class="save-row">
                  <span>Total Save</span><span>:</span><span>${total_save_amt.toFixed(2)}</span>
                </div>
              `;
        })()
        : ''
      }
 
      </div>

      <hr class="div-dash" />

   ${bill_det.customer_mobile
        ? `
    <!-- Membership Points -->
    <div class="membership">
      <div class="mem-title">Membership Points</div>

      <div>
        Card No : ${bill_det.customer_mobile}
      </div>

      <div
        class="f-row"
        style="display: flex; justify-content: space-between"
      >
        <span>This Bill :${earn_point}</span>
        <span>Total Point : ${balance_point}</span>
      
    </div> `
        : ""
      }
    
     ${Number(customer_det.total_sgst || 0) > 0
        ? `

   ${cart_det.some(item => Number(item.gst) >= 0)
          ? `

    <!-- GST Details -->
    <div class="gst-section">

      <div class="gst-title">
        GST Details
      </div>

      <table class="gst-table">

        <thead>
          <tr>
            <th>%</th>
            <th>Value</th>
            <th>SGST</th>
            <th>CGST</th>
            <th>Cess</th>
          </tr>
        </thead>

      <tbody>
  ${Object.values(
            cart_det
              .filter(item => Number(item.gst) >= 0)
              .reduce((acc, item) => {

                const gstPercent = Number(item.gst || 0);

                const amount =
                  (Number(item.rate || 0) * Number(item.qty || 0));

                const gst_amount =
                  (amount * gstPercent) / (100 + gstPercent);

                const taxable_value = amount - gst_amount;

                const sgst = gst_amount / 2;
                const cgst = gst_amount / 2;

                if (!acc[gstPercent]) {
                  acc[gstPercent] = {
                    gstPercent,
                    taxable_value: 0,
                    sgst: 0,
                    cgst: 0,
                    cess: 0
                  };
                }

                acc[gstPercent].taxable_value += taxable_value;
                acc[gstPercent].sgst += sgst;
                acc[gstPercent].cgst += cgst;
                acc[gstPercent].cess += Number(item.cess || 0);

                return acc;

              }, {})
          )
            .map(item => `
      <tr>
        <td>${item.gstPercent.toFixed(2)}</td>
        <td>${item.taxable_value.toFixed(2)}</td>
        <td>${item.sgst.toFixed(2)}</td>
        <td>${item.cgst.toFixed(2)}</td>
        <td>${item.cess.toFixed(2)}</td>
      </tr>
    `)
            .join("")}
</tbody>
      </table>

   
  `
          : ""
        }
        `
        : ""
      }
      
        <!-- Pay section -->
       <div class="pay-section">
       
        <div>
          ${(() => {
        const cashPayment = payments.find(payment => payment.mode === 1);
        const onlinePayment = payments.find(payment => payment.mode === 2);
        const cashAmount = cashPayment ? Number(cashPayment.amount) : 0;
        const onlineAmount = onlinePayment ? Number(onlinePayment.amount) : 0;
        const cashStr = cashAmount > 0 ? `Cash: ${cashAmount.toFixed(2)}` : "";
        const onlineStr = onlineAmount > 0 ? `Online: ${onlineAmount.toFixed(2)}` : "";
        if (cashStr && onlineStr) {
          return `${cashStr} | ${onlineStr}`;
        } else if (cashStr) {
          return cashStr;
        } else if (onlineStr) {
          return onlineStr;
        } else {
          return "";
        }
      })()
      }
    <div>Pay Mode : ${payments.map(payment => payment.mode).join(", ")}</div>
        <div class="pay-row">
          <span>Paid : ${payments.reduce((sum, payment) => sum + Number(payment.amount), 0).toFixed(2)}</span>
          <span>Bal : ${balance_amount}</span>
        </div>
     
  </div>
      <!-- Messages -->
      <div class="messages">
        <div>${shop_det.phone}- whatsapp order</div>
        <div class="thankyou">Thank you ! visit again !</div>
      </div>

      <!-- Barcode -->
      <div class="barcode-wrap">
        <canvas id="barcode"></canvas>
        <div class="barcode-num">${bar_code}</div>
      </div>
    </div>

   <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>

<script>
  (function () {
    const code = "${bar_code}";

    JsBarcode("#barcode", code, {
      format: "CODE128",   // Supports any length and alphanumeric
      width: 1.5,
      height: 26,
      displayValue: false,
      margin: 0
    });
  })();
</script>
  </body>
</html>

  `;
  }
  async function daySaleSave({
    logTrace,
    outlet_id,
    mode,
    balance,
    userDetails,
    financialYear,
    input: {
      billno,
      name,
      mobile,
      customer_id,
      users_id,
      is_card,
      counter_no,
      bags,

      currentDate,
      cartItems,

    }
  }) {
    const knex = this;
    let bcash = 0;
    let bcard = 0;
    let online = 0;
    let creditcard = "N";
    if (is_card == 0) {
      bcash = cartItems.cart_net_total;
      creditcard = "Y";
    } else if (is_card == 1) {
      bcard = cartItems.cart_net_total;
      creditcard = "N";
    } else {
      creditcard = "U";
    }
    if (Array.isArray(mode) && mode.length > 0) {

      mode.forEach((item) => {

        // Cash
        if (item.id == 1) {
          bcash += Number(item.amount || 0);
        }

        // Online / UPI
        else if (item.id == 2) {
          online += Number(item.amount || 0);
        }

        // Card
        else if (item.id == 3) {
          bcard += Number(item.amount || 0);
        }

      });
    }
    let modeTotal = mode.reduce((sum, item) => {
      return sum + Number(item.amount || 0);
    }, 0);
    modeTotal = Number(modeTotal.toFixed(2)) - Number(balance || 0);
    const cartNetTotal = Number(cartItems.cart_net_total) || 0;
    var pdiscount = Number(cartItems.cart_total_discount) || 0;
    var sdiscount = Number(cartItems.cart_scheme_discount) || 0;
    var round_off = Number(cartItems.cart_round_off) || 0;
    var gst = Number(cartItems.total_gst) || 0;
    let financial_year = financialYear;
    let username = userDetails.user_name;
    let mobileNo = userDetails.user_mobile;
    let locname = userDetails.outlet_name || "NA";
    console.log("floc", locname);
    let otheramount = 0;

    const query = knex(SALES.NAME)
      .where(SALES.COLUMNS.OUTLET_ID, outlet_id)
      .andWhere(SALES.COLUMNS.ENTRYDATE, currentDate);
    const exists_response = await query;

    if (exists_response.length > 0) {
      const query_update = await knex(`${SALES.NAME}`)
        .where(SALES.COLUMNS.ENTRYDATE, currentDate)
        .andWhere(SALES.COLUMNS.OUTLET_ID, outlet_id)
        .update({
          [SALES.COLUMNS.CLIENT]: userDetails.company_id,
          [SALES.COLUMNS.LOCATION]: outlet_id,
          [SALES.COLUMNS.COUNTERAMT]: knex.raw('counteramt + ?', [cartNetTotal]),
          [SALES.COLUMNS.COUNTERCARD]: 0,
          [SALES.COLUMNS.CASHAMT]: knex.raw('cashamt + ?', [bcash]),
          [SALES.COLUMNS.CASHCARD]: knex.raw('cashcard + ?', [bcard]),
          [SALES.COLUMNS.CREDITAMT]: knex.raw('creditamt + ?', [online]),
          [SALES.COLUMNS.CREDITCARD]: knex.raw('creditcard + ?', 1),
          [SALES.COLUMNS.ORDERAMT]: knex.raw('orderamt + ?', [cartNetTotal]),
          [SALES.COLUMNS.ORDERCARD]: 0,
          [SALES.COLUMNS.LOCALCASH]: 0,
          [SALES.COLUMNS.LOCALCARD]: 0,
          [SALES.COLUMNS.SDISCOUNT]: knex.raw('sdiscount + ?', [sdiscount]),
          [SALES.COLUMNS.SROUNDOFF]: knex.raw('sroundoff + ?', [round_off]),
          [SALES.COLUMNS.PDISCOUNT]: knex.raw('pdiscount + ?', [pdiscount]),
          [SALES.COLUMNS.PROUNDOFF]: knex.raw('proundoff + ?', [round_off]),
          [SALES.COLUMNS.LASTUPDTTIME]: new Date(),
          [SALES.COLUMNS.TOTNOOFBILLS]: knex.raw('totnoofbills + ?', 1),
          [SALES.COLUMNS.CASHGIFTCARD]: 0,
          [SALES.COLUMNS.OUTLET_ID]: outlet_id,
          [SALES.COLUMNS.COUNTRET]: 0,
          [SALES.COLUMNS.CASHRET]: 0,
          [SALES.COLUMNS.CREDITRET]: 0,
          [SALES.COLUMNS.OTHERAMT]: 0,
          [SALES.COLUMNS.ORDERRET]: 0,
          [SALES.COLUMNS.ONLINE]: knex.raw('online + ?', [online]),
          [SALES.COLUMNS.LOC_NAME]: locname,
          [SALES.COLUMNS.GST]: knex.raw('gst + ?', [gst]),
        });

      await query_update;
    } else {
      try {
        const query_insert = await knex(`${SALES.NAME}`).insert({
          [SALES.COLUMNS.ENTRYDATE]: currentDate,
          [SALES.COLUMNS.CLIENT]: userDetails.company_id,
          [SALES.COLUMNS.LOCATION]: outlet_id,
          [SALES.COLUMNS.COUNTERAMT]: cartNetTotal,
          [SALES.COLUMNS.COUNTERCARD]: 0,
          [SALES.COLUMNS.CASHAMT]: bcash,
          [SALES.COLUMNS.CASHCARD]: bcard,
          [SALES.COLUMNS.CREDITAMT]: online,
          [SALES.COLUMNS.CREDITCARD]: 1,
          [SALES.COLUMNS.ORDERAMT]: cartNetTotal,
          [SALES.COLUMNS.ORDERCARD]: 0,
          [SALES.COLUMNS.LOCALCASH]: 0,
          [SALES.COLUMNS.LOCALCARD]: 0,
          [SALES.COLUMNS.SDISCOUNT]: sdiscount,
          [SALES.COLUMNS.SROUNDOFF]: round_off,
          [SALES.COLUMNS.PDISCOUNT]: pdiscount,
          [SALES.COLUMNS.PROUNDOFF]: round_off,
          [SALES.COLUMNS.LASTUPDTTIME]: new Date(),
          [SALES.COLUMNS.TOTNOOFBILLS]: 1,
          [SALES.COLUMNS.CASHGIFTCARD]: 0,
          [SALES.COLUMNS.OUTLET_ID]: outlet_id,
          [SALES.COLUMNS.COUNTRET]: 0,
          [SALES.COLUMNS.CASHRET]: 0,
          [SALES.COLUMNS.CREDITRET]: 0,
          [SALES.COLUMNS.OTHERAMT]: 0,
          [SALES.COLUMNS.ORDERRET]: 0,
          [SALES.COLUMNS.ONLINE]: online,
          [SALES.COLUMNS.LOC_NAME]: locname,
          [SALES.COLUMNS.GST]: gst,
          [SALES.COLUMNS.FINANCIAL_YEAR]: financial_year
        });
        await query_insert;

      } catch (e) {
        console.log(e);

      }
    }
    return { success: true };
  }
  //    async function billPdfSummary({
  //     cartInfo,
  //     counter_no
  //   }) {

  //     let shop_det = cartInfo.shop_details;
  //     let bill_det = cartInfo.bill_details;
  //     let cart_det = cartInfo.cart_lines;
  //     let customer_det = cartInfo.totals;
  //     let payment_det = cartInfo.payment_details;
  //     let balance_amount = Number(payment_det?.balance_amount || 0).toFixed(2);
  //     function formatBillDate(bill_date) {
  //       const date = new Date(bill_date);

  //       const day = String(date.getDate()).padStart(2, "0");
  //       const month = String(date.getMonth() + 1).padStart(2, "0");
  //       const year = String(date.getFullYear()).slice(-2);

  //       let hours = date.getHours();
  //       const minutes = String(date.getMinutes()).padStart(2, "0");

  //       const ampm = hours >= 12 ? "PM" : "AM";

  //       hours = hours % 12 || 12;

  //       return `${day}-${month}-${year} ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  //     }
  //     let pay_mode = bill_det.pay_mode;

  //     const paymentModes = bill_det.pay_mode || [];

  //     const payments = paymentModes
  //       .filter((item) => Number(item.amount) > 0)
  //       .map((item) => {
  //         return {
  //           mode:
  //             item.id === 1
  //               ? "Cash"
  //               : item.id === 2
  //                 ? "Online"
  //                 : "Card",

  //           amount: Number(item.amount).toFixed(2)
  //         };
  //       });

  //     // console.log("payments", payments);
  //     let mode = payments[0].mode;
  //     let pay_amount = Number(payments?.[0]?.amount || 0).toFixed(2);

  //     let bill_date = formatBillDate(bill_det.bill_date);

  //     var wallet_amount = bill_det.wallet_amount;
  //     var balance_point = bill_det.balance_point;


  //    let sno = 1;
  //     let prod_name = '';
  //     let mrp = '';
  //     let qty = '';
  //     let rate = '';
  //     let total_amount = '';
  //     let hsn = '';
  //     let gst = '';
  //     let uom_name = '';
  //     let tot_rate = 0;
  //     let roff = 0;
  //     let discount = 0;
  //     let gr_wt = 0.00;
  //     let carts_det = [];
  //     console.log("cart_det", cart_det);

  //     for (let i = 0; i < cart_det.length; i++) {

  //       const item = {
  //         sno: cart_det[i].sno,
  //         prod_name: cart_det[i].prod_name,
  //         mrp: cart_det[i].mrp,
  //         qty: cart_det[i].qty,
  //         rate: cart_det[i].rate,
  //         total_amount: cart_det[i].total_amount || 0,
  //         hsn: cart_det[i].hsn,
  //         gst: cart_det[i].gst,
  //         uom_name: cart_det[i].uom_name,
  //         tot_rate:
  //           Number(cart_det[i].rate || 0) *
  //           Number(cart_det[i].qty || 0),

  //         roff: cart_det[i].roff || 0,
  //         discount: cart_det[i].discount
  //       };

  //       carts_det.push(item);
  //     }

  //     console.log("carts_det", cart_det);
  //     sno = cart_det.map(item => item.sno);
  //     const productName = cart_det.map(item => item.prod_name);
  //     mrp = cart_det.map(item => item.mrp);
  //     qty = cart_det.map(item => item.qty);
  //     rate = cart_det.map(item => item.rate);
  //     total_amount = cart_det.map(item => item.total_amount);
  //     hsn = cart_det.map(item => item.hsn);
  //     gst = cart_det.map(item => item.gst);
  //     tot_rate = cart_det.map(item => item.tot_rate);
  //     const tot_gstamt = cart_det
  //       .reduce(
  //         (sum, item) => sum + Number(item.total_amount || 0) * Number(item.qty || 0) * Number((parseFloat(item.gst || 0) / 100) / 2),
  //         0
  //       )
  //       .toFixed(2);
  //     let total_sgst = (
  //       Number(tot_gstamt || 0) / 2
  //     ).toFixed(2);
  //     const tot_amt = cart_det.reduce((sum, item) => sum + Number(item.total_amount || 0), 0);
  //     const tot_qty = cart_det.reduce((sum, item) => sum + Number(item.qty || 0), 0).toFixed(2);

  //     console.log("tot_Gstamt", tot_gstamt);
  //     console.log("tot_amt", tot_amt);
  //     let tot_amt_gst = (
  //       Number(tot_amt || 0) + Number(tot_gstamt || 0)
  //     ).toFixed(2);
  //     console.log("finalamt", tot_amt_gst);
  //     let round_off_tot = (
  //       Math.floor(tot_amt_gst)
  //     ).toFixed(2);
  //     console.log("round_off_tot", round_off_tot);

  //     console.log("tot_qty", tot_qty);
  //     let totalQty = 0;
  //     let prod_total = 0;

  //     cart_det.forEach(item => {
  //       item.total_amount = Number(item.rate) * Number(item.qty);

  //       totalQty += Number(item.qty);
  //       prod_total += item.total_amount;
  //       console.log("prodTotal", prod_total);

  //     });
  //     let axiosUrl = await axios.post(
  //       "https://billservices.bluekode.com/v1/pdf",
  //       {
  //     "order_number": bill_det.bill_no,
  //     "outlet_id": 53,
  //     "invoice_number": bill_det.bill_no,
  //     "invoice_terminal_number": 5,
  //     "operator": bill_det.operator_name,
  //     "invoice_date": new Date().toISOString().slice(0, 10),
  //     "total_amount": prod_total,
  //     "loyalty_discount_amount": 0.00,
  //     "invoice_amount": prod_total,
  //     "customer_name": bill_det.operator_name,
  //     "phone_number": shop_det.phone,
  //     "company_name": shop_det.shop_name,
  //     "address_line1": shop_det.address,
  //     "address_line2": shop_det.city,
  //     "address_line3": "",
  //     "address_line4": "",
  //     "city": shop_det.city,
  //     "footer1": "welcome",
  //     "footer2": "thank you",
  //     "pincode": shop_det.city,
  //     "gstin": shop_det.gstin,
  //     "fssai": shop_det.fssai_no,
  //     "contact_number": shop_det.phone,
  //     "sub_total_amount": prod_total,
  //     "round_off": 0.00,
  //     "invoice_lines": [
  //         {
  //             "ksin": sno,
  //             "product_name":productName,
  //             "quantity": {
  //                 "quantity_number": qty,
  //                 "quantity_uom": "Kgs"
  //             },
  //             "unit_price": rate,
  //             "mrp": mrp,
  //             "rate": rate,
  //             "gst": gst,
  //             "cess": 0
  //         },
  //     ],
  //     "payment_methods": [
  //         {
  //             "payment_method": "CASH",
  //             "psp_name": "KPN",
  //             "amount": 384.00
  //         }
  //     ]
  // }
  //     )

  //   }
  async function billPdfSummary({
    cartInfo,
    counter_no
  }) {

    let shop_det = cartInfo.shop_details;
    let bill_det = cartInfo.bill_details;
    let cart_det = cartInfo.cart_lines;

    // Payment Mode
    const paymentModes = bill_det.pay_mode || [];

    const payments = paymentModes
      .filter((item) => Number(item.amount) > 0)
      .map((item) => {
        return {
          payment_method:
            item.id === 1
              ? "CASH"
              : item.id === 2
                ? "ONLINE"
                : "CARD",

          psp_name: "KPN",

          amount: Number(item.amount)
        };
      });

    // Product Total
    let prod_total = 0;
    const loyalty_discount_amount = Number(cart_det[0]?.redeempoint || 0);

    cart_det.forEach((item) => {
      item.total_amount =
        Number(item.rate || 0) *
        Number(item.qty || 0);

      prod_total += item.total_amount;
    });

    // Invoice Lines
    const invoice_lines = cart_det.map((item) => ({
      ksin: String(item.sno),

      product_name: item.prod_name,

      quantity: {
        quantity_number: Number(item.qty || 0),
        quantity_uom: item.uom_name || "Nos"
      },

      unit_price: Number(item.rate || 0),

      mrp: Number(item.mrp || 0),

      rate: Number(item.rate || 0),

      gst: Number(item.gst || 0),

      cess: Number(item.cess || 0)
    }));

    // API Call
    const axiosResponse = await axios.post(
      "https://billservices.bluekode.com/v1/pdf",
      {
        order_number: String(bill_det.bill_no),

        outlet_id: String(shop_det.outlet_id || 101),

        invoice_number: String(bill_det.bill_no),

        invoice_terminal_number: Number(counter_no || 1),

        operator: bill_det.operator_name || "admin",

        invoice_date: new Date().toISOString(),

        total_amount: Number(prod_total.toFixed(2)),

        loyalty_discount_amount: Number(loyalty_discount_amount.toFixed(2)),

        invoice_amount: Number(
          Math.max(0, prod_total - loyalty_discount_amount).toFixed(2)
        ),

        customer_name:
          bill_det.customer_name || "Customer",

        phone_number: shop_det.phone || "",

        company_name: shop_det.shop_name || "",

        address_line1: shop_det.address || "",

        address_line2: shop_det.city || "",

        address_line3: "",

        address_line4: "",

        city: shop_det.city || "",

        footer1: "Welcome",

        footer2: "Thank You",

        pincode: shop_det.pincode || "",

        gstin: shop_det.gstin || "",

        fssai: shop_det.fssai_no || "",

        contact_number: shop_det.phone || "",

        sub_total_amount: Number(prod_total.toFixed(2)),

        round_off: 0.00,

        invoice_lines,

        payment_methods: payments
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    console.log(
      axiosResponse
    )
    console.log(
      "PDF Response",
      axiosResponse.data
    );

    return axiosResponse.data;
  }

  async function updateQuantityOfRoundOffCart({
    logTrace,
    body,
    input: {
      prod_id,
      users_id,
      counter_no,
      discount,
      cart_quantity,
      mrp,
      sales_rate,
      barcode,
      outlet_id,
      // round_off,
      mode
    }
  }) {
    const knex = this;
    console.log("body", mode, users_id, counter_no, outlet_id,);

    const query = knex(COUNTER_CART.NAME)
      .update({
        [COUNTER_CART.COLUMNS.UPDATED_AT]: new Date().toISOString(),
        [COUNTER_CART.COLUMNS.MODE]: mode
      })
      .where(COUNTER_CART.COLUMNS.OUTLET_ID, outlet_id)
      .andWhere(COUNTER_CART.COLUMNS.COUNTER_NO, counter_no);
    logQuery({
      logger: fastify.log,
      query,
      context: "Get Quantity of Item In Cart Round Off",
      logTrace
    });
    const response = await query;
    console.log("response", response);


    return response[0];
  }

  async function getBatchDetails({
    logTrace,
    body,
    currentDate,
    input: {
      prod_id,
      users_id,
      counter_no,
      outlet_id,
    }
  }) {
    const knex = this;
    console.log("Batchbody", prod_id, users_id, counter_no, outlet_id, currentDate);

    let query = knex(`${OUTLET_PURCHASE_MASTER.NAME} as opm`)
      .select(
        `opbd.${OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.BATCH_NO}`,
        `opbd.${OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.PRODUCT_ID}`,
        `opbd.${OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.MRP}`
      )
      .leftJoin(
        `${OUTLET_PURCHASE_DETAILS.NAME} as opd`,
        `opm.${OUTLET_PURCHASE_MASTER.COLUMNS.ID}`,
        `opd.${OUTLET_PURCHASE_DETAILS.COLUMNS.OUTLET_PURCHASE_MST_ID}`
      )
      .leftJoin(
        `${OUTLET_PURCHASE_BATCH_DETAILS.NAME} as opbd`,
        `opd.${OUTLET_PURCHASE_DETAILS.COLUMNS.OUTLET_PURCHASE_MST_ID}`,
        `opbd.${OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.OUTLET_PURCHASE_MASTER_ID}`
      )
      .where(
        `opm.${OUTLET_PURCHASE_MASTER.COLUMNS.OUTLET_ID}`,
        outlet_id
      )
      .andWhere(
        `opbd.${OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.PRODUCT_ID}`,
        prod_id
      )
      .andWhere(OUTLET_PURCHASE_BATCH_DETAILS.COLUMNS.EXPIRY_DATE, ">=", currentDate);
    logQuery({
      logger: fastify.log,
      query,
      context: "Get Quantity of Item In Cart Batch Details",
      logTrace
    });
    const response = await query;


    return response;
  }
  /**
   * Retrieves loyalty cart summary and updates loyalty status on the cart.
   * Returns cart summary if eligible for loyalty, otherwise throws an error.
   */
  async function getItemsLoyalityCart({
    logTrace,
    body,
    users_id,
    counter_no,
    outlet_id,
  }) {
    const knex = this;
    const isApplyLoyalty = body.is_apply_loyalty === true;
    console.log("isApplyLoyalty", isApplyLoyalty);

    if (!isApplyLoyalty) {
      // If loyalty is not being applied, do nothing.
      let response = await knex(COUNTER_CART.NAME)
        .update({
          [COUNTER_CART.COLUMNS.UPDATED_AT]: new Date().toISOString(),
          [COUNTER_CART.COLUMNS.IS_APPLY_LOYALTY]: false
        })
        .where(COUNTER_CART.COLUMNS.OUTLET_ID, outlet_id)
        .andWhere(COUNTER_CART.COLUMNS.COUNTER_NO, counter_no);

      //        await knex(LOYALTY_APPLY_DETAILS.NAME)
      // .where({
      //   [LOYALTY_APPLY_DETAILS.COLUMNS.CUSTOMER_ID]: body.customer_id,
      //   [LOYALTY_APPLY_DETAILS.COLUMNS.TRANSACTION_TYPE]: "REDEEM"
      // })
      // .del();


      return response;
    }


    const response = await knex(COUNTER_CART.NAME)
      .sum({ total: COUNTER_CART.COLUMNS.AMOUNT })
      .where(COUNTER_CART.COLUMNS.OUTLET_ID, outlet_id)
      .andWhere(COUNTER_CART.COLUMNS.COUNTER_NO, counter_no)
      .first();

    const cartTotal = Number(response?.total || 0);



    console.log("cartTotal", cartTotal);

    const settings = await knex(SETTING.NAME).select(`${SETTING.NAME}.*`);
    const plimit = Number(settings?.[0]?.plimit ?? 0);
    const ppoint = Number(settings?.[0]?.ppoint ?? 0);
    console.log("settings", settings);

    const check_customer = await knex(OUTLET_MEMBERS.NAME)
      .select(`${OUTLET_MEMBERS.NAME}.*`)
      .where(`${OUTLET_MEMBERS.COLUMNS.ID}`, body.customer_id);

    const customer_id = check_customer?.[0]?.id;
    console.log("customer_id", customer_id);
    let cust_response = await check_customer;
    let balance_point = cust_response?.[0]?.balance_points;
    console.log("cust_response", balance_point);
    console.log("ppoint", ppoint);

    if (balance_point < ppoint) {
      throw CustomError.create({
        httpCode: StatusCodes.BAD_REQUEST,
        message: `Point is less than minimum required (${ppoint})`,
        property: "point",
        code: "POINT_LESS_THAN_MIN"
      });
    }
    if (cartTotal < plimit) {
      // Not eligible: cart total is less than required minimum
      throw CustomError.create({
        httpCode: StatusCodes.BAD_REQUEST,
        message: `Amount is less than minimum required (${plimit})`,
        property: "amount",
        code: "AMOUNT_LESS_THAN_MIN"
      });
    }
    await knex(COUNTER_CART.NAME)
      .update({
        [COUNTER_CART.COLUMNS.UPDATED_AT]: new Date().toISOString(),
        [COUNTER_CART.COLUMNS.IS_APPLY_LOYALTY]: true
      })
      .where(COUNTER_CART.COLUMNS.OUTLET_ID, outlet_id)
      .andWhere(COUNTER_CART.COLUMNS.COUNTER_NO, counter_no);

    // if(isApplyLoyalty ==)

    // Eligible: return cart summary
    return response;
  }
  async function getItemsLoyalityPointUpdate({
    logTrace,
    body,
    users_id,
    counter_no,
    outlet_id,
    earnpoint,
    redeempoint,
    billno,
    customer_id,
  }) {
    const knex = this;
    console.log("earnpoint", earnpoint);
    console.log("redeempoint", redeempoint);
    console.log("billno", billno);
    console.log("customer_id", customer_id);
    console.log("counter_no", counter_no);
    console.log("outlet_id", outlet_id);
    console.log("users_id", users_id);
    const query = knex(OUT_BILL_MASTER.NAME)
      .update({
        [OUT_BILL_MASTER.COLUMNS.EARNPOINT]: earnpoint || 0,
       // [OUT_BILL_MASTER.COLUMNS.REDEEMPOINT]: redeempoint || 0,

      })
      .where(OUT_BILL_MASTER.COLUMNS.LOC_ID, outlet_id)
      .andWhere(OUT_BILL_MASTER.COLUMNS.BILL_NO, billno)
      .andWhere(OUT_BILL_MASTER.COLUMNS.CUSTOMER_ID, customer_id)
      .andWhere(OUT_BILL_MASTER.COLUMNS.COUNTER, counter_no);
    logQuery({
      logger: fastify.log,
      query,
      context: "Get Items Loyality Point Update",
      logTrace
    });
    const response = await query;
    return response;
  }

  async function saveLoyaltyApplyDetails({
    logTrace,
    body,
    input: {
      billno,
      customer_id,
      transaction_type,
      bill_amount,
      earned_points,
      redeemed_points,
      points_balance_before,
      points_balance_after,
    }
  }) {
    const knex = this;
    console.log("bill_id", billno);
    console.log("customer_id", customer_id);
    console.log("transaction_type", transaction_type);
    console.log("bill_amount", bill_amount);
    console.log("earned_points", earned_points);
    console.log("redeemed_points", redeemed_points);
    console.log("points_balance_before", points_balance_before);
    console.log("points_balance_after", points_balance_after);
    try {
      let result = await knex(LOYALTY_APPLY_DETAILS.NAME).where(LOYALTY_APPLY_DETAILS.COLUMNS.BILL_NO, billno).first();

      console.log("result", result);

      if (result) {
        throw CustomError.create({
          httpCode: StatusCodes.BAD_REQUEST,
          message: "loyalty points already applied for this billno",
          property: "billno",
          code: "BILLNO_EXIST"
        });
      }
      const query = knex(LOYALTY_APPLY_DETAILS.NAME)
        .insert({
          [LOYALTY_APPLY_DETAILS.COLUMNS.BILL_NO]: billno,
          [LOYALTY_APPLY_DETAILS.COLUMNS.CUSTOMER_ID]: customer_id,
          [LOYALTY_APPLY_DETAILS.COLUMNS.TRANSACTION_TYPE]: transaction_type,
          [LOYALTY_APPLY_DETAILS.COLUMNS.BILL_AMOUNT]: bill_amount,
          [LOYALTY_APPLY_DETAILS.COLUMNS.EARNED_POINTS]: earned_points,
          [LOYALTY_APPLY_DETAILS.COLUMNS.REDEEMED_POINTS]: redeemed_points,
          [LOYALTY_APPLY_DETAILS.COLUMNS.POINTS_BALANCE_BEFORE]: points_balance_before,
          [LOYALTY_APPLY_DETAILS.COLUMNS.POINTS_BALANCE_AFTER]: points_balance_after,
        });

      const response = await query;
      return response;
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  }
  async function saveLoyaltyApplyDetailsupdate({

    logTrace,
    body,
    input: {
      billno,
      customer_id,
      bill_amount,
      earned_points,
      redeemed_points,
      points_balance_before,
      points_balance_after,
    }
  }) {
    const knex = this;

    try {
      const query = knex(LOYALTY_APPLY_DETAILS.NAME)
        .update({
          [LOYALTY_APPLY_DETAILS.COLUMNS.BILL_AMOUNT]: bill_amount,
          [LOYALTY_APPLY_DETAILS.COLUMNS.EARNED_POINTS]: earned_points,
          [LOYALTY_APPLY_DETAILS.COLUMNS.POINTS_BALANCE_BEFORE]: points_balance_before,
          [LOYALTY_APPLY_DETAILS.COLUMNS.POINTS_BALANCE_AFTER]: points_balance_after,
        })
        .where(LOYALTY_APPLY_DETAILS.COLUMNS.BILL_NO, billno)
        .where(LOYALTY_APPLY_DETAILS.COLUMNS.CUSTOMER_ID, customer_id);

      // .where(LOYALTY_APPLY_DETAILS.COLUMNS.COUNTER, counter_no)
      // .where(LOYALTY_APPLY_DETAILS.COLUMNS.OUTLET_ID, outlet_id);
      logQuery({
        logger: fastify.log,
        query,
        context: "Save Loyalty Apply Details Update",
        logTrace
      });
      const response = await query;
      return response;
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  }

  async function getLoyaltyApplyDetails({
    logTrace,
    body,
    input: {
      billno,
      customer_id,
      // transaction_type,
      // bill_amount,
      // earned_points,
      // redeemed_points,
      // points_balance_before,
      // points_balance_after,
    }
  }) {
    const knex = this;
    // console.log("bill_id", billno);
    // console.log("customer_id", customer_id);
    // console.log("transaction_type", transaction_type);
    // console.log("bill_amount", bill_amount);
    // console.log("earned_points", earned_points);
    // console.log("redeemed_points", redeemed_points);
    // console.log("points_balance_before", points_balance_before);
    // console.log("points_balance_after", points_balance_after);
    try {
      let query = await knex(LOYALTY_APPLY_DETAILS.NAME)
        .where(LOYALTY_APPLY_DETAILS.COLUMNS.BILL_NO, billno)
        .where(LOYALTY_APPLY_DETAILS.COLUMNS.CUSTOMER_ID, customer_id)
        .first()
        ;
      // if (result) {
      //   throw CustomError.create({
      //     httpCode: StatusCodes.BAD_REQUEST,
      //     message: "loyalty points already applied for this billno",
      //     property: "billno",
      //     code: "BILLNO_EXIST"
      //   });
      // }


      const response = await query;
      console.log("responseGetloyality", response);

      return response;
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  }

  async function deleteLoyaltyApplyDetails({
    logTrace,
    body,
    input: {
      billno,
      customer_id,
      // transaction_type,
      // bill_amount,
      // earned_points,
      // redeemed_points,
      // points_balance_before,
      // points_balance_after,
    }
  }) {
    const knex = this;
    console.log("bill_id", billno);
    // console.log("customer_id", customer_id);
    // console.log("transaction_type", transaction_type);
    // console.log("bill_amount", bill_amount);
    // console.log("earned_points", earned_points);
    // console.log("redeemed_points", redeemed_points);
    // console.log("points_balance_before", points_balance_before);
    // console.log("points_balance_after", points_balance_after);

    try {
      const deletedCount = await knex(LOYALTY_APPLY_DETAILS.NAME)
        .where(LOYALTY_APPLY_DETAILS.COLUMNS.BILL_NO, billno)
        .andWhere(LOYALTY_APPLY_DETAILS.COLUMNS.CUSTOMER_ID, customer_id)
        .andWhere(LOYALTY_APPLY_DETAILS.COLUMNS.TRANSACTION_TYPE, "REDEEM")
        .del();

      console.log("deletedCount", deletedCount);

      return deletedCount;
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  }
  return {
    getProductInfo,
    getClearanceInfo,
    getOfferInfo,
    getSpecialOfferInfo,
    getDiscountInfo,
    getPriceOffInfo,
    getOfferCount,
    getOfferDetails,
    getSchemeDetails,
    getSchemeCount,
    getItemsInCart,
    getQuantityOfItemInCart,
    updateQuantityOfItemInCart,
    addItemToCart,
    deleteItemFromCart,
    clearCartItems,
    specialCoupon,
    insertCoupon,
    insertSpecialCoupon,
    specialCouponIssue,
    specialCouponCheck,
    billSave,
    YearSaleSave,
    CounterSaleSave,
    ItemDetailsSave,
    MemberItemSave,
    GroupSalesSave,
    HourSalesSave,
    settingInfo,
    getCompanyGstInfo,
    SchemaLogSave,
    OfferLogSave,
    getCompanyInfo,
    LoyalityPointSave,
    loyaltyInfo,
    newmemberInfo,
    countercloseInfo,
    weighingInfo,
    getcompanyweighing,
    getcprtoption,
    denominationInfo,
    productmasterblncupdate,
    specclearCartItems,
    getCartlist,
    getPaymentDetails,
    getPaymentgateway,
    getBillPrint,
    getCartPrintSummary,
    daySaleSave,
    billPdfSummary,
    updateQuantityOfRoundOffCart,
    getBatchDetails,
    getItemsLoyalityCart,
    getItemsLoyalityPointUpdate,
    saveLoyaltyApplyDetails,
    saveLoyaltyApplyDetailsupdate,
    getLoyaltyApplyDetails,
    deleteLoyaltyApplyDetails
  };
}

module.exports = productRepo;
