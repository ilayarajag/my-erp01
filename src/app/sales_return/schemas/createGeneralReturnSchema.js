const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const generalReturnDetail = {
  type: "object",
  additionalProperties: false,
  required: ["product_id", "return_qty"],
  properties: {
    product_id: { type: "integer" },
    batch_no: { type: "string" },
    return_qty: { type: "number", exclusiveMinimum: 0 },
    rate: { type: "number", minimum: 0 },
    discount_per: { type: "number", minimum: 0 },
    discount_amount: { type: "number", minimum: 0 },
    gst_per: { type: "number", minimum: 0 },
    cess_per: { type: "number", minimum: 0 }
  }
};

const createGeneralReturnSchema = {
  tags: ["Sales Return"],
  summary: "Create general sales return without bill reference",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    additionalProperties: false,
    required: ["outlet_id", "details"],
    properties: {
      outlet_id: { type: "integer" },
      customer_id: { type: "integer" },
      customer_mobile: { type: "string" },
      coupon_expiry_days: { type: "integer", minimum: 1 },
      remarks: { type: "string" },
      details: {
        type: "array",
        minItems: 1,
        items: generalReturnDetail
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

module.exports = createGeneralReturnSchema;
