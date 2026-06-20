const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const putOutletCounterPaymentModesSchema = {
  tags: ["Outlet Counter Payment Modes"],
  summary: "Update payment mode config by id",
  headers: { $ref: "request-headers#" },
  params: {
    type: "object",
    required: ["outlet_counter_payment_id"],
    properties: {
      outlet_counter_payment_id: { type: "integer" }
    }
  },
  body: {
    type: "object",
    additionalProperties: false,
    properties: {
      outlet_id: { type: "integer" },
      counter_no: { type: "integer" },
      cash: { type: "boolean" },
      card: { type: "boolean" },
      upi: { type: "boolean" },
      is_active: { type: "boolean" }
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

module.exports = putOutletCounterPaymentModesSchema;
