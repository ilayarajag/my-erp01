const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const redeemCouponSchema = {
  tags: ["Sales Return"],
  summary: "Redeem sales return coupon against a new bill",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    additionalProperties: false,
    required: ["coupon_no", "bill_no", "used_amount", "outlet_id"],
    properties: {
      coupon_no: { type: "string" },
      bill_no: { type: "integer" },
      used_amount: { type: "number", exclusiveMinimum: 0 },
      outlet_id: { type: "integer" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        coupon_id: { type: "integer" },
        used_amount: { type: "number" },
        remaining_amount: { type: "number" },
        status: { type: "string" }
      }
    },
    ...errorSchemas
  }
};

module.exports = redeemCouponSchema;
