const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const getOutletCounterPaymentModesSchema = {
  tags: ["Outlet Counter Payment Modes"],
  summary: "Get payment modes — by outlet_id | counter_no | outlet_id + counter_no",
  headers: { $ref: "request-headers#" },
  querystring: {
    type: "object",
    properties: {
      outlet_id: { type: "integer" },
      counter_no: { type: "integer" }
    }
  },
  response: {
    200: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          outlet_id: { type: "integer" },
          outlet_name: { type: "string" },
          store_code: { type: "string" },
          counter_no: { type: "integer" },
          cash: { type: "boolean" },
          card: { type: "boolean" },
          upi: { type: "boolean" },
          is_active: { type: "boolean" },
        }
      }
    },
    ...errorSchemas
  }
};

module.exports = getOutletCounterPaymentModesSchema;
