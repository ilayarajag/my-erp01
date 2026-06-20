const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const putOutletCounterPaymentProviderSchema = {
  tags: ["Outlet Counter Payment Provider"],
  summary: "Update outlet counter payment provider by id",
  headers: { $ref: "request-headers#" },
  params: {
    type: "object",
    required: ["outlet_id", "provider_id"],
    properties: {
      outlet_id: { type: "integer" },
      provider_id: { type: "integer" }
    }
  },
  body: {
    type: "object",
    required: [
      "counter_no",
      "pay_type_id",
      "provider_name"
    ],
    properties: {
      counter_no: { type: "integer" },
      pay_type_id: { type: "integer" },
      provider_name: { type: "string", minLength: 1, maxLength: 100 },
      is_active: { type: "boolean" },
      config: {
        type: "object",
        properties: {
          store_id: { type: "string" },
          merchant_id: { type: "string" },
          terminal_id: { type: "string" },
          api_key: { type: "string" },
          secret_key: { type: "string" },
          device_serial_no: { type: "string" }
        }
      }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        success: {
          type: "boolean"
        }
      }
    },
    ...errorSchemas
  }
};

module.exports = putOutletCounterPaymentProviderSchema;