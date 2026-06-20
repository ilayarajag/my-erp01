const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const { logQuery } = require("../../commons/helpers");
const axios = require('axios');
const { ITEM, UNITS, OUTLET_PRODUCT_MAPPING, MAIN_CATEGORY, SUB_CATEGORY,HEADS } = require("../commons/constants");
// const { exists } = require("fs-extra");

function getcodeRepo(fastify) {

  async function getProductcodeInfo({ code, outlet_id, params, logTrace, userDetails }) {
    const knex = this;

    const input = code.barcode;
    console.log("input", input);
    const isNumeric = /^\d+$/.test(input);
    const length = input.length;

    //  const query = knex(ITEM.NAME)
    //       .distinct()
    //       .select([
    //         `${ITEM.NAME}.${ITEM.COLUMNS.ID} AS prod_id`,
    //         `${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_CODE} AS prod_code`,
    //         `${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_NAME} AS prod_name`,
    //         `${ITEM.NAME}.${ITEM.COLUMNS.BARCODE} AS barcode`,
    //         `${ITEM.NAME}.${ITEM.COLUMNS.MAIN_CATEGORY_ID} AS main_category_id`,
    //         `${ITEM.NAME}.${ITEM.COLUMNS.SUB_CATEGORY_ID} AS sub_category_id`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BCID} AS bcid`,
    //         `${ITEM.NAME}.${ITEM.COLUMNS.MCID} AS mcid`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PRODUCT_ID} AS prod_id`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.HSN} AS hsn`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.SALES_RATE} AS sales_rate`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PURCHASE_RATE} AS purchase_rate`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.GST} AS gst`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.IS_ACTIVE} AS active`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.MBQ} AS mpq`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.GR_WT} AS gr_wt`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.DIS} AS discount`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.STKHOLD} AS stkhold`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PTAX} AS ptax`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.STAX} AS stax`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.MIN_STOCK}`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.MRP} AS mrp`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.ALLOW_NEG_STK} AS allow_neg_stk`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.NEGATIVE_STOCK} AS negative_stock`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.RATE_EDIT} AS rate_edit`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.DECIMAL1} AS decimal1`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.ACTIVE} AS active`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.LPOINT} AS lpoint`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.CPOINT} AS cpoint`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.IS_ACTIVE} AS active`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.OUTLET_ID} AS outlet_id`,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.IS_ACTIVE} AS is_active`,
    //         `${MAIN_CATEGORY.NAME}.${MAIN_CATEGORY.COLUMNS.CATEGORY_NAME}
    //           AS category_name`,
    //         `${SUB_CATEGORY.NAME}.${SUB_CATEGORY.COLUMNS.SUBCATEGORY_NAME} AS sub_category_name`,
    //         `${UNITS.NAME}.${UNITS.COLUMNS.UNITS_SHORT_NAME} AS prod_uom`,
    //       ])
    //       .leftJoin(
    //         UNITS.NAME,
    //         `${UNITS.NAME}.${UNITS.COLUMNS.ID}`,
    //         `${ITEM.NAME}.${ITEM.COLUMNS.UOM_ID}`
    //       )
    //       .leftJoin(
    //         OUTLET_PRODUCT_MAPPING.NAME,
    //         `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PRODUCT_ID}`,
    //         `${ITEM.NAME}.${ITEM.COLUMNS.ID}`
    //       )

    //       .leftJoin(
    //         MAIN_CATEGORY.NAME,
    //         `${MAIN_CATEGORY.NAME}.${MAIN_CATEGORY.COLUMNS.ID}`,
    //         `${ITEM.NAME}.${ITEM.COLUMNS.MAIN_CATEGORY_ID}`
    //       )
    //       .leftJoin(
    //         SUB_CATEGORY.NAME,
    //         `${SUB_CATEGORY.NAME}.${SUB_CATEGORY.COLUMNS.ID}`,
    //         `${ITEM.NAME}.${ITEM.COLUMNS.SUB_CATEGORY_ID}`
    //       )
    //       .where(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE}`, input)
    //       .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE1}`, input)
    //       .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE2}`, input)
    //       .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE3}`, input)
    //       .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE4}`, input)
    //       .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_CODE}`, input)
    //       .orWhere(`${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BARCODE}`, input)
    //       .andWhere(`${ITEM.NAME}.${ITEM.COLUMNS.IS_ACTIVE}`, true)
    //       .andWhere(`${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.OUTLET_ID}`, outlet_id)
    //       .andWhere(`${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.IS_ACTIVE}`, true)
    //       ;
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
        this.where(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE}`, input)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE1}`, input)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE2}`, input)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE3}`, input)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE4}`, input)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_CODE}`, input)
         .orWhere(`${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BARCODE}`, input)
         .orWhere(`${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PRODUCT_CODE}`, input)
      })
      .andWhere(`${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.OUTLET_ID}`, outlet_id)


      .andWhere(`${ITEM.NAME}.${ITEM.COLUMNS.IS_ACTIVE}`, true);

    logQuery({
      logger: fastify.log,
      query,
      context: "Get Product-mapping Info",
      logTrace
    });
  
    const response = await query;
    //console.log("codeSearch",response);
    
    if (!response.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Product is not mapped from the outlet",
        property: "",
        code: "NOT_FOUND"
      });
    }

    return response[0];
  }
  return {
    getProductcodeInfo
  };
}


module.exports = getcodeRepo;
