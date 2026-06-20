const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const insertSpecialCouponSchema = {
  tags: ["Special Coupon Schema"],
  summary: "This API is used to apply special coupon. ",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    required: ["coupon", "counter_no"],
    properties: {
      coupon: { type: "string" },
      counter_no: { type: "integer" }
    }
  }
  // response: {
  //   200: {
  //     type: "object",
  //     properties: {
  //       success: { type: "string" }
  //     }
  //   },
  //   ...errorSchemas
  // }
  // response: {
  //   200: {
  //     type: "object",
  //     properties: {
  //       cart_sub_total: { type: "number" },
  //       cart_total_discount: { type: "number" },
  //       cart_total_quantity: { type: "number" },
  //       cart_total_sgst: { type: "number" },
  //       cart_total_cgst: { type: "number" },
  //       cart_total_gst: { type: "number" },
  //       cart_total_cess: { type: "number" },
  //       cart_others: { type: "number" },
  //       cart_total: { type: "number" },
  //       cart_net_total: { type: "number" },
  //       cart_round_off: { type: "number" },
  //       cart_coupon_code: { type: "string" },
  //       cart_coupon_offer: { type: "number" },
  //       cart_lines: {
  //         type: "array",
  //         items: {
  //           type: "object",
  //           properties: {
  //             prod_id: { type: "integer" },
  //             prod_code: { type: "string" },
  //             prod_Name: { type: "string" },
  //             parent_code: { type: "integer" },
  //             prod_uom: { type: "integer" },
  //             Ptax: { type: "number" },
  //             Stax: { type: "number" },
  //             purchase_rate: { type: "number" },
  //             sales_rate: { type: "number" },
  //             mrp: { type: "number" },
  //             balance: { type: "number" },
  //             active: { type: "integer" },
  //             barcode: { type: "string" },
  //             min_stock: { type: "number" },
  //             opening_stock: { type: "number" },
  //             min_warn: { type: "integer" },
  //             negative_stock: { type: "integer" },
  //             prod_path: { type: "string" },
  //             rate_edit: { type: "integer" },
  //             decimal1: { type: "integer" },
  //             oldrate: { type: "number" },
  //             Itemadd: { type: "integer" },
  //             Wscale: { type: "integer" },
  //             juice: { type: "integer" },
  //             prod_namet: { type: "string" },
  //             BatchNo: { type: "integer" },
  //             Vattype: { type: "integer" },
  //             vatcalc: { type: "integer" },
  //             Loc: { type: "integer" },
  //             Wholesale_Rate: { type: "number" },
  //             cid: { type: "integer" },
  //             ReQty: { type: "number" },
  //             MinStkPeriod: { type: "integer" },
  //             OrderFreq: { type: "integer" },
  //             Suppid: { type: "integer" },
  //             Orderday: { type: "string" },
  //             pmargin: { type: "number" },
  //             comcode: { type: "string" },
  //             stkhold: { type: "number" },
  //             bid: { type: "integer" },
  //             posid: { type: "integer" },
  //             Asupp: { type: "string" },
  //             qty: { type: "number" },
  //             parentId: { type: "integer" },
  //             TProduct: { type: "integer" },
  //             PItem: { type: "integer" },
  //             barcode1: { type: "string" },
  //             barcode2: { type: "string" },
  //             barcode3: { type: "string" },
  //             barcode4: { type: "string" },
  //             sgst: { type: "number" },
  //             cgst: { type: "number" },
  //             cess: { type: "number" },
  //             idate: { type: "string", format: "datetime" },
  //             prodloc: { type: "string" },
  //             dis: { type: "number" },
  //             pactive: { type: "integer" },
  //             pmrp: { type: "integer" },
  //             mcid: { type: "integer" },
  //             onrate: { type: "number" },
  //             oosdate: { type: "string" },
  //             bcid: { type: "integer" },
  //             LPoint: { type: "integer" },
  //             CPoint: { type: "integer" },
  //             SMargin: { type: "number" },
  //             cgroup: { type: "integer" },
  //             sh_life: { type: "integer" },
  //             WebRate: { type: "number" },
  //             WebStock: { type: "number" },
  //             Sh_LifePer: { type: "integer" },
  //             Gr_Wt: { type: "number" },
  //             bqty: { type: "integer" },
  //             opqty: { type: "integer" },
  //             WebChkRate: { type: "number" },
  //             Potype: { type: "integer" },
  //             coupon_code: { type: "string" },
  //             uom_name: { type: "string" }
  //           }
  //         }
  //       }
  //     }
  //   },
  //   ...errorSchemas
  // }
};

module.exports = insertSpecialCouponSchema;
