const { errorSchemas } = require("../../commons/schemas/errorSchemas");
const specialCouponSchema = {
  tags: ["Special Coupon Generate"],
  summary: "This API is used to Generate Special Coupon ",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    required: ["total", "billno", "counter_no", "location"],
    properties: {
      barcode: { type: "number" },
      billno: { type: "string" },
      counter_no: { type: "integer" },
      location: { type: "location" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        success: { type: "boolean" }
      }
    },
    ...errorSchemas
  }
};

module.exports = specialCouponSchema;
