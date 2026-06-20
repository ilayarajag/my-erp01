const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const postOutletCounterPaymentModesSchema = {
  tags: ["Outlet Counter Payment Modes"],
  summary: "Create payment mode config for an outlet counter",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    additionalProperties: false,
    required: ["outlet_id", "counter_no"],
    properties: {
      outlet_id: { type: "integer" },
      counter_no: { type: "integer" },
      cash: { type: "boolean", default: true },
      card: { type: "boolean", default: true },
      upi: { type: "boolean", default: true },
      is_active: { type: "boolean", default: true }
    }
  },
  response: {
    200: {
      type: "object",
      properties: { success: { type: "boolean" } }
    },
    ...errorSchemas
  }
};

module.exports = postOutletCounterPaymentModesSchema;
