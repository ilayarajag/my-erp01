const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const postPayTypeSchema = {
  tags: ["PAY TYPE"],
  summary: "This API is to create Pay Type",
  headers: { $ref: "request-headers#" },

  body: {
    type: "object",
    additionalProperties: false,
    required: ["pay_type_name", "pay_type_key"],
    properties: {
      pay_type_name: { type: "string", minLength: 2 },
      pay_type_key: { type: "string"}, // e.g., CASH, ONLINE
      is_active: { type: "boolean", default: true }
    }
  },

  response: {
    200: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        insert_id: { type: "integer" }
      }
    },

    ...errorSchemas
  }
};

module.exports = postPayTypeSchema;