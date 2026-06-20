
const { errorSchemas } = require("../../commons/schemas/errorSchemas");

const validateCouponSchema = {
  tags: ["Sales Return"],
  summary: "Redeem sales return coupon against a new bill",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    additionalProperties: false,
    required: ["coupon_no"],
    properties: {
      coupon_no: { type: "string" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        coupon_no: { type: "string" },
        bill_no: {type: "integer"},
        outlet_id: {type:"integer"},
        coupon_value:{type : "number"},
        balance_amount: { type: "number" },
        remaining_amount: { type: "number" },
        status: { type: "string" },
        created_at: { type: "string" }
      }
    },
    ...errorSchemas
  }
};

module.exports = validateCouponSchema;
