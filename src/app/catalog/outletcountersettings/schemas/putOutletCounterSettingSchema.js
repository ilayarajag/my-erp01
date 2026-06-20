const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const putOutletCounterSettingSchema = {
  tags: ["Outlet Counter Payment Modes"],
  summary: "Update payment mode config by id",
  headers: { $ref: "request-headers#" },
  params: {
    type: "object",
    required: ["outlet_id", "pay_type_id"],
    properties: {
      outlet_id: { type: "integer" },
      pay_type_id: { type: "integer" }
    }
  },
  body: {
    type: "object",
    additionalProperties: false,
    properties: {
      outlet_id: { type: "integer" },
      counter_no: { type: "integer" },
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

module.exports = putOutletCounterSettingSchema;
