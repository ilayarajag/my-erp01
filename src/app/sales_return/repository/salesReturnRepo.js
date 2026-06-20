const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const crypto = require("crypto");
const { logQuery } = require("../../commons/helpers");
const { OUTLET_PRODUCT_MAPPING, OUT_BILL_MASTER, OUT_BILL_DETAIL } = require("../../sales/commons/constants");
const { SALES_RETURN_MASTER, SALES_RETURN_DETAIL, SALES_RETURN_COUPON, SALES_RETURN_COUPON_USAGE, STOCK_M_LEDGER, SALES_RETURN_AUDIT, REGION } = require("../commons/constants");
const { OUTLETS, OUTLET_MEMBERS, MAIN_CATEGORY, SUB_CATEGORY, MERCHANT_CATEGORY, HEADS, TYPEDESIGN, ITEM, UNITS } = require("../../sales/commons/constants");
const { USERS, USER_COUNTER_MAPPING } = require("../../accounts/admin/commons/constants");


const addDays = (date, days) => {
  const value = new Date(date);
  value.setDate(value.getDate() + Number(days || 180));
  return value;
};

const toNumber = value => Number(value || 0);

const formatDatePart = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

const formatDate = d => {
  if (!d) return "";
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const getFinancialYear = (date = new Date()) => {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  if (month >= 4) {
    return `${year}_${year + 1}`;
  } else {
    return `${year - 1}_${year}`;
  }
};

function salesReturnRepo(fastify) {
  async function nextDocumentNo(trx, tableName, financialYear) {
    const latestRow = await trx(tableName)
      .select(trx.raw(`
      MAX(
        CAST(
          split_part(${SALES_RETURN_MASTER.COLUMNS.SR_NO}, '_', 1)
          AS INTEGER
        )
      ) AS max_sr_no
    `))
      .where(SALES_RETURN_MASTER.COLUMNS.FINANCIAL_YEAR, financialYear)
      .first();

    const maxSrNo = latestRow ? Number(latestRow.max_sr_no) : 0;
    return `${String(maxSrNo + 1)}_${financialYear}`;
  }

  async function couponGeneration(prefix = "SRC") {
    const now = new Date();

    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);

    const datePart = `${dd}${mm}${yy}`;

    const random = crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase();

    return `${prefix}${datePart}${random}`;
  }

  async function generateUniqueCoupon(trx) {
    const MAX_RETRY = 5;

    for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {

      const couponNo = couponGeneration("SRC");

      const exists = await trx(SALES_RETURN_COUPON.NAME)
        .select(SALES_RETURN_COUPON.COLUMNS.COUPON_NO)
        .where({
          [SALES_RETURN_COUPON.COLUMNS.COUPON_NO]: couponNo
        })
        .first();

      if (!exists) {
        return couponNo;
      }
    }

    throw CustomError.create({
      httpCode: StatusCodes.NOT_FOUND,
      message: "Unable to generate unique coupon number",
      property: "coupon_no",
      code: "NOT_FOUND"
    });
  }

  async function fetchBillDetails({ body, logTrace }) {
    const knex = this;
    const outletId = Number(body.outlet_id);
    const billRefNo = body.bill_ref_no;

    const billQuery = knex(OUT_BILL_MASTER.NAME)
      .select([
        `${OUT_BILL_MASTER.COLUMNS.BILL_NO} as billno`,
        `${OUT_BILL_MASTER.COLUMNS.LOC_ID} as outlet_id`,
        `${OUT_BILL_MASTER.COLUMNS.LOCNAME} as outlet_name`,
        `${OUT_BILL_MASTER.COLUMNS.COUNTER} as counter_no`,
        `${OUT_BILL_MASTER.COLUMNS.BILL_REF_NO} as bill_ref_no`,
        `${OUT_BILL_MASTER.COLUMNS.FINANCIAL_YEAR} as financial_year`,
        `${OUT_BILL_MASTER.COLUMNS.BILL_DATE} as bill_date`,
        `${OUT_BILL_MASTER.COLUMNS.CUSTOMER_ID} as customer_id`,
        `${OUT_BILL_MASTER.COLUMNS.PARTY_NAME} as customer_name`,
        `${OUT_BILL_MASTER.COLUMNS.CUSTOMER_MOBILE} as customer_mobile`,
        `${OUT_BILL_MASTER.COLUMNS.UID} as user_id`,
        `${OUT_BILL_MASTER.COLUMNS.USERNAME} as user_name`,
        `${OUT_BILL_MASTER.COLUMNS.SUB_TOTAL_AMT} as sub_total_amt`,
        `${OUT_BILL_MASTER.COLUMNS.BDIS} as discount`,
        `${OUT_BILL_MASTER.COLUMNS.BAMT} as grand_total`,
        `${OUT_BILL_MASTER.COLUMNS.GST} as gst`,
        `${OUT_BILL_MASTER.COLUMNS.BCASH} as bill_cash`,
        `${OUT_BILL_MASTER.COLUMNS.BCARD} as bill_card`,
        `${OUT_BILL_MASTER.COLUMNS.BUPI} as bill_upi`,
        `${OUT_BILL_MASTER.COLUMNS.ROUND_OFF} as round_off`,
      ])
      .where(OUT_BILL_MASTER.COLUMNS.LOC_ID, outletId)
      .where(OUT_BILL_MASTER.COLUMNS.BILL_REF_NO, billRefNo)
      .first();

    logQuery({
      logger: fastify.log,
      query: billQuery,
      context: "Sales Return Billwise Master Fetch",
      logTrace
    });

    const bill = await billQuery;
    if (!bill) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Original bill not found",
        property: "bill_ref_no",
        code: "NOT_FOUND"
      });
    }

    const billNo = bill.billno;
    const detailQuery = knex(OUT_BILL_DETAIL.NAME)
      .where(OUT_BILL_DETAIL.COLUMNS.LOC_ID, outletId)
      .where(OUT_BILL_DETAIL.COLUMNS.BILL_REF_NO, billRefNo)
      .select([
        `${OUT_BILL_DETAIL.COLUMNS.PROD_ID} as product_id`,
        `${OUT_BILL_DETAIL.COLUMNS.PRODCODE} as product_code`,
        `${OUT_BILL_DETAIL.COLUMNS.PROD_QTY} as sold_qty`,
        `${OUT_BILL_DETAIL.COLUMNS.UOMNAME} as uom_name`,
        `${OUT_BILL_DETAIL.COLUMNS.PRODNAME} as product_name`,
        `${OUT_BILL_DETAIL.COLUMNS.MRP} as mrp`,
        `${OUT_BILL_DETAIL.COLUMNS.PROD_RATE} as rate`,
        `${OUT_BILL_DETAIL.COLUMNS.DIS_AMT} as discount_amount`,
        `${OUT_BILL_DETAIL.COLUMNS.GST} as gst_per`,
        `${OUT_BILL_DETAIL.COLUMNS.CESS} as cess_per`,
        `${OUT_BILL_DETAIL.COLUMNS.BARCODE} as barcode`,
        `${OUT_BILL_DETAIL.COLUMNS.BILLDATE} as bill_date`
      ]);

    logQuery({
      logger: fastify.log,
      query: detailQuery,
      context: "Sales Return Billwise Detail Fetch",
      logTrace
    });

    const billItems = await detailQuery;
    const returnedRows = await knex(SALES_RETURN_MASTER.NAME)
      .join(
        SALES_RETURN_DETAIL.NAME,
        `${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.ID}`,
        `${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.SALES_RETURN_MST_ID}`
      )
      .where(`${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.OUTLET_ID}`, outletId)
      .where(`${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.BILL_NO}`, billNo)
      .whereNot(`${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.STATUS}`, "CANCELLED")
      .groupBy(`${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.PRODUCT_ID}`)
      .select([
        `${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.PRODUCT_ID} as product_id`,
        knex.raw(`COALESCE(SUM(${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.RETURN_QTY}),0) as returned_qty`)
      ]);

    const returnedMap = new Map(
      returnedRows.map(row => [Number(row.product_id), toNumber(row.returned_qty)])
    );

    const response = {
      bill,
      items: billItems.map(item => {
        const soldQty = toNumber(item.sold_qty);
        const returnedQty = returnedMap.get(Number(item.product_id)) || 0;
        const mrp = Number(item.mrp || 0);
        const sales_rate = Number(item.rate || 0);
        const discount_amount = Number(item.discount_amount || 0);
        const gstPer = Number(item.gst_per || 0);
        const cessPer = Number(item.cess_per || 0);
        const totalAmount = (soldQty * sales_rate);
        const gst_amount = (totalAmount * gstPer) / 100;
        const cess_amount = (totalAmount * cessPer) / 100;
        return {
          ...item,
          net_amount: Number(totalAmount).toFixed(2),
          gst_amount: Number(gst_amount).toFixed(2),
          cess_amount: Number(cess_amount).toFixed(2),
          returned_qty: returnedQty,
          available_return_qty: Math.max(0, soldQty - returnedQty).toFixed(3)
        };
      })
    };

    return response
  }

  async function validateBillwiseReturn(trx, { body }) {
    if (body.return_type !== "BILLWISE") {
      return { bill: null, details: body.details };
    }

    if (!body.bill_ref_no) {
      throw CustomError.create({
        httpCode: StatusCodes.BAD_REQUEST,
        message: "Bill reference number is required for billwise return",
        property: "bill_ref_no",
        code: "REQUIRED"
      });
    }

    const bill = await trx(OUT_BILL_MASTER.NAME)
      .where(OUT_BILL_MASTER.COLUMNS.LOC_ID, body.outlet_id)
      .where(OUT_BILL_MASTER.COLUMNS.BILL_REF_NO, body.bill_ref_no)
      .first();

    if (!bill) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Original bill not found",
        property: "bill_ref_no",
        code: "NOT_FOUND"
      });
    }

    body.bill_no = bill[OUT_BILL_MASTER.COLUMNS.BILL_NO];

    // if (String(bill[OUT_BILL_MASTER.COLUMNS.STATUS] || "").toUpperCase() ) {
    //   throw CustomError.create({
    //     httpCode: StatusCodes.BAD_REQUEST,
    //     message: "Return not allowed for cancelled bill",
    //     property: "bill_ref_no",
    //     code: "BILL_CANCELLED"
    //   });
    // }

    const normalizedDetails = [];

    for (const item of body.details) {

      const billItem = await trx(OUT_BILL_DETAIL.NAME)
        .where(
          OUT_BILL_DETAIL.COLUMNS.LOC_ID,
          body.outlet_id
        )
        .where(
          OUT_BILL_DETAIL.COLUMNS.BILL_REF_NO,
          body.bill_ref_no
        )
        .where(
          OUT_BILL_DETAIL.COLUMNS.PROD_ID,
          item.product_id
        )
        .first();

      if (!billItem) {
        throw CustomError.create({
          httpCode: StatusCodes.BAD_REQUEST,
          message: "Product is not present in original bill",
          property: "details.product_id",
          code: "INVALID_PRODUCT"
        });
      }

      const [returned] = await trx(SALES_RETURN_MASTER.NAME)
        .join(
          SALES_RETURN_DETAIL.NAME,
          `${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.ID}`,
          `${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.SALES_RETURN_MST_ID}`
        )
        .where(
          `${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.OUTLET_ID}`,
          body.outlet_id
        )
        .where(
          `${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.BILL_REF_NO}`,
          body.bill_ref_no
        )
        .where(
          `${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.PRODUCT_ID}`,
          item.product_id
        )
        .whereNot(
          `${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.STATUS}`,
          "CANCELLED"
        )
        .sum({
          returned_qty: `${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.RETURN_QTY}`
        });

      const soldQty = toNumber(billItem[OUT_BILL_DETAIL.COLUMNS.PROD_QTY]);


      const alreadyReturned = toNumber(returned.returned_qty);

      const requestedQty = toNumber(item.return_qty);
      const uomName = String(
        billItem[OUT_BILL_DETAIL.COLUMNS.UOMNAME] || ""
      ).toLowerCase();

      // Non-KGS items: only integers allowed
      if (uomName !== "kgs") {
        if (!Number.isInteger(requestedQty)) {
          throw CustomError.create({
            httpCode: StatusCodes.BAD_REQUEST,
            message: "Only whole quantities are allowed for this item",
            property: "return_qty",
            code: "INVALID_QUANTITY"
          });
        }
      }

      if (requestedQty + alreadyReturned > soldQty) {
        throw CustomError.create({
          httpCode: StatusCodes.BAD_REQUEST,
          message: "Return quantity cannot exceed sold quantity",
          property: "details.return_qty",
          code: "OVER_RETURN"
        });
      }

      const rate = toNumber(billItem[OUT_BILL_DETAIL.COLUMNS.PROD_RATE]);

      const grossAmount = Number((requestedQty * rate).toFixed(2));


      const discountAmount = (Number((billItem[OUT_BILL_DETAIL.COLUMNS.DIS_AMT] || 0) / billItem[OUT_BILL_DETAIL.COLUMNS.PROD_QTY] * requestedQty)).toFixed(2);

      const totalAmount = Number((grossAmount).toFixed(2));
      const taxableAmount = Number((grossAmount).toFixed(2));

      const gstPer = toNumber(billItem[OUT_BILL_DETAIL.COLUMNS.GST] || billItem[OUT_BILL_DETAIL.COLUMNS.VAT]);

      const cessPer = toNumber(billItem[OUT_BILL_DETAIL.COLUMNS.CESS]);
      const gstAmount = Number(((taxableAmount * gstPer) / 100).toFixed(2));
      const cessAmount = Number(((taxableAmount * cessPer) / 100).toFixed(2));
      const netAmount = Number((totalAmount).toFixed(2));

      normalizedDetails.push({
        product_id: item.product_id,
        batch_no: item.batch_no || null,
        actual_qty: soldQty,
        return_qty: requestedQty,
        rate,
        mrp: toNumber(billItem[OUT_BILL_DETAIL.COLUMNS.MRP]),
        discount_amount: discountAmount,
        gst: gstPer,
        cgst: gstPer / 2,
        sgst: gstPer / 2,
        gst_amount: gstAmount,
        cess: cessPer,
        cess_amount: cessAmount,
        amount: netAmount
      });
    }

    return {
      bill,
      details: normalizedDetails
    };
  }

  async function fetchGeneralReturnProduct(knex, { outletId, productCode, productId, logTrace }) {
    const searchCode = productCode === undefined || productCode === null
      ? ""
      : String(productCode).trim();

    const productQuery = knex(ITEM.NAME)
      .leftJoin(OUTLET_PRODUCT_MAPPING.NAME, function () {
        this.on(
          `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PRODUCT_ID}`,
          `${ITEM.NAME}.${ITEM.COLUMNS.ID}`
        ).andOn(
          `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.OUTLET_ID}`,
          knex.raw("?", [outletId])
        );
      })
      .leftJoin(
        UNITS.NAME,
        `${UNITS.NAME}.${UNITS.COLUMNS.ID}`,
        `${ITEM.NAME}.${ITEM.COLUMNS.UOM_ID}`
      )
      .select([
        `${ITEM.NAME}.${ITEM.COLUMNS.ID} as product_id`,
        `${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_CODE} as product_code`,
        `${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_NAME} as product_name`,
        `${ITEM.NAME}.${ITEM.COLUMNS.BALANCE} as item_balance`,
        `${ITEM.NAME}.${ITEM.COLUMNS.SALE_RATE} as item_sale_rate`,
        `${ITEM.NAME}.${ITEM.COLUMNS.GST} as item_gst`,
        `${ITEM.NAME}.${ITEM.COLUMNS.CESS} as item_cess`,
        `${UNITS.NAME}.${UNITS.COLUMNS.UNITS_SHORT_NAME} as uom_name`,

        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BALENCE_STOCK} as outlet_balance`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.SALES_RATE} as outlet_sale_rate`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.GST} as outlet_gst`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.CESS} as outlet_cess`,
        `${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BATCH_NO} as batch_no`
      ]);

    if (productId) {
      productQuery.where(`${ITEM.NAME}.${ITEM.COLUMNS.ID}`, Number(productId));
    } else if (searchCode.length >= 10) {
      productQuery.where(builder => {
        builder
          .where(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE}`, searchCode)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE1}`, searchCode)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE2}`, searchCode)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE3}`, searchCode)
          .orWhere(`${ITEM.NAME}.${ITEM.COLUMNS.BARCODE4}`, searchCode)
          .orWhere(`${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BARCODE}`, searchCode)
          .orWhere(`${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BARCODE1}`, searchCode)
          .orWhere(`${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BARCODE2}`, searchCode)
          .orWhere(`${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BARCODE3}`, searchCode)
          .orWhere(`${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.BARCODE4}`, searchCode);
      });
    } else if (searchCode) {
      productQuery.where(builder => {
        builder
          .where(`${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_CODE}`, searchCode)
          .orWhere(`${OUTLET_PRODUCT_MAPPING.NAME}.${OUTLET_PRODUCT_MAPPING.COLUMNS.PRODUCT_CODE}`, searchCode);
      });
    }

    logQuery({
      logger: fastify.log,
      query: productQuery,
      context: "General Sales Return Product Fetch",
      logTrace
    });

    const product = await productQuery.first();

    if (!product) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Product not found",
        property: "product_id",
        code: "PRODUCT_NOT_FOUND"
      });
    }

    const lastSale = await knex(OUT_BILL_DETAIL.NAME)
      .where(OUT_BILL_DETAIL.COLUMNS.LOC_ID, outletId)
      .where(OUT_BILL_DETAIL.COLUMNS.PROD_ID, product.product_id)
      .orderBy(OUT_BILL_DETAIL.COLUMNS.BILLDATE, "desc")
      .first([
        OUT_BILL_DETAIL.COLUMNS.PROD_RATE,
        OUT_BILL_DETAIL.COLUMNS.MRP,
        OUT_BILL_DETAIL.COLUMNS.DIS,
        OUT_BILL_DETAIL.COLUMNS.GST,
        OUT_BILL_DETAIL.COLUMNS.ID,
        OUT_BILL_DETAIL.COLUMNS.PROD_QTY,
        OUT_BILL_DETAIL.COLUMNS.DIS_AMT
      ]);

    const mrp = toNumber(
      lastSale?.[OUT_BILL_DETAIL.COLUMNS.MRP] ||
      product.outlet_sale_rate ||
      product.item_sale_rate
    );

    const saleRate = toNumber(
      lastSale?.[OUT_BILL_DETAIL.COLUMNS.PROD_RATE] ||
      product.outlet_sale_rate ||
      product.item_sale_rate
    );

    const gstPer = toNumber(
      lastSale?.[OUT_BILL_DETAIL.COLUMNS.GST] ||
      product.outlet_gst ||
      product.item_gst
    );

    const grossAmount = saleRate;

    const discountAmount = lastSale?.[OUT_BILL_DETAIL.COLUMNS.DIS_AMT] / lastSale?.[OUT_BILL_DETAIL.COLUMNS.PROD_QTY];
    const discountPer = (discountAmount / grossAmount) * 100;
    console.log(discountAmount)
    const taxableAmount = grossAmount;

    const gstAmount = (taxableAmount * gstPer) / 100;

    const finalAmount = taxableAmount;

    const returnRate = finalAmount;

    return {
      product_id: Number(product.product_id),
      product_code: product.product_code,
      product_name: product.product_name,
      uom_name: product.uom_name,
      batch_no: product.batch_no || null,

      balance_qty: toNumber(
        product.outlet_balance || product.item_balance
      ),

      mrp: Number(mrp.toFixed(2)),

      sale_rate: Number(saleRate.toFixed(2)),

      discount_amount: Number(
        discountAmount.toFixed(2)
      ),

      gst_per: Number(gstPer.toFixed(2)),

      gst_amount: Number(
        gstAmount.toFixed(2)
      ),

      cess_per: toNumber(
        product.outlet_cess || product.item_cess
      ),

      cess_amount: Number(
        ((taxableAmount * toNumber(product.outlet_cess || product.item_cess)) / 100).toFixed(2)
      ),

      return_rate: Number(
        returnRate.toFixed(2)
      ),

      rate_source: lastSale
        ? "LAST_SELLING_RATE"
        : "DEFAULT_RETURN_RATE"
    };
  }

  async function getGeneralReturnProduct({ body, logTrace }) {
    const knex = this;
    return fetchGeneralReturnProduct(knex, {
      outletId: Number(body.outlet_id),
      productCode: body.product_code,
      logTrace
    });
  }

  async function buildGeneralReturnDetails(knex, { outletId, details, logTrace }) {
    const normalizedDetails = [];

    for (const item of details) {
      const product = await fetchGeneralReturnProduct(knex, {
        outletId,
        productId: item.product_id,
        logTrace
      });

      const returnQty = toNumber(item.return_qty);
      const uomName = String(product.uom_name || "").toLowerCase();

      // Non-KGS items: only integers allowed
      if (uomName !== "kgs") {
        if (!Number.isInteger(returnQty)) {
          throw CustomError.create({
            httpCode: StatusCodes.BAD_REQUEST,
            message: "Only whole quantities are allowed for this item",
            property: "return_qty",
            code: "INVALID_QUANTITY"
          });
        }
      }

      const rate = toNumber(product.sale_rate);

      const grossAmount = Number((returnQty * rate).toFixed(2));

      const discountAmount =Number((toNumber(product.discount_amount) * returnQty).toFixed(2))

      const taxableAmount = Number((grossAmount).toFixed(2));

      const gstPer = toNumber(product.gst_per);

      const cessPer = toNumber(product.cess_per);

      const gstAmount = Number(((taxableAmount * gstPer) / 100).toFixed(2));

      const cessAmount = Number(((taxableAmount * cessPer) / 100).toFixed(2));

      const netAmount = Number((taxableAmount).toFixed(2));

      normalizedDetails.push({
        product_id: product.product_id,
        product_code: product.product_code,
        product_name: product.product_name,
        batch_no: product.batch_no,
        actual_qty: product.balance_qty,
        return_qty: returnQty,
        mrp: product.mrp,
        rate,
        discount_amount: discountAmount,
        gst: gstPer,
        cgst: gstPer / 2,
        sgst: gstPer / 2,
        gst_amount: gstAmount,
        cess: cessPer,
        cess_amount: cessAmount,
        amount: netAmount
      });
    }

    return normalizedDetails;
  }


  async function calculateStockAndUpdate(trx, { item, outletId, srNo, transactionType, userId }) {
    const product = await trx(OUTLET_PRODUCT_MAPPING.NAME)
      .where({
        [OUTLET_PRODUCT_MAPPING.COLUMNS.OUTLET_ID]: outletId,
        [OUTLET_PRODUCT_MAPPING.COLUMNS.PRODUCT_ID]: item.product_id
      })
      .first();

    if (!product) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Product not found",
        property: "details.product_id",
        code: "PRODUCT_NOT_FOUND"
      });
    }

    const currentStock = toNumber(product[OUTLET_PRODUCT_MAPPING.COLUMNS.BALENCE_STOCK]);
    const newStock = currentStock + toNumber(item.return_qty);


    await trx(OUTLET_PRODUCT_MAPPING.NAME)
      .where(OUTLET_PRODUCT_MAPPING.COLUMNS.PRODUCT_ID, item.product_id)
      .where(OUTLET_PRODUCT_MAPPING.COLUMNS.OUTLET_ID, outletId)
      .update({
        [OUTLET_PRODUCT_MAPPING.COLUMNS.BALENCE_STOCK]: newStock,
        [OUTLET_PRODUCT_MAPPING.COLUMNS.UPDATED_AT]: new Date()
      });

    await trx(STOCK_M_LEDGER.NAME).insert({
      [STOCK_M_LEDGER.COLUMNS.OUTLET_ID]: outletId,
      [STOCK_M_LEDGER.COLUMNS.PRODUCT_ID]: item.product_id,
      [STOCK_M_LEDGER.COLUMNS.BATCH_NO]: item.batch_no || null,
      [STOCK_M_LEDGER.COLUMNS.TRANSACTION_TYPE]: transactionType,
      [STOCK_M_LEDGER.COLUMNS.SR_NO]: srNo,
      [STOCK_M_LEDGER.COLUMNS.TRANSACTION_DATE]: new Date(),
      [STOCK_M_LEDGER.COLUMNS.INWARD_QTY]: item.return_qty,
      [STOCK_M_LEDGER.COLUMNS.OUTWARD_QTY]: 0,
      [STOCK_M_LEDGER.COLUMNS.BALANCE_QTY]: newStock,
      [STOCK_M_LEDGER.COLUMNS.CREATED_BY]: userId
    });

    return newStock;
  }

  async function createSalesReturn({ body, params, logTrace, userDetails, financialYear }) {
    const knex = this;
    const trx = await knex.transaction();
    try {
      const { company_id } = params;
      const userId = Number(userDetails.id);
      const outletId = Number(body.outlet_id || userDetails.outlet_id);
      let details = body.details || [];
      const currentFinancialYear = financialYear || getFinancialYear();

      if (!details.length) {
        throw CustomError.create({
          httpCode: StatusCodes.BAD_REQUEST,
          message: "At least one return item is required",
          property: "details",
          code: "REQUIRED"
        });
      }

      if (details.some(item => toNumber(item.return_qty) <= 0)) {
        throw CustomError.create({
          httpCode: StatusCodes.BAD_REQUEST,
          message: "Return quantity cannot be zero or negative",
          property: "details.return_qty",
          code: "INVALID_QTY"
        });
      }


      const txBody = { ...body, outlet_id: outletId, details };

      // validate billwise return and enrich details
      // (product name, code, rate, gst etc) based on original bill
      const billwiseData = await validateBillwiseReturn(trx, { body: txBody });

      if (body.return_type === "BILLWISE") {
        details = billwiseData.details;
        txBody.details = details;
        txBody.original_bill_date = txBody.original_bill_date
          || billwiseData.bill[OUT_BILL_MASTER.COLUMNS.BILL_DATE]
          || billwiseData.bill[OUT_BILL_MASTER.COLUMNS.BILLDATE]
          || null;

        txBody.amount = billwiseData.bill[OUT_BILL_MASTER.COLUMNS.AMOUNT];

        // txBody.pay_mode = (billwiseData.bill[OUT_BILL_MASTER.COLUMNS.BCASH] > 0 ? "CASH" :
        //   billwiseData.bill[OUT_BILL_MASTER.COLUMNS.BCARD] > 0
        //     ? "CARD" :
        //     billwiseData.bill[OUT_BILL_MASTER.COLUMNS.BUPI] > 0
        //       ? "UPI" : null);

        txBody.customer_id = txBody.customer_id
          || billwiseData.bill[OUT_BILL_MASTER.COLUMNS.CUSTOMER_ID]
          || null;
      }

      const [{ max_id }] = await trx(SALES_RETURN_MASTER.NAME)
        .max("id as max_id");

      const nextId = (max_id || 0) + 1;
      const srNo = await nextDocumentNo(trx, SALES_RETURN_MASTER.NAME, currentFinancialYear);
      const transactionType = txBody.return_type === "BILLWISE" ? "SALES_RETURN" : "GENERAL_RETURN";

      const subTotalAmount = Number(details.reduce((sum, item) => sum + (toNumber(item.return_qty) * toNumber(item.rate)), 0).toFixed(2));
      const discountAmount = Number(details.reduce((sum, item) => sum + toNumber(item.discount_amount), 0).toFixed(2));
      const gstAmount = Number(details.reduce((sum, item) => sum + toNumber(item.gst_amount), 0).toFixed(2));
      const cessAmount = Number(details.reduce((sum, item) => sum + toNumber(item.cess_amount), 0).toFixed(2));
      const grandTotal = Number((subTotalAmount).toFixed(2));

      const roundedGrandTotal = body.return_type === "BILLWISE" && !Number.isInteger(txBody.amount) ? Math.round(grandTotal) : grandTotal;

      const roundOff = Number((roundedGrandTotal - grandTotal).toFixed(2));

      if (roundedGrandTotal <= 0) {
        throw CustomError.create({
          httpCode: StatusCodes.BAD_REQUEST,
          message: "Sales return cannot be completed without positive coupon value",
          property: "grand_total",
          code: "INVALID_AMOUNT"
        });
      }

      if (txBody.customer_id) {
        const customerExist = await trx(OUTLET_MEMBERS.NAME)
          .where(OUTLET_MEMBERS.COLUMNS.ID, txBody.customer_id)
          .andWhere(OUTLET_MEMBERS.COLUMNS.IS_ACTIVE, true)
          .first();
        if (!customerExist) {
          throw CustomError.create({
            httpCode: StatusCodes.BAD_REQUEST,
            message: "Customer not found or inactive",
            property: "customer_id",
            code: "CUSTOMER_NOT_FOUND"
          });
        }
        txBody.customer_mobile = customerExist.mobile;
        // txBody.customer_name = customerExist.party_name || null;
        // check this customer purchased this bill

        // if (txBody.return_type === 'BILLWISE') {
        //   const billExist = await knex(OUT_BILL_MASTER.NAME)
        //     .where(OUT_BILL_MASTER.COLUMNS.CUSTOMER_ID, txBody.customer_id)
        //     .andWhere(OUT_BILL_MASTER.COLUMNS.BILL_REF_NO, txBody.bill_ref_no)
        //     .andWhere(OUT_BILL_MASTER.COLUMNS.LOC_ID, txBody.outlet_id)
        //     .first();

        //   if (!billExist) {
        //     throw CustomError.create({
        //       httpCode: StatusCodes.BAD_REQUEST,
        //       message: "Bill not found for this customer",
        //       property: "customer_id",
        //       code: "BILL_NOT_FOUND"
        //     });
        //   }
        // }
      }




      const masterInsert = trx(SALES_RETURN_MASTER.NAME)
        .insert({
          [SALES_RETURN_MASTER.COLUMNS.ID]: nextId,
          [SALES_RETURN_MASTER.COLUMNS.FINANCIAL_YEAR]: currentFinancialYear,
          [SALES_RETURN_MASTER.COLUMNS.SR_NO]: srNo,
          [SALES_RETURN_MASTER.COLUMNS.SR_DATE]: new Date(),
          [SALES_RETURN_MASTER.COLUMNS.OUTLET_ID]: outletId,
          [SALES_RETURN_MASTER.COLUMNS.SALES_RETURN_TYPE]: txBody.return_type,
          [SALES_RETURN_MASTER.COLUMNS.BILL_NO]: txBody.bill_no || null,
          [SALES_RETURN_MASTER.COLUMNS.BILL_REF_NO]: txBody.bill_ref_no || null,
          [SALES_RETURN_MASTER.COLUMNS.ORIGINAL_BILL_DATE]: txBody.original_bill_date || null,
          [SALES_RETURN_MASTER.COLUMNS.CUSTOMER_ID]: txBody.customer_id || null,
          [SALES_RETURN_MASTER.COLUMNS.CUSTOMER_MOBILE]: txBody.customer_mobile || null,
          [SALES_RETURN_MASTER.COLUMNS.SUB_TOTAL_AMOUNT]: subTotalAmount,
          [SALES_RETURN_MASTER.COLUMNS.DISCOUNT_AMOUNT]: discountAmount,
          [SALES_RETURN_MASTER.COLUMNS.TOTAL_GST_AMOUNT]: gstAmount,
          [SALES_RETURN_MASTER.COLUMNS.TOTAL_CESS_AMOUNT]: cessAmount,
          [SALES_RETURN_MASTER.COLUMNS.ROUND_OFF]: roundOff,
          [SALES_RETURN_MASTER.COLUMNS.GRAND_TOTAL]: grandTotal,
          [SALES_RETURN_MASTER.COLUMNS.NET_AMOUNT]: roundedGrandTotal,
          [SALES_RETURN_MASTER.COLUMNS.COUPON_GENERATED]: false,
          [SALES_RETURN_MASTER.COLUMNS.REMARKS]: txBody.remarks || '',
          [SALES_RETURN_MASTER.COLUMNS.STATUS]: "COMPLETED",
          [SALES_RETURN_MASTER.COLUMNS.COMPANY_ID]: company_id,
          [SALES_RETURN_MASTER.COLUMNS.USER_NAME]: userDetails.user_name,
          [SALES_RETURN_MASTER.COLUMNS.CREATED_BY]: userId,
          [SALES_RETURN_MASTER.COLUMNS.UPDATED_BY]: userId,
          [SALES_RETURN_MASTER.COLUMNS.CREATED_AT]: new Date(),
          [SALES_RETURN_MASTER.COLUMNS.UPDATED_AT]: new Date()
        })
        .returning("*");

      logQuery({
        logger: fastify.log,
        query: masterInsert,
        context: "Sales Return Master Insert",
        logTrace
      });

      const [master] = await masterInsert;
      const salesReturnNo = master[SALES_RETURN_MASTER.COLUMNS.SR_NO];
      const salesReturnMstId = master[SALES_RETURN_MASTER.COLUMNS.ID];

      for (const item of details) {
        await trx(SALES_RETURN_DETAIL.NAME).insert({
          [SALES_RETURN_DETAIL.COLUMNS.SALES_RETURN_MST_ID]: salesReturnMstId,
          [SALES_RETURN_DETAIL.COLUMNS.FINANCIAL_YEAR]: currentFinancialYear,
          [SALES_RETURN_DETAIL.COLUMNS.BILL_REF_NO]: txBody.bill_ref_no || null,
          [SALES_RETURN_DETAIL.COLUMNS.PRODUCT_ID]: item.product_id,
          [SALES_RETURN_DETAIL.COLUMNS.BATCH_NO]: item.batch_no || null,
          [SALES_RETURN_DETAIL.COLUMNS.ACTUAL_QTY]: item.actual_qty || null,
          [SALES_RETURN_DETAIL.COLUMNS.RETURN_QTY]: item.return_qty,
          [SALES_RETURN_DETAIL.COLUMNS.MRP]: item.mrp || 0,
          [SALES_RETURN_DETAIL.COLUMNS.RATE]: item.rate || 0,
          [SALES_RETURN_DETAIL.COLUMNS.DISCOUNT]: item.discount || 0,
          [SALES_RETURN_DETAIL.COLUMNS.DISCOUNT_AMOUNT]: item.discount_amount || 0,
          [SALES_RETURN_DETAIL.COLUMNS.GST]: item.gst || 0,
          [SALES_RETURN_DETAIL.COLUMNS.CGST]: item.cgst || 0,
          [SALES_RETURN_DETAIL.COLUMNS.SGST]: item.sgst || 0,
          [SALES_RETURN_DETAIL.COLUMNS.GST_AMOUNT]: item.gst_amount || 0,
          [SALES_RETURN_DETAIL.COLUMNS.CESS]: item.cess || 0,
          [SALES_RETURN_DETAIL.COLUMNS.CESS_AMOUNT]: item.cess_amount || 0,
          [SALES_RETURN_DETAIL.COLUMNS.AMOUNT]: item.amount || 0,
          [SALES_RETURN_DETAIL.COLUMNS.COMPANY_ID]: company_id,
          [SALES_RETURN_DETAIL.COLUMNS.CREATED_BY]: userId
        });

        await calculateStockAndUpdate(trx, {
          item,
          outletId,
          srNo,
          transactionType,
          userId
        });
      }

      const couponNo = await generateUniqueCoupon(trx);

      const couponInsert = trx(SALES_RETURN_COUPON.NAME)
        .insert({
          [SALES_RETURN_COUPON.COLUMNS.COUPON_NO]: couponNo,
          [SALES_RETURN_COUPON.COLUMNS.SALES_RETURN_MST_ID]: salesReturnMstId,
          [SALES_RETURN_COUPON.COLUMNS.ORIGINAL_BILL_NO]: txBody.bill_no || null,
          [SALES_RETURN_COUPON.COLUMNS.BILL_REF_NO]: txBody.bill_ref_no || null,
          [SALES_RETURN_COUPON.COLUMNS.CUSTOMER_ID]: txBody.customer_id || null,
          [SALES_RETURN_COUPON.COLUMNS.OUTLET_ID]: outletId,
          [SALES_RETURN_COUPON.COLUMNS.COUPON_VALUE]: roundedGrandTotal,
          [SALES_RETURN_COUPON.COLUMNS.BALANCE_AMOUNT]: roundedGrandTotal,
          [SALES_RETURN_COUPON.COLUMNS.ISSUE_DATE]: new Date(),
          [SALES_RETURN_COUPON.COLUMNS.EXPIRY_DATE]: addDays(new Date(), 180),
          [SALES_RETURN_COUPON.COLUMNS.STATUS]: "ACTIVE"
        })
        .returning("*");

      logQuery({
        logger: fastify.log,
        query: couponInsert,
        context: "Sales Return Coupon Insert",
        logTrace
      });

      const [coupon] = await couponInsert;
      await trx(SALES_RETURN_MASTER.NAME)
        .where(SALES_RETURN_MASTER.COLUMNS.ID, salesReturnMstId)
        .update({
          [SALES_RETURN_MASTER.COLUMNS.COUPON_GENERATED]: true,
          [SALES_RETURN_MASTER.COLUMNS.COUPON_ID]: coupon[SALES_RETURN_COUPON.COLUMNS.ID],
          [SALES_RETURN_MASTER.COLUMNS.UPDATED_BY]: userId,
          [SALES_RETURN_MASTER.COLUMNS.UPDATED_AT]: new Date()
        });

      // await trx(SALES_RETURN_AUDIT.NAME).insert({
      //   [SALES_RETURN_AUDIT.COLUMNS.SALES_RETURN_MST_ID]: salesReturnMstId,
      //   [SALES_RETURN_AUDIT.COLUMNS.ACTION_TYPE]: "CREATE",
      //   [SALES_RETURN_AUDIT.COLUMNS.REMARKS]: txBody.remarks || "Sales return posted and SRC generated",
      //   [SALES_RETURN_AUDIT.COLUMNS.ACTION_BY]: userId
      // });

      await trx.commit();

      return {
        success: true,
        sr_no: srNo,
        coupon_no: couponNo,
        coupon_value: roundedGrandTotal
      };

    } catch (error) {
      // Rollback transaction in case of any failure
      await trx.rollback();
      console.error("Transaction Failed:", error);
      if (error?._code === 404) {
        // Re-throw the custom 404 error as is 
        throw error;
      } // Default to internal server error if it's not a known custom error 
      throw CustomError.create({
        httpCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: error.message || error._errors[0].message || "An error occurred while processing the sales return",
        property: "",
        code: "TRANSACTION_FAILED"
      });
    }
  }

  async function createGeneralReturn({ body, params, logTrace, userDetails, financialYear }) {
    const knex = this;
    const outletId = Number(body.outlet_id || userDetails.outlet_id);
    const details = await buildGeneralReturnDetails(knex, {
      outletId,
      details: body.details || [],
      logTrace
    });

    return createSalesReturn.call(knex, {
      body: {
        outlet_id: outletId,
        return_type: "GENERAL",
        bill_no: null,
        customer_id: body.customer_id || null,
        coupon_expiry_days: body.coupon_expiry_days,
        company_id: body.company_id || null,
        remarks: body.remarks || "General sales return",
        details
      },
      params,
      logTrace,
      userDetails,
      financialYear
    });
  }

  async function redeemCoupon({ body, userDetails }) {
    const knex = this;
    const userId = Number(userDetails.id);

    return knex.transaction(async trx => {
      const coupon = await trx(SALES_RETURN_COUPON.NAME)
        .where(SALES_RETURN_COUPON.COLUMNS.COUPON_NO, body.coupon_no)
        .first();

      if (!coupon) {
        throw CustomError.create({
          httpCode: StatusCodes.NOT_FOUND,
          message: "Sales return coupon not found",
          property: "coupon_no",
          code: "NOT_FOUND"
        });
      }

      const status = coupon[SALES_RETURN_COUPON.COLUMNS.STATUS];
      if (!["ACTIVE", "PARTIAL"].includes(status)) {
        throw CustomError.create({
          httpCode: StatusCodes.BAD_REQUEST,
          message: "Coupon is not available for redemption",
          property: "coupon_no",
          code: "INVALID_COUPON_STATUS"
        });
      }

      const expiryDate = coupon[SALES_RETURN_COUPON.COLUMNS.EXPIRY_DATE];
      if (expiryDate && new Date(expiryDate) < new Date()) {
        await trx(SALES_RETURN_COUPON.NAME)
          .where(SALES_RETURN_COUPON.COLUMNS.ID, coupon[SALES_RETURN_COUPON.COLUMNS.ID])
          .update({ [SALES_RETURN_COUPON.COLUMNS.STATUS]: "EXPIRED" });

        throw CustomError.create({
          httpCode: StatusCodes.BAD_REQUEST,
          message: "Coupon is expired",
          property: "coupon_no",
          code: "COUPON_EXPIRED"
        });
      }

      const balanceAmount = toNumber(coupon[SALES_RETURN_COUPON.COLUMNS.BALANCE_AMOUNT]);
      const usedAmount = toNumber(body.used_amount);

      if (usedAmount > balanceAmount) {
        throw CustomError.create({
          httpCode: StatusCodes.BAD_REQUEST,
          message: "Coupon used amount cannot exceed balance amount",
          property: "used_amount",
          code: "INVALID_AMOUNT"
        });
      }

      const remainingAmount = Number((balanceAmount - usedAmount).toFixed(2));
      const nextStatus = remainingAmount === 0 ? "REDEEMED" : "PARTIAL";
      const couponId = coupon[SALES_RETURN_COUPON.COLUMNS.ID];

      await trx(SALES_RETURN_COUPON_USAGE.NAME).insert({
        [SALES_RETURN_COUPON_USAGE.COLUMNS.COUPON_ID]: couponId,
        [SALES_RETURN_COUPON_USAGE.COLUMNS.BILL_NO]: body.bill_no,
        [SALES_RETURN_COUPON_USAGE.COLUMNS.USED_AMOUNT]: usedAmount,
        [SALES_RETURN_COUPON_USAGE.COLUMNS.REMAINING_AMOUNT]: remainingAmount,
        [SALES_RETURN_COUPON_USAGE.COLUMNS.OUTLET_ID]: body.outlet_id,
        [SALES_RETURN_COUPON_USAGE.COLUMNS.CREATED_BY]: userId
      });

      await trx(SALES_RETURN_COUPON.NAME)
        .where(SALES_RETURN_COUPON.COLUMNS.ID, couponId)
        .update({
          [SALES_RETURN_COUPON.COLUMNS.BALANCE_AMOUNT]: remainingAmount,
          [SALES_RETURN_COUPON.COLUMNS.STATUS]: nextStatus
        });

      await trx(SALES_RETURN_AUDIT.NAME).insert({
        [SALES_RETURN_AUDIT.COLUMNS.SALES_RETURN_MST_ID]: coupon[SALES_RETURN_COUPON.COLUMNS.SALES_RETURN_MST_ID],
        [SALES_RETURN_AUDIT.COLUMNS.ACTION_TYPE]: "COUPON_REDEEMED",
        [SALES_RETURN_AUDIT.COLUMNS.REMARKS]: `Coupon ${body.coupon_no} redeemed against bill ${body.bill_no}`,
        [SALES_RETURN_AUDIT.COLUMNS.ACTION_BY]: userId
      });

      return {
        success: true,
        coupon_id: couponId,
        used_amount: usedAmount,
        remaining_amount: remainingAmount,
        status: nextStatus
      };
    });
  }

  // validateCoupon
  async function validateCoupon({ body, userDetails, logTrace }) {
    const knex = this;

    const coupon = await knex(SALES_RETURN_COUPON.NAME)
      .where(SALES_RETURN_COUPON.COLUMNS.COUPON_NO, body.coupon_no)
      .first();

    if (!coupon) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Sales return coupon not found",
        property: "coupon_no",
        code: "NOT_FOUND"
      });
    }

    const status = coupon[SALES_RETURN_COUPON.COLUMNS.STATUS];
    if (!["ACTIVE", "PARTIAL"].includes(status)) {
      throw CustomError.create({
        httpCode: StatusCodes.BAD_REQUEST,
        message: "Coupon is not available for redemption",
        property: "coupon_no",
        code: "INVALID_COUPON_STATUS"
      });
    }

    const expiryDate = coupon[SALES_RETURN_COUPON.COLUMNS.EXPIRY_DATE];
    if (expiryDate && new Date(expiryDate) < new Date()) {
      await knex(SALES_RETURN_COUPON.NAME)
        .where(SALES_RETURN_COUPON.COLUMNS.ID, coupon[SALES_RETURN_COUPON.COLUMNS.ID])
        .update({ [SALES_RETURN_COUPON.COLUMNS.STATUS]: "EXPIRED" });

      throw CustomError.create({
        httpCode: StatusCodes.BAD_REQUEST,
        message: "Coupon is expired",
        property: "coupon_no",
        code: "COUPON_EXPIRED"
      });
    }

    coupon.created_at = new Date(coupon.created_at).toISOString();
    return coupon;
  }

  // API 1: Daily summary per outlet — grouped by outlet + date
  async function getSalesReturnReport({ body, query, logTrace }) {
    const knex = this;
    const { outlet_id, from_date, to_date, region_id } = body;

    const pg_query = knex(SALES_RETURN_MASTER.NAME)
      .select([
        `${REGION.NAME}.${REGION.COLUMNS.REGION_NAME} as region`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID} as outlet_id`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULLNAME} as outlet_name`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID} as store_code`,
        knex.raw(`DATE(${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.SR_DATE}) as date`),
        knex.raw(`COUNT(${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.ID}) as bills`),
        knex.raw(`COALESCE(SUM(${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.GRAND_TOTAL}), 0) as amount`)
      ])
      .join(OUTLETS.NAME, `${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.OUTLET_ID}`, `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`)
      .join(REGION.NAME, `${OUTLETS.NAME}.${OUTLETS.COLUMNS.REGION_ID}`, `${REGION.NAME}.${REGION.COLUMNS.ID}`)
      .where(`${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.SALES_RETURN_TYPE}`, "BILLWISE")
      .whereNot(`${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.STATUS}`, "CANCELLED")
      .whereBetween(knex.raw(`DATE(${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.SR_DATE})`), [from_date, to_date])
      .groupBy([
        `${REGION.NAME}.${REGION.COLUMNS.REGION_NAME}`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULLNAME}`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID}`,
        knex.raw(`DATE(${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.SR_DATE})`)
      ])
      .orderBy([
        { column: `${REGION.NAME}.${REGION.COLUMNS.REGION_NAME}`, order: "asc" },
        { column: `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULLNAME}`, order: "asc" },
        { column: knex.raw(`DATE(${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.SR_DATE})`), order: "asc" }
      ]);

    if (region_id) {
      pg_query.where(`${REGION.NAME}.${REGION.COLUMNS.ID}`, region_id);
    }
    if (outlet_id) {
      pg_query.where(`${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.OUTLET_ID}`, outlet_id);
    }

    logQuery({
      logger: fastify.log,
      query: pg_query,
      context: "Sales Return Report",
      logTrace
    });

    const rows = await pg_query;

    if (!rows.length) {
      throw CustomError.create({ httpCode: StatusCodes.NOT_FOUND, message: "No sales return data found", code: "NOT_FOUND" });
    }

    return {
      bills_count: rows.reduce((sum, r) => sum + Number(r.bills), 0),
      total_amount: rows.reduce((sum, r) => sum + Number(r.amount), 0),
      data: rows.map(r => ({
        region: r.region,
        outlet_id: r.outlet_id,
        outlet_name: r.outlet_name,
        store_code: r.store_code,
        date: formatDate(r.date),
        bills: Number(r.bills),
        amount: Number(r.amount),
        start_date: formatDate(r.date),
        end_date: formatDate(r.date)
      }))
    };
  }

  // API 2: Invoice list for a specific outlet + date range
  async function getSalesReturnInvoiceReport({ body, query, logTrace }) {
    const knex = this;
    const { region_id, from_date, to_date, outlet_id } = body;

    const pg_query = knex(SALES_RETURN_MASTER.NAME)
      .select([
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULLNAME} as outlet_name`,
        knex.raw(`TO_CHAR(DATE(${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.SR_DATE}), 'DD-MM-YYYY') as sr_date`),
        `${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.BILL_REF_NO} as invoice_no`,
        `${USERS.NAME}.${USERS.COLUMNS.USER_NAME} as user_name`,
        `${USER_COUNTER_MAPPING.NAME}.${USER_COUNTER_MAPPING.COLUMNS.COUNTER_NO} as counter_no`,
        `${OUTLET_MEMBERS.NAME}.${OUTLET_MEMBERS.COLUMNS.PARTY_NAME} as party_name`,
        `${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.GRAND_TOTAL} as amount`
      ])
      .join(OUTLETS.NAME, `${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.OUTLET_ID}`, `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`)
      .join(REGION.NAME, `${OUTLETS.NAME}.${OUTLETS.COLUMNS.REGION_ID}`, `${REGION.NAME}.${REGION.COLUMNS.ID}`)
      .leftJoin(USERS.NAME, `${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.CREATED_BY}`, `${USERS.NAME}.${USERS.COLUMNS.ID}`)
      .leftJoin(USER_COUNTER_MAPPING.NAME, function () {
        this.on(`${USERS.NAME}.${USERS.COLUMNS.ID}`, `${USER_COUNTER_MAPPING.NAME}.${USER_COUNTER_MAPPING.COLUMNS.USER_ID}`)
          .andOn(`${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.OUTLET_ID}`, `${USER_COUNTER_MAPPING.NAME}.${USER_COUNTER_MAPPING.COLUMNS.OUTLET_ID}`);
      })
      .leftJoin(OUTLET_MEMBERS.NAME, `${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.CUSTOMER_ID}`, `${OUTLET_MEMBERS.NAME}.${OUTLET_MEMBERS.COLUMNS.ID}`)
      .whereNot(`${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.STATUS}`, "CANCELLED")
      .where(`${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.SALES_RETURN_TYPE}`, "BILLWISE")
      .whereBetween(knex.raw(`DATE(${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.SR_DATE})`), [from_date, to_date])
      .where(`${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.OUTLET_ID}`, outlet_id)
      .orderBy([
        { column: knex.raw(`DATE(${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.SR_DATE})`), order: "asc" },
        { column: `${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.SR_NO}`, order: "asc" }
      ]);

    if (region_id) {
      pg_query.where(`${REGION.NAME}.${REGION.COLUMNS.ID}`, region_id);
    }

    logQuery({
      logger: fastify.log,
      query: pg_query,
      context: "Sales Return Invoice Report",
      logTrace
    });

    const rows = await pg_query;

    if (!rows.length) {
      throw CustomError.create({ httpCode: StatusCodes.NOT_FOUND, message: "No invoice data found", code: "NOT_FOUND" });
    }

    return {
      data: rows.map(r => ({
        outlet_name: r.outlet_name,
        sr_date: r.sr_date,
        invoice_no: r.invoice_no,
        counter_no: r.counter_no || "",
        user_name: r.user_name || "",
        party_name: r.party_name || "",
        amount: Number(r.amount)
      }))
    };
  }

  // API 3: Item-level details for a specific invoice
  async function getInvoiceSalesReturnDetails({ body, query, logTrace }) {
    const knex = this;
    const { region_id, from_date, to_date, outlet_id, invoice_number } = body;

    const pg_query = knex(SALES_RETURN_DETAIL.NAME)
      .select([
        `${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.ID} as sr_id`,
        `${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_CODE} as product_code`,
        `${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_NAME} as product_name`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID} as outlet_id`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULLNAME} as outlet_name`,
        `${MAIN_CATEGORY.NAME}.${MAIN_CATEGORY.COLUMNS.CATEGORY_NAME} as main_category`,
        `${SUB_CATEGORY.NAME}.${SUB_CATEGORY.COLUMNS.SUBCATEGORY_NAME} as sub_category`,
        `${MERCHANT_CATEGORY.NAME}.${MERCHANT_CATEGORY.COLUMNS.MERCHANT_CATEGORY_NAME} as merchant_category_name`,
        `${HEADS.NAME}.${HEADS.COLUMNS.CATEGORY_NAME} as brand_name`,
        `${TYPEDESIGN.NAME}.${TYPEDESIGN.COLUMNS.TYPE_NAME} as brand_company_name`,
        `${ITEM.NAME}.${ITEM.COLUMNS.GST} as gst`,
        `${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.CESS} as cess`,
        `${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.MRP} as mrp`,
        `${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.RETURN_QTY} as return_qty`,
        `${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.RATE} as item_rate`,
        knex.raw(`${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.RETURN_QTY} * ${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.RATE} as "item_amt"`),
        `${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.GST} as item_gst`,
        `${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.AMOUNT} as total_amt`,
        `${ITEM.NAME}.${ITEM.COLUMNS.ID} as pro_id`,
        `${USER_COUNTER_MAPPING.NAME}.${USER_COUNTER_MAPPING.COLUMNS.COUNTER_NO} as counter_no`,
        `${USERS.NAME}.${USERS.COLUMNS.USER_NAME} as EnteredBy`,
        `${UNITS.NAME}.${UNITS.COLUMNS.UNITS_SHORT_NAME} as uom_name`,

      ])
      .join(SALES_RETURN_MASTER.NAME, `${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.SALES_RETURN_MST_ID}`, `${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.ID}`)
      .join(OUTLETS.NAME, `${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.OUTLET_ID}`, `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`)
      .join(REGION.NAME, `${OUTLETS.NAME}.${OUTLETS.COLUMNS.REGION_ID}`, `${REGION.NAME}.${REGION.COLUMNS.ID}`)
      .leftJoin(USERS.NAME, `${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.CREATED_BY}`, `${USERS.NAME}.${USERS.COLUMNS.ID}`)
      .leftJoin(USER_COUNTER_MAPPING.NAME, function () {
        this.on(`${USERS.NAME}.${USERS.COLUMNS.ID}`, `${USER_COUNTER_MAPPING.NAME}.${USER_COUNTER_MAPPING.COLUMNS.USER_ID}`)
          .andOn(`${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.OUTLET_ID}`, `${USER_COUNTER_MAPPING.NAME}.${USER_COUNTER_MAPPING.COLUMNS.OUTLET_ID}`);
      })
      .join(ITEM.NAME, `${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.PRODUCT_ID}`, `${ITEM.NAME}.${ITEM.COLUMNS.ID}`)
      .leftJoin(MAIN_CATEGORY.NAME, `${ITEM.NAME}.${ITEM.COLUMNS.MAIN_CATEGORY_ID}`, `${MAIN_CATEGORY.NAME}.${MAIN_CATEGORY.COLUMNS.ID}`)
      .leftJoin(SUB_CATEGORY.NAME, `${ITEM.NAME}.${ITEM.COLUMNS.SUB_CATEGORY_ID}`, `${SUB_CATEGORY.NAME}.${SUB_CATEGORY.COLUMNS.ID}`)
      .leftJoin(MERCHANT_CATEGORY.NAME, `${ITEM.NAME}.${ITEM.COLUMNS.MERCHANT_CATEGORY_ID}`, `${MERCHANT_CATEGORY.NAME}.${MERCHANT_CATEGORY.COLUMNS.ID}`)
      .leftJoin(HEADS.NAME, `${ITEM.NAME}.${ITEM.COLUMNS.HEAD_ID}`, `${HEADS.NAME}.${HEADS.COLUMNS.ID}`)
      .leftJoin(TYPEDESIGN.NAME, `${ITEM.NAME}.${ITEM.COLUMNS.TYPEDESIGN_ID}`, `${TYPEDESIGN.NAME}.${TYPEDESIGN.COLUMNS.ID}`)
      .leftJoin(UNITS.NAME, `${ITEM.NAME}.${ITEM.COLUMNS.UOM_ID}`, `${UNITS.NAME}.${UNITS.COLUMNS.ID}`)
      .whereNot(`${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.STATUS}`, "CANCELLED")
      .where(`${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.SALES_RETURN_TYPE}`, "BILLWISE")
      .whereBetween(knex.raw(`DATE(${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.SR_DATE})`), [from_date, to_date])
      .where(`${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.OUTLET_ID}`, outlet_id)
      .where(`${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.BILL_REF_NO}`, invoice_number)
      .orderBy(`${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.ID}`, "asc");

    if (region_id) {
      pg_query.where(`${REGION.NAME}.${REGION.COLUMNS.ID}`, region_id);
    }

    logQuery({
      logger: fastify.log,
      query: pg_query,
      context: "Invoice Sales Return Details",
      logTrace
    });

    const rows = await pg_query;

    if (!rows.length) {
      throw CustomError.create({ httpCode: StatusCodes.NOT_FOUND, message: "No details found for this invoice", code: "NOT_FOUND" });
    }

    const getSalesReturnMasterQuery = await knex(SALES_RETURN_MASTER.NAME)
      .whereNot(`${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.STATUS}`, "CANCELLED")
      .whereBetween(knex.raw(`DATE(${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.SR_DATE})`), [from_date, to_date])
      .where(`${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.OUTLET_ID}`, outlet_id)
      .where(`${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.BILL_REF_NO}`, invoice_number)
      .where(`${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.SALES_RETURN_TYPE}`, "BILLWISE");


    return {
      // basic details  
      outlet_id: rows[0].outlet_id,
      outlet_name: rows[0].outlet_name,
      sr_date: rows[0].sr_date,
      invoice_no: invoice_number,
      counter_no: rows[0].counter_no || "",
      user_name: rows[0].EnteredBy || "",
      total_amount: Number(getSalesReturnMasterQuery[0][SALES_RETURN_MASTER.COLUMNS.GRAND_TOTAL]) || 0,
      // item details
      data: rows.map(r => ({
        sr_id: r.sr_id,
        pro_id: r.pro_id,
        product_code: r.product_code,
        product_name: r.product_name,
        outlet_id: r.outlet_id,
        outlet_name: r.outlet_name,
        main_category: r.main_category || "",
        sub_category: r.sub_category || "",
        merchant_category_name: r.merchant_category_name || "",
        brand_name: r.brand_name || "",
        brand_company_name: r.brand_company_name || "",
        gst: Number(r.gst) || 0,
        cess: Number(r.cess) || 0,
        mrp: Number(r.mrp) || 0,
        return_qty: r.return_qty,
        uom_name: r.uom_name || "",
        item_rate: Number(r.item_rate),
        item_amt: Number(r.item_amt),
        item_gst: Number(r.item_gst) || 0,
        total_amt: Number(r.total_amt),
      }))
    };
  }

  async function getSalesReturnInfo({ params, logTrace }) {
    const knex = this;
    const srNo = String(params.sr_no || "").trim();

    const masterQuery = knex(SALES_RETURN_MASTER.NAME)
      .where(SALES_RETURN_MASTER.COLUMNS.SR_NO, srNo)
      .select([
        SALES_RETURN_MASTER.COLUMNS.ID,
        SALES_RETURN_MASTER.COLUMNS.SR_NO,
        SALES_RETURN_MASTER.COLUMNS.OUTLET_ID,
        SALES_RETURN_MASTER.COLUMNS.SR_DATE,
        SALES_RETURN_MASTER.COLUMNS.SALES_RETURN_TYPE,
        SALES_RETURN_MASTER.COLUMNS.NET_AMOUNT,
        SALES_RETURN_MASTER.COLUMNS.STATUS,
        SALES_RETURN_MASTER.COLUMNS.COUPON_GENERATED
      ])
      .first();

    logQuery({
      logger: fastify.log,
      query: masterQuery,
      context: "Sales Return Info Master Fetch",
      logTrace
    });

    const master = await masterQuery;
    if (!master) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "Sales return not found",
        property: "sr_no",
        code: "NOT_FOUND"
      });
    }

    const detailsQuery = knex(SALES_RETURN_DETAIL.NAME)
      .leftJoin(
        ITEM.NAME,
        `${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.PRODUCT_ID}`,
        `${ITEM.NAME}.${ITEM.COLUMNS.ID}`
      )
      .leftJoin(
        UNITS.NAME,
        `${ITEM.NAME}.${ITEM.COLUMNS.UOM_ID}`,
        `${UNITS.NAME}.${UNITS.COLUMNS.ID}`
      )
      .where(
        `${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.SALES_RETURN_MST_ID}`,
        master[SALES_RETURN_MASTER.COLUMNS.ID]
      )
      .select([
        `${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.ID} as id`,
        `${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.PRODUCT_ID} as product_id`,
        `${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_CODE} as product_code`,
        `${ITEM.NAME}.${ITEM.COLUMNS.PRODUCT_NAME} as product_name`,
        `${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.MRP} as mrp`,
        `${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.RATE} as rate`,
        `${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.RETURN_QTY} as return_qty`,
        `${UNITS.NAME}.${UNITS.COLUMNS.UNITS_SHORT_NAME} as uom_name`,
        `${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.AMOUNT} as amount`
      ])
      .orderBy(
        `${SALES_RETURN_DETAIL.NAME}.${SALES_RETURN_DETAIL.COLUMNS.ID}`,
        "asc"
      );
    logQuery({
      logger: fastify.log,
      query: detailsQuery,
      context: "Sales Return Info Detail Fetch",
      logTrace
    });

    const details = await detailsQuery;
    const coupon = await knex(SALES_RETURN_COUPON.NAME)
      .where(
        SALES_RETURN_COUPON.COLUMNS.SALES_RETURN_MST_ID,
        master[SALES_RETURN_MASTER.COLUMNS.ID]
      )
      .select([
        SALES_RETURN_COUPON.COLUMNS.COUPON_NO,
        SALES_RETURN_COUPON.COLUMNS.COUPON_VALUE,
        SALES_RETURN_COUPON.COLUMNS.BALANCE_AMOUNT,
        SALES_RETURN_COUPON.COLUMNS.ISSUE_DATE,
        SALES_RETURN_COUPON.COLUMNS.EXPIRY_DATE,
        SALES_RETURN_COUPON.COLUMNS.STATUS
      ])
      .first();

    return {
      ...master,
      details,
      coupon: coupon || {}
    };
  }


  async function getGeneralReturnReport({ body, query, logTrace }) {
    const knex = this;
    const { outlet_id, from_date, to_date, region_id } = body;

    const pg_query = knex(SALES_RETURN_MASTER.NAME)
      .select([
        `${REGION.NAME}.${REGION.COLUMNS.REGION_NAME} as region`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID} as outlet_id`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULLNAME} as outlet_name`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID} as store_code`,
        knex.raw(`DATE(${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.SR_DATE}) as date`),
        knex.raw(`COUNT(${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.ID}) as bills`),
        knex.raw(`COALESCE(SUM(${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.GRAND_TOTAL}), 0) as amount`)
      ])
      .join(OUTLETS.NAME, `${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.OUTLET_ID}`, `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`)
      .join(REGION.NAME, `${OUTLETS.NAME}.${OUTLETS.COLUMNS.REGION_ID}`, `${REGION.NAME}.${REGION.COLUMNS.ID}`)
      .where(`${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.SALES_RETURN_TYPE}`, "GENERAL")
      .whereNot(`${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.STATUS}`, "CANCELLED")
      .whereBetween(knex.raw(`DATE(${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.SR_DATE})`), [from_date, to_date])
      .groupBy([
        `${REGION.NAME}.${REGION.COLUMNS.REGION_NAME}`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.ID}`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULLNAME}`,
        `${OUTLETS.NAME}.${OUTLETS.COLUMNS.BANK_ID}`,
        knex.raw(`DATE(${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.SR_DATE})`)
      ])
      .orderBy([
        { column: `${REGION.NAME}.${REGION.COLUMNS.REGION_NAME}`, order: "asc" },
        { column: `${OUTLETS.NAME}.${OUTLETS.COLUMNS.FULLNAME}`, order: "asc" },
        { column: knex.raw(`DATE(${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.SR_DATE})`), order: "asc" }
      ]);

    if (region_id) {
      pg_query.where(`${REGION.NAME}.${REGION.COLUMNS.ID}`, region_id);
    }
    if (outlet_id) {
      pg_query.where(`${SALES_RETURN_MASTER.NAME}.${SALES_RETURN_MASTER.COLUMNS.OUTLET_ID}`, outlet_id);
    }

    logQuery({
      logger: fastify.log,
      query: pg_query,
      context: "Sales Return Report",
      logTrace
    });

    const rows = await pg_query;

    if (!rows.length) {
      throw CustomError.create({ httpCode: StatusCodes.NOT_FOUND, message: "No sales return data found", code: "NOT_FOUND" });
    }

    return {
      bills_count: rows.reduce((sum, r) => sum + Number(r.bills), 0),
      total_amount: rows.reduce((sum, r) => sum + Number(r.amount), 0),
      data: rows.map(r => ({
        region: r.region,
        outlet_id: r.outlet_id,
        outlet_name: r.outlet_name,
        store_code: r.store_code,
        date: formatDate(r.date),
        bills: Number(r.bills),
        amount: Number(r.amount),
        start_date: formatDate(r.date),
        end_date: formatDate(r.date)
      }))
    };
  }

  return {
    createSalesReturn,
    fetchBillDetails,
    redeemCoupon,
    getGeneralReturnProduct,
    createGeneralReturn,
    validateCoupon,
    getSalesReturnReport,
    getSalesReturnInvoiceReport,
    getInvoiceSalesReturnDetails,
    getSalesReturnInfo,
    getGeneralReturnReport
  };
}

module.exports = salesReturnRepo;
