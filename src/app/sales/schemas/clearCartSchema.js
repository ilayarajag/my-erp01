const { errorSchemas } = require("../../commons/schemas/errorSchemas");
const clearCartSchema = {
  tags: ["CART"],
  summary: "This API is used to clear the Cart",
  headers: { $ref: "request-headers#" },
  body: {
    type: "object",
    required: ["counter_no"],
    additionalProperties: false,
    properties: {
      counter_no: { type: "integer" },
      outlet_id: { type: "integer" }
    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        success: { type: "string" }
      }
    },
    ...errorSchemas
  }
};

module.exports = clearCartSchema;
