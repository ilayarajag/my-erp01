const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const { logQuery } = require("../../commons/helpers");
const axios = require("axios");
const { PENDINGBILL, COUNTER_CART } = require("../commons/constants");
const { exists } = require("fs-extra");

function pendingbillRepo(fastify) {

  async function CartTopendingBill({
    logTrace,
    users_id,
    counter_no,
    outlet_id,
    customer_id,
    cartItemsResult,
    bill_no

  }) {
    const knex = this;
  //console.log("cartItemsResult",cartItemsResult);
  
    for (const orderline of cartItemsResult.cart_lines) {
      const query = {
        [PENDINGBILL.COLUMNS.PROD_ID]: orderline.prod_id,
        [PENDINGBILL.COLUMNS.COUNTER_NO]: counter_no,
        [PENDINGBILL.COLUMNS.QTY]: orderline.qty,
        [PENDINGBILL.COLUMNS.USERS_ID]: users_id,
        [PENDINGBILL.COLUMNS.DISCOUNT_AMOUNT]: orderline.discount_amount,
        [PENDINGBILL.COLUMNS.SALES_RATE]: orderline.sales_rate,
        [PENDINGBILL.COLUMNS.MRP]: orderline.mrp,
        [PENDINGBILL.COLUMNS.BARCODE]: orderline.barcode,
        [PENDINGBILL.COLUMNS.COUPON_CODE]: orderline.coupon_code,
        [PENDINGBILL.COLUMNS.BILL_NO]: bill_no,
        [PENDINGBILL.COLUMNS.OUTLET_ID]: outlet_id,
        [PENDINGBILL.COLUMNS.STATUS]: 1,
        [PENDINGBILL.COLUMNS.CUSTOMER_ID]: customer_id,
       
              [PENDINGBILL.COLUMNS.PRODUCTS_CODE]: orderline.prod_code,
              [PENDINGBILL.COLUMNS.PRODUCTS_NAME]: orderline.prod_name,
              [PENDINGBILL.COLUMNS.PRODUCTS_RATE]: orderline.sale_rate,
              [PENDINGBILL.COLUMNS.PRODUCTS_OFFER]: orderline.discount,
              [PENDINGBILL.COLUMNS.MINIMUM_SALES_QTY]: orderline.minimum_sales_qty,
              [PENDINGBILL.COLUMNS.MAXIMUM_SALES_QTY]: orderline.maximum_sales_qty,
              [PENDINGBILL.COLUMNS.STOCK_STATUS]: orderline.stock_status,
              [PENDINGBILL.COLUMNS.PACKING_WEIGHT]: orderline.packing_weight,
              [PENDINGBILL.COLUMNS.GST]: orderline.cgst,
              [PENDINGBILL.COLUMNS.IGST]: orderline.cgst,
              [PENDINGBILL.COLUMNS.CESS]: orderline.cess,
                [PENDINGBILL.COLUMNS.BRAND_NAME]: orderline.brand_name,
                  [PENDINGBILL.COLUMNS.GROUP_NAME]: orderline.brand_name,
  
              [PENDINGBILL.COLUMNS.UNITS_ID]: orderline.prod_uom,
              [PENDINGBILL.COLUMNS.MAIN_CATEGORY_ID]: orderline.main_cat_id,
              [PENDINGBILL.COLUMNS.SUB_CATEGORY_ID]: orderline.sub_cat_id,
              [PENDINGBILL.COLUMNS.UNITS_NAME]: orderline.uom_name,
              [PENDINGBILL.COLUMNS.CATEGORY_NAME]: orderline.main_category_name,
              [PENDINGBILL.COLUMNS.SUBCATEGORY_NAME]: orderline.sub_category_name,
              [PENDINGBILL.COLUMNS.CREATED_AT]: new Date().toISOString(),
              [PENDINGBILL.COLUMNS.UPDATED_AT]: new Date().toISOString(),

           
      };
      try {
        await knex(`${PENDINGBILL.NAME}`).insert(query);
      }
      catch (error) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_FOUND,
          message: "Add Item To Pending Bill",
          property: "",
          code: "NOT_FOUND"
        });
      }
    }




    return { success: true };
  }
  async function bendingbilltoCart({
    users_id,
    counter_no,
    pendingItems,
    bill_no,
    outlet_id

  }) {
    const knex = this;
    console.log("pendingItems",pendingItems);
    
    for (const orderline of pendingItems) {
      const query = {
        [COUNTER_CART.COLUMNS.PROD_ID]: orderline.prod_id,
        [COUNTER_CART.COLUMNS.COUNTER_NO]: counter_no,
        [COUNTER_CART.COLUMNS.QTY]: orderline.qty,
        [COUNTER_CART.COLUMNS.USERS_ID]: users_id,
        [COUNTER_CART.COLUMNS.DISCOUNT_AMOUNT]: orderline.discount_amount,
        [COUNTER_CART.COLUMNS.SALES_RATE]: orderline.sales_rate,
        [COUNTER_CART.COLUMNS.MRP]: orderline.mrp,
        [COUNTER_CART.COLUMNS.BARCODE]: orderline.barcode,
        [COUNTER_CART.COLUMNS.COUPON_CODE]: orderline.coupon_code,
        [COUNTER_CART.COLUMNS.OUTLET_ID]: outlet_id,
        [COUNTER_CART.COLUMNS.CREATED_AT]: new Date().toISOString(),
        [COUNTER_CART.COLUMNS.CUSTOMERS_ID]: orderline.customers_id,
              [COUNTER_CART.COLUMNS.PRODUCTS_CODE]: orderline.products_code,
              [COUNTER_CART.COLUMNS.PRODUCTS_NAME]: orderline.products_name,
              [COUNTER_CART.COLUMNS.PRODUCTS_OFFER]: orderline.discount,
              [COUNTER_CART.COLUMNS.MINIMUM_SALES_QTY]: orderline.minimum_sales_qty,
              [COUNTER_CART.COLUMNS.MAXIMUM_SALES_QTY]: orderline.maximum_sales_qty,
              [COUNTER_CART.COLUMNS.STOCK_STATUS]: orderline.stock_status,
              [COUNTER_CART.COLUMNS.PACKING_WEIGHT]: orderline.packing_weight,
              [COUNTER_CART.COLUMNS.GST]: orderline.gst,
              [COUNTER_CART.COLUMNS.IGST]: orderline.gst,
              [COUNTER_CART.COLUMNS.CESS]: orderline.cess,
               [COUNTER_CART.COLUMNS.BRAND_NAME]: orderline.brand_name,
              [COUNTER_CART.COLUMNS.GROUP_NAME]: orderline.brand_name,
              [COUNTER_CART.COLUMNS.UNITS_ID]: orderline.units_id,
              [COUNTER_CART.COLUMNS.MAIN_CATEGORY_ID]: orderline.main_category_id,
              [COUNTER_CART.COLUMNS.SUB_CATEGORY_ID]: orderline.sub_category_id,
              [COUNTER_CART.COLUMNS.UNITS_NAME]: orderline.units_name,
              [COUNTER_CART.COLUMNS.CATEGORY_NAME]: orderline.category_name,
              [COUNTER_CART.COLUMNS.SUBCATEGORY_NAME]: orderline.subcategory_name,

      };


     console.log("orderline", orderline);
      try {

        await knex(`${COUNTER_CART.NAME}`).insert(query);
      } catch (error) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_FOUND,
          message: "Retrieve item pending to cart",
          property: "",
          code: "NOT_FOUND"
        });
       // console.log(error);

      }
    }

    return { success: true };
  }
  async function getPendingBillData({
    logTrace,
    users_id,
    counter_no,
    bill_no,
    outlet_id

  }) {
    const knex = this;
    const query = knex(PENDINGBILL.NAME)
      .select(`${PENDINGBILL.NAME}.*`)
      .where(`${PENDINGBILL.COLUMNS.USERS_ID}`, users_id)
      .andWhere(`${PENDINGBILL.COLUMNS.COUNTER_NO}`, counter_no)
      .andWhere(`${PENDINGBILL.COLUMNS.OUTLET_ID}`, outlet_id)
      .andWhere(`${PENDINGBILL.COLUMNS.BILL_NO}`, bill_no);
    logQuery({
      logger: fastify.log,
      query,
      context: "Get Items at pending Bill Info",
      logTrace
    });
    const response = await query;
    if (!response.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Items not found",
        property: "",
        code: "NOT_FOUND"
      });
    }
    return response;
  }

  async function getPendingBilloverallgetData({
    logTrace,
    users_id,
    counter_no,
    outlet_id

  }) {
    const knex = this;
    const query = knex(PENDINGBILL.NAME)
      .select(`${PENDINGBILL.NAME}.counter_no`, `${PENDINGBILL.NAME}.bill_no`)
      .where(`${PENDINGBILL.COLUMNS.USERS_ID}`, users_id)
      .andWhere(`${PENDINGBILL.COLUMNS.OUTLET_ID}`, outlet_id)
      .andWhere(`${PENDINGBILL.COLUMNS.COUNTER_NO}`, counter_no);
    logQuery({
      logger: fastify.log,
      query,
      context: "Get Items at pending Bill Info",
      logTrace
    });
    const response = await query;
    if (!response.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Items not found",
        property: "",
        code: "NOT_FOUND"
      });
    }
    const uniqueBillNos = new Set(response.map(item => item.bill_no));

    return [...uniqueBillNos];
  }

  async function getPendingBillClearData({
    logTrace,
    users_id,
    counter_no,
    bill_no,
    outlet_id

  }) {
    const knex = this;
    const query = knex(PENDINGBILL.NAME)
      .where(`${PENDINGBILL.COLUMNS.USERS_ID}`, users_id)
      .andWhere(`${PENDINGBILL.COLUMNS.COUNTER_NO}`, counter_no)
      .andWhere(`${PENDINGBILL.COLUMNS.OUTLET_ID}`, outlet_id)
      .andWhere(`${PENDINGBILL.COLUMNS.BILL_NO}`, bill_no)
      
     .del();
    logQuery({
      logger: fastify.log,
      query,
      context: "Delete at pending Bill Info",
      logTrace
    });
    const response = await query;

    return { success: true };
  }
  return {
    CartTopendingBill,
    bendingbilltoCart,
    getPendingBillData,
    getPendingBillClearData,
    getPendingBilloverallgetData
  };
}

module.exports = pendingbillRepo;
