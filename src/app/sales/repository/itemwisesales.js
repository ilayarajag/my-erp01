const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../../errorHandler");
const { logQuery } = require("../../commons/helpers");
const {
  OUT_BILL_DETAIL,
  OUT_BILL_MASTER,
  ITEM,
  MAIN_CATEGORY,
  SUB_CATEGORY,
  MERCHANT_CATEGORY,
  TYPEDESIGN,
  UNITS,
  OUTLETS,
  OUTLET_PRODUCT_MAPPING
} = require("../commons/constants");

const REGION = { NAME: "region", COLUMNS: { ID: "id", REGION_NAME: "region_name" } };

function itemWiseSalesRepo(fastify) {

  async function getItemWiseSales({ body, logTrace }) {
    const knex = this;
    const { from_date, to_date, region_id, outlet_id, main_category_id } = body;

    const obd = OUT_BILL_DETAIL.NAME;
    const obm = OUT_BILL_MASTER.NAME;
    const it = ITEM.NAME;
    const mc = MAIN_CATEGORY.NAME;
    const sc = SUB_CATEGORY.NAME;
    const mcat = MERCHANT_CATEGORY.NAME;
    const un = UNITS.NAME;
    const ol = OUTLETS.NAME;

    const query = knex(obd)
      .select([
        `${ol}.${OUTLETS.COLUMNS.FULLNAME} as outlet_name`,
        `${it}.${ITEM.COLUMNS.PRODUCT_CODE} as pro_code`,
        `${it}.${ITEM.COLUMNS.PRODUCT_NAME} as product_name`,
        `${mc}.${MAIN_CATEGORY.COLUMNS.CATEGORY_NAME} as main_category`,
        `${sc}.${SUB_CATEGORY.COLUMNS.SUBCATEGORY_NAME} as sub_category`,
        `${mcat}.${MERCHANT_CATEGORY.COLUMNS.MERCHANT_CATEGORY_NAME} as mc_name`,
        `${obd}.${OUT_BILL_DETAIL.COLUMNS.BRANDNAME} as brand_name`,
        `${obd}.${OUT_BILL_DETAIL.COLUMNS.BRANDCOMPNAME} as brand_company_name`,
        `${obd}.${OUT_BILL_DETAIL.COLUMNS.HSN} as hsn`,
        `${obd}.${OUT_BILL_DETAIL.COLUMNS.GST} as vat`,
        `${obd}.${OUT_BILL_DETAIL.COLUMNS.CESS} as cess`,
        `${un}.${UNITS.COLUMNS.UNITS_SHORT_NAME} as uom_name`,
        knex.raw(`COALESCE(SUM(${obd}.${OUT_BILL_DETAIL.COLUMNS.PROD_QTY}),0) as total_qty`),
        knex.raw(`COALESCE(SUM(${obd}.${OUT_BILL_DETAIL.COLUMNS.PROD_QTY} * ${obd}.${OUT_BILL_DETAIL.COLUMNS.PROD_RATE}),0) as total_value`),
        knex.raw(`COALESCE(SUM(${obd}.${OUT_BILL_DETAIL.COLUMNS.CESS}),0) as cess_value`)
      ])
      .join(obm, function () {
        this.on(`${obd}.${OUT_BILL_DETAIL.COLUMNS.BILL_NO}`, `${obm}.${OUT_BILL_MASTER.COLUMNS.BILL_NO}`)
          .andOn(`${obd}.${OUT_BILL_DETAIL.COLUMNS.LOC_ID}`, `${obm}.${OUT_BILL_MASTER.COLUMNS.LOC_ID}`);
      })
      .join(it, `${obd}.${OUT_BILL_DETAIL.COLUMNS.PROD_ID}`, `${it}.${ITEM.COLUMNS.ID}`)
      .leftJoin(mc, `${it}.${ITEM.COLUMNS.MAIN_CATEGORY_ID}`, `${mc}.${MAIN_CATEGORY.COLUMNS.ID}`)
      .leftJoin(sc, `${it}.${ITEM.COLUMNS.SUB_CATEGORY_ID}`, `${sc}.${SUB_CATEGORY.COLUMNS.ID}`)
      .leftJoin(mcat, `${it}.${ITEM.COLUMNS.MERCHANT_CATEGORY_ID}`, `${mcat}.${MERCHANT_CATEGORY.COLUMNS.ID}`)
      .leftJoin(un, `${it}.${ITEM.COLUMNS.UOM_ID}`, `${un}.${UNITS.COLUMNS.ID}`)
      .join(ol, `${obm}.${OUT_BILL_MASTER.COLUMNS.LOC_ID}`, `${ol}.${OUTLETS.COLUMNS.ID}`)
      .join(REGION.NAME, `${ol}.region_id`, `${REGION.NAME}.${REGION.COLUMNS.ID}`)
      .whereRaw(`DATE(${obm}.${OUT_BILL_MASTER.COLUMNS.BILL_DATE}) BETWEEN ? AND ?`, [from_date, to_date])
      .where(`${REGION.NAME}.${REGION.COLUMNS.ID}`, region_id)
      .where(`${obm}.${OUT_BILL_MASTER.COLUMNS.LOC_ID}`, outlet_id)
      .groupBy([
        `${ol}.${OUTLETS.COLUMNS.FULLNAME}`,
        `${it}.${ITEM.COLUMNS.ID}`,
        `${it}.${ITEM.COLUMNS.PRODUCT_CODE}`,
        `${it}.${ITEM.COLUMNS.PRODUCT_NAME}`,
        `${obd}.${OUT_BILL_DETAIL.COLUMNS.GST}`,
        `${obd}.${OUT_BILL_DETAIL.COLUMNS.CESS}`,
        `${mc}.${MAIN_CATEGORY.COLUMNS.CATEGORY_NAME}`,
        `${sc}.${SUB_CATEGORY.COLUMNS.SUBCATEGORY_NAME}`,
        `${mcat}.${MERCHANT_CATEGORY.COLUMNS.MERCHANT_CATEGORY_NAME}`,
        `${obd}.${OUT_BILL_DETAIL.COLUMNS.BRANDNAME}`,
        `${obd}.${OUT_BILL_DETAIL.COLUMNS.BRANDCOMPNAME}`,
        `${obd}.${OUT_BILL_DETAIL.COLUMNS.HSN}`,
        `${un}.${UNITS.COLUMNS.UNITS_SHORT_NAME}`
      ])
      .orderBy(`${it}.${ITEM.COLUMNS.PRODUCT_NAME}`, "asc");

    if (main_category_id) {
      query.where(`${it}.${ITEM.COLUMNS.MAIN_CATEGORY_ID}`, main_category_id);
    }

    logQuery({ logger: fastify.log, query, context: "Item Wise Sales", logTrace });

    const rows = await query;

    if (!rows.length) {
      throw CustomError.create({
        httpCode: StatusCodes.NOT_FOUND,
        message: "No sales data found for the given filters",
        property: "",
        code: "NOT_FOUND"
      });
    }

    const data = rows.map(r => ({
      pro_code: r.pro_code,
      product_name: r.product_name,
      main_category: r.main_category || "",
      sub_category: r.sub_category || "",
      mc_name: r.mc_name || "",
      brand_name: r.brand_name || "",
      brand_company_name: r.brand_company_name || "",
      hsn: r.hsn || "",
      vat: Number(r.vat) || 0,
      cess: Number(r.cess) || 0,
      sqty: [Number(r.total_qty) || 0],
      svalue: [Number(Number(r.total_value || 0).toFixed(2))],
      gst_value: [Number(
        (
          ((Number(r.total_value) || 0) * (Number(r.vat) || 0)) / 100
        ).toFixed(2)
      )
      ],
      cess_value: [Number(
        (
          ((Number(r.total_value) || 0) * (Number(r.cess) || 0)) / 100
        ).toFixed(2)
      )
      ],
      total_qty: Number(r.total_qty) || 0,
      total_value: Number(r.total_value) || 0,
      uom_name: r.uom_name || ""
    }));

    // "total_sum": [
    //     {
    //         "loc_short": "FFTNG",
    //         "locname": "T- Nagar 1",
    //         "sqty": 1891.599,
    //         "svalue": 114549.23,
    //         "gst_value": 2174.076674739,
    //         "cess_value": 0.0
    //     }
    // ]

    return {
      data,
      outlet_name: rows[0].outlet_name,
      total_sum: [
        {
          outlet_name: rows[0].outlet_name,
          sqty: data.reduce((a, b) => a + b.sqty[0], 0),
          svalue: data.reduce((a, b) => a + b.svalue[0], 0),
          gst_value: data.reduce((a, b) => a + b.gst_value[0], 0),
          cess_value: data.reduce((a, b) => a + b.cess_value[0], 0)
        }
      ]
    }
  }

  return { getItemWiseSales };
}

module.exports = itemWiseSalesRepo;
