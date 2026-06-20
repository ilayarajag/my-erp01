const { errorSchemas } = require("../../../commons/schemas/errorSchemas");

const putPayTypeSchema = {
  tags: ["PAY TYPE"],
  summary: "This API is to update Pay Type",
  headers: { $ref: "request-headers#" },

  params: {
    type: "object",
    required: ["pay_type_id"],
    properties: {
      pay_type_id: { type: "integer" }
    }
  },

  body: {
    type: "object",
    additionalProperties: false,
    properties: {
      pay_type_name: { type: "string", minLength: 2 },
      is_active: { type: "boolean" }
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

module.exports = putPayTypeSchema;