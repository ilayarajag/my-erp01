const { errorSchemas } = require("../../commons/schemas/errorSchemas");

// BILLWISE: only product_id + return_qty needed — rate/tax/amounts derived from original bill
// GENERAL:  product_id + return_qty required; rate/discount/gst/cess optional overrides
const returnDetail = {
  type: "object",
  required: ["product_id", "return_qty"],
  properties: {
    product_id: { type: "integer" },
    return_qty: { type: "number", exclusiveMinimum: 0 },
  }
};

const createSalesReturnSchema = {
  tags: ["Sales Return"],
  summary: "Create billwise  return and generate SRC coupon",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    additionalProperties: false,
    required: ["outlet_id", "bill_ref_no", "details"],
    properties: {
      outlet_id: { type: "integer" },
      bill_ref_no: { type: "string" },
      customer_id: { type: ["integer", "null"] },
      remarks: { type: "string" },
      details: {
        type: "array",
        minItems: 1,
        items: returnDetail
      }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        sr_no: { type: "string" },
        coupon_no: { type: "string" },
        coupon_value: { type: "number" }
      }
    },
    ...errorSchemas
  }
};

module.exports = createSalesReturnSchema;
